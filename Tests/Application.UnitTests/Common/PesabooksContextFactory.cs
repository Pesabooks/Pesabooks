using Microsoft.EntityFrameworkCore;
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
                .Options;

            var _sessionMock = new Mock<ISession>();
            _sessionMock.Setup(m => m.UserId).Returns(1);
            _sessionMock.Setup(m => m.TenantId).Returns(1);


            var _dateTimeMock = new Mock<IDateTime>();
            _dateTimeMock.Setup(m => m.UtcNow).Returns(DateTime.UtcNow);

            var context = new PesabooksDbContext(options, _sessionMock.Object, _dateTimeMock.Object);

            context.Database.EnsureCreated();

            context.Accounts.AddRange(DefaultAccounts.GetDefaultAccounts("CAD"));

            var memberFaker = new MemberFaker();
            var members = memberFaker.Generate(10);
            for (int i = 0; i < 4; i++)
            {
                members[i].Archive();
            }
            context.Members.AddRange(members);
            context.SaveChangesAsync().Wait();

            return context;
        }

        public static void Destroy(PesabooksDbContext context)
        {
            context.Database.EnsureDeleted();

            context.Dispose();
        }
    }
}
