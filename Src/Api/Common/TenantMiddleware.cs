using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Api.Common
{
    internal class TenantMiddleware
    {
        private readonly RequestDelegate _next;

        public TenantMiddleware(RequestDelegate next)
        {
            _next = next;
        }


        public async Task Invoke(HttpContext httpContext, IPesabooksDbContext context)
        {
            //int userId = 0;
            //var id = httpContext.User.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault();
            //int.TryParse(id, out userId);

            var userId = 1;

            var user = await context.Users.Where(t => t.Id == userId).FirstOrDefaultAsync();
            httpContext.Items.Add(Constants.HttpContextUserKey, user);

            var strTenantId = httpContext?.Request.Headers[Constants.HttpContextTenantKey].FirstOrDefault();

            if (!String.IsNullOrEmpty(strTenantId))
            {
                try
                {
                    var tenantId = int.Parse(strTenantId);

                    var tenant = await context.Tenants.Where(t => t.Id == tenantId).FirstOrDefaultAsync();
                    if (tenant is null)
                    {
                        throw new UnauthorizedException("Attempted to accesss an unauthorized tenant.");
                    }
                    else
                    {
                        httpContext.Items.Add(Constants.HttpContextTenantKey, tenant);
                    }

                }
                catch (FormatException)
                {
                    throw new BadRequestException("Malformed Tenant Id. Should be a number");
                }

            }

            await _next(httpContext);
        }
    }

    public static class TenantMiddlewareMiddlewareExtensions
    {
        public static IApplicationBuilder UseTenantMiddleware(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<TenantMiddleware>();
        }
    }
}
