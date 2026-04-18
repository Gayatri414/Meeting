import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BrainCircuit } from 'lucide-react';

/**
 * Handles the redirect from Google OAuth.
 * Backend redirects to /auth/callback?user=<encoded JSON>
 */
const AuthCallback = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const userParam = params.get('user');
    const error = params.get('error');

    if (error || !userParam) {
      navigate('/login?error=google_failed', { replace: true });
      return;
    }

    try {
      const user = JSON.parse(decodeURIComponent(userParam));
      localStorage.setItem('meetai_user', JSON.stringify(user));
      navigate('/', { replace: true });
    } catch {
      navigate('/login?error=parse_failed', { replace: true });
    }
  }, [params, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#050505]">
      <div className="flex flex-col items-center gap-4">
        <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 animate-pulse">
          <BrainCircuit className="h-8 w-8 text-white" />
        </div>
        <p className="text-muted-foreground text-sm">Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
