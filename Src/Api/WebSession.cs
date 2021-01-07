using Microsoft.AspNetCore.Http;
using Pesabooks.Api.Common;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Domain.Identity;
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

        public WebSession(IHttpContextAccessor context)
        {
            _context = context;
        }

        public User CurrentUser
        {
            get => _context.HttpContext.Items[Constants.HttpContextUserKey] as User;
        }

        public Tenant Tenant
        {
            get => _context.HttpContext.Items[Constants.HttpContextTenantKey] as Tenant;
        }

        public int? UserId => CurrentUser?.Id;

        public int? TenantId => Tenant?.Id;
    }
}
