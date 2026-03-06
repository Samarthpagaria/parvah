'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthBackground from '@/components/auth/AuthBackground'
import { authAPI } from '@/utils/backend_api_endpoints'

/* ── Palette ──────────────────────────
  #09637E  deep teal
  #088395  teal (primary accent)
  #7AB2B2  sage teal
  #EBF4F6  ice background
  #F25A5A  coral (CTA)
  #201F47  deep indigo (headings)
  #576CDB  indigo blue (links / tabs)
  #333333  body text
  #F5F6FA  input bg
────────────────────────────────────── */

export default function UserLoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '', phone: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('')
  }
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        if (!form.email || !form.password) throw new Error('Please fill in all fields')
        await authAPI.loginPublic(form.email, form.password)
        window.location.href = '/dashboard'
      } else {
        if (!form.fullName || !form.email || !form.password || !form.confirmPassword || !form.phone)
          throw new Error('Please fill in all fields')
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match')

        await authAPI.registerPublic({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
          phone: form.phone,
        })

        // After registration, auto-login or redirect to login
        await authAPI.loginPublic(form.email, form.password)
        window.location.href = '/dashboard'
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const Eye = ({ open }: { open: boolean }) => open
    ? <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    : <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>

  return (
    <>
      <style>{`
        @keyframes gradShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes blob1 { 0%,100%{ transform:translate(0,0) scale(1) }   50%{ transform:translate(16px,-16px) scale(1.05) } }
        @keyframes blob2 { 0%,100%{ transform:translate(0,0) scale(1) }   50%{ transform:translate(-14px,12px) scale(.96)  } }
        @keyframes fadeUp { from{ opacity:0; transform:translateY(10px) } to{ opacity:1; transform:translateY(0) } }

        .u-lpanel {
          background: linear-gradient(-45deg, #09637E, #088395, #7AB2B2, #088395, #09637E);
          background-size: 400% 400%;
          animation: gradShift 10s ease infinite;
        }
        .u-b1 { animation: blob1 10s ease-in-out infinite; }
        .u-b2 { animation: blob2 13s ease-in-out infinite; }
        .u-fi { animation: fadeUp .38s ease both; }

        .u-f {
          width:100%; padding:.58rem .8rem .58rem 2.2rem;
          font-size:.8125rem; color:#333;
          background:#F5F6FA; border:1.5px solid #dde4e8;
          border-radius:.6rem; outline:none;
          transition:border-color .14s, box-shadow .14s, background .12s;
        }
        .u-f::placeholder { color:#b0bec5; font-size:.78rem; }
        .u-f:focus {
          border-color:#088395;
          box-shadow:0 0 0 3px rgba(8,131,149,.1);
          background:#fff;
        }

        .u-tab {
          flex:1; padding:.42rem .5rem;
          font-size:.71rem; font-weight:600;
          border-radius:.42rem; border:none; cursor:pointer;
          transition:all .18s; background:transparent; color:#9EAEBB;
        }
        .u-tab.on {
          background:#fff; color:#201F47;
          box-shadow:0 1px 4px rgba(32,31,71,.08);
        }

        .u-btn {
          width:100%; padding:.63rem;
          font-size:.8125rem; font-weight:700;
          letter-spacing:.01em; color:#fff;
          background:#F25A5A; border:none;
          border-radius:.6rem; cursor:pointer;
          box-shadow:0 3px 12px rgba(242,90,90,.28);
          transition:background .17s, box-shadow .17s, transform .1s;
        }
        .u-btn:hover  { background:#d94c4c; box-shadow:0 5px 18px rgba(242,90,90,.36); }
        .u-btn:active { transform:scale(.98); }

        .u-fw { position:relative; }
        .u-fw .ico {
          position:absolute; left:.7rem; top:50%;
          transform:translateY(-50%);
          pointer-events:none; color:#B0C4CC;
        }
        .u-fw .ey {
          position:absolute; right:.7rem; top:50%;
          transform:translateY(-50%); color:#B0C4CC;
          background:none; border:none; cursor:pointer;
          display:flex; align-items:center;
        }
        .u-fw .ey:hover { color:#088395; }
      `}</style>

      {/* Page */}
      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#EBF4F6 0%,#dff0f4 50%,#EBF4F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
        <AuthBackground variant="citizen" />

        {/* Outer white card */}
        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: '880px',
          background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(16px)',
          borderRadius: '1.75rem', padding: '12px',
          boxShadow: '0 20px 60px rgba(8,131,149,.12), 0 4px 12px rgba(0,0,0,.06)',
          border: '1px solid rgba(255,255,255,.95)'
        }}>

          {/* Inner row */}
          <div style={{ display: 'flex', minHeight: '468px', borderRadius: '1.25rem', overflow: 'hidden' }}>

            {/* LEFT — teal gradient panel */}
            <div className="u-lpanel hidden lg:block" style={{ width: '42%', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '1.125rem' }}>
              <div className="u-b1" style={{ position: 'absolute', top: '10%', left: '8%', width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,.18)', filter: 'blur(50px)' }} />
              <div className="u-b2" style={{ position: 'absolute', bottom: '8%', right: '6%', width: 230, height: 230, borderRadius: '50%', background: 'rgba(255,255,255,.13)', filter: 'blur(60px)' }} />
              {/* dot mesh */}
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.28) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: .55 }} />
              {/* content */}
              <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, letterSpacing: '-.04em', color: 'rgba(255,255,255,.9)' }}>par</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, letterSpacing: '-.04em', color: 'rgba(255,255,255,.55)' }}>vah</span>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,.55)', marginLeft: 2, marginBottom: 3, display: 'inline-block' }} />
                </span>
                <p style={{ marginTop: '1.5rem', fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-.03em', whiteSpace: 'pre-line' }}>
                  {isLogin ? 'Your city,\nyour voice.' : 'Join and\nmake an\nimpact.'}
                </p>
                <p style={{ marginTop: '.8rem', fontSize: '.78rem', color: 'rgba(255,255,255,.6)', lineHeight: 1.7, fontWeight: 400 }}>
                  Report civic issues &amp; track real-time resolutions in your community.
                </p>
              </div>
              {/* bottom brand */}
              <p style={{ position: 'absolute', bottom: '1.1rem', left: 0, right: 0, textAlign: 'center', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.18)' }}>Parvah Citizen</p>
            </div>

            {/* RIGHT — form */}
            <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 2.5rem' }}>
              <div className="u-fi" style={{ width: '100%', maxWidth: '295px' }}>

                {/* Wordmark */}
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1, textDecoration: 'none', marginBottom: '1.75rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-.04em', color: '#201F47' }}>par</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-.04em', color: '#088395' }}>vah</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#088395', marginLeft: 2, marginBottom: 3, display: 'inline-block' }} />
                </Link>

                {/* Heading */}
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#201F47', letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: '.3rem' }}>
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h1>
                <p style={{ fontSize: '.78rem', color: '#7AB2B2', marginBottom: '1.4rem', fontWeight: 400, lineHeight: 1.5 }}>
                  {isLogin ? 'Sign in to your citizen account.' : 'Join Parvah and make your city better.'}
                </p>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#F5F6FA', borderRadius: '.6rem', padding: '3px', gap: '3px', marginBottom: '1.2rem' }}>
                  {[['Sign In', true], ['Register', false]].map(([l, v]) => (
                    <button key={String(l)} onClick={() => { setIsLogin(v as boolean); setError('') }}
                      className={`u-tab${isLogin === v ? ' on' : ''}`}>{l}</button>
                  ))}
                </div>

                {error && (
                  <div style={{ marginBottom: '.7rem', padding: '.5rem .7rem', borderRadius: '.45rem', fontSize: '.71rem', color: '#F25A5A', background: '#fff5f5', border: '1px solid #fdd' }}>{error}</div>
                )}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                  {!isLogin && (<>
                    <div className="u-fw">
                      <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <input name="fullName" type="text" placeholder="Full name" value={form.fullName} onChange={onChange} className="u-f" />
                    </div>
                    <div className="u-fw">
                      <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      <input name="phone" type="tel" placeholder="Phone number" value={form.phone} onChange={onChange} className="u-f" />
                    </div>
                  </>)}

                  <div className="u-fw">
                    <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <input name="email" type="email" placeholder="Email address" value={form.email} onChange={onChange} className="u-f" />
                  </div>

                  <div className="u-fw">
                    <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <input name="password" type={showPwd ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={onChange} className="u-f" style={{ paddingRight: '2.1rem' }} />
                    <button type="button" className="ey" onClick={() => setShowPwd(p => !p)}><Eye open={showPwd} /></button>
                  </div>

                  {isLogin && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="button" style={{ fontSize: '.69rem', color: '#088395', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="u-fw">
                      <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={form.confirmPassword} onChange={onChange} className="u-f" style={{ paddingRight: '2.1rem' }} />
                      <button type="button" className="ey" onClick={() => setShowConfirm(p => !p)}><Eye open={showConfirm} /></button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="u-btn" style={{ marginTop: '.5rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                  </button>
                </form>

                {/* Social divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '.65rem', margin: '.95rem 0' }}>
                  <div style={{ flex: 1, height: 1, background: '#EBF4F6' }} />
                  <span style={{ fontSize: '.65rem', color: '#B0C4CC', fontWeight: 500 }}>or continue with</span>
                  <div style={{ flex: 1, height: 1, background: '#EBF4F6' }} />
                </div>
                <div style={{ display: 'flex', gap: '.45rem' }}>
                  {[
                    <svg key="g" width="15" height="15" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>,
                    <svg key="f" width="15" height="15" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>,
                    <svg key="a" width="15" height="15" viewBox="0 0 24 24" fill="#111827"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" /></svg>,
                  ].map((icon, i) => (
                    <button key={i} type="button" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '.5rem', borderRadius: '.5rem', border: '1.5px solid #dde4e8', background: '#fff', cursor: 'pointer', transition: 'all .14s' }}
                      onMouseEnter={e => { const b = e.currentTarget; b.style.borderColor = '#7AB2B2'; b.style.background = '#F5F6FA' }}
                      onMouseLeave={e => { const b = e.currentTarget; b.style.borderColor = '#dde4e8'; b.style.background = '#fff' }}>
                      {icon}
                    </button>
                  ))}
                </div>

                <p style={{ textAlign: 'center', fontSize: '.69rem', color: '#9EAEBB', marginTop: '.95rem' }}>
                  {isLogin ? "Don't have an account? " : 'Already registered? '}
                  <button onClick={() => { setIsLogin(p => !p); setError('') }}
                    style={{ color: '#576CDB', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '.69rem' }}>
                    {isLogin ? 'Register' : 'Sign In'}
                  </button>
                </p>
                <div style={{ borderTop: '1px solid #EBF4F6', marginTop: '.85rem', paddingTop: '.85rem', textAlign: 'center' }}>
                  <Link href="/admin/login" style={{ fontSize: '.67rem', color: '#9EAEBB', textDecoration: 'none', fontWeight: 500 }}>
                    Admin or Staff? <span style={{ color: '#088395', fontWeight: 700 }}>Admin Login →</span>
                  </Link>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
