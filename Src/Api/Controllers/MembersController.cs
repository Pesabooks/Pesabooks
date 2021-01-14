using Microsoft.AspNetCore.Mvc;
using Pesabooks.Application.Members.Commands;
using Pesabooks.Application.Members.Dto;
using Pesabooks.Application.Members.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace Pesabooks.Api.Controllers
{

    public class MembersController : BaseController
    {
        // GET: api/<MembersController>
        [HttpGet]
        public async Task<ActionResult<MemberListDto>> Get()
        {
            var members = await Mediator.Send(new GetMemberListQuery());

            return Ok(members);
        }

        // POST api/<MembersController>
        [HttpPost]
        public async Task Post([FromBody] CreateMemberCommand command)
        {
            await Mediator.Send(command);
        }

        // PUT api/<MembersController>/5
        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody] UpdateMemberCommand command)
        {
            await Mediator.Send(command);
        }

        // DELETE api/<MembersController>/5
        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await Mediator.Send(new DeleteMemberCommand { MemberId = id });
        }

        [HttpPost("{id}/deactivate")]
        public async Task Deactivate(int id)
        {
            await Mediator.Send(new DeactivateMemberCommand { MemberId = id });
        }
    }
}
