using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Common
{
    public interface IAuditable
    {
        /// <summary>
        /// The creation time for this entity.
        /// </summary>
        DateTime? CreatedAt { get; set; }

        /// <summary>
        /// created user Id for this entity.
        /// </summary>
        int? CreatedById { get; set; }

        /// <summary>
        /// The last modified time for this entity.
        /// </summary>
        DateTime? ModifiedAt { get; set; }
        /// <summary>
        /// Last modified user id for this entity.
        /// </summary>
        int? ModifiedById { get; set; }
    }
}
