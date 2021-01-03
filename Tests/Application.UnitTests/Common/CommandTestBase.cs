using Pesabooks.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Application.UnitTests.Common
{
    public class CommandTestBase : IDisposable
    {
        protected readonly PesabooksDbContext _context;

        public CommandTestBase()
        {
            _context = PesabooksContextFactory.Create();
        }

        public void Dispose()
        {
            PesabooksContextFactory.Destroy(_context);
        }
    }
}
