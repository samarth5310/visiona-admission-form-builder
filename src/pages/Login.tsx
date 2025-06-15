
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { user, login } = useAuth();
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) navigate("/students", { replace: true });
    // eslint-disable-next-line
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await login(mobile, password);
    setLoading(false);
    if (error) {
      setErr(error);
    } else {
      navigate("/students", { replace: true });
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-bold text-center text-blue-700 mb-2">Admin Login</h2>
        <Input
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
          autoComplete="username"
          required
          type="tel"
          maxLength={15}
        />
        <Input
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          type="password"
        />
        {err && <div className="text-red-600 text-sm">{err}</div>}
        <Button type="submit" className="bg-blue-700 hover:bg-blue-800" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Only authorized staff are allowed to log in.
        </p>
      </form>
    </div>
  );
};

export default Login;
