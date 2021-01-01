using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Domain.Members.Events
{
    public class MemberCreated : INotification
    {
        public int MemberId { get; set; }
    }
}
