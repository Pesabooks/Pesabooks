using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Common
{
    public record Phone
    {
        public string CountryCode { get; private set; }
        [MaxLength(20)]
        public string Number { get; private set; }
        public string NationalFormat { get; private set; }
    }
}
