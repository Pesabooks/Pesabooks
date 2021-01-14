using AutoMapper;
using Pesabooks.Application.Common.Mappings;
using Pesabooks.Domain.Accounting;
using System;

namespace Pesabooks.Application.Accounting.Dto
{
    public class JournalEntryDto: IMapFrom<JournalEntry>
    {
        public int AccountId { get; set; }
        public string AccountName { get; set; }

        public int TransactionId { get; set; }
        public string TransactionDescription { get; set; }
        public DateTime TransactionDate { get; set; }
        public string TransactionType { get; set; }
        public int? TransactionMemberId { get; set; }
        public string TransactionMemberFullName { get; set; }
        public decimal Amount { get; private set; }
        public string Type { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<JournalEntry, JournalEntryDto>();
        }
    }
}
