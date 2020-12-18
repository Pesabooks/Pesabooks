using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Session
{
    public interface ISession
    {
        /// <summary>
        /// Gets current UserId or null.
        /// It can be null if no user logged in.
        /// </summary>
        int? UserId { get; }

        /// <summary>
        /// Gets current Tenant or null.
        /// This TenantId should be the TenantId of the <see cref="UserId"/>.
        /// It can be null if is a host user or no user logged in.
        /// </summary>
        int? TenantId { get; }



    }
}
