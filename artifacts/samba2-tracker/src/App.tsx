import { useState } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import StaffView from "@/pages/staff-view";
import NotFound from "@/pages/not-found";
import { PasswordGate } from "@/components/password-gate";
import { getStoredToken, getStoredRole, getStoredUsername, type UserRole } from "@/lib/auth";

const queryClient = new QueryClient();

function App() {
  const [authed, setAuthed] = useState(() => !!getStoredToken());
  const [role,   setRole]   = useState<UserRole | null>(() => getStoredRole());
  const [username, setUsername] = useState<string | null>(() => getStoredUsername());

  if (!authed) {
    return (
      <PasswordGate
        onSuccess={(r, u) => {
          setRole(r);
          setUsername(u);
          setAuthed(true);
        }}
      />
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Switch>
            <Route path="/">
              {role === "admin"
                ? <Home />
                : <StaffView username={username ?? ""} />}
            </Route>
            <Route component={NotFound} />
          </Switch>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
