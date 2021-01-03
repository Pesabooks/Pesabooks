using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Pesabooks.Infrastructure.Persistance;
using Microsoft.Extensions.Configuration;
using Microsoft.AspNetCore.Identity;
using Pesabooks.Domain.Identity;
using Pesabooks.Infrastructure.Persistance.Identity;
using Microsoft.AspNetCore.Hosting;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Interfaces;
using IdentityServer4.Models;
using IdentityServer4.Test;
using System.Collections.Generic;
using System.Security.Claims;
using IdentityModel;
using Microsoft.Extensions.Hosting;

namespace Pesabooks.Infrastructure
{
    public static class DependencyInjection
    {
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration, IWebHostEnvironment environment)
        {
            var connectionString = configuration.GetConnectionString("PesabooksDatabase");

            services.AddDbContext<PesabooksDbContext>(options =>
                options.UseNpgsql(connectionString));

            services.AddScoped<IPesabooksDbContext>(provider => provider.GetService<PesabooksDbContext>());

            //Identity
            services.AddDbContext<AppIdentityDbContext>(options =>
               options.UseNpgsql(connectionString));

            services.AddIdentity<User, Role>()
                    .AddEntityFrameworkStores<AppIdentityDbContext>()
                    .AddDefaultTokenProviders();

            //IdentityServer
            if (environment.IsEnvironment("Test"))
            {
                services.AddIdentityServer()
                    .AddInMemoryIdentityResources(Config.IdentityResources)
                    .AddInMemoryClients(new[] {
                        new Client
                            {
                                ClientId = "Pesabooks.IntegrationTests",
                                AllowedGrantTypes = { GrantType.ResourceOwnerPassword },
                                ClientSecrets = { new Secret("secret".Sha256()) },
                                AllowedScopes = { "openid", "profile" }
                            }
                    })
                    .AddTestUsers(new List<TestUser>
                    {
                        new TestUser
                        {
                            SubjectId = "1",
                            Username = "test@pesabooks",
                            Password = "123qwe",
                            Claims = new List<Claim>
                            {
                                new Claim(JwtClaimTypes.Email, "test@pesabooks")
                            }
                        }
                    })
                    .AddDeveloperSigningCredential(); 
            }
            else
            {
                var builder = services.AddIdentityServer(options =>
                {
                    options.UserInteraction.LoginUrl = "/identity/account/login";
                    options.UserInteraction.ErrorUrl = "/identity/home/error";
                    options.Events.RaiseErrorEvents = true;
                    options.Events.RaiseInformationEvents = true;
                    options.Events.RaiseFailureEvents = true;
                    options.Events.RaiseSuccessEvents = true;

                    // see https://identityserver4.readthedocs.io/en/latest/topics/resources.html
                    options.EmitStaticAudienceClaim = true;
                })
                .AddInMemoryIdentityResources(Config.IdentityResources)
                .AddInMemoryApiScopes(Config.ApiScopes)
                .AddInMemoryClients(Config.Clients)
                .AddAspNetIdentity<User>()
                // not recommended for production - you need to store your key material somewhere secure
                .AddDeveloperSigningCredential();
            }

            //Tenant
            services.AddTransient<ITenantManager, TenantManager>();

            services.AddTransient<IDateTime, SystemDateTime>();

            return services;
        }
    }
}
