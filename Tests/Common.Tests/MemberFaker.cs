using Bogus;
using Pesabooks.Domain.Members;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Common.Tests
{
    public class MemberFaker : Faker<Member>
    {
        public MemberFaker()
        {
            CustomInstantiator(f => new Member(f.Name.FirstName(),
                 f.Name.LastName(),
                 f.Internet.Email(),
                 f.Phone.PhoneNumber()
                 ));
        }
    }
}
