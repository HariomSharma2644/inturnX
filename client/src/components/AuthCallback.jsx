import { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleOAuthCallback } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    const provider = searchParams.get('provider');

    if (token && provider) {
      handleOAuthCallback(token, provider);
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  }, [searchParams, navigate, handleOAuthCallback]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] to-[#1A1A1A] text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#14A44D] mx-auto mb-4"></div>
        <p className="text-xl">Completing sign in...</p>
      </div>
    </div>
  );
}