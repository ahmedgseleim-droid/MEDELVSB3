import { useState } from "react";
import { login, type UserRole } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordGateProps {
  onSuccess: (role: UserRole, username: string) => void;
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(username, password);
    setLoading(false);
    if (result) {
      onSuccess(result.role, result.username);
    } else {
      setError("Incorrect username or password. Please try again.");
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#F0F0F0" }}>
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-sm" style={{ border: "2px solid #C60C30" }}>

        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ background: "#C60C30" }} />
            <span className="text-xs font-bold tracking-widest uppercase" style={{ color: "#646464" }}>
              MED-EL
            </span>
          </div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "#C60C30" }}>
            Device Tracker
          </h1>
          <p className="text-sm" style={{ color: "#979594" }}>
            Sign in to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username — only needed for staff */}
          <div className="space-y-1.5">
            <Label htmlFor="username" style={{ color: "#0D0D0D" }}>
              Username <span style={{ color: "#979594", fontWeight: 400 }}>(Staff only)</span>
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. USER1"
              autoComplete="username"
              style={{ borderColor: "#E4E4E4" }}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" style={{ color: "#0D0D0D" }}>Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              autoComplete="current-password"
              style={{ borderColor: "#E4E4E4" }}
            />
          </div>

          {error && (
            <p className="text-sm font-medium" style={{ color: "#C60C30" }}>
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full font-semibold text-white mt-2"
            style={{ background: "#C60C30" }}
            disabled={loading || !password}
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: "#BEBEBE" }}>
          Admin: leave username blank · Staff: enter your username
        </p>
      </div>
    </div>
  );
}
