import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/Card";
import { loginUser, signupUser } from "@/services/api";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, ArrowRight } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Google "G" icon
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AuthPage = ({ mode }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get('error') ? 'Google sign-in failed. Please try again.' : "");
  const [loading, setLoading] = useState(false);

  const destination = useMemo(
    () => location.state?.from?.pathname || "/",
    [location]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Email and password are required."); return; }

    try {
      setLoading(true);
      const payload = isLogin
        ? await loginUser(email, password)
        : await signupUser(email, password);

      localStorage.setItem("meetai_user", JSON.stringify({ ...payload.user, token: payload.token }));
      navigate(destination, { replace: true });
    } catch (apiError) {
      const msg = apiError?.response?.data?.error
        || (apiError?.code === 'ERR_NETWORK' ? 'Cannot connect to server. Make sure the backend is running on port 5001.' : null)
        || apiError?.message
        || "Authentication failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-[#06040f]">
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-700/20 blur-[120px]" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[45%] h-[45%] rounded-full bg-blue-600/15 blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] rounded-full bg-purple-900/20 blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[440px] relative z-10"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            initial={{ scale: 0.5 }}
            animate={{ scale: 1 }}
            className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 mb-4 shadow-xl shadow-indigo-500/20"
          >
            <BrainCircuit className="h-8 w-8 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold tracking-tight text-white">MeetAI</h1>
          <p className="text-muted-foreground mt-2">Next-gen AI Meeting Intelligence</p>
        </div>

        <Card className="glass-card border-purple-700/20 shadow-glass-lg overflow-hidden rounded-3xl"
          style={{ background: 'rgba(13,10,26,0.8)' }}
        >
          <CardHeader className="pt-8 pb-4 text-center">
            <CardTitle className="text-2xl font-bold">
              {isLogin ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              {isLogin ? "Sign in to access your workspace" : "Join thousands of teams using MeetAI"}
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {/* Google Sign-In */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              variant="outline"
              className="border-white/10 hover:bg-white/5 rounded-xl h-11 w-full mb-4 gap-2"
            >
              <GoogleIcon />
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#0f0f11] px-2 text-muted-foreground">Or with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-purple h-11 rounded-xl"
                required
              />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-purple h-11 rounded-xl"
                required
              />

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-rose-400 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20 flex items-center gap-2"
                  >
                    <div className="w-1 h-1 rounded-full bg-rose-500 flex-shrink-0" />
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 btn-primary font-semibold rounded-xl group"
              >
                {loading ? "Processing..." : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Get Started"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-4">
                {isLogin ? "New to MeetAI? " : "Already have an account? "}
                <Link
                  to={isLogin ? "/signup" : "/login"}
                  className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors"
                >
                  {isLogin ? "Create account" : "Log in"}
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AuthPage;