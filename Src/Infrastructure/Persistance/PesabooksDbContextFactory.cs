
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using Pesabooks.Domain.Session;
using System;
using System.IO;

namespace Pesabooks.Infrastructure.Persistance
{
    public class PesabooksDbContextFactory : DesignTimeDbContextFactoryBase<PesabooksDbContext>
    {
        
        protected override PesabooksDbContext CreateNewInstance(DbContextOptions<PesabooksDbContext> options)
        {
            return new PesabooksDbContext(new NullSession(), options);
        }
    }

   

  
}
