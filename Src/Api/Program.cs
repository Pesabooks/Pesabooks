using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Pesabooks.Infrastructure.Persistance;
using Serilog;
using Serilog.Events;
using Serilog.Sinks.SystemConsole.Themes;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;

namespace Pesabooks.Api
{
    public class Program
    {
        public static void Main(string[] args)
        {
            Activity.DefaultIdFormat = ActivityIdFormat.W3C;

            Log.Logger = new LoggerConfiguration()
           .MinimumLevel.Debug()
           .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
           .MinimumLevel.Override("Microsoft.Hosting.Lifetime", LogEventLevel.Information)
           .MinimumLevel.Override("System", LogEventLevel.Warning)
           .MinimumLevel.Override("Microsoft.AspNetCore.Authentication", LogEventLevel.Information)
           .MinimumLevel.Override("Microsoft.AspNetCore.Authentication.JwtBearer", LogEventLevel.Debug)
           .Enrich.FromLogContext()
           .WriteTo.Console(outputTemplate: "[{Timestamp:HH:mm:ss} {Level}] {SourceContext}{NewLine}{Message:lj}{NewLine}{Exception}{NewLine}", theme: AnsiConsoleTheme.Code)
           .CreateLogger();

            try
            {
                var host = CreateHostBuilder(args).Build();

                var config = host.Services.GetRequiredService<IConfiguration>();
                var connectionString = config.GetConnectionString("PesabooksDatabase");
                SeedData.EnsureSeedData(connectionString);

                host.Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Host terminated unexpectedly.");
                throw;
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
             .UseSerilog()
            .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseStartup<Startup>();
                });
    }
}
