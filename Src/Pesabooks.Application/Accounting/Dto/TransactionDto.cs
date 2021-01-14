using AutoMapper;
using Pesabooks.Accounting.Domain;
using Pesabooks.Application.Common.Mappings;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using static Pesabooks.Enums.Accounting;

namespace Pesabooks.Application.Accounting.Dto
{
    public class TransactionDto : IMapFrom<Transaction>
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
        public string TransactionDirection { get; set; }
        public int? MemberId { get; private set; }
        public virtual string MemberFullName { get; set; }

        public decimal Amount { get; set; }
        public string DebitedAccountId { get; set; }
        public string DebitedAccountName { get; set; }
        public string CreditedAccountId { get; set; }
        public string CreditedAccountName { get; set; }
        public int JournalEntriesCount { get; private set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Transaction, TransactionDto>()
                .ForMember(dest => dest.DebitedAccountId, ops => ops.MapFrom(src => src.JournalEntries.FirstOrDefault(j => j.Type == JournalEntryType.Debit).Account.Id))
                .ForMember(dest => dest.DebitedAccountName, ops => ops.MapFrom(src => src.JournalEntries.FirstOrDefault(j => j.Type == JournalEntryType.Debit).Account.Name))
                .ForMember(dest => dest.CreditedAccountId, ops => ops.MapFrom(src => src.JournalEntries.FirstOrDefault(j => j.Type == JournalEntryType.Credit).Account.Id))
                .ForMember(dest => dest.CreditedAccountName, ops => ops.MapFrom(src => src.JournalEntries.FirstOrDefault(j => j.Type == JournalEntryType.Credit).Account.Name))
                .ForMember(dest => dest.Amount, ops => ops.MapFrom(src => src.JournalEntries.First().Amount))
                .ForMember(dest => dest.TransactionDirection, ops => ops.MapFrom(src => src.Direction.ToString()));
        }
    }
}
