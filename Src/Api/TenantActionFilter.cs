using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
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
            var tenant = context.HttpContext?.Request.Headers["Tenant"].FirstOrDefault();
            if (tenant is null)
            {
                context.Result = new BadRequestObjectResult("Tenant is required");
                return;
            }
        }
    }
}
