using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Pesabooks.Api.Common;
using Pesabooks.Api.Controllers;
using Pesabooks.Application;
using Pesabooks.Application.Common.Interfaces;
using Pesabooks.Domain.Session;
using Pesabooks.Infrastructure;
using System.Threading.Tasks;

namespace Pesabooks.Api
{
    public class Startup
    {
        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            Configuration = configuration;
            Environment = environment;
        }

        public IConfiguration Configuration { get; }
        public IWebHostEnvironment Environment { get; }
        readonly string MyAllowSpecificOrigins = "_myAllowSpecificOrigins";

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {

            services.AddCors(options =>
            {
                options.AddPolicy(name: MyAllowSpecificOrigins,
                    builder =>
                    {
                        builder.WithOrigins("http://localhost:3000").AllowAnyMethod().AllowAnyHeader();
                    });
            });

            services.AddControllersWithViews(options =>
            {
                options.Filters.Add(new ProducesResponseTypeAttribute(typeof(ApiError), Microsoft.AspNetCore.Http.StatusCodes.Status400BadRequest));
            }).AddFluentValidation(fv => fv.RegisterValidatorsFromAssemblyContaining<IPesabooksDbContext>()); ;


            services.AddApplication();
            services.AddInfrastructure(Configuration, Environment);

            services.AddAuthentication("Bearer")
            .AddIdentityServerAuthentication(options =>
            {
                options.Authority = "https://localhost:5001";
                options.RequireHttpsMetadata = false;
                options.ApiName = "pesabooksApi";
            });



            services.ConfigureApplicationCookie(options =>
            {
                options.Events.OnRedirectToLogin = context =>
                {
                    context.Response.Headers["Location"] = context.RedirectUri;
                    context.Response.StatusCode = 401;
                    return Task.CompletedTask;
                };

            });
            services.AddScoped<ISession, WebSession>();

            services.AddScoped<TenantActionFilter>();

            services.AddControllers();
            services.AddSwaggerGen(c =>
            {
                c.SwaggerDoc("v1", new OpenApiInfo { Title = "Pesabooks.Api", Version = "v1" });
                c.OperationFilter<AddRequiredHeaderParameter>();
            });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

            if (env.IsDevelopment())
            {

                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Pesabooks.Api v1"));
            }

            app.UseCustomExceptionHandler();
            app.UseHttpsRedirection();

            app.UseStaticFiles();

            app.UseRouting();


            app.UseAuthentication();
            app.UseIdentityServer();
            app.UseAuthorization();

            app.UseTenantMiddleware();

            app.UseCors(MyAllowSpecificOrigins);
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "areas",
                    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}"
                 );
                endpoints.MapControllers();
            });
        }
    }
}
