using System;
using System.IO;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using BankingSystem.Api.Data;
using BankingSystem.Api.DTOs.Kyc;
using BankingSystem.Api.Models.Compliance;
using BankingSystem.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingSystem.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public sealed class KycController(
        AppDbContext context,
        IImageKitService imageKitService,
        TimeProvider timeProvider) : ControllerBase
    {
        private sealed class PermanentAddressModel
        {
            public string Street { get; set; } = null!;
            public string City { get; set; } = null!;
            public string State { get; set; } = null!;
            public string Country { get; set; } = null!;
            public string PostalCode { get; set; } = null!;
        }

        [Authorize]
        [HttpPost("register-kyc")]
        public async Task<IActionResult> RegisterKyc(
            [FromForm] string fullName,
            [FromForm] string dateOfBirth,
            [FromForm] string gender,
            [FromForm] string permanentAddress,
            [FromForm] string documentType,
            [FromForm] string documentNumber,
            IFormFile? documentImg,
            CancellationToken cancellationToken)
        {
            // Validate inputs
            if (string.IsNullOrWhiteSpace(fullName) ||
                string.IsNullOrWhiteSpace(dateOfBirth) ||
                string.IsNullOrWhiteSpace(gender) ||
                string.IsNullOrWhiteSpace(permanentAddress) ||
                string.IsNullOrWhiteSpace(documentType) ||
                string.IsNullOrWhiteSpace(documentNumber) ||
                documentImg == null)
            {
                return BadRequest(new { message = "All fields are required for register Kyc" });
            }

            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(new { message = "User not found, you must register a user account first" });
            }

            var user = await context.Users.FindAsync([userId.Value], cancellationToken);
            if (user == null)
            {
                return NotFound(new { message = "User not found, you must register a user account first" });
            }

            if (!user.EmailVerified)
            {
                return StatusCode(StatusCodes.Status403Forbidden, new
                {
                    message = $"Your registration account exists, but your current verify status is: {user.EmailVerified}"
                });
            }

            // Check existing KYC application
            var existingKyc = await context.KycApplications
                .Include(k => k.KycAddress)
                .Include(k => k.KycDocuments)
                .FirstOrDefaultAsync(k => k.UserId == userId.Value, cancellationToken);

            if (existingKyc != null)
            {
                if (string.Equals(existingKyc.KycStatus, "APPROVED", StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(new { message = "Your KYC application has already been verified and approved." });
                }
                if (string.Equals(existingKyc.KycStatus, "Pending", StringComparison.OrdinalIgnoreCase) ||
                    string.Equals(existingKyc.KycStatus, "PENDING", StringComparison.OrdinalIgnoreCase))
                {
                    return Conflict(new { message = "Your KYC application is currently under review by our administration team." });
                }
            }

            // Parse permanentAddress
            PermanentAddressModel? addr;
            try
            {
                addr = JsonSerializer.Deserialize<PermanentAddressModel>(permanentAddress, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
            catch
            {
                return BadRequest(new { message = "Invalid permanent address format." });
            }

            if (addr == null ||
                string.IsNullOrWhiteSpace(addr.Street) ||
                string.IsNullOrWhiteSpace(addr.City) ||
                string.IsNullOrWhiteSpace(addr.State) ||
                string.IsNullOrWhiteSpace(addr.Country) ||
                string.IsNullOrWhiteSpace(addr.PostalCode))
            {
                return BadRequest(new { message = "All Field are required for register Kyc" });
            }

            // Upload image to ImageKit
            string imageUrl;
            try
            {
                imageUrl = await imageKitService.UploadKycDocumentAsync(documentImg, userId.Value.ToString(), cancellationToken);
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status502BadGateway, new { message = ex.Message });
            }

            var now = timeProvider.GetUtcNow().UtcDateTime;

            if (!DateTime.TryParse(dateOfBirth, out var dob))
            {
                dob = now.AddYears(-18); // Default fallback
            }

            if (existingKyc != null && string.Equals(existingKyc.KycStatus, "REJECTED", StringComparison.OrdinalIgnoreCase))
            {
                // Re-submit rejected KYC
                existingKyc.FullName = fullName;
                existingKyc.DateOfBirth = dob;
                existingKyc.Gender = gender;
                existingKyc.KycStatus = "Pending";
                existingKyc.RejectionReason = null;
                existingKyc.SubmittedAtUtc = now;
                existingKyc.UpdatedAtUtc = now;

                if (existingKyc.KycAddress != null)
                {
                    existingKyc.KycAddress.Street = addr.Street;
                    existingKyc.KycAddress.City = addr.City;
                    existingKyc.KycAddress.StateOrProvince = addr.State;
                    existingKyc.KycAddress.Country = addr.Country;
                    existingKyc.KycAddress.PostalCode = addr.PostalCode;
                }
                else
                {
                    existingKyc.KycAddress = new KycAddress
                    {
                        Street = addr.Street,
                        City = addr.City,
                        StateOrProvince = addr.State,
                        Country = addr.Country,
                        PostalCode = addr.PostalCode
                    };
                }

                var doc = existingKyc.KycDocuments.FirstOrDefault();
                if (doc != null)
                {
                    doc.DocumentType = documentType.ToUpperInvariant().Replace(" ", "_").Replace("-", "_");
                    doc.DocumentNumber = documentNumber;
                    doc.DocumentImageUrl = imageUrl;
                    doc.UploadedAtUtc = now;
                }
                else
                {
                    existingKyc.KycDocuments.Add(new KycDocument
                    {
                        KycDocumentId = Guid.NewGuid(),
                        KycApplicationId = existingKyc.KycApplicationId,
                        DocumentType = documentType.ToUpperInvariant().Replace(" ", "_").Replace("-", "_"),
                        DocumentNumber = documentNumber,
                        DocumentImageUrl = imageUrl,
                        UploadedAtUtc = now
                    });
                }

                await context.SaveChangesAsync(cancellationToken);

                return StatusCode(StatusCodes.Status200OK, new
                {
                    message = "Kyc application re-submitted successfully.",
                    status = "Pending"
                });
            }

            // Create new KYC application
            var kycApp = new KycApplication
            {
                KycApplicationId = Guid.NewGuid(),
                UserId = userId.Value,
                FullName = fullName,
                DateOfBirth = dob,
                Gender = gender,
                KycStatus = "Pending",
                SubmittedAtUtc = now,
                UpdatedAtUtc = now,
                KycAddress = new KycAddress
                {
                    Street = addr.Street,
                    City = addr.City,
                    StateOrProvince = addr.State,
                    Country = addr.Country,
                    PostalCode = addr.PostalCode
                }
            };

            var kycDoc = new KycDocument
            {
                KycDocumentId = Guid.NewGuid(),
                KycApplicationId = kycApp.KycApplicationId,
                DocumentType = documentType.ToUpperInvariant().Replace(" ", "_").Replace("-", "_"),
                DocumentNumber = documentNumber,
                DocumentImageUrl = imageUrl,
                UploadedAtUtc = now
            };

            kycApp.KycDocuments.Add(kycDoc);
            context.KycApplications.Add(kycApp);

            await context.SaveChangesAsync(cancellationToken);

            return StatusCode(StatusCodes.Status201Created, new
            {
                message = "Kyc is successfully registered...",
                status = "Pending"
            });
        }

        private Guid? GetCurrentUserId()
        {
            var claimVal = User.FindFirst("userid")?.Value
                        ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value
                        ?? User.FindFirst("sub")?.Value;

            return Guid.TryParse(claimVal, out var id) ? id : null;
        }

        [Authorize]
        [HttpGet("my-kyc")]
        public async Task<IActionResult> GetMyKyc(CancellationToken cancellationToken)
        {
            var userId = GetCurrentUserId();
            if (!userId.HasValue)
            {
                return Unauthorized(new { message = "User not found" });
            }

            var kyc = await context.KycApplications
                .Include(k => k.KycAddress)
                .Include(k => k.KycDocuments)
                .FirstOrDefaultAsync(k => k.UserId == userId.Value, cancellationToken);

            if (kyc == null)
            {
                return NotFound(new { message = "No KYC record found" });
            }

            return Ok(new
            {
                kycApplicationId = kyc.KycApplicationId,
                fullName = kyc.FullName,
                dateOfBirth = kyc.DateOfBirth,
                gender = kyc.Gender,
                kycStatus = kyc.KycStatus,
                rejectionReason = kyc.RejectionReason,
                submittedAtUtc = kyc.SubmittedAtUtc,
                address = kyc.KycAddress != null ? new
                {
                    street = kyc.KycAddress.Street,
                    city = kyc.KycAddress.City,
                    state = kyc.KycAddress.StateOrProvince,
                    country = kyc.KycAddress.Country,
                    postalCode = kyc.KycAddress.PostalCode
                } : null,
                documents = kyc.KycDocuments.Select(d => new
                {
                    documentType = d.DocumentType,
                    documentNumber = d.DocumentNumber,
                    documentImageUrl = d.DocumentImageUrl
                })
            });
        }

        [HttpPost("verify-kyc")]
        public async Task<IActionResult> VerifyKyc(
            [FromBody] VerifyKycRequest request,
            CancellationToken cancellationToken)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Status))
            {
                return BadRequest(new { message = "User ID and status action (Approve/Rejected) are required." });
            }

            if (request.Status != "Approve" && request.Status != "Rejected")
            {
                return BadRequest(new { message = "Invalid status action. Must be 'Approve' or 'Rejected'." });
            }

            var kycRecord = await context.KycApplications
                .FirstOrDefaultAsync(k => k.UserId == request.UserId, cancellationToken);

            if (kycRecord == null)
            {
                return NotFound(new { message = "KYC record not found for this user." });
            }

            var now = timeProvider.GetUtcNow().UtcDateTime;

            if (request.Status == "Rejected")
            {
                if (string.IsNullOrWhiteSpace(request.RejectReason))
                {
                    return BadRequest(new { message = "A rejection reason is required to reject KYC." });
                }

                kycRecord.KycStatus = "REJECTED";
                kycRecord.RejectionReason = request.RejectReason;
                kycRecord.ReviewedAtUtc = now;
                kycRecord.UpdatedAtUtc = now;

                await context.SaveChangesAsync(cancellationToken);

                return Ok(new
                {
                    message = "KYC application has been rejected.",
                    status = "success"
                });
            }

            kycRecord.KycStatus = "APPROVED";
            kycRecord.RejectionReason = null;
            kycRecord.ReviewedAtUtc = now;
            kycRecord.UpdatedAtUtc = now;

            // Activate bank account for transactions
            var accounts = await context.BankAccounts
                .Where(acc => acc.UserId == request.UserId)
                .ToListAsync(cancellationToken);

            // Wait, does AppDbContext map User having a kyc property? Let's check user.model.js: user.kyc links to KYC record.
            // In SQL schema, KycApplications table has UserId as unique, which is a 1-to-1 relationship.
            // So setting KycStatus to APPROVED automatically verified the user's KYC.
            // And any account of this user should be set to isKycVerified = true (Wait, in C# the BankAccounts table doesn't have an `isKycVerified` column! Wait, does it? Let's check `01_NormalizedSchema.sql` table `[Banking].[BankAccounts]` columns:
            // It has: AccountId, LegacyObjectId, AccountNumber, UserId, AccountType, AccountStatus, AccountPurpose, CurrencyCode, OpenedAtUtc, ClosedAtUtc, CreatedAtUtc, UpdatedAtUtc, RowVersion.
            // Wait, does it have `isKycVerified`? No, it does NOT!
            // Wait! In MERN, `account.model.js` has `isKycVerified: { type: Boolean, default: false }`.
            // In SQL Server normalized schema, this field was intentionally removed because it's redundant! The KYC verification status is stored on the user's `Compliance.KycApplications` record instead!
            // Wait, is that true? Let's check `02_LedgerAndTransactions.sql` lines 329-336:
            // ```sql
            //             IF NOT EXISTS
            //             (
            //                 SELECT 1
            //                 FROM [Compliance].[KycApplications]
            //                 WHERE [UserId] = @FromUserId
            //                   AND [KycStatus] = N'APPROVED'
            //             )
            //                 THROW 51014, 'The source account owner does not have approved KYC.', 1;
            // ```
            // Yes! The database checking is based on whether there's an Approved KYC application for the user.
            // So we don't need to write to an `isKycVerified` column in the accounts table, since the C# BankAccounts model doesn't even have it, and the database view vwAccountBalances doesn't have it either.
            // But wait, the frontend might check `isKycVerified` on the account objects returned by the API.
            // Let's check if the frontend reads `isKycVerified` from `accounts` array.
            // In `OpenAccount.jsx`:
            // `const hasVerifiedKyc = profile?.kyc?.status === 'Approve';` -> So it checks the profile KYC status!
            // What about in other pages? In `Home.jsx`, does it check?
            // In `Home.jsx` it makes transfer requests.
            // In C# account responses, we can return `isKycVerified = (kycStatus == "APPROVED")` to the frontend as a virtual field!
            // This is super clean, it avoids database columns while satisfying the frontend's expectations perfectly!

            await context.SaveChangesAsync(cancellationToken);

            return Ok(new
            {
                message = "KYC application approved successfully. Bank account activated for transactions.",
                status = "success"
            });
        }
    }
}
