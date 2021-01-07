using IdentityModel;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Pesabooks.Domain.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Infrastructure.Persistance
{
    public class SeedData
    {
        public static void EnsureSeedData(string connectionString)
        {
            var services = new ServiceCollection();
            services.AddLogging();
            services.AddDbContext<PesabooksDbContext>(options =>
               options.UseNpgsql(connectionString));

            services.AddIdentity<User, Role>()
                 .AddEntityFrameworkStores<PesabooksDbContext>()
                    .AddDefaultTokenProviders();

            using (var serviceProvider = services.BuildServiceProvider())
            {
                using (var scope = serviceProvider.GetRequiredService<IServiceScopeFactory>().CreateScope())
                {
                    var context = scope.ServiceProvider.GetService<PesabooksDbContext>();
                    context.Database.Migrate();
                   

                    var userMgr = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
                    var amdin = userMgr.FindByNameAsync("admin").Result;
                    if (amdin == null)
                    {
                        amdin = new User
                        {
                            UserName = "admin",
                            Email = "admin@pesabooks.com",
                            EmailConfirmed = true,
                        };
                        var result = userMgr.CreateAsync(amdin, "P@ssw0rd").Result;
                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }

                        result = userMgr.AddClaimsAsync(amdin, new Claim[]{
                            new Claim(JwtClaimTypes.Name, "System Admin"),
                            new Claim(JwtClaimTypes.GivenName, "System"),
                            new Claim(JwtClaimTypes.FamilyName, "Admin"),
                            new Claim(JwtClaimTypes.WebSite, "https://pesabooks.com")
                        }).Result;

                        if (!result.Succeeded)
                        {
                            throw new Exception(result.Errors.First().Description);
                        }
                    }
                    context.SaveChanges();

                }
            }
        }
    }
}
