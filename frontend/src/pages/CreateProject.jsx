// src/pages/CreateProject.jsx
import React, { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [evaluatorId, setEvaluatorId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/projects", { name, description, evaluatorId });
      toast({ title: "Created!", description: "Project created." });
      navigate("/evaluator/dashboard");
    } catch (err) {
      toast({ title: "Error", description: err, variant: "destructive" });
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Create Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div>
          <Label>Description</Label>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <Label>Evaluator ID</Label>
          <Input value={evaluatorId} onChange={(e) => setEvaluatorId(e.target.value)} required />
        </div>
        <Button type="submit">Create</Button>
      </form>
    </div>
  );
}