using Pesabooks.Application.Members.Commands;
using Pesabooks.Application.UnitTests.Common;
using Pesabooks.Common.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;
using static Pesabooks.Application.Members.Commands.DeleteMemberCommand;

namespace Pesabooks.Application.UnitTests.Members.Commands
{
    public class DeleteMemberCommandTests : CommandTestBase
    {
        private readonly DeleteMemberCommandHandler _sut;

        public DeleteMemberCommandTests() : base()
        {
            _sut = new DeleteMemberCommandHandler(_context);
        }

        [Fact]
        public async Task Handle_GivenInvalidId_ThrowsNotFoundException()
        {
            var invalidId = -1;

            var command = new DeleteMemberCommand { MemberId = invalidId };

            await Assert.ThrowsAsync<NotFoundException>(() => _sut.Handle(command, CancellationToken.None));
        }
    }
}
