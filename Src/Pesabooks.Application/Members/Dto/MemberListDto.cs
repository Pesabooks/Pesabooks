using AutoMapper;
using Pesabooks.Application.Common.Mappings;
using Pesabooks.Domain.Members;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Application.Members.Dto
{
    public class MemberListDto : IMapFrom<Member>
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }

        public void Mapping(Profile profile)
        {
            profile.CreateMap<Member, MemberListDto>();
        }
    }
}
