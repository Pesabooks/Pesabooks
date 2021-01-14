using System;
using System.Collections.Generic;
using System.Text;

namespace Pesabooks.Domain.Common
{
    /// <summary>
    /// Used to standardize soft deleting entities.
    /// Soft-delete entities are not actually deleted,
    /// marked as IsDeleted = true in the database,
    /// but can not be retrieved to the application.
    /// </summary>
    public interface ISoftDelete
    {
        /// <summary>
        /// Used to mark an Entity as 'Deleted'. 
        /// </summary>
        bool IsDeleted { get; set; }

        /// <summary>
        /// The soft deletion time for this entity.
        /// </summary>
        DateTime? DeletedAt { get; set; }
        /// <summary>
        /// Last modified user id for this entity.
        /// </summary>
        int? DeletedById { get; set; }
    }
}
