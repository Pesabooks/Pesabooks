using AutoMapper;
using Pesabooks.Application.Common.Mappings;
using Pesabooks.Tenancy.Domain;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Application.Tenancy.Dto
{
    public class TenantDto : IMapFrom<Tenant>
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public string DefaultCurrency { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Tenant, TenantDto>();
        }
    }
}
