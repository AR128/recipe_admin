import { Link, Navigate } from 'react-router';
import { useAuth } from '../context/useAuth';

const Home = () => {
    const { isAuthenticated } = useAuth();

    // If already logged in, no need to show the landing page, go straight to dashboard
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 text-[#F5F0E8]">
            <div className="bg-[#141412] max-w-md w-full rounded-3xl shadow-2xl border border-white/10 p-10 text-center">
                <div className="w-16 h-16 bg-[#C9A96E]/10 border border-[#C9A96E]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#C9A96E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>
                <h1 className="font-serif text-3xl font-bold text-white mb-2">
                    Admin Portal
                </h1>
                <p className="text-neutral-400 text-sm mb-8">
                    Secure access to the Poodiest management dashboard.
                </p>
                <Link
                    to="/login"
                    className="block w-full rounded-full bg-gradient-to-r from-[#C9A96E] to-[#DAB97E] px-6 py-3 text-xs font-bold uppercase tracking-wider text-[#121210] shadow-md shadow-[#C9A96E]/20 transition hover:brightness-110"
                >
                    Log In to Dashboard
                </Link>
            </div>
        </div>
    );
};

export default Home;
