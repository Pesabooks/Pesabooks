using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Common
{
    public interface IHaveTenant
    {
        public int TenantId { get; set; }
    }
}
