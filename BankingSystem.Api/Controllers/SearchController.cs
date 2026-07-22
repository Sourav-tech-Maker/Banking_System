using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BankingSystem.Api.Data;
using BankingSystem.Api.DTOs.Search;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingSystem.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public sealed class SearchController(AppDbContext context) : ControllerBase
    {
        [HttpGet]
        public async Task<IActionResult> Search([FromQuery] string? q, CancellationToken cancellationToken)
        {
            var query = q?.Trim() ?? string.Empty;
            if (string.IsNullOrWhiteSpace(query))
            {
                return Ok(new SearchResultDto(query, 0, new SearchCategoriesDto([], [], [], [])));
            }

            var userIdClaim = User.FindFirst("userid")?.Value;
            if (userIdClaim == null || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { message = "Unauthorized access" });
            }

            var queryLower = query.ToLowerInvariant();
            var userRole = User.FindFirst("role")?.Value ?? User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
            var isAdmin = string.Equals(userRole, "admin", StringComparison.OrdinalIgnoreCase);

            // 1. Pages / Action deep links
            var availablePages = new List<(string Name, string ActionId, string Subtitle, string Keywords)>
            {
                ("Dashboard Overview", "dashboard", "Main account overview & stats", "dashboard overview balance home main stats summary"),
                ("Recent Transactions", "transactions", "View and filter transfer history", "transactions transfers history payments statements credit debit"),
                ("Open Account", "open-account", "Apply for a new savings or current bank account", "open account create bank new savings checking current"),
                ("KYC Verification", "kyc", "Upload documents & verify identity", "kyc verification identity upload passport pan aadhaar verify status"),
                ("Beneficiaries", "beneficiaries", "Manage saved payees & accounts", "beneficiaries payees saved contacts transfer recipients add beneficiary"),
                ("Savings Goals", "goals", "Track financial goals & targets", "goals savings piggy target deposit wealth budget"),
                ("My Profile", "profile", "View account details & personal info", "profile account personal details info email user avatar"),
                ("Settings", "settings", "Manage preferences & dark mode", "settings preferences theme dark mode light mode password security")
            };

            if (isAdmin)
            {
                availablePages.Add(("Admin Console", "admin", "System administration & KYC processing", "admin console system users audit kyc approve management"));
            }

            var pagesMatches = availablePages
                .Where(p => p.Name.ToLowerInvariant().Contains(queryLower) || p.Keywords.ToLowerInvariant().Contains(queryLower))
                .Select(p => new SearchItemDto(
                    Id: $"page-{p.ActionId}",
                    Category: "Pages & Actions",
                    Title: p.Name,
                    Subtitle: p.Subtitle,
                    BadgeText: "Page",
                    Value: "Navigate",
                    ActionViewId: p.ActionId,
                    IconType: "layout"
                ))
                .ToList();

            // 2. Transactions
            var userAccountIds = await context.BankAccounts
                .AsNoTracking()
                .Where(a => a.UserId == userId)
                .Select(a => a.AccountId)
                .ToListAsync(cancellationToken);

            var transactionMatches = new List<SearchItemDto>();
            if (userAccountIds.Count > 0)
            {
                var transfers = await context.Transfers
                    .AsNoTracking()
                    .Where(t => userAccountIds.Contains(t.FromAccountId) || userAccountIds.Contains(t.ToAccountId))
                    .OrderByDescending(t => t.CreatedAtUtc)
                    .Take(30)
                    .ToListAsync(cancellationToken);

                var allTxnAccountIds = transfers.Select(t => t.FromAccountId).Union(transfers.Select(t => t.ToAccountId)).Distinct().ToList();
                var transferAccounts = await context.BankAccounts
                    .AsNoTracking()
                    .Where(acc => allTxnAccountIds.Contains(acc.AccountId))
                    .Include(acc => acc.User)
                    .ToDictionaryAsync(acc => acc.AccountId, cancellationToken);

                foreach (var t in transfers)
                {
                    var isDebit = userAccountIds.Contains(t.FromAccountId);
                    var otherAcc = isDebit
                        ? transferAccounts.GetValueOrDefault(t.ToAccountId)
                        : transferAccounts.GetValueOrDefault(t.FromAccountId);

                    var partyName = otherAcc?.User?.UserName ?? "Bank Transfer";
                    var shortAcc = otherAcc != null ? $"A/C {otherAcc.AccountId.ToString()[^6..].ToUpperInvariant()}" : "";
                    var titleText = isDebit ? $"Transfer to {partyName}" : $"Received from {partyName}";
                    var amountStr = $"₹{t.Amount:N2}";

                    if (titleText.ToLowerInvariant().Contains(queryLower)
                        || partyName.ToLowerInvariant().Contains(queryLower)
                        || shortAcc.ToLowerInvariant().Contains(queryLower)
                        || t.TransferStatus.ToLowerInvariant().Contains(queryLower)
                        || amountStr.Contains(queryLower))
                    {
                        transactionMatches.Add(new SearchItemDto(
                            Id: t.TransferId.ToString(),
                            Category: "Transactions",
                            Title: titleText,
                            Subtitle: $"{shortAcc} • {t.CreatedAtUtc:dd MMM yyyy}",
                            BadgeText: t.TransferStatus.ToUpperInvariant(),
                            Value: (isDebit ? "-" : "+") + amountStr,
                            ActionViewId: "transactions",
                            IconType: isDebit ? "arrow-up-right" : "arrow-down-left"
                        ));
                    }
                }
            }

            // 3. Beneficiaries
            var beneficiariesMatches = new List<SearchItemDto>();
            var beneficiaries = await context.Beneficiaries
                .AsNoTracking()
                .Where(b => b.OwnerUserId == userId)
                .Include(b => b.BeneficiaryAccount)
                .ThenInclude(a => a.User)
                .ToListAsync(cancellationToken);

            foreach (var b in beneficiaries)
            {
                var holderName = b.DisplayName ?? b.NickName ?? b.BeneficiaryAccount?.User?.UserName ?? "Beneficiary";
                var accNo = b.BeneficiaryAccountId.ToString();
                var shortAcc = accNo.Length >= 6 ? $"A/C {accNo[^6..].ToUpperInvariant()}" : $"A/C {accNo.ToUpperInvariant()}";

                if (holderName.ToLowerInvariant().Contains(queryLower)
                    || (b.NickName != null && b.NickName.ToLowerInvariant().Contains(queryLower))
                    || shortAcc.ToLowerInvariant().Contains(queryLower)
                    || accNo.ToLowerInvariant().Contains(queryLower))
                {
                    beneficiariesMatches.Add(new SearchItemDto(
                        Id: b.BeneficiaryId.ToString(),
                        Category: "Beneficiaries",
                        Title: holderName,
                        Subtitle: $"{b.NickName} • {shortAcc}",
                        BadgeText: b.BeneficiaryStatus,
                        Value: "Send Funds",
                        ActionViewId: "beneficiaries",
                        IconType: "user"
                    ));
                }
            }

            // 4. Savings Goals
            var goalsMatches = new List<SearchItemDto>();
            var goals = await context.SavingsGoals
                .AsNoTracking()
                .Where(g => g.UserId == userId && !g.IsArchived)
                .ToListAsync(cancellationToken);

            foreach (var g in goals)
            {
                if (g.Title.ToLowerInvariant().Contains(queryLower)
                    || g.Category.ToLowerInvariant().Contains(queryLower)
                    || g.TargetAmount.ToString().Contains(queryLower))
                {
                    goalsMatches.Add(new SearchItemDto(
                        Id: g.SavingsGoalId.ToString(),
                        Category: "Savings Goals",
                        Title: g.Title,
                        Subtitle: $"Category: {g.Category} • Target: {g.TargetDateUtc:dd MMM yyyy}",
                        BadgeText: "Goal",
                        Value: $"₹{g.TargetAmount:N0}",
                        ActionViewId: "goals",
                        IconType: "target"
                    ));
                }
            }

            var total = pagesMatches.Count + transactionMatches.Count + beneficiariesMatches.Count + goalsMatches.Count;

            var results = new SearchCategoriesDto(
                Pages: pagesMatches.Take(5).ToList(),
                Transactions: transactionMatches.Take(6).ToList(),
                Beneficiaries: beneficiariesMatches.Take(5).ToList(),
                Goals: goalsMatches.Take(5).ToList()
            );

            return Ok(new SearchResultDto(query, total, results));
        }
    }
}
