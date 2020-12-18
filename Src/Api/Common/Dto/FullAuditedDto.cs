using System;

namespace Pesabooks.Common.Dto
{
    public class FullAuditedDto
    {
        public DateTime? CreatedAt { get; set; }
        public string CreatedById { get; set; }        
        public DateTime? ModifiedAt { get; set; }
        public string ModifiedById { get; set; }
        public DateTime? DeletedAt { get; set; }
        public string DeletedById { get; set; }
    }
}
