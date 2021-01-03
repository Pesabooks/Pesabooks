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
using static Pesabooks.Application.Members.Commands.UpdateMemberCommand;

namespace Pesabooks.Application.UnitTests.Members.Commands
{
    public class UpdateMemberCommandTests : CommandTestBase
    {
        private readonly UpdateMemberCommandHandler _sut;

        public UpdateMemberCommandTests() : base()
        {
            _sut = new UpdateMemberCommandHandler(_context);
        }

        [Fact]
        public async Task Handle_GivenInvalidId_ThrowsNotFoundException()
        {
            var invalidId = -1;

            var command = new UpdateMemberCommand { Id = invalidId, FirstName = "John Doe" };

            await Assert.ThrowsAsync<NotFoundException>(() => _sut.Handle(command, CancellationToken.None));
        }
    }
}
