using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Pesabooks.Application.Accounting.Commands;
using Pesabooks.Application.Accounting.Dto;
using Pesabooks.Application.Accounting.Queries;
using Pesabooks.Application.Transactioning.Commands.Transactions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Api.Controllers
{

    public class TransactionsController : BaseController
    {
        [HttpPost()]
        public async Task<ActionResult> Post([FromBody] CreateTransactionCommand command)
        {
            await Mediator.Send(command);
            return Ok();
        }

        [HttpGet]
        public async Task<IEnumerable<TransactionDto>> Get([FromQuery] GetTransactionsListQuery query)
        {
            var transactions = await Mediator.Send(query);
            return transactions;
        }

        [HttpDelete("{id}")]
        public async Task Delete(int id)
        {
            await Mediator.Send(new DeleteTransactionCommand { TransactionId = id });
        }
    }
}
