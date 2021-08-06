// Copyright (c) Brock Allen & Dominick Baier. All rights reserved.
// Licensed under the Apache License, Version 2.0. See LICENSE in the project root for license information.


using IdentityServer4;
using IdentityServer4.Models;
using System.Collections.Generic;

namespace Pesabooks.IdentityServer
{
    public static class Config
    {
        public static IEnumerable<IdentityResource> IdentityResources =>
                   new IdentityResource[]
                   {
                        new IdentityResources.OpenId(),
                        new IdentityResources.Profile(),
                        new IdentityResources.Email(),
                   };


        public static IEnumerable<ApiResource> GetApiResources()
        {
            return new[]
            {
            new ApiResource
            {
                Name = "pesabooksApi",
                DisplayName = "Pesabooks API",
                Scopes = {"api"}
            }
        };
        }

        public static IEnumerable<ApiScope> ApiScopes =>
            new ApiScope[]
            {
                new ApiScope("api","Full access to Pesabooks api"),
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