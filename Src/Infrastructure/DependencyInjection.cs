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
        public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("PesabooksDatabase");

            services.AddDbContext<PesabooksDbContext>(options =>
                options.UseNpgsql(connectionString));

            services.AddScoped<IPesabooksDbContext>(provider => provider.GetService<PesabooksDbContext>());

            services.AddTransient<IDateTime, SystemDateTime>();

            return services;
        }
    }
}
