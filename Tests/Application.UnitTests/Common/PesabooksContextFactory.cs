using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Moq;
using Pesabooks.Accounting.Domain;
using Pesabooks.Common.Interfaces;
using Pesabooks.Common.Tests;
using Pesabooks.Domain.Members;
using Pesabooks.Domain.Session;
using Pesabooks.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Application.UnitTests.Common
{
    public class PesabooksContextFactory
    {
        public static PesabooksDbContext Create()
        {
            var options = new DbContextOptionsBuilder<PesabooksDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            var _sessionMock = new Mock<ISession>();
            _sessionMock.Setup(m => m.UserId).Returns(1);
            _sessionMock.Setup(m => m.TenantId).Returns(1);


            var _dateTimeMock = new Mock<IDateTime>();
            _dateTimeMock.Setup(m => m.UtcNow).Returns(DateTime.UtcNow);

            var context = new PesabooksDbContext(options, _sessionMock.Object, _dateTimeMock.Object);

            context.Database.EnsureCreated();

            // add members
            var memberFaker = new MemberFaker();
            var members = memberFaker.Generate(Constants.InitialMembersCount);
            for (int i = 0; i < Constants.InitialMembersArchivedCount; i++)
            {
                members[i].Deactivate();
            }
            context.Members.AddRange(members);

            context.SaveChanges();

            return context;
        }

        public static void Destroy(PesabooksDbContext context)
        {
            context.Database.EnsureDeleted();

            context.Dispose();
        }
    }
}
