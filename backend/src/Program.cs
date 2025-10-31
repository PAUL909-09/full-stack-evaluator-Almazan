using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;
using task_manager_api.Data;
using task_manager_api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;

DotNetEnv.Env.Load(); // Load environment variables from .env if present

var builder = WebApplication.CreateBuilder(args);

// --- Add services ---
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// --- Swagger Configuration ---
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TaskManager API",
        Version = "v1",
        Description = "Full Stack Evaluator Backend API with JWT Authentication"
    });
});

// --- Database Configuration ---
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// --- Add Custom Services ---
builder.Services.AddScoped<AuthService>();

// --- JWT Authentication Configuration ---
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Secret"]!)
        ),
        ClockSkew = TimeSpan.Zero // Token expires exactly at the expiration time
    };
});

builder.Services.AddAuthorization();

// --- CORS Policy (allow React frontend to connect) ---
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// --- Build App ---
var app = builder.Build();

// --- Middleware Pipeline ---
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskManager API v1");
    c.RoutePrefix = "swagger"; // Access via /swagger
});

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
