import { authService } from "@/api/authService";

function LogoutButton() {
  const handleLogout = () => {
    authService.logout();  // ← Clears token + redirects
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
    >
      Logout
    </button>
  );
}

export default LogoutButton;
