using Microsoft.AspNetCore.Http;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Domain.Session;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ISession = Pesabooks.Domain.Session.ISession;

namespace Pesabooks.Api
{
    public class WebSession : ISession
    {
        private readonly IHttpContextAccessor _context;
        private readonly ITenantManager _tenantManager;

        public WebSession(IHttpContextAccessor context, ITenantManager tenantManager)
        {
            _context = context;
            _tenantManager = tenantManager;
        }

        public int? UserId
        {
            get
            {
                int userId = 0;
                var id = _context.HttpContext.User.Claims.Where(c => c.Type == "sub").Select(c => c.Value).FirstOrDefault();
                int.TryParse(id, out userId);

                return userId == 0 ? null : userId;
            }
        }

        public int? TenantId
        {
            get
            {
                int tenantId = 0;
                int.TryParse(_context.HttpContext?.Request.Headers["Tenant"].FirstOrDefault(), out tenantId);
                return tenantId == 0 ? null : tenantId;
            }
        }

        public Tenant Tenant
        {
            get
            {
                int tenantId;
                int.TryParse(_context.HttpContext?.Request.Headers["Tenant"].FirstOrDefault(), out tenantId);
                if (tenantId != 0)
                {
                    var tenant = _tenantManager.FindByIdAsync(tenantId).Result;
                    return tenant;
                }
                else return null;
            }
        }
    }
}
