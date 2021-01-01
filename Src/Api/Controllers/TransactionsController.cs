using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pesabooks.Application.Accounting.Commands;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Api.Controllers
{

    public class TransactionsController : BaseController
    {
        [HttpPost("deposit")]
        public async Task<ActionResult> Post([FromBody] MakeDepositCommand command)
        {
            await Mediator.Send(command);
            return Ok();
        }
    }
}
