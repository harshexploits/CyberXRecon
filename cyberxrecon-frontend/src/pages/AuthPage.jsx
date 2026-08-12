export default function AuthPage({ mode, setMode }) {
  const isSignUp = mode === 'signup';

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleOAuth = () => {};

  return (
    <div className="flex justify-center items-center py-10">
      <div className="w-full max-w-md bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl shadow-cyan-500/10">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </h2>
          <p className="text-gray-500 text-sm mt-1">
            {isSignUp ? 'Start your recon journey with CyberXRecon' : 'Sign in to continue to your dashboard'}
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => handleOAuth('google')}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-white text-gray-800 font-medium hover:bg-gray-100 transition"
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.4 6.1 29.5 4 24 4 16.2 4 9.5 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.3 35 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.4 39.6 16.1 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.3 5.3C39.9 36.9 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/>
            </svg>
            Continue with Google
          </button>
          <button
            onClick={() => handleOAuth('github')}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-lg bg-[#181717] text-white font-medium hover:bg-[#2b2b2b] transition border border-white/10"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.73.08-.73 1.21.09 1.84 1.24 1.84 1.24 1.07 1.84 2.81 1.31 3.5 1 .11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 016 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.23 1.91 1.23 3.22 0 4.61-2.8 5.63-5.48 5.92.43.37.81 1.1.81 2.22 0 1.6-.02 2.89-.02 3.29 0 .32.22.7.83.58C20.56 21.8 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <input
              type="text"
              placeholder="Full name"
              className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
            />
          )}
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2.5 rounded-lg bg-black/40 border border-white/10 text-gray-200 placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
          />

          {!isSignUp && (
            <div className="text-right">
              <a href="#forgot" className="text-xs text-cyan-400 hover:underline">Forgot password?</a>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-lg bg-gradient-to-r from-cyan-400 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/30 transition"
          >
            {isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setMode(isSignUp ? 'signin' : 'signup')}
            className="text-cyan-400 font-medium hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
}
