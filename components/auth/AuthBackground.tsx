'use client'

/**
 * Auth page background — teal/indigo palette
 * #09637E  deep teal
 * #088395  teal
 * #7AB2B2  sage teal
 * #EBF4F6  ice
 * #576CDB  indigo accent
 */
export default function AuthBackground({ variant = 'citizen' }: { variant?: 'citizen' | 'admin' }) {
  const teal   = '#088395'
  const deep   = '#09637E'
  const sage   = '#7AB2B2'
  const indigo = '#576CDB'
  const node   = variant === 'citizen' ? teal : deep

  return (
    <>
      <style>{`
        @keyframes ab-up   { 0%,100%{transform:translateY(0)}   50%{transform:translateY(-14px)} }
        @keyframes ab-down { 0%,100%{transform:translateY(0)}   50%{transform:translateY(12px)}  }
        @keyframes ab-sway { 0%,100%{transform:rotate(-3deg)}   50%{transform:rotate(3deg)}      }
        @keyframes ab-ring { 0%{transform:scale(1);opacity:.5}  100%{transform:scale(2.8);opacity:0} }
        @keyframes ab-spin { to{transform:rotate(360deg)} }
        @keyframes ab-card {
          0%   {opacity:0;transform:translateY(20px) scale(.96)}
          12%  {opacity:1;transform:translateY(0)    scale(1)}
          88%  {opacity:1;transform:translateY(0)    scale(1)}
          100% {opacity:0;transform:translateY(-16px) scale(.96)}
        }
        @keyframes ab-pill {
          0%   {opacity:0;transform:scale(.85)}
          14%  {opacity:1;transform:scale(1)}
          86%  {opacity:1;transform:scale(1)}
          100% {opacity:0;transform:scale(.85)}
        }
        .ab-u  {animation:ab-up   var(--d,9s)   ease-in-out infinite var(--dl,0s)}
        .ab-d  {animation:ab-down var(--d,11s)  ease-in-out infinite var(--dl,0s)}
        .ab-sw {animation:ab-sway var(--d,8s)   ease-in-out infinite var(--dl,0s)}
        .ab-rg {animation:ab-ring var(--d,2.8s) ease-out    infinite var(--dl,0s)}
        .ab-sp {animation:ab-spin var(--d,40s)  linear      infinite}
        .ab-c  {animation:ab-card var(--d,11s)  ease-in-out infinite var(--dl,0s)}
        .ab-p  {animation:ab-pill var(--d,9s)   ease-in-out infinite var(--dl,0s)}
      `}</style>

      <div aria-hidden="true" style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>

        {/* 1 ── Radial gradient mesh */}
        <div style={{position:'absolute',inset:0,background:`
          radial-gradient(ellipse 65% 55% at 10% 15%,  ${teal}12  0%, transparent 65%),
          radial-gradient(ellipse 55% 45% at 90% 85%,  ${indigo}0d 0%, transparent 65%),
          radial-gradient(ellipse 45% 35% at 50% 50%,  ${sage}09   0%, transparent 65%)`}}/>

        {/* 2 ── Dot grid */}
        <div style={{position:'absolute',inset:0,
          backgroundImage:`radial-gradient(circle, ${sage}30 1px, transparent 1px)`,
          backgroundSize:'30px 30px'}}/>

        {/* 3 ── Spinning orbital arcs — corner top-left */}
        <div className="ab-sp" style={{'--d':'45s',position:'absolute',top:'-130px',left:'-130px',width:360,height:360,
          border:`1px solid ${teal}1e`,borderRadius:'50%'} as React.CSSProperties}/>
        <div className="ab-sp" style={{'--d':'65s',position:'absolute',top:'-195px',left:'-195px',width:490,height:490,
          border:`1px dashed ${sage}14`,borderRadius:'50%',animationDirection:'reverse'} as React.CSSProperties}/>

        {/* 4 ── Orbital arc — corner bottom-right */}
        <div className="ab-sp" style={{'--d':'38s',position:'absolute',bottom:'-150px',right:'-150px',width:400,height:400,
          border:`1px solid ${deep}18`,borderRadius:'50%',animationDirection:'reverse'} as React.CSSProperties}/>

        {/* 5 ── SVG network graph */}
        <svg style={{position:'absolute',inset:0,width:'100%',height:'100%',opacity:.16}} viewBox="0 0 1200 700" preserveAspectRatio="xMidYMid slice">
          {[
            [80,120,220,280],[220,280,420,175],[420,175,640,320],
            [1100,100,900,260],[900,260,720,135],
            [100,560,300,440],[300,440,480,585],
            [1050,585,820,480],[820,480,640,560],
          ].map(([x1,y1,x2,y2],i)=>(
            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={node} strokeWidth="1.2" strokeDasharray="6 6">
              <animate attributeName="stroke-dashoffset" from="0" to="-60" dur={`${2+i*.4}s`} repeatCount="indefinite"/>
            </line>
          ))}
          {[
            [80,120],[220,280],[420,175],[640,320],
            [1100,100],[900,260],[720,135],
            [100,560],[300,440],[480,585],
            [1050,585],[820,480],[640,560],
          ].map(([cx,cy],i)=>(
            <g key={i}>
              <circle cx={cx} cy={cy} r="4.5" fill={node} opacity=".45"/>
              <circle cx={cx} cy={cy} r="9"   fill="none" stroke={node} strokeWidth="1" opacity=".25"/>
            </g>
          ))}
        </svg>

        {/* 6 ── Floating map pins */}
        {[
          {x:'6%', y:'10%',s:30,cls:'ab-u',d:'9s', dl:'0s'  },
          {x:'88%',y:'7%', s:24,cls:'ab-d',d:'11s',dl:'1.4s'},
          {x:'3%', y:'60%',s:22,cls:'ab-u',d:'8s', dl:'3s'  },
          {x:'93%',y:'54%',s:26,cls:'ab-d',d:'13s',dl:'0.8s'},
          {x:'48%',y:'3%', s:20,cls:'ab-u',d:'7s', dl:'2s'  },
          {x:'76%',y:'87%',s:24,cls:'ab-d',d:'10s',dl:'4s'  },
          {x:'18%',y:'87%',s:20,cls:'ab-u',d:'12s',dl:'1s'  },
        ].map((p,i)=>(
          <div key={i} className={p.cls} style={{'--d':p.d,'--dl':p.dl,position:'absolute',left:p.x,top:p.y,opacity:.2} as React.CSSProperties}>
            <div style={{position:'relative',width:p.s,height:p.s}}>
              <div className="ab-rg" style={{'--d':'3s','--dl':`${i*.35}s`,position:'absolute',top:'22%',left:'50%',
                transform:'translate(-50%,-50%)',width:p.s*.5,height:p.s*.5,borderRadius:'50%',
                border:`1.5px solid ${teal}`,boxSizing:'border-box'} as React.CSSProperties}/>
              <svg width={p.s} height={p.s} viewBox="0 0 24 24">
                <defs><filter id={`ps${i}`}><feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor={deep} floodOpacity=".4"/></filter></defs>
                <path fill={teal} filter={`url(#ps${i})`} d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
          </div>
        ))}

        {/* 7 ── Floating issue cards */}
        {[
          {x:'4%', y:'26%',d:'12s',dl:'0s',   status:'Open',       sc:'#F25A5A', title:'Pothole on MG Road',  id:'#1042',
           icon:<svg width="11" height="11" fill="none" stroke={teal} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>},
          {x:'84%',y:'62%',d:'14s',dl:'3.5s', status:'Resolved',    sc:'#088395', title:'Streetlight fixed',   id:'#987',
           icon:<svg width="11" height="11" fill="none" stroke={teal} strokeWidth="2" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>},
          {x:'70%',y:'12%',d:'10s',dl:'6.5s', status:'In Progress', sc:'#7AB2B2', title:'Water leakage',        id:'#1156',
           icon:<svg width="11" height="11" fill="none" stroke={teal} strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>},
          {x:'8%', y:'72%',d:'11s',dl:'4.5s', status:'Assigned',    sc:'#576CDB', title:'Drainage blocked',    id:'#778',
           icon:<svg width="11" height="11" fill="none" stroke={teal} strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>},
        ].map((c,i)=>(
          <div key={i} className="ab-c" style={{'--d':c.d,'--dl':c.dl,position:'absolute',left:c.x,top:c.y} as React.CSSProperties}>
            <div style={{background:'rgba(255,255,255,.86)',backdropFilter:'blur(10px)',border:`1px solid ${teal}1a`,
              borderRadius:'1rem',padding:'.6rem .82rem',minWidth:146,
              boxShadow:`0 8px 24px ${teal}12, 0 2px 6px rgba(0,0,0,.05)`}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'.38rem'}}>
                <div style={{display:'flex',alignItems:'center',gap:'.3rem'}}>
                  {c.icon}
                  <span style={{fontSize:'.58rem',color:'#9ca3af',fontWeight:600,letterSpacing:'.04em'}}>{c.id}</span>
                </div>
                <span style={{fontSize:'.55rem',fontWeight:700,letterSpacing:'.04em',color:c.sc,
                  background:c.sc+'18',padding:'2px 6px',borderRadius:'99px'}}>{c.status}</span>
              </div>
              <p style={{fontSize:'.65rem',color:'#374151',fontWeight:600,margin:0,lineHeight:1.3}}>{c.title}</p>
            </div>
          </div>
        ))}

        {/* 8 ── Emoji badge pills */}
        {[
          {x:'94%',y:'30%',d:'8s', dl:'1s',   emoji:'⚠️',label:'Alert'},
          {x:'50%',y:'93%',d:'10s',dl:'2.5s', emoji:'✅',label:'Done'},
          {x:'32%',y:'4%', d:'9s', dl:'5s',   emoji:'📡',label:'Live'},
        ].map((b,i)=>(
          <div key={i} className="ab-p" style={{'--d':b.d,'--dl':b.dl,position:'absolute',left:b.x,top:b.y} as React.CSSProperties}>
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'.18rem',
              background:'rgba(255,255,255,.78)',backdropFilter:'blur(8px)',
              border:`1px solid ${sage}28`,borderRadius:'1rem',padding:'.5rem .65rem',
              boxShadow:`0 4px 14px ${teal}10`}}>
              <span style={{fontSize:'1rem',lineHeight:1}}>{b.emoji}</span>
              <span style={{fontSize:'.52rem',fontWeight:700,color:deep,letterSpacing:'.08em',textTransform:'uppercase'}}>{b.label}</span>
            </div>
          </div>
        ))}

      </div>
    </>
  )
}
