using AutoMapper;
using Pesabooks.Application.Common.Mappings;
using Pesabooks.Domain.Accounting;

namespace Pesabooks.Application.Accounting.Dto
{
    public class AccountsListDto : IMapFrom<Account>
    {
        public int Id { get; set; }
        public string Code { get; set; }

        public string Name { get; set; }

        public string Type { get; private set; }
        public string Category { get; private set; }

        public string CurrencyCode { get; private set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Account, AccountsListDto>();
        }
    }
}