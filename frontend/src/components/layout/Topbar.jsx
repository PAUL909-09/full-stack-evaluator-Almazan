// import React from "react";
// import { authService } from "@/api/authService";

// export default function Topbar(){
//   const user = authService.getCurrentUser();

//   return (
//     <header className="flex items-center justify-between bg-white p-3 border-b">
//       <div>Welcome, {user?.email}</div>
//       <div>
//         <button onClick={() => authService.logout()} className="text-red-500">Logout</button>
//       </div>
//     </header>
//   );
// }import React from "react";
import { authService } from "@/api/authService";
import LogoutButton from "../ui/LogoutButton"; // ← Added import for LogoutButton

export default function Topbar() {
  const user = authService.getCurrentUser();

  return (
    <header className="flex items-center justify-between bg-white p-3 border-b">
      <div>Welcome, {user?.email}</div>
      <div>
        <LogoutButton /> 
      </div>
    </header>
  );
}
