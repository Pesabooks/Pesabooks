using System;
using System.Collections.Generic;
using System.Text;

namespace Pesabooks.Domain.Common
{
    public interface IAuditableEntity
    {
        public string CreatedBy { get; set; }

        public DateTime Created { get; set; }

        public string LastModifiedBy { get; set; }

        public DateTime? LastModified { get; set; }
    }
}
