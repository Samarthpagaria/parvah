'use client'

import { useState } from 'react'
import Link from 'next/link'
import AuthBackground from '@/components/auth/AuthBackground'
import { authAPI, orgAPI } from '@/utils/backend_api_endpoints'

export default function AdminLoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', fullName: '', organizationCode: '' })
  const [error, setError] = useState('')

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value })); setError('')
  }
  const [loading, setLoading] = useState(false)
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        if (!form.email || !form.password) throw new Error('Please fill in all fields')
        const res = await authAPI.loginAdmin(form.email, form.password)
        console.log('Login success:', res)

        const me = await authAPI.getMe();
        console.log('User profile:', me)

        if (me.user.is_super_admin) {
          console.log('Redirecting to super admin organizations')
          window.location.href = '/admin/organizations'
          return
        }

        // Otherwise check their role in any org
        // This is a bit tricky without a dedicated "my roles" endpoint.
        // Let's check if they have a role in the database.

        // For now, let's just use the user's hardcoded hint or a generic check.
        // REAL logic: fetch memberships.
        // I'll assume we can infer it or we might need to add an endpoint.

        // Let's try a heuristic: if email contains staff, go to staff.
        // Or better: fetch any org and see role.

        // We'll update this to be more precise if you have a "get my memberships" endpoint.
        // For now, I'll stick to the user's suggestion but using real login.
        console.log('Redirecting to organizations hub')
        window.location.href = '/admin/organizations'
      } else {
        if (!form.fullName || !form.email || !form.password || !form.confirmPassword)
          throw new Error('Please fill in all fields')
        if (form.password !== form.confirmPassword) throw new Error('Passwords do not match')

        await authAPI.registerAdmin({
          full_name: form.fullName,
          email: form.email,
          password: form.password,
        })

        // Auto-login after registration
        await authAPI.loginAdmin(form.email, form.password)
        window.location.href = '/admin/organizations'
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
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
        @keyframes blob2 { 0%,100%{ transform:translate(0,0) scale(1) }   50%{ transform:translate(-14px,12px) scale(.96) } }
        @keyframes fadeUp { from{ opacity:0; transform:translateY(10px) } to{ opacity:1; transform:translateY(0) } }

        /* Admin left — deeper teal with dark indigo tones */
        .a-lpanel {
          background: linear-gradient(-45deg, #09637E, #201F47, #09637E, #0a4f68, #201F47);
          background-size: 400% 400%;
          animation: gradShift 11s ease infinite;
        }
        .a-b1 { animation: blob1 11s ease-in-out infinite; }
        .a-b2 { animation: blob2 14s ease-in-out infinite; }
        .a-fi { animation: fadeUp .38s ease both; }

        .a-f {
          width:100%; padding:.58rem .8rem .58rem 2.2rem;
          font-size:.8125rem; color:#333;
          background:#F5F6FA; border:1.5px solid #dde4e8;
          border-radius:.6rem; outline:none;
          transition:border-color .14s, box-shadow .14s, background .12s;
        }
        .a-f::placeholder { color:#b0bec5; font-size:.78rem; }
        .a-f:focus {
          border-color:#09637E;
          box-shadow:0 0 0 3px rgba(9,99,126,.1);
          background:#fff;
        }

        .a-tab {
          flex:1; padding:.42rem .5rem;
          font-size:.71rem; font-weight:600;
          border-radius:.42rem; border:none; cursor:pointer;
          transition:all .18s; background:transparent; color:#9EAEBB;
        }
        .a-tab.on {
          background:#fff; color:#201F47;
          box-shadow:0 1px 4px rgba(32,31,71,.08);
        }

        /* Admin CTA — coral (primary brand) */
        .a-btn {
          width:100%; padding:.63rem;
          font-size:.8125rem; font-weight:700;
          letter-spacing:.01em; color:#fff;
          background:#F25A5A; border:none;
          border-radius:.6rem; cursor:pointer;
          box-shadow:0 3px 12px rgba(242,90,90,.26);
          transition:background .17s, box-shadow .17s, transform .1s;
        }
        .a-btn:hover  { background:#d94c4c; box-shadow:0 5px 18px rgba(242,90,90,.34); }
        .a-btn:active { transform:scale(.98); }

        .a-fw { position:relative; }
        .a-fw .ico {
          position:absolute; left:.7rem; top:50%;
          transform:translateY(-50%);
          pointer-events:none; color:#B0C4CC;
        }
        .a-fw .ey {
          position:absolute; right:.7rem; top:50%;
          transform:translateY(-50%); color:#B0C4CC;
          background:none; border:none; cursor:pointer;
          display:flex; align-items:center;
        }
        .a-fw .ey:hover { color:#09637E; }
      `}</style>

      {/* Page */}
      <div style={{ minHeight: '100vh', background: 'linear-gradient(145deg,#EBF4F6 0%,#dff0f4 50%,#EBF4F6 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative' }}>
        <AuthBackground variant="admin" />

        {/* Outer white card */}
        <div style={{
          position: 'relative', zIndex: 1, width: '100%', maxWidth: '880px',
          background: 'rgba(255,255,255,.9)', backdropFilter: 'blur(16px)',
          borderRadius: '1.75rem', padding: '12px',
          boxShadow: '0 20px 60px rgba(9,99,126,.12), 0 4px 12px rgba(0,0,0,.06)',
          border: '1px solid rgba(255,255,255,.95)'
        }}>

          {/* Inner row */}
          <div style={{ display: 'flex', minHeight: '468px', borderRadius: '1.25rem', overflow: 'hidden' }}>

            {/* LEFT — deep teal + indigo gradient */}
            <div className="a-lpanel hidden lg:block" style={{ width: '42%', flexShrink: 0, position: 'relative', overflow: 'hidden', borderRadius: '1.125rem' }}>
              <div className="a-b1" style={{ position: 'absolute', top: '10%', left: '8%', width: 190, height: 190, borderRadius: '50%', background: 'rgba(255,255,255,.14)', filter: 'blur(50px)' }} />
              <div className="a-b2" style={{ position: 'absolute', bottom: '8%', right: '6%', width: 230, height: 230, borderRadius: '50%', background: 'rgba(122,178,178,.12)', filter: 'blur(60px)' }} />
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(rgba(255,255,255,.2) 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: .45 }} />
              <div style={{ position: 'relative', zIndex: 1, padding: '2.5rem 2rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'flex-end', gap: '1px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, letterSpacing: '-.04em', color: 'rgba(255,255,255,.9)' }}>par</span>
                  <span style={{ fontSize: '1.1rem', fontWeight: 400, letterSpacing: '-.04em', color: 'rgba(255,255,255,.5)' }}>vah</span>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'rgba(255,255,255,.5)', marginLeft: 2, marginBottom: 3, display: 'inline-block' }} />
                </span>
                <p style={{ marginTop: '1.5rem', fontSize: '1.75rem', fontWeight: 800, color: '#fff', lineHeight: 1.2, letterSpacing: '-.03em', whiteSpace: 'pre-line' }}>
                  {isLogin ? 'Manage.\nResolve.\nImpact.' : 'Set up your\nadmin\naccount.'}
                </p>
                <p style={{ marginTop: '.8rem', fontSize: '.78rem', color: 'rgba(255,255,255,.55)', lineHeight: 1.7, fontWeight: 400 }}>
                  Oversee organizations &amp; drive civic resolutions from one place.
                </p>
              </div>
              <p style={{ position: 'absolute', bottom: '1.1rem', left: 0, right: 0, textAlign: 'center', fontSize: '.58rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.15)' }}>Parvah Admin</p>
            </div>

            {/* RIGHT — form */}
            <div style={{ flex: 1, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 2.5rem' }}>
              <div className="a-fi" style={{ width: '100%', maxWidth: '295px' }}>

                {/* Wordmark */}
                <Link href="/" style={{ display: 'inline-flex', alignItems: 'flex-end', gap: 1, textDecoration: 'none', marginBottom: '1.75rem' }}>
                  <span style={{ fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-.04em', color: '#201F47' }}>par</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: 400, letterSpacing: '-.04em', color: '#088395' }}>vah</span>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#088395', marginLeft: 2, marginBottom: 3, display: 'inline-block' }} />
                </Link>

                {/* Heading */}
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#201F47', letterSpacing: '-.03em', lineHeight: 1.15, marginBottom: '.3rem' }}>
                  {isLogin ? 'Admin Sign In' : 'Admin Register'}
                </h1>
                <p style={{ fontSize: '.78rem', color: '#7AB2B2', marginBottom: '1.4rem', fontWeight: 400, lineHeight: 1.5 }}>
                  {isLogin ? 'Sign in to manage your organization.' : 'Set up your admin account.'}
                </p>

                {/* Tabs */}
                <div style={{ display: 'flex', background: '#F5F6FA', borderRadius: '.6rem', padding: '3px', gap: '3px', marginBottom: '1.2rem' }}>
                  {['Sign In', 'Register'].map((t, i) => (
                    <button key={t} onClick={() => { setIsLogin(i === 0); setError('') }}
                      className={`a-tab${(isLogin ? i === 0 : i === 1) ? ' on' : ''}`}>{t}</button>
                  ))}
                </div>

                {error && (
                  <div style={{ marginBottom: '.7rem', padding: '.5rem .7rem', borderRadius: '.45rem', fontSize: '.71rem', color: '#F25A5A', background: '#fff5f5', border: '1px solid #fdd' }}>{error}</div>
                )}

                <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '.55rem' }}>
                  {!isLogin && (
                    <div className="a-fw">
                      <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                      <input name="fullName" type="text" placeholder="Full name" value={form.fullName} onChange={onChange} className="a-f" />
                    </div>
                  )}

                  <div className="a-fw">
                    <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <input name="email" type="email" placeholder="Email address" value={form.email} onChange={onChange} className="a-f" />
                  </div>

                  <div className="a-fw">
                    <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    <input name="password" type={showPwd ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={onChange} className="a-f" style={{ paddingRight: '2.1rem' }} />
                    <button type="button" className="ey" onClick={() => setShowPwd(p => !p)}><Eye open={showPwd} /></button>
                  </div>

                  {isLogin && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button type="button" style={{ fontSize: '.69rem', color: '#09637E', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
                    </div>
                  )}

                  {!isLogin && (
                    <div className="a-fw">
                      <svg className="ico" width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      <input name="confirmPassword" type={showConfirm ? 'text' : 'password'} placeholder="Confirm password" value={form.confirmPassword} onChange={onChange} className="a-f" style={{ paddingRight: '2.1rem' }} />
                      <button type="button" className="ey" onClick={() => setShowConfirm(p => !p)}><Eye open={showConfirm} /></button>
                    </div>
                  )}

                  <button type="submit" disabled={loading} className="a-btn" style={{ marginTop: '.5rem', opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Admin Account')}
                  </button>
                </form>

                {/* Staff hint */}
                {isLogin && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '.45rem', marginTop: '.85rem', padding: '.55rem .7rem', borderRadius: '.5rem', background: '#EBF4F6', border: '1px solid #c8e0e8' }}>
                    <svg width="12" height="12" fill="none" stroke="#088395" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <p style={{ fontSize: '.67rem', color: '#7AB2B2' }}>Staff: use <strong style={{ color: '#09637E' }}>staff@gmail.com</strong></p>
                  </div>
                )}

                <p style={{ textAlign: 'center', fontSize: '.69rem', color: '#9EAEBB', marginTop: '.95rem' }}>
                  {isLogin ? "Don't have an account? " : 'Already registered? '}
                  <button onClick={() => { setIsLogin(p => !p); setError('') }}
                    style={{ color: '#576CDB', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontSize: '.69rem' }}>
                    {isLogin ? 'Register' : 'Sign In'}
                  </button>
                </p>
                <div style={{ borderTop: '1px solid #EBF4F6', marginTop: '.85rem', paddingTop: '.85rem', textAlign: 'center' }}>
                  <Link href="/login" style={{ fontSize: '.67rem', color: '#9EAEBB', textDecoration: 'none', fontWeight: 500 }}>
                    Not an admin? <span style={{ color: '#088395', fontWeight: 700 }}>Citizen Login →</span>
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
