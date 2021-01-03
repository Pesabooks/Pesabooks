using IdentityModel.Client;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Domain.Session;
using Pesabooks.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Api.IntegrationTests.Common
{
    public class CustomWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder
                .ConfigureServices(services =>
                {
                    // Create a new service provider.
                    var serviceProvider = new ServiceCollection()
                        .AddEntityFrameworkInMemoryDatabase()
                        .BuildServiceProvider();

                    var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<PesabooksDbContext>));

                    services.Remove(descriptor);

                    // Add a database context using an in-memory 
                    // database for testing.
                    services.AddDbContext<PesabooksDbContext>(options =>
                    {
                        options.UseInMemoryDatabase("InMemoryDbForTesting");
                        options.UseInternalServiceProvider(serviceProvider);
                    });

                    services.AddScoped<ISession, TestSession>();
                    services.AddScoped<IPesabooksDbContext>(provider => provider.GetService<PesabooksDbContext>());

                    var sp = services.BuildServiceProvider();

                    // Create a scope to obtain a reference to the database
                    using var scope = sp.CreateScope();
                    var scopedServices = scope.ServiceProvider;
                    var context = scopedServices.GetRequiredService<PesabooksDbContext>();
                    var logger = scopedServices.GetRequiredService<ILogger<CustomWebApplicationFactory<TStartup>>>();

                    // Ensure the database is created.
                    context.Database.EnsureCreated();

                    try
                    {
                        // Seed the database with test data.
                        Utilities.InitializeDbForTests(context);
                    }
                    catch (Exception ex)
                    {
                        logger.LogError(ex, "An error occurred seeding the " +
                                            $"database with test messages. Error: {ex.Message}");
                    }
                })
                .UseEnvironment("Test");
        }

        public HttpClient GetAnonymousClient()
        {
            return CreateClient();
        }

        public async Task<HttpClient> GetAuthenticatedClientAsync()
        {
            return await GetAuthenticatedClientAsync("test@pesabooks", "123qwe");
        }

        public async Task<HttpClient> GetAuthenticatedClientAsync(string userName, string password, string tenantId = "1")
        {
            var client = CreateClient();

            var token = await GetAccessTokenAsync(client, userName, password);

            client.SetBearerToken(token);
            client.DefaultRequestHeaders.Add("Tenant", tenantId);

            return client;
        }

        private async Task<string> GetAccessTokenAsync(HttpClient client, string userName, string password)
        {
            var disco = await client.GetDiscoveryDocumentAsync();

            if (disco.IsError)
            {
                throw new Exception(disco.Error);
            }

            var response = await client.RequestPasswordTokenAsync(new PasswordTokenRequest
            {
                Address = disco.TokenEndpoint,
                ClientId = "Pesabooks.IntegrationTests",
                ClientSecret = "secret",
                GrantType = IdentityServer4.Models.GrantType.ResourceOwnerPassword,
                Scope = "openid profile",
                UserName = userName,
                Password = password
            });

            if (response.IsError)
            {
                throw new Exception(response.Error);
            }

            return response.AccessToken;
        }
    }
}
