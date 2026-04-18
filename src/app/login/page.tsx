import { login, signup, signInWithGoogle } from './actions'

export default async function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center relative border-t border-transparent" style={{ background: 'var(--bg-base)' }}>
      {/* Ambient background glow */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px',
        height: '600px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <form className="glass z-10 w-full max-w-sm p-8 rounded-2xl flex flex-col gap-6 animate-fade-in-up">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-2">Welcome Back</h1>
          <p className="text-sm text-secondary">Sign in to your AI-powered memory.</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block" htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 block" htmlFor="password">Password</label>
            <input
              className="input"
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 mt-2">
          <button formAction={login} className="btn btn-primary w-full shadow-[0_4px_20px_rgba(124,58,237,0.4)] hover:shadow-[0_6px_28px_rgba(124,58,237,0.5)]">
            Log in
          </button>
          
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-[rgba(255,255,255,0.1)]"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-muted">OR</span>
            <div className="flex-grow border-t border-[rgba(255,255,255,0.1)]"></div>
          </div>

          <button formNoValidate formAction={signInWithGoogle} className="btn btn-ghost w-full bg-white/5 border-white/10 hover:bg-white/10 flex items-center justify-center gap-2">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="text-center mt-2 text-sm text-muted">
            Don't have an account?{' '}
            <a href="/signup" className="text-[var(--violet-bright)] hover:underline">
              Sign up
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}
