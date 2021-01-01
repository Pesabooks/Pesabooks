using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pesabooks.Application.Accounting.Commands;
using Pesabooks.Application.Accounting.Queries;
using Pesabooks.Domain.Session;
using System.Threading.Tasks;

namespace Pesabooks.Api.Controllers
{
    [Authorize]
    public class AccountsController : BaseController
    {
        public AccountsController(ISession session)
        {
            var tenant = session.Tenant;
        }

        // GET: api/accounts
        [HttpGet]
        public async Task<ActionResult<AccountsListDto>> Get([FromQuery] GetAccountsListQuery query)
        {
            var list = await Mediator.Send(query);

            return Ok(list);
        }

        [HttpPost("defaultAccount")]
        public async Task<ActionResult> Post()
        {
            await Mediator.Send(new CreateDefaultAccountsCommand());
            return Ok();
        }

        //// GET api/<ValuesController>/5
        //[HttpGet("{id}")]
        //public string Get(int id)
        //{
        //    return "value";
        //}

        //// POST api/<ValuesController>
        //[HttpPost]
        //public void Post([FromBody] string value)
        //{
        //}

        //// PUT api/<ValuesController>/5
        //[HttpPut("{id}")]
        //public void Put(int id, [FromBody] string value)
        //{
        //}

        //// DELETE api/<ValuesController>/5
        //[HttpDelete("{id}")]
        //public void Delete(int id)
        //{
        //}
    }
}
