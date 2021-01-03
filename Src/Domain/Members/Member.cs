using Pesabooks.Domain.Common;

namespace Pesabooks.Domain.Members
{
    public class Member : BaseEntity, IHaveTenant, IArchivable
    {
        public string FirstName { get; private set; }
        public string LastName { get; private set; }
        public string FullName { get; private set; }
        public string Email { get; private set; }
        public string Phone { get; private set; }
        public int TenantId { get; set; }
        public bool IsArchived { get;  set; }

        private Member()
        {

        }
        public Member(string firstName, string lastame)
        {
            FirstName = firstName;
            LastName = lastame;
        }
        public Member(string firstName, string lastame, string email, string phone)
            : this(firstName, lastame)
        {
            Email = email;
            Phone = phone;
        }

        public void Update(string firstName, string lastame, string email, string phone)
        {
            FirstName = firstName;
            LastName = lastame;
            Email = email;
            Phone = phone;
        }

        public void Archive()
        {
            IsArchived = !IsArchived;
        }
    }
}
