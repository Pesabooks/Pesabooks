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
    public class Update : IClassFixture<CustomWebApplicationFactory<Startup>>
    {
        private readonly CustomWebApplicationFactory<Startup> _factory;

        public Update(CustomWebApplicationFactory<Startup> factory)
        {
            _factory = factory;
        }

        [Fact]
        public async Task GivenUpdateMemberCommand_ReturnsSuccessStatusCode()
        {
            var client = await _factory.GetAuthenticatedClientAsync();

            var command = new UpdateMemberCommand
            {
                Id = 1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@email.com",
                Phone = "+151400545623"
            };

            var content = Utilities.GetRequestContent(command);

            var response = await client.PutAsync($"/api/members/{command.Id}", content);

            response.EnsureSuccessStatusCode();
        }

        [Fact]
        public async Task GivenUpdateMemberCommand_ReturnsNotFound()
        {
            var client = await _factory.GetAuthenticatedClientAsync();

            var command = new UpdateMemberCommand
            {
                Id = -1,
                FirstName = "John",
                LastName = "Doe",
                Email = "john@email.com",
                Phone = "+888000000"
            };

            var content = Utilities.GetRequestContent(command);

            var response = await client.PutAsync($"/api/members/{command.Id}", content);

            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }

        [Theory]
        [ClassData(typeof(InvalidUpdateemberParameters))]
        public async Task WhenUpdateMember_ShouldReturnBadRequest(UpdateMemberCommand command)
        {
            // arrange
            var client = await _factory.GetAuthenticatedClientAsync();

            // act
            var content = Utilities.GetRequestContent(command);

            var response = await client.PutAsync($"/api/members/{command.Id}", content);

            // assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }

    public class InvalidUpdateemberParameters : IEnumerable<object[]>
    {
        public IEnumerator<object[]> GetEnumerator()
        {
            // Missing Id
            yield return new object[]
            {
                new UpdateMemberCommand {
                    Id = 1,
                    FirstName="John",
                    LastName="Doe",
                    Email="email",
                    Phone="+888000000"
                }
            };

            // Invalid Email
            yield return new object[]
            {
                new UpdateMemberCommand {
                    Id = 1,
                    FirstName="John",
                    LastName="Doe",
                    Email="email",
                    Phone="+888000000"
                }
            };

            // Invalid phone
            yield return new object[]
            {
                new UpdateMemberCommand          {
                    Id = 1,
                    FirstName="John",
                    LastName="Doe",
                    Email="john@email.com",
                    Phone="1234"
                }
            };

            //Empty Firstname
            yield return new object[]
            {
                new UpdateMemberCommand          {
                    Id = 1,
                    FirstName="",
                    LastName="Doe",
                    Email="john@email.com",
                    Phone="+888000000"
                }
            };

            // Empty Lastname
            yield return new object[]
            {
                new UpdateMemberCommand          {
                    Id = 1,
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
