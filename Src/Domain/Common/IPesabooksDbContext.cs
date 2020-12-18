using Microsoft.EntityFrameworkCore;
using Pesabooks.Tenancy.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Common
{
    public interface IPesabooksDbContext
    {
        //Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
