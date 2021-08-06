using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pesabooks.Application.Accounting.Commands.Accounts;
using Pesabooks.Application.Accounting.Dto;
using Pesabooks.Application.Accounting.Queries;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Pesabooks.Api.Controllers
{
    public class ApiError
    {
        public string Message { get; set; }
    }

    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public class AccountsController : BaseController
    {
        public AccountsController()
        {
        }

        // GET: api/accounts
        [HttpGet]
        public async Task<IEnumerable<AccountsListDto>> GetAll(bool IncludeDeactivated = false)
        {
            var list = await Mediator.Send(new GetAccountsListQuery { IncludeDeactivated = IncludeDeactivated });
            return list;
        }

        [HttpGet("{id}/journalEntries")]
        [ProducesResponseType(StatusCodes.Status200OK, Type = typeof(JournalEntryDto[]))]
        public async Task<ActionResult<JournalEntryDto[]>> GetJournalEntries(int id)
        {
            var query = new GetJournalEntriesListQuery { AccountId = id };
            var entries = await Mediator.Send(query); ;

            return Ok(entries);
        }


        // POST api/accounts
        [HttpPost]
        public async Task Post([FromBody] CreateAccountCommand command)
        {
            await Mediator.Send(command);
        }

        // PUT api/AccountS/5
        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody] UpdateAccountCommand command)
        {
            await Mediator.Send(command);
        }

        //// DELETE api/AccountS/5
        //[HttpDelete("{id}")]
        //public async Task Delete(int id)
        //{
        //    await Mediator.Send(new DeleteAccountCommand { AccountId = id });
        //}

        // POST api/accounts
        [HttpPost("{id}/deactivate")]
        public async Task Deactivate(int id)
        {
            var command = new DeactivateAccountCommand { AccountId = id };
            await Mediator.Send(command);
        }

    }

}
