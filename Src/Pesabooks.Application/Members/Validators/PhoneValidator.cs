using FluentValidation.Validators;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Application.Members.Validators
{
    public class PhoneValidator : PropertyValidator
    {
        public PhoneValidator() : base("Invalid phone number")
        {

        }
        protected override bool IsValid(PropertyValidatorContext context)
        {

            var phone = context.PropertyValue as string;

            var phoneNumberUtil = PhoneNumbers.PhoneNumberUtil.GetInstance();
            try
            {
                var phoneNumber = phoneNumberUtil.Parse(phone, null);
                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }
    }
}
