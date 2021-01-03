using Pesabooks.Api.IntegrationTests.Common;
using Pesabooks.Application.Members.Commands;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Pesabooks.Api.IntegrationTests.Controllers.Members
{
    public class Create : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public Create(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GivenCreateMemberCommand_ReturnsSuccessStatusCode()
        {
            var client = await _factory.GetAuthenticatedClientAsync();

            var command = new CreateMemberCommand
            {
                FirstName = "John",
                LastName = "Doe",
                Email = "john@email.com",
                Phone = "+888000000"
            };

            var content = Utilities.GetRequestContent(command);

            var response = await client.PostAsync($"/api/members", content);

            response.EnsureSuccessStatusCode();
        }

        [Theory]
        [ClassData(typeof(InvalidCreateMemberParameters))]
        public async Task WhenCreateMember_ShouldReturnBadRequest(CreateMemberCommand command)
        {
            // arrange
            var client = await _factory.GetAuthenticatedClientAsync();

            // act
            var content = Utilities.GetRequestContent(command);

            var response = await client.PostAsync($"/api/members", content);

            // assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    public class InvalidCreateMemberParameters : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            // Invalid Email
            yield return new object[]
            {
                new CreateMemberCommand          {
                    FirstName="John",
                    LastName="Doe",
                    Email="email",
                    Phone="+888000000"
                }
            };

            // Invalid phone
            yield return new object[]
            {
                new CreateMemberCommand          {
                    FirstName="John",
                    LastName="Doe",
                    Email="john@email.com",
                    Phone="1234"
                }
            };

            //Empty Firstname
            yield return new object[]
            {
                new CreateMemberCommand          {
                    FirstName="",
                    LastName="Doe",
                    Email="john@email.com",
                    Phone="+888000000"
                }
            };

            // Empty Lastname
            yield return new object[]
            {
                new CreateMemberCommand          {
                    FirstName="John",
                    LastName="",
                    Email="john@email.com",
                    Phone="+888000000"
                }
            };

        }

        IEnumerator IEnumerable.GetEnumerator() => GetEnumerator();
    }
}
