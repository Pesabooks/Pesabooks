using Newtonsoft.Json;
using Pesabooks.Common.Tests;
using Pesabooks.Infrastructure.Persistance;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Pesabooks.Api.IntegrationTests.Common
{
    public class Utilities
    {
        public static StringContent GetRequestContent(object obj)
        {
            return new StringContent(JsonConvert.SerializeObject(obj), Encoding.UTF8, "application/json");
        }

        public static async Task<T> GetResponseContent<T>(HttpResponseMessage response)
        {
            var stringResponse = await response.Content.ReadAsStringAsync();

            var result = JsonConvert.DeserializeObject<T>(stringResponse);

            return result;
        }

        public static void InitializeDbForTests(PesabooksDbContext context)
        {
            var memberFaker = new MemberFaker();
            context.Members.AddRange(memberFaker.Generate(10));
            context.SaveChangesAsync().Wait();
        }
    }
}
