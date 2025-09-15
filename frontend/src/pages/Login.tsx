// src/pages/Login.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useFirebaseAuth } from "../hooks/useFirebaseAuth";

export default function Login() {
  const { login, signup } = useFirebaseAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isNew, setIsNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    try {
      if (isNew) await signup(email, password);
      else await login(email, password);
      navigate("/feed");
    } catch (err) {
      console.error(err);
      alert((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">
          {isNew ? "Create account" : "Sign in"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={isNew}
                onChange={() => setIsNew((v) => !v)}
              />
              <span className="text-sm">Create account</span>
            </label>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Working..." : isNew ? "Create" : "Login"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
