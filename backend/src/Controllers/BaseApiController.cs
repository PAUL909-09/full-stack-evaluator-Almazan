using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace task_manager_api.Controllers
{
    [ApiController]
    public abstract class BaseApiController : ControllerBase
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        protected BaseApiController(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        protected (Guid userId, string role) GetCurrentUser()
        {
            var user = _httpContextAccessor.HttpContext!.User;

            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("User ID claim is missing.");

            var roleClaim = user.FindFirst(ClaimTypes.Role)?.Value ?? "";

            if (!Guid.TryParse(userIdClaim, out var userId))
                throw new UnauthorizedAccessException("Invalid user ID in token.");

            return (userId, roleClaim);
        }
    }
}
