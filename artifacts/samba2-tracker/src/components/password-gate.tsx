import { useState } from "react";
import { login } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordGateProps {
  onSuccess: () => void;
}

export function PasswordGate({ onSuccess }: PasswordGateProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);
    const ok = await login(password);
    setLoading(false);
    if (ok) {
      onSuccess();
    } else {
      setError(true);
      setPassword("");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f5f5f5]">
      <div className="bg-white rounded-xl border-2 border-[#7a0000] shadow-lg p-10 w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-[#7a0000] mb-1">MEDEL — SAMBA 2 Tracker</h1>
          <p className="text-sm text-muted-foreground">Enter your password to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              data-testid="input-password"
            />
            {error && (
              <p className="text-sm text-destructive font-medium" data-testid="text-error">
                Incorrect password. Please try again.
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full bg-[#7a0000] hover:bg-[#550000] text-white"
            disabled={loading || !password}
            data-testid="button-login"
          >
            {loading ? "Checking..." : "Sign In"}
          </Button>
        </form>
      </div>
    </div>
  );
}
