using MediatR;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Common.Exceptions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using static AutoMapper.Internal.ExpressionFactory;

namespace Pesabooks.Application.Members.Commands
{
    public class UpdateMemberCommand : IRequest
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
    }

    public class UpdateMemberCommandHandler : IRequestHandler<UpdateMemberCommand>
    {
        private readonly IPesabooksDbContext _dbContext;

        public UpdateMemberCommandHandler(IPesabooksDbContext context)
        {
            _dbContext = context;
        }

        public async Task<Unit> Handle(UpdateMemberCommand request, CancellationToken cancellationToken)
        {
            var member = await _dbContext.Members
                .FindAsync(request.Id);

            if (member == null)
            {
                throw new NotFoundException(nameof(Member), request.Id);
            }

            var phoneNumberUtil = PhoneNumbers.PhoneNumberUtil.GetInstance();
            var phone = phoneNumberUtil.Parse(request.Phone, null);
            var formattedPhone = phoneNumberUtil.Format(phone, PhoneNumbers.PhoneNumberFormat.E164);


            member.Update(request.FirstName, request.LastName, request.Email, formattedPhone);

            await _dbContext.SaveChangesAsync(cancellationToken);

            return Unit.Value;
        }
    }
}
