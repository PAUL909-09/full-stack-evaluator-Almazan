using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace task_manager_api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _config;

        public EmailService(IConfiguration config)
        {
            _config = config;
        }

        // Send HTML email using SMTP (configured via appsettings.json)
        public async Task SendEmailAsync(string toEmail, string subject, string body)
        {
            var fromEmail = _config["Email:From"] 
                ?? throw new InvalidOperationException("Email:From not configured in appsettings.json");

            var password = _config["Email:Password"]
                ?? throw new InvalidOperationException("Email:Password not configured in appsettings.json");

            var smtpHost = _config["Email:SmtpHost"]
                ?? throw new InvalidOperationException("Email:SmtpHost not configured");

            var smtpPort = int.TryParse(_config["Email:SmtpPort"], out var port) ? port : 587;

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                Credentials = new NetworkCredential(fromEmail, password),
                EnableSsl = true
            };

            using var mail = new MailMessage(fromEmail, toEmail, subject, body)
            {
                IsBodyHtml = true
            };

            try
            {
                await client.SendMailAsync(mail);
                Console.WriteLine($"Email sent to {toEmail}");
            }
            catch (SmtpException ex)
            {
                Console.WriteLine($"SMTP Error sending email to {toEmail}: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"General error sending email to {toEmail}: {ex.Message}");
                throw;
            }
        }
    }
}