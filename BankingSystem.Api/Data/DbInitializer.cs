using System;
using System.Linq;
using System.Threading.Tasks;
using BankingSystem.Api.Models.Auth;
using BankingSystem.Api.Models.Banking;
using Microsoft.EntityFrameworkCore;

namespace BankingSystem.Api.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            try
            {
                var now = DateTime.UtcNow;

                // 1. Seed Roles if missing
                var roles = await context.Roles.ToListAsync();
                var userRoleObj = roles.FirstOrDefault(r => r.NormalizedRoleName == "USER");
                if (userRoleObj == null)
                {
                    userRoleObj = new Role
                    {
                        RoleId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                        RoleName = "user",
                        NormalizedRoleName = "USER",
                        CreatedAtUtc = now
                    };
                    context.Roles.Add(userRoleObj);
                }

                var adminRoleObj = roles.FirstOrDefault(r => r.NormalizedRoleName == "ADMIN");
                if (adminRoleObj == null)
                {
                    adminRoleObj = new Role
                    {
                        RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222"),
                        RoleName = "admin",
                        NormalizedRoleName = "ADMIN",
                        CreatedAtUtc = now
                    };
                    context.Roles.Add(adminRoleObj);
                }

                var sysRoleObj = roles.FirstOrDefault(r => r.NormalizedRoleName == "SYSTEMUSER");
                if (sysRoleObj == null)
                {
                    sysRoleObj = new Role
                    {
                        RoleId = Guid.Parse("33333333-3333-3333-3333-333333333333"),
                        RoleName = "systemUser",
                        NormalizedRoleName = "SYSTEMUSER",
                        CreatedAtUtc = now
                    };
                    context.Roles.Add(sysRoleObj);
                }

                await context.SaveChangesAsync();

                // 2. Seed Default Test User (test_user-01@yono.com) if not exists
                var testUser = await context.Users.FirstOrDefaultAsync(u => u.NormalizedUserName == "TEST_USER-01" || u.NormalizedEmail == "TEST_USER-01@YONO.COM");
                if (testUser == null)
                {
                    testUser = new User
                    {
                        UserId = Guid.NewGuid(),
                        UserName = "test_user-01",
                        NormalizedUserName = "TEST_USER-01",
                        Email = "test_user-01@yono.com",
                        NormalizedEmail = "TEST_USER-01@YONO.COM",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!", workFactor: 12),
                        EmailVerified = true,
                        UserStatus = "ACTIVE",
                        LoginAttempts = 0,
                        CreatedAtUtc = now,
                        UpdatedAtUtc = now
                    };
                    context.Users.Add(testUser);
                    context.UserRoles.Add(new UserRole
                    {
                        UserId = testUser.UserId,
                        RoleId = userRoleObj.RoleId,
                        AssignedAtUtc = now
                    });
                    await context.SaveChangesAsync();

                    // Create initial bank account for test user
                    var bankAcc = new BankAccount
                    {
                        AccountId = Guid.NewGuid(),
                        UserId = testUser.UserId,
                        AccountType = "SAVINGS",
                        AccountStatus = "ACTIVE",
                        AccountPurpose = "CUSTOMER",
                        CurrencyCode = "INR",
                        OpenedAtUtc = now,
                        CreatedAtUtc = now,
                        UpdatedAtUtc = now
                    };
                    context.BankAccounts.Add(bankAcc);

                    // Add initial credit transfer
                    var transfer = new Transfer
                    {
                        TransferId = Guid.NewGuid(),
                        FromAccountId = bankAcc.AccountId,
                        ToAccountId = bankAcc.AccountId,
                        Amount = 47651.00m,
                        IdempotencyKey = $"initial-seed-{bankAcc.AccountId}",
                        TransferStatus = "COMPLETED",
                        CreatedAtUtc = now,
                        CompletedAtUtc = now
                    };
                    context.Transfers.Add(transfer);

                    var ledger = new LedgerEntry
                    {
                        TransferId = transfer.TransferId,
                        AccountId = bankAcc.AccountId,
                        EntrySequence = 1,
                        EntryType = "CREDIT",
                        Amount = 47651.00m,
                        CreatedAtUtc = now
                    };
                    context.LedgerEntries.Add(ledger);
                    await context.SaveChangesAsync();
                }

                // 3. Seed Default Admin User (admin@yono.com) if not exists
                var adminUser = await context.Users.FirstOrDefaultAsync(u => u.NormalizedUserName == "ADMIN" || u.NormalizedEmail == "ADMIN@YONO.COM");
                if (adminUser == null)
                {
                    adminUser = new User
                    {
                        UserId = Guid.NewGuid(),
                        UserName = "admin",
                        NormalizedUserName = "ADMIN",
                        Email = "admin@yono.com",
                        NormalizedEmail = "ADMIN@YONO.COM",
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123!", workFactor: 12),
                        EmailVerified = true,
                        UserStatus = "ACTIVE",
                        LoginAttempts = 0,
                        CreatedAtUtc = now,
                        UpdatedAtUtc = now
                    };
                    context.Users.Add(adminUser);
                    context.UserRoles.Add(new UserRole
                    {
                        UserId = adminUser.UserId,
                        RoleId = adminRoleObj.RoleId,
                        AssignedAtUtc = now
                    });
                    await context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DbInitializer] Warning during seeding: {ex.Message}");
            }
        }
    }
}
