using MediatR;
using Moq;
using Pesabooks.Application.Members.Commands;
using Pesabooks.Application.UnitTests.Common;
using Pesabooks.Domain.Members.Events;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Application.UnitTests.Members.Commands
{
    public class CreateMemberCommandTests : CommandTestBase
    {
        [Fact]
        public void Handle_GivenValidRequest_ShouldRaiseCustomerCreatedNotification()
        {
            // Arrange
            var mediatorMock = new Mock<IMediator>();
            var sut = new CreateMemberCommandHandler(_context, mediatorMock.Object);

            // Act
            var result = sut.Handle(new CreateMemberCommand { FirstName = "John", LastName = "Doe" }, CancellationToken.None);

            // Assert
            mediatorMock.Verify(m => m.Publish(It.Is<MemberCreated>(cc => cc.MemberId != 0), It.IsAny<CancellationToken>()), Times.Once);
        }
    }
}
