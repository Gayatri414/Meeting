import { useMemo, useState, useEffect } from "react";
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

let API_URL = import.meta.env.VITE_API_URL || '/api';
if (API_URL.startsWith('http') && !API_URL.endsWith('/api')) {
  API_URL = API_URL.replace(/\/$/, '') + '/api';
}


const AuthPage = ({ mode }) => {
  const isLogin = mode === "login";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(searchParams.get('error') ? 'Google sign-in failed. Please try again.' : "");
  const [loading, setLoading] = useState(false);

  // Clear any stale session data when landing on login/signup
  useEffect(() => {
    localStorage.removeItem("meetai_user");
  }, []);

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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-purple h-12 rounded-xl bg-white/5 border-white/10 focus:border-purple-500/50"
                  required
                />
              </div>
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-purple h-12 rounded-xl bg-white/5 border-white/10 focus:border-purple-500/50"
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="text-sm text-rose-400 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20 flex items-start gap-3"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 btn-primary font-semibold rounded-xl group mt-4"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Get Started"}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground mt-6">
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