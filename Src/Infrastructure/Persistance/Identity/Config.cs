using IdentityModel;
using IdentityServer4;
using IdentityServer4.Models;
using IdentityServer4.Test;
using System.Collections.Generic;
using System.Security.Claims;

namespace Pesabooks.Infrastructure.Persistance.Identity
{
    public static class Config
    {
        public static IEnumerable<IdentityResource> IdentityResources =>
                   new IdentityResource[]
                   {
                        new IdentityResources.OpenId(),
                        new IdentityResources.Profile(),
                        new IdentityResources.Email(),
                        new IdentityResource
                        {
                            Name = "role",
                            UserClaims = new List<string> {"role"}
                        }
                   };


        public static IEnumerable<ApiResource> GetApiResources()
        {
            return new[]
            {
            new ApiResource
            {
                Name = "api",
                DisplayName = "Pesabooks API",
                Description = "Allow the application to access Pesabooks API on your behalf",
                Scopes = new List<string> {"api"},
                ApiSecrets = new List<Secret> {new Secret("ScopeSecret".Sha256())},
                UserClaims = new List<string> {"role"}
            }
        };
        }

        public static IEnumerable<ApiScope> ApiScopes =>
            new ApiScope[]
            {
                new ApiScope("api","Access to Pesabooks API"),
            };



        public static IEnumerable<Client> Clients =>
            new Client[]
            {
               

                //postman
                new Client{
                    ClientName = "Postman", //_configuration.GetSection("PostmanClient").GetValue<string>("ClientName"),
                    ClientId = "postman", //_configuration.GetSection("PostmanClient").GetValue<string>("ClientId"),
                    RequirePkce = false,
                    AllowedGrantTypes = GrantTypes.Code,
                    AllowOfflineAccess = true,
                    IdentityTokenLifetime = 60 * 60 * 24,
                    AccessTokenLifetime = 60 * 60 * 24,
                    RedirectUris = new List<string>()
                    {
                        "https://www.getpostman.com/oauth2/callback"
                    },
                    PostLogoutRedirectUris = new List<string>()
                    {
                        "https://www.getpostman.com"
                    },
                    AllowedCorsOrigins = new List<string>()
                    {
                        "https://www.getpostman.com"
                    },
                   AllowedScopes =
                    {
                        IdentityServerConstants.StandardScopes.OpenId,
                        IdentityServerConstants.StandardScopes.Profile,
                        IdentityServerConstants.StandardScopes.Email,
                        "api"
                    },
                    ClientSecrets = { new Secret("123456".Sha256()) },
                    AllowAccessTokensViaBrowser = true,
                    RequireConsent = false,
                    EnableLocalLogin = true,
                    Enabled = true
                }
            };
    }
}