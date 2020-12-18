using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Pesabooks.Infrastructure.Persistance;
using Microsoft.Extensions.Configuration;
using Pesabooks.Domain.Common;
using Microsoft.AspNetCore.Identity;
using Pesabooks.Domain.Identity;
using Pesabooks.Infrastructure.Persistance.Identity;
using Microsoft.AspNetCore.Hosting;

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

            var builder = services.AddIdentityServer(options =>
            {
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
            .AddAspNetIdentity<User>();

            // not recommended for production - you need to store your key material somewhere secure
            builder.AddDeveloperSigningCredential();

            return services;
        }
    }
}
