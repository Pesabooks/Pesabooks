using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Pesabooks.Api.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Api
{
    public class TenantActionFilter : IActionFilter
    {
        public void OnActionExecuted(ActionExecutedContext context)
        {

        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            var tenant = context.HttpContext.Items[Constants.HttpContextTenantKey];
            if (tenant is null)
            {
                context.Result = new BadRequestObjectResult("Tenant is required");
                return;
            }
        }
    }
}
