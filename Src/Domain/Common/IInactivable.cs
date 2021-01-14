using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Common
{
    public interface IInactivable
    {
        public bool IsInactive { get; set; }
        public void Deactivate();
    }
}
