using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pesabooks.Application.Tenancy.Commands;
using Pesabooks.Application.Tenancy.Dto;
using Pesabooks.Application.Tenancy.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TenantsController : ControllerBase
    {
        private IMediator Mediator;

        public TenantsController(IMediator mediator)
        {
            Mediator = mediator;
        }

        [HttpPost]
        public async Task Post([FromBody] CreateTenantCommand command)
        {
            await Mediator.Send(command);
        }


        [HttpGet]
        public async Task<ActionResult<TenantDto>> Get()
        {
            var tenants = await Mediator.Send(new GetTenantListQuery());
            return Ok(tenants);
        }
    }
}
