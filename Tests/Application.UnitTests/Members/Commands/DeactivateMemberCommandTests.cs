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
using static Pesabooks.Application.Members.Commands.DeactivateMemberCommand;

namespace Pesabooks.Application.UnitTests.Members.Commands
{
    public class DeactivateMemberCommandTests : CommandTestBase
    {
        private readonly DeactivateMemberCommandHandler _sut;

        public DeactivateMemberCommandTests() : base()
        {
            _sut = new DeactivateMemberCommandHandler(_context);
        }

        [Fact]
        public async Task Handle_GivenInvalidId_ThrowsNotFoundException()
        {
            var invalidId = -1;

            var command = new DeactivateMemberCommand { MemberId = invalidId };

            await Assert.ThrowsAsync<NotFoundException>(() => _sut.Handle(command, CancellationToken.None));
        }
    }
}
