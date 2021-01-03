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
using static Pesabooks.Application.Members.Commands.ArchiveMemberCommand;

namespace Pesabooks.Application.UnitTests.Members.Commands
{
    public class ArchiveMemberCommandTests : CommandTestBase
    {
        private readonly ArchiveMemberCommandHandler _sut;

        public ArchiveMemberCommandTests() : base()
        {
            _sut = new ArchiveMemberCommandHandler(_context);
        }

        [Fact]
        public async Task Handle_GivenInvalidId_ThrowsNotFoundException()
        {
            var invalidId = -1;

            var command = new ArchiveMemberCommand { MemberId = invalidId };

            await Assert.ThrowsAsync<NotFoundException>(() => _sut.Handle(command, CancellationToken.None));
        }
    }
}
