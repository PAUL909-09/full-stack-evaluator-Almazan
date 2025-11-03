// frontend/src/pages/Admin/AdminVerifyUsers.jsx
import React, { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminVerifyUsers() {
  const [pending, setPending] = useState([]);
  const { toast } = useToast();

  // Fixed: Added 'toast' to dependency array
  useEffect(() => {
    api.get("/admin/pending-users")
      .then(res => setPending(res.data))
      .catch(err => {
        toast({
          title: "Failed to load users",
          description: err.message || "Please try again.",
          variant: "destructive"
        });
      });
  }, [toast]); // ESLint satisfied

  const verify = async (id) => {
    try {
      await api.post(`/admin/verify/${id}`);
      setPending(prev => prev.filter(u => u.id !== id)); // Use functional update
      toast({ title: "Verified!", description: "User email verified." });
    } catch (err) {
      toast({
        title: "Verification failed",
        description: err.message || "Something went wrong.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-gray-800">Verify Pending Users</h1>

      {pending.length === 0 ? (
        <div className="bg-green-50 border border-green-200 text-green-700 p-6 rounded-lg text-center">
          <p className="text-lg font-medium">All users are verified!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pending.map(user => (
            <Card
              key={user.id}
              className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500"
            >
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">{user.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex justify-between items-center">
                <div>
                  <p className="text-gray-600">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p className="text-gray-600">
                    <span className="font-medium">Role:</span>{" "}
                    <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full
                      ${user.role === "Evaluator" ? "bg-purple-100 text-purple-800" : "bg-orange-100 text-orange-800"}`}>
                      {user.role}
                    </span>
                  </p>
                </div>
                <Button
                  onClick={() => verify(user.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Verify Email
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}