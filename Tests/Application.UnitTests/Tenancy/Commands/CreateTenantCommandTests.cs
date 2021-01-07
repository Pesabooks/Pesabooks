using MediatR;
using Moq;
using Pesabooks.Application.Tenancy.Commands;
using Pesabooks.Application.UnitTests.Common;
using Pesabooks.Domain.Session;
using Shouldly;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Application.UnitTests.Tenancy.Commands
{
    public class CreateTenantCommandTests : CommandTestBase
    {
        Mock<ISession> sessionMock;

        public CreateTenantCommandTests()
        {
            sessionMock = new Mock<ISession>();
            sessionMock.Setup(s => s.UserId).Returns(1);

        }
        [Fact]
        public void Handle_GivenValidRequest_ShouldRaiseCustomerCreatedNotification()
        {
            // Arrange           
            var sut = new CreateTenantCommandHandler(sessionMock.Object, _context);

            // Act
            var tenantId = sut.Handle(new CreateTenantCommand { Name = "Tenant", Description = "Desc", DefaultCurrency = "CAD" }, CancellationToken.None).Result;

            // Assert
            sessionMock.Setup(s => s.TenantId).Returns(tenantId);
            var roles = _context.Roles.ToList();
            var tenant = _context.Tenants.ToArray();
            roles.Count.ShouldBe(3);

            var userTenants = tenant[0].UserTenants.ToList();
            userTenants.Count.ShouldBe(1);
            userTenants[0].UserId.ShouldBe(1);
            userTenants[0].TenantId.ShouldBe(tenantId);

            var userRoles = _context.UserRoles.ToList();
            userRoles[0].UserId.ShouldBe(1);
            userRoles[0].TenantId.ShouldBe(tenantId);
        }
    }
}
