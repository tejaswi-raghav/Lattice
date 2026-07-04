import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Lock, Check, Image as ImageIcon, BarChart2, CalendarClock, Send, Copy,
  Heart, MessageCircle, Plus, X, Home, UserPlus, ChevronLeft, KeyRound,
  Clock, Eye, Grid3X3, Mail, Users, ArrowRight, Box, Maximize2, Move3d,
  ShieldCheck, Radio, Mic, MicOff, Fingerprint, WifiOff, Layers, ArrowUp,
  CalendarPlus, ChevronRight, Sparkles, Wind, Pencil, ScanLine, Wallet, Zap
} from "lucide-react";

/* ================================================================== *
 *  LATTICE — a private, volumetric social sanctuary. (2040 build)     *
 *  Design language: spatial-OS glass. Deep-space canvas, real depth   *
 *  & translucency, one luminous aurora signature, instrument type.    *
 *  Familiar flat-first layout; future materials.                      *
 *  Features from spec: volumetric splat posts + orbit, depth stories, *
 *  channels (Feed/Board/Events), ZK consent circles, haptic-resist    *
 *  refresh, spatial P2P lobby, post-quantum DMs, local-first status.  *
 * ================================================================== */

const AUR = "linear-gradient(120deg,#33E6D0,#6C6CF5 50%,#E85BE0)";
const RINGG = "conic-gradient(from 210deg,#33E6D0,#6C6CF5,#E85BE0,#33E6D0)";

function onAccent(hex){
  const c = hex.replace("#",""); const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16);
  return (0.299*r+0.587*g+0.114*b) > 150 ? "#0a0b12" : "#ffffff";
}
/* 7 era presets — accent behaves as light on the dark canvas */
const VIBES = {
  aurora:   { label:"Aurora",        accent:"#6C6CF5", nameFont:"'Sora', sans-serif",       nameSize:23, canvasCss:"radial-gradient(120% 120% at 20% 0%,#1a2440,transparent 60%),radial-gradient(120% 120% at 90% 30%,#3a2a5e,transparent 55%)" },
  grunge:   { label:"Soft Grunge",   accent:"#c85b57", nameFont:"'Courier New', monospace", nameSize:21, canvasCss:"radial-gradient(120% 120% at 30% 0%,#2a1f1e,transparent 60%)" },
  girly:    { label:"2014 Girly",    accent:"#7fd8b0", nameFont:"Georgia, serif",           nameSize:23, canvasCss:"radial-gradient(120% 120% at 20% 0%,#3a2230,transparent 60%),radial-gradient(120% 120% at 90% 20%,#2a3a44,transparent 55%)" },
  academia: { label:"Dark Academia", accent:"#d8b45a", nameFont:"'EB Garamond', serif",     nameSize:25, canvasCss:"radial-gradient(120% 120% at 25% 0%,#2b2318,transparent 60%)" },
  cottage:  { label:"Cottagecore",   accent:"#a8956a", nameFont:"'Libre Baskerville', serif",nameSize:21, canvasCss:"radial-gradient(120% 120% at 20% 0%,#22301f,transparent 60%)" },
  vapor:    { label:"Vaporwave",     accent:"#ff4fa3", nameFont:"'Sora', sans-serif",        nameSize:23, canvasCss:"radial-gradient(120% 120% at 15% 0%,#241452,transparent 60%),radial-gradient(120% 120% at 95% 25%,#5a1a52,transparent 55%)" },
  twee:     { label:"Twee",          accent:"#6aa2c8", nameFont:"'Times New Roman', serif",  nameSize:23, canvasCss:"radial-gradient(120% 120% at 20% 0%,#20303a,transparent 60%)" },
};
/* splat = layered depth media (bg / mid / fg glow) */
const SPLATS = [
  { bg:"linear-gradient(160deg,#7a3f5e,#EC6F8e)", mid:"radial-gradient(closest-side,#ffd9e8,#e88fb0cc 70%,transparent)", fg:"radial-gradient(closest-side,#fff3fa,#ffc9e0aa 60%,transparent)" },
  { bg:"linear-gradient(160deg,#1f3f6a,#4C8AA8)", mid:"radial-gradient(closest-side,#bfe3ff,#6fa8d6cc 70%,transparent)", fg:"radial-gradient(closest-side,#eaffff,#cfe8ffaa 60%,transparent)" },
  { bg:"linear-gradient(160deg,#2c6a52,#1C3A30)", mid:"radial-gradient(closest-side,#c8f0c2,#7fbf8ccc 70%,transparent)", fg:"radial-gradient(closest-side,#f2ffe8,#bfe8b0aa 60%,transparent)" },
  { bg:"linear-gradient(160deg,#4a3f8a,#2A2350)", mid:"radial-gradient(closest-side,#d8c8ff,#a98fd9cc 70%,transparent)", fg:"radial-gradient(closest-side,#fff,#e2ccffaa 60%,transparent)" },
];
const PAL = { You:"#6C6CF5", Arjun:"#33E6D0", Mei:"#E85BE0", Sana:"#6aa2c8", Theo:"#a88fe6", Dev:"#e0a35f" };

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&family=Space+Mono:wght@400;700&family=EB+Garamond:wght@500;600&family=Libre+Baskerville:wght@400;700&display=swap');
*{box-sizing:border-box; margin:0;}
.l-root{
  --void:#06070C; --deep:#0B0D15; --pane:rgba(255,255,255,.05); --pane2:rgba(255,255,255,.085);
  --hair:rgba(255,255,255,.11); --hair2:rgba(255,255,255,.06); --ink:#EEF1F8; --dim:#8B92A8; --dim2:#565C72;
  --accent:#6C6CF5; --on-accent:#0a0b12;
  font-family:'Sora',system-ui,sans-serif; color:var(--ink); -webkit-font-smoothing:antialiased;
  background:var(--void);
}
button{ font-family:inherit; color:inherit; }
.mono{ font-family:'Space Mono', monospace; }
.av{ border-radius:50%; display:grid;place-items:center; font-weight:700; flex:none; user-select:none; }

/* ambient deep-space field */
.ambient{ position:fixed; inset:0; z-index:0; overflow:hidden; background:
  radial-gradient(120% 90% at 50% -10%, #10131f, var(--void) 60%); }
.blob{ position:absolute; width:60vmax; height:60vmax; border-radius:50%; filter:blur(90px); opacity:.28; mix-blend-mode:screen; }
.blob.a{ background:#33E6D0; top:-20vmax; left:-10vmax; animation:drift1 26s ease-in-out infinite; }
.blob.b{ background:#6C6CF5; top:10vmax; right:-18vmax; animation:drift2 32s ease-in-out infinite; }
.blob.c{ background:#E85BE0; bottom:-24vmax; left:20vmax; opacity:.2; animation:drift3 38s ease-in-out infinite; }
@keyframes drift1{ 0%,100%{transform:translate(0,0)} 50%{transform:translate(6vmax,4vmax)} }
@keyframes drift2{ 0%,100%{transform:translate(0,0)} 50%{transform:translate(-5vmax,6vmax)} }
@keyframes drift3{ 0%,100%{transform:translate(0,0)} 50%{transform:translate(4vmax,-5vmax)} }
.stars{ position:absolute; inset:0; background-image:radial-gradient(1px 1px at 20% 30%,rgba(255,255,255,.5),transparent),radial-gradient(1px 1px at 70% 60%,rgba(255,255,255,.35),transparent),radial-gradient(1px 1px at 40% 80%,rgba(255,255,255,.3),transparent),radial-gradient(1px 1px at 85% 15%,rgba(255,255,255,.4),transparent),radial-gradient(1px 1px at 55% 40%,rgba(255,255,255,.25),transparent); opacity:.5; }
.layer{ position:relative; z-index:1; }

.glass{ background:var(--pane); backdrop-filter:blur(22px) saturate(1.2); -webkit-backdrop-filter:blur(22px) saturate(1.2); border:1px solid var(--hair); }

/* ============ LANDING ============ */
.nav{ max-width:1120px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:22px 28px; }
.brand{ font-size:18px; font-weight:700; letter-spacing:-.02em; display:flex; align-items:center; gap:10px; }
.blogo{ width:26px;height:26px;border-radius:8px; background:${AUR}; position:relative; box-shadow:0 0 20px -2px rgba(108,108,245,.6); }
.blogo:after{ content:""; position:absolute; inset:6px; border-radius:4px; background:var(--void); }
.navlink{ font-size:13.5px; color:var(--dim); background:none; border:none; cursor:pointer; }
.hero{ max-width:1120px; margin:0 auto; padding:56px 28px 0; text-align:center; }
.kick{ display:inline-flex; align-items:center; gap:8px; font-family:'Space Mono',monospace; font-size:11.5px; letter-spacing:.16em; text-transform:uppercase; color:var(--dim); border:1px solid var(--hair); border-radius:999px; padding:7px 14px; }
.kick .kd{ width:6px;height:6px;border-radius:50%; background:${AUR}; box-shadow:0 0 10px #6C6CF5; }
.hero h1{ font-size:clamp(44px,7.4vw,82px); font-weight:800; letter-spacing:-.04em; line-height:1.02; margin-top:22px; }
.hero h1 .g{ background:${AUR}; -webkit-background-clip:text; background-clip:text; color:transparent; }
.hero .sub{ font-size:clamp(16px,2.2vw,21px); color:var(--dim); font-weight:400; margin-top:20px; line-height:1.5; }
.ctas{ display:flex; gap:13px; justify-content:center; margin-top:32px; flex-wrap:wrap; }
.cta1{ border:none; border-radius:999px; padding:14px 26px; font-size:15px; font-weight:600; cursor:pointer; color:#06070C; background:${AUR}; display:inline-flex; align-items:center; gap:8px; box-shadow:0 10px 40px -10px rgba(108,108,245,.7); }
.cta1:hover{ filter:brightness(1.08); }
.cta2{ background:var(--pane); border:1px solid var(--hair); border-radius:999px; padding:14px 22px; font-size:15px; font-weight:500; cursor:pointer; color:var(--ink); }

/* floating holographic memory */
.holo-stage{ display:flex; justify-content:center; padding:60px 20px 90px; position:relative; }
.holo-glow{ position:absolute; top:40px; width:440px; height:440px; border-radius:50%; background:${AUR}; filter:blur(90px); opacity:.4; }
.holo{ position:relative; width:min(340px,86vw); animation:float 7s ease-in-out infinite; }
@keyframes float{ 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
.holo-frame{ border-radius:26px; overflow:hidden; border:1px solid var(--hair); background:var(--pane2); backdrop-filter:blur(20px); box-shadow:0 40px 90px -30px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.04) inset; }
.holo-cap{ display:flex; align-items:center; gap:9px; padding:11px 13px; border-top:1px solid var(--hair2); }
.holo-reflect{ position:absolute; left:8%; right:8%; top:100%; height:60px; background:${AUR}; filter:blur(26px); opacity:.22; border-radius:50%; }

.manif{ max-width:860px; margin:0 auto; }
.mrow{ padding:104px 28px; text-align:center; border-bottom:1px solid var(--hair2); }
.mrow:last-child{ border-bottom:none; }
.mrow h2{ font-size:clamp(32px,5.2vw,54px); font-weight:800; letter-spacing:-.03em; line-height:1.06; }
.mrow h2 em{ font-style:normal; color:var(--dim); }
.mrow h2 .g{ background:${AUR}; -webkit-background-clip:text; background-clip:text; color:transparent; }
.mrow p{ font-size:16.5px; color:var(--dim); max-width:34em; margin:18px auto 0; line-height:1.6; }
.demo3d{ margin:32px auto 0; width:min(320px,84vw); }
.demohint{ font-family:'Space Mono',monospace; font-size:11.5px; color:var(--dim2); margin-top:14px; letter-spacing:.02em; }
.chipline{ display:flex; gap:9px; justify-content:center; flex-wrap:wrap; margin-top:26px; }
.vchip{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--hair); border-radius:999px; padding:9px 15px; font-size:13.5px; font-weight:500; background:var(--pane); }
.vchip i{ width:10px;height:10px;border-radius:50%; }
.specrow{ display:grid; grid-template-columns:repeat(3,1fr); gap:12px; max-width:820px; margin:56px auto 0; padding:0 28px; }
@media(max-width:760px){ .specrow{ grid-template-columns:1fr 1fr; } }
.spec{ text-align:left; border-radius:16px; padding:16px; background:var(--pane); border:1px solid var(--hair); }
.spec .si{ width:34px;height:34px;border-radius:10px; display:grid;place-items:center; background:var(--pane2); color:#8fe6d8; }
.spec h5{ font-size:14px; font-weight:700; margin:11px 0 5px; letter-spacing:-.01em; }
.spec p{ font-size:12px; color:var(--dim); line-height:1.5; margin:0; }
.spec .tag{ font-family:'Space Mono',monospace; font-size:9.5px; color:var(--dim2); letter-spacing:.05em; margin-top:8px; display:block; }

.pricing{ max-width:860px; margin:0 auto; padding:96px 28px 40px; text-align:center; }
.pricing h2{ font-size:clamp(30px,4.6vw,46px); font-weight:800; letter-spacing:-.03em; }
.psub{ font-size:16px; color:var(--dim); margin-top:14px; }
.prow{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:42px; text-align:left; }
@media(max-width:700px){ .prow{ grid-template-columns:1fr; } }
.pcard{ border-radius:22px; padding:28px 26px; background:var(--pane); border:1px solid var(--hair); }
.pcard.hi{ border-color:rgba(108,108,245,.5); box-shadow:0 0 60px -20px rgba(108,108,245,.5); }
.pk{ font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--dim); }
.pn{ font-size:22px; font-weight:800; letter-spacing:-.02em; margin-top:8px; }
.pv{ font-size:38px; font-weight:800; letter-spacing:-.03em; margin-top:12px; }
.pv span{ font-size:14px; font-weight:400; color:var(--dim); letter-spacing:0; }
.pcard ul{ list-style:none; padding:0; margin:16px 0 0; }
.pcard li{ font-size:13.5px; color:var(--dim); line-height:1.5; padding:5px 0; display:flex; gap:9px; }
.pcard li svg{ flex:none; margin-top:2px; color:#8fe6d8; }
.golden{ margin-top:26px; font-size:13.5px; font-weight:500; color:var(--ink); }
.foot{ border-top:1px solid var(--hair2); padding:28px; text-align:center; font-family:'Space Mono',monospace; font-size:11.5px; color:var(--dim2); line-height:1.8; letter-spacing:.02em; }

/* ============ FLOW ============ */
.flow{ min-height:100vh; display:flex; justify-content:center; padding:44px 22px 80px; }
.fcard{ width:100%; max-width:420px; }
.back{ display:inline-flex; align-items:center; gap:5px; background:none;border:none; cursor:pointer; color:var(--dim); font-size:13.5px; margin-bottom:22px; }
.fstep{ font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.1em; text-transform:uppercase; color:#8fe6d8; }
.ftitle{ font-size:27px; font-weight:800; letter-spacing:-.025em; margin:10px 0 8px; }
.fmuted{ color:var(--dim); font-size:14px; line-height:1.6; }
.gbtn{ width:100%; display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; background:var(--pane2); border:1px solid var(--hair); border-radius:13px; padding:14px; font-weight:600; font-size:15px; margin-top:26px; }
.gbtn:hover{ border-color:rgba(255,255,255,.2); }
.gicon{ width:19px;height:19px; }
.fnote{ display:flex; gap:9px; align-items:flex-start; margin-top:18px; padding:13px 14px; border-radius:12px; background:var(--pane); border:1px solid var(--hair2); font-size:12px; color:var(--dim); line-height:1.55; }
.field{ margin-top:22px; }
.flabel{ font-size:13px; font-weight:600; color:var(--ink); margin-bottom:8px; display:flex; justify-content:space-between; }
.flabel .cnt{ color:var(--dim2); font-weight:400; font-family:'Space Mono',monospace; font-size:11px; }
.finput{ width:100%; background:var(--pane); border:1px solid var(--hair); border-radius:12px; padding:12px 14px; font-size:15px; font-family:inherit; color:var(--ink); outline:none; }
.finput:focus{ border-color:rgba(108,108,245,.6); }
.finput::placeholder{ color:var(--dim2); }
textarea.finput{ resize:none; min-height:60px; }
.vgrid{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
.vopt{ cursor:pointer; border:1.5px solid var(--hair); border-radius:12px; overflow:hidden; background:var(--pane); text-align:center; padding:0; }
.vopt.on{ border-color:var(--accent); box-shadow:0 0 18px -6px var(--accent); }
.vopt .vsw{ height:40px; position:relative; }
.vopt .vsw i{ position:absolute; right:7px; bottom:7px; width:9px;height:9px;border-radius:50%; box-shadow:0 0 8px currentColor; }
.vopt .vn{ font-size:10.5px; font-weight:600; padding:6px 3px 7px; color:var(--dim); }
.cgrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.copt{ cursor:pointer; border:1.5px solid var(--hair); border-radius:12px; overflow:hidden; height:52px; position:relative; background:var(--pane); padding:0; }
.copt.on{ border-color:var(--accent); }
.copt span{ position:absolute; left:8px; bottom:6px; font-size:10.5px; font-weight:600; }
.copt .p360{ position:absolute; top:6px; right:7px; font-family:'Space Mono',monospace; font-size:8.5px; color:var(--ink); background:rgba(0,0,0,.4); padding:2px 6px; border-radius:999px; }
.mini{ border-radius:16px; overflow:hidden; border:1px solid var(--hair); background:var(--pane); margin-top:8px; }
.mini .mb{ height:78px; }
.mini .mn{ padding:12px 14px 14px; }
.deploybtn{ width:100%; margin-top:26px; border:none; border-radius:999px; padding:15px; font-weight:700; font-size:15px; cursor:pointer; color:#06070C; background:${AUR}; display:flex; align-items:center; justify-content:center; gap:8px; box-shadow:0 10px 40px -12px rgba(108,108,245,.7); }
.dscreen{ text-align:center; max-width:420px; margin-top:8vh; }
.dorb{ width:70px;height:70px;border-radius:50%; margin:0 auto 22px; background:${AUR}; box-shadow:0 0 50px -6px rgba(108,108,245,.8); animation:spin 2.2s linear infinite; position:relative; }
.dorb:after{ content:""; position:absolute; inset:9px; border-radius:50%; background:var(--void); }
@keyframes spin{to{transform:rotate(360deg)}}
.dsteps{ margin-top:20px; text-align:left; display:inline-block; }
.dstep{ display:flex; gap:10px; align-items:center; font-family:'Space Mono',monospace; font-size:12px; color:var(--dim); padding:5px 0; }
.dstep svg{ color:#8fe6d8; flex:none; }
.durl{ font-family:'Space Mono',monospace; font-weight:700; font-size:16px; margin-top:12px; background:${AUR}; -webkit-background-clip:text; background-clip:text; color:transparent; }

/* ============ APP ============ */
.app{ min-height:100vh; display:flex; justify-content:center; }
.appcol{ width:100%; max-width:500px; min-height:100vh; display:flex; flex-direction:column; position:relative; border-left:1px solid var(--hair2); border-right:1px solid var(--hair2); }
@media(max-width:520px){ .appcol{ border:none; } }
.topbar{ position:sticky; top:0; z-index:30; background:rgba(6,7,12,.72); backdrop-filter:blur(20px); border-bottom:1px solid var(--hair2); padding:0 16px; height:56px; display:flex; align-items:center; justify-content:space-between; }
.roomname{ line-height:1; text-shadow:0 0 22px color-mix(in srgb, var(--accent) 55%, transparent); }
.status{ display:flex; align-items:center; gap:12px; }
.synced{ display:inline-flex; align-items:center; gap:6px; font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:.04em; color:var(--dim); }
.synced .sd{ width:6px;height:6px;border-radius:50%; background:#4fe3a0; box-shadow:0 0 8px #4fe3a0; animation:pulse 2.6s infinite; }
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.iconbtn{ background:none; border:none; cursor:pointer; color:var(--ink); display:grid; place-items:center; padding:0; opacity:.85; }
.iconbtn:hover{ opacity:1; }

.roomband{ height:80px; position:relative; }
.roomband:after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg,transparent 40%,rgba(6,7,12,.55)); }
.bmeta{ position:absolute; left:16px; bottom:10px; display:flex; gap:7px; z-index:2; }
.bpill{ font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:.02em; color:var(--ink); background:rgba(0,0,0,.42); backdrop-filter:blur(6px); padding:4px 9px; border-radius:999px; display:inline-flex; gap:5px; align-items:center; border:1px solid var(--hair2); }

/* channel pills */
.channels{ display:flex; gap:7px; padding:12px 16px 10px; overflow-x:auto; scrollbar-width:none; border-bottom:1px solid var(--hair2); }
.channels::-webkit-scrollbar{display:none;}
.chpill{ flex:none; display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:1px solid var(--hair); background:var(--pane); color:var(--dim); font-size:12.5px; font-weight:600; padding:7px 13px; border-radius:999px; }
.chpill.on{ color:var(--on-accent); background:var(--accent); border-color:var(--accent); box-shadow:0 0 16px -4px var(--accent); }

.stories{ display:flex; gap:16px; padding:12px 16px 12px; overflow-x:auto; scrollbar-width:none; border-bottom:1px solid var(--hair2); }
.stories::-webkit-scrollbar{display:none;}
.story{ display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; background:none; border:none; padding:0; }
.ring{ width:64px;height:64px; border-radius:50%; padding:2.5px; background:${RINGG}; }
.ring.seen{ background:var(--hair); }
.ring .rin{ width:100%; height:100%; border-radius:50%; background:var(--void); padding:2.5px; }
.sn{ font-size:11px; color:var(--dim); max-width:64px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.story.you .ring{ background:var(--hair); }
.youplus{ position:relative; }
.youplus .pb{ position:absolute; right:-1px; bottom:-1px; width:20px;height:20px; border-radius:50%; background:var(--accent); border:2.5px solid var(--void); display:grid; place-items:center; color:var(--on-accent); }

.feed{ padding-bottom:100px; }
.welcome{ margin:14px 16px 4px; border-radius:16px; padding:14px 16px; background:var(--pane); border:1px solid var(--hair); border-left:2px solid var(--accent); }
.welcome .wl{ font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.05em; text-transform:uppercase; color:var(--accent); }
.welcome .wq{ font-size:14px; color:var(--ink); line-height:1.5; margin-top:5px; }
.post{ margin:14px 16px; border-radius:18px; overflow:hidden; background:var(--pane); border:1px solid var(--hair); }
.phead{ display:flex; align-items:center; gap:10px; padding:12px 14px; }
.pa{ font-weight:600; font-size:13.5px; }
.pt{ font-size:10.5px; color:var(--dim); margin-top:1px; font-family:'Space Mono',monospace; }
.circletag{ margin-left:auto; display:inline-flex; align-items:center; gap:5px; font-size:10px; font-weight:600; color:var(--dim); border:1px solid var(--hair); border-radius:999px; padding:3px 9px; }

.vol{ aspect-ratio:1/1; position:relative; overflow:hidden; perspective:900px; cursor:pointer; touch-action:pan-y; background:#000; }
.vlayer{ position:absolute; inset:-8%; will-change:transform; }
.vlayer.mid{ inset:10%; } .vlayer.fg{ inset:26%; }
.vbadge{ position:absolute; top:12px; right:12px; z-index:5; display:inline-flex; align-items:center; gap:5px; font-family:'Space Mono',monospace; font-size:9.5px; letter-spacing:.05em; color:#fff; background:rgba(0,0,0,.42); backdrop-filter:blur(6px); padding:4px 9px; border-radius:999px; border:1px solid rgba(255,255,255,.15); }
.vexpand{ position:absolute; bottom:12px; right:12px; z-index:5; width:32px;height:32px;border-radius:50%; background:rgba(0,0,0,.45); backdrop-filter:blur(6px); color:#fff; border:1px solid rgba(255,255,255,.15); cursor:pointer; display:grid; place-items:center; }
.vcap{ position:absolute; left:12px; bottom:12px; z-index:5; background:rgba(0,0,0,.42); backdrop-filter:blur(5px); color:#fff; padding:6px 11px; border-radius:9px; font-size:13px; }

.orbitwrap{ position:fixed; inset:0; z-index:80; background:rgba(4,5,10,.9); backdrop-filter:blur(10px); display:grid; place-items:center; padding:18px; }
.orbitstage{ width:min(430px,92vw); aspect-ratio:1/1; perspective:1000px; position:relative; cursor:grab; touch-action:none; }
.orbitstage:active{ cursor:grabbing; }
.orbitcube{ position:absolute; inset:0; transform-style:preserve-3d; border-radius:22px; filter:drop-shadow(0 0 40px rgba(108,108,245,.4)); }
.olayer{ position:absolute; inset:0; border-radius:22px; }
.olayer.mid{ inset:9%; } .olayer.fg{ inset:24%; }
.ohud{ position:absolute; top:16px; left:16px; right:16px; display:flex; align-items:center; justify-content:space-between; color:#fff; z-index:5; }
.ohud .ot{ font-size:12.5px; font-weight:600; display:inline-flex; gap:8px; align-items:center; }
.ohud button{ background:rgba(255,255,255,.12); border:none; color:#fff; width:32px;height:32px;border-radius:50%; cursor:pointer; display:grid; place-items:center; }
.ofoot{ position:absolute; bottom:16px; left:0; right:0; text-align:center; color:#fff; z-index:5; }
.ofoot .oh{ font-family:'Space Mono',monospace; font-size:11px; opacity:.6; letter-spacing:.02em; }
.spatialbtn{ margin-top:12px; display:inline-flex; align-items:center; gap:8px; background:${AUR}; border:none; color:#06070C; font-size:13px; font-weight:700; padding:10px 18px; border-radius:999px; cursor:pointer; }

.acts{ display:flex; align-items:center; gap:16px; padding:10px 14px 5px; }
.acts button{ background:none; border:none; cursor:pointer; color:var(--ink); padding:0; display:grid; place-items:center; }
.acts .liked{ color:#ff5b7f; }
.acts .quiet{ margin-left:auto; font-family:'Space Mono',monospace; font-size:9.5px; color:var(--dim2); }
.pbody{ padding:2px 14px 14px; font-size:14px; line-height:1.45; }
.pbody b{ font-weight:600; }
.pbody .cmt{ color:var(--dim); font-size:13px; margin-top:3px; cursor:pointer; }
.ptextonly{ padding:2px 14px 14px; font-size:14.5px; line-height:1.55; }
.remcard{ margin:2px 14px 14px; border:1px solid var(--hair); border-radius:14px; padding:13px; display:flex; gap:12px; align-items:center; background:var(--pane2); }
.remcard .cal{ width:44px;height:44px;border-radius:12px; display:grid;place-items:center; flex:none; }
.remcard .rt{ font-weight:600; font-size:14px; }
.remcard .rw{ font-size:11px; color:var(--dim); margin-top:2px; font-family:'Space Mono',monospace; }
.cdown{ margin-left:auto; text-align:right; }
.cdown .cv{ font-family:'Space Mono',monospace; font-weight:700; font-size:14px; }
.cdown .cl{ font-family:'Space Mono',monospace; font-size:9px; color:var(--dim); text-transform:uppercase; letter-spacing:.05em; }
.pollwrap{ padding:2px 14px 12px; }
.pollq{ font-size:14px; font-weight:600; margin-bottom:10px; }
.popt{ position:relative; border:1px solid var(--hair); border-radius:11px; padding:11px 13px; margin-bottom:8px; cursor:pointer; overflow:hidden; background:var(--pane); }
.popt .pfill{ position:absolute; inset:0; opacity:.2; width:0; transition:width .5s ease; }
.popt .pl{ position:relative; display:flex; justify-content:space-between; font-size:13.5px; }
.popt.voted{ cursor:default; }
.popt .pct{ color:var(--dim); font-family:'Space Mono',monospace; }
.pollmeta{ font-family:'Space Mono',monospace; font-size:10.5px; color:var(--dim2); padding:2px 0 6px; }

/* haptic resistance block */
.hapzone{ text-align:center; padding:30px 20px 14px; }
.hapzone .ht{ font-size:14px; font-weight:600; }
.hapzone .hs{ font-size:12px; color:var(--dim); margin-top:4px; line-height:1.5; }
.happad{ position:relative; width:200px; height:56px; margin:18px auto 0; border-radius:999px; border:1px solid var(--hair); background:var(--pane); overflow:hidden; cursor:pointer; user-select:none; display:grid; place-items:center; }
.happad .hfill{ position:absolute; left:0; top:0; bottom:0; width:0%; background:${AUR}; opacity:.28; }
.happad .hlabel{ position:relative; z-index:2; font-family:'Space Mono',monospace; font-size:11.5px; letter-spacing:.06em; text-transform:uppercase; display:inline-flex; gap:8px; align-items:center; }
.hapdone{ display:inline-flex; align-items:center; gap:8px; font-size:13px; color:var(--dim); margin-top:6px; }

/* board */
.board{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; padding:14px 14px 100px; }
.bcell{ aspect-ratio:1/1; position:relative; cursor:pointer; border:none; padding:0; overflow:hidden; border-radius:10px; }
.bcell .who{ position:absolute; left:6px; bottom:6px; font-size:10px; font-weight:600; color:#fff; background:rgba(0,0,0,.42); padding:2px 7px; border-radius:999px; z-index:2; }
.bcell .up{ position:absolute; top:6px; right:6px; z-index:2; display:inline-flex; align-items:center; gap:4px; font-family:'Space Mono',monospace; font-size:9px; color:#fff; background:rgba(0,0,0,.42); padding:2px 7px; border-radius:999px; border:none; cursor:pointer; }
.bcell .up.on{ color:#8fe6d8; }
.bnote{ grid-column:1/-1; text-align:center; font-family:'Space Mono',monospace; font-size:10.5px; color:var(--dim2); padding:12px 20px 4px; }

/* events ledger */
.events{ padding:16px 16px 100px; }
.evhead{ font-size:19px; font-weight:800; letter-spacing:-.02em; }
.evsub{ font-size:12.5px; color:var(--dim); margin-top:4px; }
.evcard{ margin-top:14px; border-radius:16px; padding:15px; background:var(--pane); border:1px solid var(--hair); display:flex; gap:13px; align-items:center; }
.evdate{ width:52px;height:52px;border-radius:13px; flex:none; display:grid; place-items:center; text-align:center; background:var(--pane2); border:1px solid var(--hair); }
.evdate .d{ font-size:18px; font-weight:800; line-height:1; }
.evdate .mo{ font-family:'Space Mono',monospace; font-size:9px; color:var(--dim); text-transform:uppercase; margin-top:2px; }
.evbody .en{ font-weight:600; font-size:14.5px; }
.evbody .em{ font-size:11.5px; color:var(--dim); margin-top:2px; font-family:'Space Mono',monospace; }
.evsub-btn{ margin-left:auto; border:1px solid var(--hair); background:var(--pane); color:var(--ink); font-weight:600; font-size:12px; padding:8px 13px; border-radius:999px; cursor:pointer; display:inline-flex; gap:6px; align-items:center; }
.evsub-btn.on{ background:var(--accent); color:var(--on-accent); border-color:var(--accent); }

/* spatial lobby */
.lobby{ flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:20px 20px 110px; text-align:center; position:relative; }
.lobbystage{ position:relative; width:min(320px,80vw); aspect-ratio:1/1; margin:8px auto 0; }
.lring{ position:absolute; border-radius:50%; border:1px solid var(--hair); left:50%; top:50%; transform:translate(-50%,-50%); }
.lring.pulse{ border-color:var(--accent); animation:lpulse 3s ease-out infinite; }
@keyframes lpulse{ 0%{opacity:.7; transform:translate(-50%,-50%) scale(.7)} 100%{opacity:0; transform:translate(-50%,-50%) scale(1.1)} }
.lmember{ position:absolute; transform:translate(-50%,-50%); display:flex; flex-direction:column; align-items:center; gap:4px; }
.lmember .lname{ font-size:10px; color:var(--dim); }
.lspeak{ box-shadow:0 0 0 3px color-mix(in srgb, var(--accent) 70%, transparent), 0 0 22px var(--accent); border-radius:50%; }
.lobbymeta{ font-family:'Space Mono',monospace; font-size:11px; color:var(--dim); margin-top:18px; line-height:1.7; letter-spacing:.02em; }
.lobbyctl{ display:flex; gap:12px; justify-content:center; margin-top:18px; }
.lctl{ width:52px;height:52px;border-radius:50%; border:1px solid var(--hair); background:var(--pane); color:var(--ink); cursor:pointer; display:grid; place-items:center; }
.lctl.join{ background:${AUR}; color:#06070C; border:none; width:auto; padding:0 22px; border-radius:999px; font-weight:700; font-size:14px; gap:8px; }
.lctl.leave{ background:#ff5b7f22; border-color:#ff5b7f55; color:#ff8ba3; }
.lctl.on{ background:var(--accent); color:var(--on-accent); border-color:var(--accent); }

/* chat */
.chat{ display:flex; flex-direction:column; flex:1; }
.chatscroll{ flex:1; overflow-y:auto; padding:14px 14px 6px; display:flex; flex-direction:column; gap:8px; }
.cnote{ text-align:center; font-family:'Space Mono',monospace; font-size:10.5px; color:var(--dim2); margin:6px 0 12px; line-height:1.7; letter-spacing:.02em; }
.cnote .ck{ color:#8fe6d8; }
.bub{ max-width:74%; padding:10px 14px; border-radius:20px; font-size:14.5px; line-height:1.4; }
.bub.them{ align-self:flex-start; background:var(--pane2); border:1px solid var(--hair); border-bottom-left-radius:6px; }
.bub.me{ align-self:flex-end; color:var(--on-accent); border-bottom-right-radius:6px; }
.bwho{ font-size:10.5px; color:var(--dim); margin:0 0 2px 6px; font-weight:600; }
.chatbar{ display:flex; gap:9px; padding:10px 14px calc(10px + env(safe-area-inset-bottom)); border-top:1px solid var(--hair2); }
.chatbar input{ flex:1; background:var(--pane); border:1px solid var(--hair); border-radius:999px; padding:11px 16px; color:var(--ink); font-family:inherit; font-size:14.5px; outline:none; }
.chatbar input::placeholder{ color:var(--dim2); }
.csend{ width:40px;height:40px;border-radius:50%; color:var(--on-accent); border:none; cursor:pointer; display:grid;place-items:center; flex:none; }

/* invite */
.inv{ padding:18px 16px 100px; }
.invh{ font-size:20px; font-weight:800; letter-spacing:-.02em; }
.invs{ font-size:13px; color:var(--dim); margin-top:4px; line-height:1.55; }
.kcard{ border:1px solid var(--hair); border-radius:16px; padding:16px; margin-top:16px; background:var(--pane); }
.klbl{ font-family:'Space Mono',monospace; font-size:10px; letter-spacing:.06em; text-transform:uppercase; color:var(--dim); }
.klink{ font-family:'Space Mono',monospace; font-size:12.5px; margin-top:8px; word-break:break-all; line-height:1.6; }
.kmeta{ display:flex; gap:7px; margin-top:10px; flex-wrap:wrap; }
.kpill{ font-family:'Space Mono',monospace; font-size:9.5px; color:var(--dim); border:1px solid var(--hair); background:var(--pane); padding:3px 9px; border-radius:999px; display:inline-flex; gap:4px; align-items:center; }
.krow{ display:flex; gap:9px; margin-top:14px; flex-wrap:wrap; }
.kbtn{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; border:none; color:var(--on-accent); font-weight:600; font-size:13.5px; padding:10px 16px; border-radius:11px; }
.kghost{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; background:var(--pane); color:var(--ink); border:1px solid var(--hair); font-weight:600; font-size:13px; padding:10px 14px; border-radius:11px; }
.emailrow{ display:flex; gap:8px; margin-top:12px; }
.emailrow input{ flex:1; background:var(--pane); border:1px solid var(--hair); border-radius:10px; padding:10px 13px; color:var(--ink); font-family:inherit; font-size:13.5px; outline:none; }
.emailrow input::placeholder{ color:var(--dim2); }
.kstat{ font-family:'Space Mono',monospace; font-size:11px; color:var(--dim); margin-top:12px; }
.kstat b{ color:var(--ink); }
.invrow{ display:flex; align-items:center; gap:11px; padding:12px 2px; border-bottom:1px solid var(--hair2); }
.invrow:last-child{ border-bottom:none; }
.tagv{ margin-left:auto; font-family:'Space Mono',monospace; font-size:10px; padding:3px 10px; border-radius:999px; border:1px solid var(--hair); }

/* tab bar */
.tabbar{ position:sticky; bottom:0; z-index:30; display:flex; background:rgba(6,7,12,.78); backdrop-filter:blur(20px); border-top:1px solid var(--hair2); padding:6px 8px calc(8px + env(safe-area-inset-bottom)); }
.tabb{ flex:1; display:grid; place-items:center; background:none; border:none; cursor:pointer; color:var(--ink); padding:8px 0; opacity:.4; }
.tabb.on{ opacity:1; }
.tabb.plus{ opacity:1; }
.tabb.plus .pring{ width:34px;height:34px;border-radius:11px; background:${AUR}; display:grid; place-items:center; color:#06070C; box-shadow:0 0 18px -4px rgba(108,108,245,.8); }

/* sheets & modals */
.sheetwrap{ position:fixed; inset:0; z-index:60; background:rgba(4,5,10,.55); backdrop-filter:blur(4px); display:flex; align-items:flex-end; justify-content:center; }
.sheet{ width:100%; max-width:500px; background:var(--deep); border:1px solid var(--hair); border-bottom:none; border-radius:22px 22px 0 0; padding:8px 16px calc(18px + env(safe-area-inset-bottom)); animation:up .22s ease; }
@keyframes up{ from{ transform:translateY(40px); opacity:.6; } to{ transform:none; opacity:1; } }
.grab{ width:38px; height:4.5px; border-radius:3px; background:var(--hair); margin:6px auto 14px; }
.sh{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.sh .st{ font-size:16px; font-weight:700; }
.sh button{ background:none; border:none; cursor:pointer; color:var(--dim); }
.ctabs{ display:flex; gap:7px; margin-bottom:12px; }
.ctab{ display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:1px solid var(--hair); background:var(--pane); color:var(--dim); font-size:12.5px; font-weight:600; padding:8px 12px; border-radius:999px; }
.ci{ width:100%; background:var(--pane); border:1px solid var(--hair); border-radius:11px; padding:11px 13px; color:var(--ink); font-family:inherit; font-size:14.5px; outline:none; resize:none; }
.ci::placeholder{ color:var(--dim2); }
.ci + .ci{ margin-top:8px; }
.mediapick{ display:flex; gap:8px; margin-top:10px; }
.mp{ flex:1; height:52px; border-radius:11px; cursor:pointer; border:2px solid transparent; padding:0; }
.mp.on{ border-color:var(--ink); }
.optrow{ display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:11px 13px; border:1px solid var(--hair); border-radius:11px; background:var(--pane); }
.optrow .sl{ font-size:13px; font-weight:600; display:flex; gap:8px; align-items:center; }
.optrow .ss{ font-size:10.5px; color:var(--dim); margin-top:2px; font-family:'Space Mono',monospace; }
.swtch{ width:44px; height:26px; border-radius:999px; border:none; cursor:pointer; position:relative; background:var(--hair); flex:none; }
.swtch i{ position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .15s; }
.swtch.on i{ transform:translateX(18px); }
.circlepick{ display:flex; gap:7px; margin-top:10px; flex-wrap:wrap; }
.crc{ display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:1px solid var(--hair); background:var(--pane); color:var(--dim); font-size:12px; font-weight:600; padding:7px 12px; border-radius:999px; }
.crc.on{ color:var(--on-accent); background:var(--accent); border-color:var(--accent); }
.shfoot{ display:flex; align-items:center; justify-content:space-between; margin-top:14px; }
.shnote{ font-family:'Space Mono',monospace; font-size:10.5px; color:var(--dim2); }
.postbtn{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; border:none; color:var(--on-accent); font-weight:700; font-size:14px; padding:11px 20px; border-radius:999px; }
.postbtn[disabled]{ opacity:.4; cursor:default; }

/* privacy panel */
.ppanel{ position:fixed; inset:0; z-index:65; background:rgba(4,5,10,.6); backdrop-filter:blur(6px); display:flex; align-items:flex-start; justify-content:center; padding:70px 18px 18px; }
.pp{ width:100%; max-width:400px; background:var(--deep); border:1px solid var(--hair); border-radius:20px; overflow:hidden; }
.pphead{ padding:18px 18px 6px; }
.pptitle{ font-size:17px; font-weight:800; letter-spacing:-.02em; display:flex; align-items:center; gap:9px; }
.ppsub{ font-size:12px; color:var(--dim); margin-top:6px; line-height:1.5; }
.pprow{ display:flex; gap:12px; padding:13px 18px; border-top:1px solid var(--hair2); }
.pprow .pi{ width:34px;height:34px;border-radius:10px; background:var(--pane2); display:grid; place-items:center; color:#8fe6d8; flex:none; }
.pprow .pn{ font-size:13.5px; font-weight:600; }
.pprow .pd{ font-size:11px; color:var(--dim); margin-top:2px; line-height:1.45; }
.pprow .pt{ font-family:'Space Mono',monospace; font-size:9px; color:var(--dim2); margin-top:4px; letter-spacing:.03em; }
.pprow .pok{ margin-left:auto; color:#4fe3a0; flex:none; }
.ppclose{ width:100%; padding:14px; background:var(--pane); border:none; border-top:1px solid var(--hair2); color:var(--ink); font-weight:600; font-size:14px; cursor:pointer; }

/* story viewer — depth-aware, locked base, safe zones */
.scrim{ position:fixed; inset:0; background:rgba(4,5,10,.92); z-index:70; display:grid; place-items:center; padding:18px; }
.moment{ width:100%; max-width:350px; aspect-ratio:9/16; border-radius:20px; overflow:hidden; position:relative; perspective:800px; }
.moment .mbg{ position:absolute; inset:0; z-index:0; }
.moment .msafe-t{ position:absolute; top:0; left:0; right:0; height:14%; z-index:4; }
.moment .msafe-b{ position:absolute; bottom:0; left:0; right:0; height:14%; z-index:4; }
.moment .mcanvas{ position:absolute; inset:14% 8%; z-index:2; display:grid; place-items:center; text-align:center; will-change:transform; }
.moment .mh{ position:absolute; top:16px; left:14px; right:14px; display:flex; align-items:center; gap:8px; color:#fff; font-size:13px; font-weight:600; z-index:5; }
.moment .mt{ font-weight:800; font-size:26px; color:#fff; line-height:1.2; letter-spacing:-.01em; text-shadow:0 2px 16px rgba(0,0,0,.5); }
.moment .mbar{ position:absolute; top:9px; left:14px; right:14px; height:2.5px; border-radius:3px; background:rgba(255,255,255,.3); overflow:hidden; z-index:5; }
.moment .mbar i{ display:block; height:100%; background:#fff; animation:fill 7s linear forwards; }
@keyframes fill{from{width:0}to{width:100%}}
.mclose{ position:absolute; top:12px; right:12px; cursor:pointer; background:rgba(0,0,0,.35); border:none; color:#fff; width:30px;height:30px;border-radius:50%; display:grid;place-items:center; z-index:6; }

.joincard{ width:100%; max-width:370px; background:var(--deep); border:1px solid var(--hair); border-radius:20px; overflow:hidden; }
.join-top{ height:90px; position:relative; }
.join-body{ padding:18px 20px 22px; }
.join-name{ font-size:19px; font-weight:800; letter-spacing:-.02em; }
.join-from{ font-family:'Space Mono',monospace; font-size:11.5px; color:var(--dim); margin-top:4px; }
.checks{ margin:16px 0 4px; }
.chk{ display:flex; align-items:center; gap:10px; padding:9px 0; font-size:13px; color:var(--dim2); border-bottom:1px solid var(--hair2); }
.chk.ok{ color:var(--ink); }
.chk .cbox{ width:22px;height:22px;border-radius:7px; display:grid;place-items:center; background:var(--pane2); color:var(--dim2); flex:none; }
.chk.ok .cbox{ background:#4fe3a0; color:#06070C; }
.join-cta{ width:100%; margin-top:14px; display:flex; align-items:center; justify-content:center; gap:10px; background:var(--pane2); border:1px solid var(--hair); border-radius:11px; padding:13px; font-weight:600; font-size:14px; cursor:pointer; }
.join-cta[disabled]{ opacity:.5; cursor:default; }
.join-close{ position:absolute; top:12px; right:12px; cursor:pointer; background:rgba(0,0,0,.3); border:none; color:#fff; width:28px;height:28px;border-radius:50%; display:grid;place-items:center; z-index:2; }

/* ambient periphery indicators (calm tech · the digital livewire) */
.periphery{ position:fixed; inset:0; z-index:40; pointer-events:none; opacity:0; transition:opacity 3.6s ease;
  box-shadow:inset 0 0 130px 8px color-mix(in srgb, var(--accent) 42%, transparent), inset 0 0 46px 0 color-mix(in srgb, var(--accent) 22%, transparent); }
.periphery.on{ opacity:.5; }
.dangle{ position:absolute; top:60px; left:9px; z-index:35; width:2px; height:44px; transform-origin:top center; pointer-events:none; opacity:.35; transition:opacity 1.2s ease; }
.dangle .thread{ position:absolute; top:0; left:0; width:1.6px; height:100%; background:linear-gradient(var(--accent),transparent); border-radius:2px; }
.dangle .bead{ position:absolute; bottom:-3px; left:-2px; width:6px;height:6px;border-radius:50%; background:var(--accent); box-shadow:0 0 12px var(--accent); }
.dangle.sway{ opacity:.9; animation:sway 3.3s ease-in-out infinite; }
@keyframes sway{ 0%,100%{transform:rotate(-8deg)} 50%{transform:rotate(8deg)} }
.whisper{ position:fixed; left:0; right:0; bottom:calc(74px + env(safe-area-inset-bottom)); text-align:center; z-index:40; pointer-events:none; font-family:'Space Mono',monospace; font-size:10.5px; letter-spacing:.04em; color:var(--dim2); opacity:0; transition:opacity 1.6s ease; }
.whisper.on{ opacity:.7; }

/* completed-state ritual (anti-reflexive) */
.completed{ padding:32px 20px 18px; text-align:center; }
.cdone{ font-size:15px; font-weight:700; }
.cdsub{ font-size:12px; color:var(--dim); line-height:1.55; max-width:26em; margin:5px auto 0; }
.seg{ display:inline-flex; gap:4px; padding:4px; border-radius:999px; background:var(--pane); border:1px solid var(--hair); margin-top:16px; }
.segb{ border:none; background:none; cursor:pointer; color:var(--dim); font-size:12px; font-weight:600; padding:7px 14px; border-radius:999px; display:inline-flex; gap:6px; align-items:center; }
.segb.on{ background:var(--accent); color:var(--on-accent); }
.breathe{ margin:20px auto 4px; width:160px; height:160px; display:grid; place-items:center; position:relative; }
.bhalo{ position:absolute; width:78px; height:78px; border-radius:50%; border:1px solid var(--hair); transition:transform 4s ease-in-out; }
.borb{ width:78px; height:78px; border-radius:50%; background:${AUR}; box-shadow:0 0 46px -6px color-mix(in srgb, var(--accent) 70%, transparent); transition:transform 4s ease-in-out; }
.bword{ position:absolute; bottom:-2px; font-family:'Space Mono',monospace; font-size:11px; letter-spacing:.08em; text-transform:uppercase; color:var(--dim); transition:opacity .6s; }
.doodle{ margin:18px auto 4px; max-width:300px; }
.dcanvas{ width:100%; height:150px; border-radius:14px; background:var(--pane); border:1px solid var(--hair); touch-action:none; cursor:crosshair; display:block; }
.dclear{ margin-top:8px; background:none; border:none; color:var(--dim); font-family:'Space Mono',monospace; font-size:11px; cursor:pointer; letter-spacing:.04em; }
.cmode-note{ font-size:11.5px; color:var(--dim2); margin-top:10px; }

@media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important; } }
`;

function Avatar({ who, size=32, ring=false }){
  const c = PAL[who] || "#8990a6";
  return <div className="av" style={{ width:size,height:size,fontSize:size*0.42,
    background:`linear-gradient(150deg,${c},${c}bb)`, color:onAccent(c),
    boxShadow: ring ? `0 0 0 2px ${c}, 0 0 18px ${c}` : "none" }}>{who[0]}</div>;
}
function GoogleMark(){
  return (<svg className="gicon" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.3 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>);
}

/* volumetric block: pointer parallax on layered planes */
function VolBlock({ splat, caption, onExpand, className="vol", depth=14 }){
  const ref = useRef(null);
  const [t, setT] = useState({ x:0, y:0 });
  const move = useCallback(e=>{
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    setT({ x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5 });
  },[]);
  return (
    <div ref={ref} className={className} onPointerMove={move} onPointerLeave={()=>setT({x:0,y:0})} onClick={onExpand}>
      <div className="vlayer" style={{ background:splat.bg, transform:`translate(${t.x*-depth}px,${t.y*-depth}px) scale(1.06)` }}/>
      <div className="vlayer mid" style={{ background:splat.mid, transform:`translate(${t.x*depth*1.4}px,${t.y*depth*1.4}px)` }}/>
      <div className="vlayer fg" style={{ background:splat.fg, transform:`translate(${t.x*depth*2.6}px,${t.y*depth*2.6}px)` }}/>
      <span className="vbadge"><Box size={11}/> 3DGS</span>
      {onExpand && <button className="vexpand" aria-label="Open 3D viewer" onClick={e=>{e.stopPropagation(); onExpand();}}><Maximize2 size={14}/></button>}
      {caption && <span className="vcap">{caption}</span>}
    </div>
  );
}
function OrbitViewer({ splat, author, caption, onClose }){
  const [rot, setRot] = useState({ x:-8, y:14 });
  const drag = useRef(null);
  function down(e){ drag.current={ sx:e.clientX, sy:e.clientY, rx:rot.x, ry:rot.y }; e.currentTarget.setPointerCapture(e.pointerId); }
  function move(e){ if(!drag.current) return; const dx=e.clientX-drag.current.sx, dy=e.clientY-drag.current.sy;
    setRot({ x:Math.max(-38,Math.min(38,drag.current.rx-dy*0.25)), y:drag.current.ry+dx*0.3 }); }
  function up(){ drag.current=null; }
  const Z=60;
  return (
    <div className="orbitwrap" onClick={onClose}>
      <div className="orbitstage" onClick={e=>e.stopPropagation()} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}>
        <div className="ohud"><span className="ot"><Box size={15}/> {author}’s spatial memory</span><button onClick={onClose} aria-label="Close"><X size={15}/></button></div>
        <div className="orbitcube" style={{ transform:`rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
          <div className="olayer" style={{ background:splat.bg, transform:`translateZ(${-Z}px) scale(1.12)` }}/>
          <div className="olayer mid" style={{ background:splat.mid }}/>
          <div className="olayer fg" style={{ background:splat.fg, transform:`translateZ(${Z}px)` }}/>
        </div>
        <div className="ofoot">
          <div className="oh"><Move3d size={12} style={{verticalAlign:"-2px"}}/> drag to orbit · decoded on-device · zero telemetry</div>
          <button className="spatialbtn" onClick={e=>e.stopPropagation()}><Box size={14}/> Enter Spatial Space</button>
          {caption && <div style={{fontSize:13,marginTop:10,opacity:.8}}>{caption}</div>}
        </div>
      </div>
    </div>
  );
}

/* -------- seed content -------- */
const seedStories = [
  { id:"st1", who:"Arjun", css:"linear-gradient(160deg,#2c6a52,#14261f)", text:"summit before sunrise", seen:false },
  { id:"st2", who:"Mei",   css:"linear-gradient(160deg,#7a2f4e,#EC6F8e)", text:"that ramen again. no regrets.", seen:false },
  { id:"st3", who:"Sana",  css:"linear-gradient(160deg,#1f3f6a,#4C8AA8)", text:"rooftop, golden hour", seen:true },
];
const REMIND_TARGET = Date.now() + 1000*60*60*52 + 1000*60*23;
const seedPosts = [
  { id:"p1", author:"Arjun", time:"1h", type:"reminder", rtitle:"Cabin weekend", rwhen:"6 going · bring layers", target:REMIND_TARGET, liked:false, comments:9, circle:"Everyone" },
  { id:"p2", author:"Mei", time:"3h", type:"splat", splat:SPLATS[0], caption:"new spot, would absolutely return", liked:true, comments:4, circle:"Close Friends" },
  { id:"p3", author:"Sana", time:"5h", type:"poll", q:"Movie night pick?", opts:[{t:"Spirited Away",v:4},{t:"Paddington 2",v:6}], voted:null, comments:7, circle:"Everyone" },
  { id:"p4", author:"Theo", time:"7h", type:"splat", splat:SPLATS[1], caption:"golden hour did its thing", liked:false, comments:3, circle:"Everyone" },
  { id:"p5", author:"Dev", time:"1d", type:"splat", splat:SPLATS[3], caption:"first attempt at focaccia", liked:false, comments:6, circle:"Family" },
  { id:"p6", author:"You", time:"2d", type:"splat", splat:SPLATS[2], caption:"trail from last weekend", liked:false, comments:2, circle:"Everyone" },
];
const seedEvents = [
  { id:"e1", d:"14", mo:"Jun", name:"Cabin weekend", meta:"Fri 6pm · 6 going", sub:true },
  { id:"e2", d:"22", mo:"Jun", name:"Movie night — Ghibli marathon", meta:"Sat 8pm · Sana’s place", sub:false },
  { id:"e3", d:"03", mo:"Jul", name:"Dev’s bread club, take two", meta:"Wed 5pm · bring flour", sub:false },
];
const seedChat = [
  { who:"Mei", me:false, text:"who's bringing the speaker fri?" },
  { who:"Arjun", me:false, text:"i got it. also packing the board games" },
  { who:"You", me:true, text:"yesss bring catan, we owe Theo a rematch" },
];
const LOBBY = [
  { who:"Arjun", speaking:true }, { who:"Mei", speaking:false },
  { who:"Sana", speaking:false }, { who:"Theo", speaking:false },
];
function fmtLeft(ms){
  if(ms<=0) return { v:"now", l:"live" };
  const d=Math.floor(ms/86400000), h=Math.floor(ms%86400000/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000);
  if(d>0) return { v:`${d}d ${h}h`, l:"to go" };
  if(h>0) return { v:`${h}h ${m}m`, l:"to go" };
  return { v:`${m}m ${s}s`, l:"to go" };
}
function vibrate(pattern){ try{ navigator.vibrate?.(pattern); }catch{} }

/* ================================================================== */
export default function App(){
  const [stage, setStage] = useState("landing");
  const [cfg, setCfg] = useState({ name:"Moonbase", desc:"our corner of the internet — slow, private, ours", vibe:"aurora", canvas:"aurora" });
  const v = VIBES[cfg.vibe];
  return (
    <div className="l-root" style={{ "--accent":v.accent, "--on-accent":onAccent(v.accent) }}>
      <style>{STYLES}</style>
      <div className="ambient"><div className="stars"/><div className="blob a"/><div className="blob b"/><div className="blob c"/></div>
      <div className="layer">
        {stage==="landing"   && <Landing onStart={()=>setStage("signup")}/>}
        {stage==="signup"    && <Signup onBack={()=>setStage("landing")} onAuthed={()=>setStage("customize")}/>}
        {stage==="customize" && <Customize cfg={cfg} setCfg={setCfg} onBack={()=>setStage("signup")} onDeploy={()=>setStage("deploying")}/>}
        {stage==="deploying" && <Deploying cfg={cfg} onDone={()=>setStage("space")}/>}
        {stage==="space"     && <Space cfg={cfg}/>}
      </div>
    </div>
  );
}

/* -------- hero holographic memory -------- */
function HoloMemory(){
  return (
    <div className="holo">
      <div className="holo-frame">
        <VolBlock splat={SPLATS[0]} depth={16}/>
        <div className="holo-cap"><Avatar who="Mei" size={26}/><b style={{fontSize:12.5}}>Mei</b><span className="mono" style={{fontSize:10,color:"var(--dim)"}}>spatial · 14.2MB</span></div>
      </div>
      <div className="holo-reflect"/>
    </div>
  );
}

/* ---------------- landing ---------------- */
function Landing({ onStart }){
  const specs = [
    { ic:<ShieldCheck size={17}/>, h:"Post-quantum private", p:"Messages sealed with ML-KEM. The server caches, then forgets — zero metadata retained.", t:"ML-KEM-768 · E2E" },
    { ic:<Fingerprint size={17}/>, h:"Server computes blind", p:"Spam filters and search run on encrypted ciphertext. Admins can’t read a word.", t:"TFHE-rs · FHE" },
    { ic:<WifiOff size={17}/>, h:"Local-first, offline", p:"Everything lives on your device first and syncs peer-to-peer when you reconnect.", t:"SQLite-WASM · OPFS · CRDT" },
    { ic:<Layers size={17}/>, h:"Yours to run", p:"One binary, one server, one tenant. No company sits in the middle of your friendships.", t:"Self-hosted · zero-ads" },
    { ic:<ScanLine size={17}/>, h:"Leak-traceable memories", p:"Every spatial memory carries an invisible per-viewer fingerprint. If it ever leaks, the source is provable — without identifying anyone to the group.", t:"forensic watermarking" },
    { ic:<Wallet size={17}/>, h:"Anonymous billing", p:"Managed-instance payments route through tokenized processors. Not even we see which card funds which room.", t:"tokenized payment routing" },
    { ic:<Zap size={17}/>, h:"Zero-retention gating", p:"Identity checks run as one-shot proofs with nothing stored — no ID scans sitting in a database.", t:"zero-knowledge verification" },
  ];
  return (
    <div>
      <nav className="nav">
        <div className="brand"><span className="blogo"/> Lattice</div>
        <button className="navlink" onClick={onStart}>Sign in</button>
      </nav>
      <section className="hero">
        <div className="kick"><span className="kd"/> Dropped from 2040</div>
        <h1>Your memories<br/>aren’t <span className="g">flat</span> anymore.</h1>
        <p className="sub">A private, volumetric sanctuary for your people.<br/>No ads. No algorithm. No audience. No company in the middle.</p>
        <div className="ctas">
          <button className="cta1" onClick={onStart}>Start your Lattice <ArrowRight size={16}/></button>
          <button className="cta2" onClick={onStart}>See how it works</button>
        </div>
      </section>
      <div className="holo-stage"><div className="holo-glow"/><HoloMemory/></div>

      <div className="manif">
        <section className="mrow">
          <h2>Social media asked you to perform.<br/><em>Lattice asks you to </em><span className="g">belong.</span></h2>
          <p>Every network before this was built for an audience — likes to chase, strangers to impress, an algorithm to please. Lattice is built for the handful of people who already love each other. Post the moment. Nobody’s ranking it.</p>
        </section>
        <section className="mrow">
          <h2>Photos with <span className="g">depth.</span> Literally.</h2>
          <p>Upload one ordinary photo and Lattice reconstructs it as a volumetric memory — a 3D scene you can tilt, orbit, and step around, decoded on your own device. On a headset or holographic display it becomes a window you can walk up to. No cloud ever sees it.</p>
          <div className="demo3d"><VolBlock splat={SPLATS[1]} depth={18} caption="move your cursor — this has depth"/></div>
          <div className="demohint">// drag any 3D post inside Lattice to orbit it</div>
        </section>
        <section className="mrow">
          <h2>A feed that <span className="g">ends.</span></h2>
          <p>Newest to oldest, your people only, and then — done. No infinite scroll. When you hit the bottom, the feed physically resists you: to refresh you press and hold against a haptic wall, breaking the reflex to keep pulling. Friction, on purpose.</p>
        </section>
        <section className="mrow">
          <h2>Private by <span className="g">mathematics,</span><br/>not by policy.</h2>
          <p>Privacy here isn’t a promise in a settings page — it’s the architecture, some of it borrowed from industries that had to get this right under real pressure and simply couldn’t afford not to.</p>
          <div className="specrow">
            {specs.map(s=>(
              <div className="spec" key={s.h}><div className="si">{s.ic}</div><h5>{s.h}</h5><p>{s.p}</p><span className="tag">{s.t}</span></div>
            ))}
          </div>
        </section>
        <section className="mrow">
          <h2>Every room has a <span className="g">soul.</span></h2>
          <p>Name it. Write its manifesto. Dress it in the internet era your group actually lived in, and wrap it in a 360° canvas. Your Lattice should look like your people — not like everyone else’s app.</p>
          <div className="chipline">
            {Object.values(VIBES).map(vb=>(
              <span className="vchip" key={vb.label} style={{fontFamily:vb.nameFont}}><i style={{background:vb.accent, boxShadow:`0 0 10px ${vb.accent}`}}/>{vb.label}</span>
            ))}
          </div>
        </section>
      </div>

      <div className="pricing">
        <h2>Own it. Don’t rent it.</h2>
        <p className="psub">Nothing here is ad-supported, so nothing here is free-with-your-data. Two honest ways to run a Lattice.</p>
        <div className="prow">
          <div className="pcard hi">
            <div className="pk">Pay once</div><div className="pn">Own it forever</div><div className="pv">$299 <span>one time</span></div>
            <ul>
              <li><Check size={15}/> The full compiled app — one script deploys it to your server</li>
              <li><Check size={15}/> Unlimited members and workspaces, free security updates</li>
              <li><Check size={15}/> Your data never touches our machines</li>
            </ul>
          </div>
          <div className="pcard">
            <div className="pk">Managed</div><div className="pn">Private instance</div><div className="pv">$12 <span>/ month flat</span></div>
            <ul>
              <li><Check size={15}/> Zero setup — your single-tenant instance, hosted for you</li>
              <li><Check size={15}/> Priced by storage, never by people</li>
              <li><Check size={15}/> Export everything and self-host anytime</li>
            </ul>
          </div>
        </div>
        <div className="golden">No per-user pricing, ever. Inviting a friend should never cost money.</div>
      </div>

      <footer className="foot">LATTICE · a private, volumetric social sanctuary · local-first · zero-telemetry · built for the cozy web</footer>
    </div>
  );
}

/* ---------------- signup ---------------- */
function Signup({ onBack, onAuthed }){
  const [loading, setLoading] = useState(false);
  return (
    <div className="flow"><div className="fcard">
      <button className="back" onClick={onBack}><ChevronLeft size={15}/> Back</button>
      <div className="fstep">Step 1 / 3</div>
      <h1 className="ftitle">Sign in to start your Lattice</h1>
      <p className="fmuted">Google’s OpenID Connect confirms it’s you — scopes limited to identity and email. No passwords stored, no phone number, and your key pair is generated on your device.</p>
      <button className="gbtn" onClick={()=>{ setLoading(true); setTimeout(onAuthed,900); }} disabled={loading}>
        <GoogleMark/> {loading ? "Connecting…" : "Continue with Google"}
      </button>
      <div className="fnote"><Lock size={15} style={{flex:"none",marginTop:1}}/>
        <span>OAuth only — Lattice receives a verified email, never your credentials. From there, everything is post-quantum encrypted and local-first.</span></div>
    </div></div>
  );
}

/* ---------------- customize ---------------- */
function Customize({ cfg, setCfg, onBack, onDeploy }){
  const v = VIBES[cfg.vibe];
  const canvas = VIBES[cfg.canvas];
  const set = (k,val)=> setCfg(c=>({ ...c, [k]:val }));
  const CANVASES = [{ id:null, label:"None" }, ...Object.entries(VIBES).slice(0,5).map(([id])=>({ id, label:VIBES[id].label }))];
  return (
    <div className="flow"><div className="fcard">
      <button className="back" onClick={onBack}><ChevronLeft size={15}/> Back</button>
      <div className="fstep">Step 2 / 3</div>
      <h1 className="ftitle">Make it yours</h1>
      <p className="fmuted">Name your room, write its manifesto, choose its era and canvas. All editable later.</p>
      <div className="field">
        <label className="flabel"><span>Room name</span><span className="cnt">{cfg.name.length}/64</span></label>
        <input className="finput" value={cfg.name} maxLength={64} onChange={e=>set("name", e.target.value || " ")} placeholder="e.g. Moonbase"/>
      </div>
      <div className="field">
        <label className="flabel"><span>Manifesto · optional</span><span className="cnt">{cfg.desc.length}/256</span></label>
        <textarea className="finput" value={cfg.desc} maxLength={256} onChange={e=>set("desc", e.target.value)} placeholder="what this room is for"/>
      </div>
      <div className="field">
        <label className="flabel"><span>Vibe · your room’s era</span></label>
        <div className="vgrid">
          {Object.entries(VIBES).map(([k,t])=>(
            <button key={k} className={"vopt"+(cfg.vibe===k?" on":"")} onClick={()=>set("vibe",k)} style={cfg.vibe===k?{ "--accent":t.accent }:undefined}>
              <div className="vsw" style={{ background:t.canvasCss+",#0c0e16" }}><i style={{ background:t.accent, color:t.accent }}/></div>
              <div className="vn">{t.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="flabel"><span>Background canvas · 360° panorama, optional</span></label>
        <div className="cgrid">
          {CANVASES.map(c=>(
            <button key={String(c.id)} className={"copt"+(cfg.canvas===c.id?" on":"")} style={c.id?{ background:VIBES[c.id].canvasCss+",#0c0e16" }:undefined} onClick={()=>set("canvas",c.id)}>
              {c.id && <span className="p360">360°</span>}
              <span style={{ color:c.id?"#fff":"var(--dim)" }}>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="flabel"><span>Preview</span></label>
        <div className="mini">
          <div className="mb" style={{ background:(canvas?.canvasCss? canvas.canvasCss+",#0c0e16" : v.canvasCss+",#0c0e16") }}/>
          <div className="mn">
            <div style={{ fontFamily:v.nameFont, fontSize:Math.min(v.nameSize+2,26), lineHeight:1.1, textShadow:`0 0 20px ${v.accent}` }}>{cfg.name}</div>
            <div style={{ fontSize:12, color:"var(--dim)", marginTop:5, lineHeight:1.4 }}>{cfg.desc || "no manifesto yet"}</div>
          </div>
        </div>
      </div>
      <button className="deploybtn" onClick={onDeploy}>Deploy my Lattice <ArrowRight size={16}/></button>
    </div></div>
  );
}

/* ---------------- deploying ---------------- */
function Deploying({ cfg, onDone }){
  const [done, setDone] = useState(false);
  const slug = cfg.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "room";
  useEffect(()=>{ const t1=setTimeout(()=>setDone(true),2300), t2=setTimeout(onDone,3800); return ()=>{clearTimeout(t1);clearTimeout(t2);}; },[]);
  const steps = ["postgres core · single-tenant","gotrue · google OIDC","storage · volumetric bucket","keypair · ML-KEM generated on device","caddy · TLS auto-provisioned"];
  return (
    <div className="flow"><div className="dscreen">
      {!done ? <>
        <div className="dorb"/>
        <h1 className="ftitle">Weaving {cfg.name}…</h1>
        <p className="fmuted">Provisioning your single-tenant stack.</p>
        <div className="dsteps">{steps.map((s,i)=>(<div className="dstep" key={i}><Check size={13}/> {s}</div>))}</div>
      </> : <>
        <div style={{width:60,height:60,borderRadius:"50%",background:AUR,display:"grid",placeItems:"center",margin:"0 auto 20px",boxShadow:"0 0 44px -6px rgba(108,108,245,.8)"}}><Check size={30} color="#06070C"/></div>
        <h1 className="ftitle">You’re live.</h1>
        <p className="fmuted">Your room is private, encrypted, and yours.</p>
        <div className="durl">{slug}.lattice.space</div>
      </>}
    </div></div>
  );
}

/* ---------------- THE APP ---------------- */
function Space({ cfg }){
  const v = VIBES[cfg.vibe];
  const canvas = cfg.canvas ? VIBES[cfg.canvas] : null;
  const [tab, setTab] = useState("home");        // home | lobby | chat | invite
  const [chan, setChan] = useState("feed");       // feed | board | events
  const [posts, setPosts] = useState(seedPosts);
  const [events, setEvents] = useState(seedEvents);
  const [stories, setStories] = useState(seedStories);
  const [moment, setMoment] = useState(null);
  const [orbit, setOrbit] = useState(null);
  const [compose, setCompose] = useState(false);
  const [privacy, setPrivacy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [curated, setCurated] = useState({});
  const [periph, setPeriph] = useState(false);
  const [whisper, setWhisper] = useState(null);

  useEffect(()=>{ const i=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(i); },[]);
  useEffect(()=>{ if(!moment) return; const t=setTimeout(()=>setMoment(null),7000); return ()=>clearTimeout(t); },[moment]);
  // ambient periphery — presence arrives calmly, no pings, no badges
  useEffect(()=>{
    const names=["Mei","Arjun","Sana","Theo","Dev"];
    const acts=["shared a memory","is in the lobby","added to their story","pinned an event"];
    let fade;
    const loop=()=>{
      const who=names[Math.floor(Math.random()*names.length)];
      setPeriph(true); setWhisper(`${who} ${acts[Math.floor(Math.random()*acts.length)]}`); vibrate(6);
      fade=setTimeout(()=>{ setPeriph(false); setTimeout(()=>setWhisper(null),1700); }, 5200);
    };
    const first=setTimeout(loop, 6500);
    const iv=setInterval(loop, 18000);
    return ()=>{ clearTimeout(first); clearTimeout(fade); clearInterval(iv); };
  },[]);

  const slug = cfg.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "room";
  const token = "a4f8c2e9b7d3f6e2k7Q2mZ4pXw9rT1uV";
  const accent = v.accent;
  const bandBg = (canvas?.canvasCss || v.canvasCss) + ",#0c0e16";
  const splatPosts = posts.filter(p=>p.type==="splat");

  function like(id){ setPosts(ps=>ps.map(p=>p.id===id?{...p,liked:!p.liked}:p)); }
  function vote(id, oi){ setPosts(ps=>ps.map(p=>{ if(p.id!==id||p.voted!=null) return p;
    const opts=p.opts.map((o,i)=>i===oi?{...o,v:o.v+1}:o); return {...p,opts,voted:oi}; })); vibrate(8); }
  function sendInvite(){ if(!email.trim()||!email.includes("@")) return; setSent(true); setEmail(""); setTimeout(()=>setSent(false),2200); }

  return (
    <div className="app">
      <PeripheryGlow active={periph}/>
      {whisper && <div className={"whisper"+(periph?" on":"")} aria-hidden="true">· {whisper} in {cfg.name} ·</div>}
      <div className="appcol">
        <DanglingString active={periph}/>
        <div className="topbar">
          <div className="roomname" style={{ fontFamily:v.nameFont, fontSize:v.nameSize, color:"var(--ink)" }}>{cfg.name}</div>
          <div className="status">
            <span className="synced"><span className="sd"/> LOCAL-FIRST</span>
            <button className="iconbtn" onClick={()=>setPrivacy(true)} aria-label="Privacy"><ShieldCheck size={19}/></button>
            <button className="iconbtn" onClick={()=>setTab("chat")} aria-label="Messages"><Send size={20}/></button>
          </div>
        </div>

        {tab==="home" && (
          <>
            <div className="roomband" style={{ background:bandBg }}>
              <div className="bmeta">
                <span className="bpill"><Users size={11}/> 6 members</span>
                <span className="bpill"><Lock size={11}/> invite-only</span>
                {canvas && <span className="bpill"><Box size={11}/> 360°</span>}
              </div>
            </div>
            <div className="channels">
              {[["feed",<Home size={14} key="h"/>,"Feed"],["board",<Grid3X3 size={14} key="g"/>,"Board"],["events",<CalendarClock size={14} key="c"/>,"Events"]].map(([k,ic,l])=>(
                <button key={k} className={"chpill"+(chan===k?" on":"")} onClick={()=>setChan(k)}>{ic}{l}</button>
              ))}
            </div>

            {chan==="feed" && (
              <>
                <div className="stories">
                  <button className="story you" onClick={()=>setMoment({ who:"You", css:bandBg, text:"add to your story" })}>
                    <div className="youplus"><div className="ring"><div className="rin"><Avatar who="You" size={54}/></div></div><span className="pb"><Plus size={12}/></span></div>
                    <span className="sn">Your story</span>
                  </button>
                  {stories.map(s=>(
                    <button key={s.id} className="story" onClick={()=>{ setMoment(s); setStories(st=>st.map(x=>x.id===s.id?{...x,seen:true}:x)); }}>
                      <div className={"ring"+(s.seen?" seen":"")}><div className="rin"><Avatar who={s.who} size={54}/></div></div>
                      <span className="sn">{s.who}</span>
                    </button>
                  ))}
                </div>
                <div className="feed">
                  {cfg.desc && <div className="welcome"><div className="wl">// {cfg.name}</div><div className="wq">{cfg.desc}</div></div>}
                  {posts.map(p=>{
                    const total = p.type==="poll" ? p.opts.reduce((a,o)=>a+o.v,0) : 0;
                    const left = p.type==="reminder" && p.target ? fmtLeft(p.target-now) : null;
                    return (
                      <div className="post" key={p.id}>
                        <div className="phead">
                          <Avatar who={p.author}/>
                          <div><div className="pa">{p.author}</div><div className="pt">{p.time}</div></div>
                          {p.circle && p.circle!=="Everyone" && <span className="circletag"><Lock size={9}/> {p.circle}</span>}
                        </div>
                        {p.type==="splat" && <VolBlock splat={p.splat} onExpand={()=>setOrbit(p)}/>}
                        {p.type==="reminder" && (
                          <div className="remcard">
                            <div className="cal" style={{ background:accent, color:onAccent(accent) }}><CalendarClock size={20}/></div>
                            <div><div className="rt">{p.rtitle}</div><div className="rw">{p.rwhen} · local alert</div></div>
                            {left && <div className="cdown"><div className="cv" style={{color:accent}}>{left.v}</div><div className="cl">{left.l}</div></div>}
                          </div>
                        )}
                        {p.type==="poll" && (
                          <div className="pollwrap"><div className="pollq">{p.q}</div>
                            {p.opts.map((o,i)=>{ const pct=total?Math.round(o.v/total*100):0; const voted=p.voted!=null;
                              return (<div key={i} className={"popt"+(voted?" voted":"")} onClick={()=>vote(p.id,i)}>
                                <div className="pfill" style={{ width:voted?pct+"%":0, background:accent }}/>
                                <div className="pl"><span>{o.t}{p.voted===i?" ✓":""}</span>{voted && <span className="pct">{pct}%</span>}</div></div>); })}
                            {p.voted!=null && <div className="pollmeta">{total} votes · ZK · one per member</div>}
                          </div>
                        )}
                        <div className="acts">
                          <button className={p.liked?"liked":""} onClick={()=>like(p.id)} aria-label="Love"><Heart size={22} fill={p.liked?"#ff5b7f":"none"}/></button>
                          <button aria-label="Comment"><MessageCircle size={22}/></button>
                          <span className="quiet">no counts</span>
                        </div>
                        {p.type==="splat" && p.caption && <div className="pbody"><b>{p.author}</b> {p.caption}{p.comments>0 && <div className="cmt">View all {p.comments} comments</div>}</div>}
                      </div>
                    );
                  })}
                  <CompletedState accent={accent}/>
                </div>
              </>
            )}

            {chan==="board" && (
              <div className="board">
                {splatPosts.map(p=>{
                  const on = curated[p.id];
                  return (
                    <button key={p.id} className="bcell" onClick={()=>setOrbit(p)}>
                      <div style={{position:"absolute",inset:0,background:p.splat.bg}}/>
                      <div style={{position:"absolute",inset:"18%",background:p.splat.mid}}/>
                      <span className={"up"+(on?" on":"")} onClick={e=>{ e.stopPropagation(); setCurated(c=>({...c,[p.id]:!on})); vibrate(6); }}><ArrowUp size={10}/>{on?"1":""}</span>
                      <span className="who">{p.author}</span>
                    </button>
                  );
                })}
                <div className="bnote">// pinned media board · anonymous ZK curation · decoupled from chat</div>
              </div>
            )}

            {chan==="events" && (
              <div className="events">
                <div className="evhead">Event ledger</div>
                <div className="evsub">Pinned above the noise. Subscribing schedules a local device alert — never a server push.</div>
                {events.map(e=>(
                  <div className="evcard" key={e.id}>
                    <div className="evdate"><div className="d">{e.d}</div><div className="mo">{e.mo}</div></div>
                    <div className="evbody"><div className="en">{e.name}</div><div className="em">{e.meta}</div></div>
                    <button className={"evsub-btn"+(e.sub?" on":"")} onClick={()=>{ setEvents(evs=>evs.map(x=>x.id===e.id?{...x,sub:!x.sub}:x)); vibrate(8); }}>
                      {e.sub ? <><Check size={13}/> Going</> : <><CalendarPlus size={13}/> Subscribe</>}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab==="lobby" && <Lobby accent={accent}/>}
        {tab==="chat" && (
          <div className="chat">
            <div className="chatscroll">
              <div className="cnote"><span className="ck">◆</span> post-quantum encrypted (ML-KEM) · the server can’t read this<br/>no typing dots · no read receipts · on purpose</div>
              <ChatBody accent={accent}/>
            </div>
          </div>
        )}
        {tab==="invite" && (
          <div className="inv">
            <div className="invh">Invite friends</div>
            <div className="invs">Invites go by link or email — phone numbers stay masked behind signed avatars. Tokens carry 192 bits of entropy; only their SHA-256 hash is stored.</div>
            <div className="kcard">
              <div className="klbl">your invite link</div>
              <div className="klink">{slug}.lattice.space/join?token=<span style={{color:accent}}>{token.slice(0,16)}…</span></div>
              <div className="kmeta">
                <span className="kpill"><KeyRound size={11}/> CSPRNG · 192-bit</span>
                <span className="kpill"><Clock size={11}/> 72h expiry</span>
                <span className="kpill"><Check size={11}/> single-use</span>
              </div>
              <div className="krow">
                <button className="kbtn" style={{ background:accent, color:onAccent(accent) }} onClick={()=>{ try{navigator.clipboard?.writeText(`https://${slug}.lattice.space/join?token=${token}`);}catch{} setCopied(true); setTimeout(()=>setCopied(false),1600); }}>
                  {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy link</>}
                </button>
                <button className="kghost" onClick={()=>setShowJoin(true)}><Eye size={14}/> Preview join</button>
              </div>
              <div className="emailrow">
                <input placeholder="or invite by email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") sendInvite(); }}/>
                <button className="kbtn" style={{ background:accent, color:onAccent(accent) }} onClick={sendInvite}>{sent ? <><Check size={14}/> Sent</> : <><Mail size={14}/> Invite</>}</button>
              </div>
              <div className="kstat"><b>3</b> joined · <b>3</b> seats left</div>
            </div>
            <div style={{marginTop:20}}>
              <div className="klbl" style={{marginBottom:2}}>people you’ve brought in</div>
              {[["Theo","brought 2 of their own"],["Sana","posts on Fridays"],["Dev","newest member"]].map(([n,w])=>(
                <div className="invrow" key={n}><Avatar who={n} size={38}/><div><div className="pa">{n}</div><div className="pt">{w}</div></div><span className="tagv" style={{ color:accent }}>via your link</span></div>
              ))}
            </div>
          </div>
        )}

        <div className="tabbar">
          <button className={"tabb"+(tab==="home"?" on":"")} onClick={()=>setTab("home")} aria-label="Home"><Home size={23}/></button>
          <button className={"tabb"+(tab==="lobby"?" on":"")} onClick={()=>setTab("lobby")} aria-label="Lobby"><Radio size={23}/></button>
          <button className="tabb plus" onClick={()=>setCompose(true)} aria-label="New post"><span className="pring"><Plus size={19}/></span></button>
          <button className={"tabb"+(tab==="chat"?" on":"")} onClick={()=>setTab("chat")} aria-label="Chat"><Send size={22}/></button>
          <button className={"tabb"+(tab==="invite"?" on":"")} onClick={()=>setTab("invite")} aria-label="Invite"><UserPlus size={23}/></button>
        </div>
      </div>

      {compose && <ComposerSheet accent={accent} onClose={()=>setCompose(false)}
        onPost={(p)=>{ setPosts(ps=>[{ ...p, id:"p"+Date.now(), author:"You", time:"now", liked:false, comments:0 }, ...ps]); setCompose(false); setTab("home"); setChan("feed"); vibrate(12); }}/>}
      {orbit && <OrbitViewer splat={orbit.splat} author={orbit.author} caption={orbit.caption} onClose={()=>setOrbit(null)}/>}
      {moment && <div className="scrim" onClick={()=>setMoment(null)}><StoryViewer moment={moment} onClose={()=>setMoment(null)}/></div>}
      {privacy && <PrivacyPanel onClose={()=>setPrivacy(false)}/>}
      {showJoin && <JoinPreview cfg={cfg} v={v} bandBg={bandBg} token={token} slug={slug} onClose={()=>setShowJoin(false)}/>}
    </div>
  );
}

/* ---- ambient periphery indicators (calm tech) ---- */
function PeripheryGlow({ active }){ return <div className={"periphery"+(active?" on":"")} aria-hidden="true"/>; }
function DanglingString({ active }){
  return <div className={"dangle"+(active?" sway":"")} aria-hidden="true"><span className="thread"/><span className="bead"/></div>;
}

/* ---- completed-state ritual (anti-reflexive) ---- */
function Breathe(){
  const [phase,setPhase]=useState("in");
  useEffect(()=>{ const id=setInterval(()=>setPhase(p=>p==="in"?"out":"in"),4000); return ()=>clearInterval(id); },[]);
  const s = phase==="in";
  return (
    <div className="breathe">
      <div className="bhalo" style={{ transform:`scale(${s?1.35:0.72})` }}/>
      <div className="borb" style={{ transform:`scale(${s?1.12:0.6})` }}/>
      <div className="bword">{s?"breathe in":"breathe out"}</div>
    </div>
  );
}
function Doodle({ accent }){
  const cvs=useRef(null); const drawing=useRef(false); const last=useRef(null);
  function P(e){ const r=cvs.current.getBoundingClientRect(); return { x:(e.clientX-r.left)*(cvs.current.width/r.width), y:(e.clientY-r.top)*(cvs.current.height/r.height) }; }
  function down(e){ drawing.current=true; last.current=P(e); e.currentTarget.setPointerCapture(e.pointerId); vibrate(4); }
  function move(e){ if(!drawing.current) return; const ctx=cvs.current.getContext("2d"); const p=P(e);
    ctx.strokeStyle=accent; ctx.lineWidth=3.5; ctx.lineCap="round"; ctx.lineJoin="round"; ctx.shadowBlur=8; ctx.shadowColor=accent;
    ctx.beginPath(); ctx.moveTo(last.current.x,last.current.y); ctx.lineTo(p.x,p.y); ctx.stroke(); last.current=p; }
  function up(){ drawing.current=false; }
  function clear(){ const ctx=cvs.current.getContext("2d"); ctx.clearRect(0,0,cvs.current.width,cvs.current.height); }
  return (
    <div className="doodle">
      <canvas ref={cvs} width={300} height={150} className="dcanvas"
        onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} onPointerCancel={up}/>
      <button className="dclear" onClick={clear}>clear</button>
    </div>
  );
}
function HoldRefresh({ accent }){
  const [pct,setPct]=useState(0); const [refreshed,setRefreshed]=useState(false);
  const raf=useRef(null); const holding=useRef(false);
  function start(e){ e.preventDefault(); holding.current=true; vibrate(10); const t0=performance.now();
    const tick=(t)=>{ if(!holding.current) return; const p=Math.min(100,(t-t0)/3000*100); setPct(p);
      if(p>=100){ holding.current=false; vibrate([18,40,18]); setRefreshed(true); setTimeout(()=>{setRefreshed(false); setPct(0);},1800); }
      else raf.current=requestAnimationFrame(tick); };
    raf.current=requestAnimationFrame(tick);
  }
  function end(){ holding.current=false; cancelAnimationFrame(raf.current); if(pct<100) setPct(0); }
  if(refreshed) return <div className="hapdone" style={{marginTop:18}}><Check size={15} style={{color:accent}}/> Refreshed. Still nothing new — go be present.</div>;
  return (
    <div className="happad" style={{marginTop:18}} onPointerDown={start} onPointerUp={end} onPointerLeave={end} onPointerCancel={end}>
      <div className="hfill" style={{ width:pct+"%" }}/>
      <span className="hlabel"><Move3d size={13}/> Hold 3s to refresh</span>
    </div>
  );
}
function CompletedState({ accent }){
  const [mode,setMode]=useState("breathe");
  const note = mode==="breathe" ? "in through the nose, out slow — a minute is plenty"
    : mode==="doodle" ? "draw nothing in particular. that’s the whole point."
    : "the feed won’t pull for you — you pull against it";
  return (
    <div className="completed">
      <div className="cdone">You’re all caught up</div>
      <div className="cdsub">The feed is complete — nothing more is waiting. A good place to stop and just be here.</div>
      <div className="seg">
        <button className={"segb"+(mode==="breathe"?" on":"")} onClick={()=>setMode("breathe")}><Wind size={13}/> Breathe</button>
        <button className={"segb"+(mode==="doodle"?" on":"")} onClick={()=>setMode("doodle")}><Pencil size={13}/> Doodle</button>
        <button className={"segb"+(mode==="refresh"?" on":"")} onClick={()=>setMode("refresh")}><Move3d size={13}/> Refresh</button>
      </div>
      {mode==="breathe" && <Breathe/>}
      {mode==="doodle" && <Doodle accent={accent}/>}
      {mode==="refresh" && <HoldRefresh accent={accent}/>}
      <div className="cmode-note">{note}</div>
    </div>
  );
}

/* ---- spatial lobby ---- */
function Lobby({ accent }){
  const [joined, setJoined] = useState(false);
  const [muted, setMuted] = useState(false);
  const members = joined ? [{ who:"You", speaking:!muted }, ...LOBBY] : LOBBY;
  const R = 108;
  return (
    <div className="lobby">
      <div className="evhead" style={{fontSize:20}}>General · voice</div>
      <div className="evsub" style={{maxWidth:"28em"}}>A zero-config spatial room. Voices are placed in 3D by ray-traced room acoustics, streamed peer-to-peer and decrypted on your device.</div>
      <div className="lobbystage">
        {[220,170,120].map((d,i)=>(<div key={i} className={"lring"+(joined&&i===0?" pulse":"")} style={{ width:d, height:d }}/>))}
        <div className="lmember" style={{ left:"50%", top:"50%" }}>
          <div className={joined&&!muted?"lspeak":""} style={{"--accent":accent}}><Avatar who="You" size={joined?52:44}/></div>
          <span className="lname">{joined?"You":"—"}</span>
        </div>
        {members.filter(m=>m.who!=="You").map((m,i)=>{
          const ang = (i/(LOBBY.length))*Math.PI*2 - Math.PI/2;
          return (
            <div className="lmember" key={m.who} style={{ left:`calc(50% + ${Math.cos(ang)*R}px)`, top:`calc(50% + ${Math.sin(ang)*R}px)` }}>
              <div className={m.speaking?"lspeak":""} style={{"--accent":accent}}><Avatar who={m.who} size={44}/></div>
              <span className="lname">{m.who}{m.speaking?" ·":""}</span>
            </div>
          );
        })}
      </div>
      <div className="lobbymeta">{joined? "// connected · P2P WebRTC · spatial audio on" : `${LOBBY.length} friends in the room`}</div>
      <div className="lobbyctl">
        {!joined ? (
          <button className="lctl join" onClick={()=>{ setJoined(true); vibrate(14); }}><Radio size={16}/> Join room</button>
        ) : (<>
          <button className={"lctl"+(muted?"":" on")} onClick={()=>setMuted(m=>!m)} aria-label="Mute">{muted?<MicOff size={19}/>:<Mic size={19}/>}</button>
          <button className="lctl leave" onClick={()=>{ setJoined(false); setMuted(false); }} aria-label="Leave"><X size={19}/></button>
        </>)}
      </div>
    </div>
  );
}

/* ---- privacy panel ---- */
function PrivacyPanel({ onClose }){
  const rows = [
    { ic:<ShieldCheck size={16}/>, n:"Post-quantum messaging", d:"Every DM and group message sealed against future quantum attacks.", t:"ML-KEM-768" },
    { ic:<Eye size={16}/>, n:"Server computes blind", d:"Search, spam filtering and routing run on ciphertext the host can’t read.", t:"TFHE-rs · FHE on WASM" },
    { ic:<WifiOff size={16}/>, n:"Local-first storage", d:"Your data lives on-device and syncs peer-to-peer, offline-resilient.", t:"SQLite-WASM · OPFS · Automerge CRDT" },
    { ic:<Fingerprint size={16}/>, n:"Zero metadata", d:"The relay keeps no record of who talked to whom, or when.", t:"host caches, then forgets" },
    { ic:<Users size={16}/>, n:"PII masked by default", d:"Circles share via ZK proofs; friends see signed avatars, not phone numbers.", t:"ZKP-consent circles" },
    { ic:<ScanLine size={16}/>, n:"Ghost watermarking", d:"Every spatial memory carries an invisible per-viewer fingerprint. A leak is traceable to its source — without exposing anyone to the group.", t:"forensic steganography · leak-attribution" },
    { ic:<Wallet size={16}/>, n:"Anonymous billing", d:"Managed-instance payments route through tokenized processors. Not even Lattice sees which card funds which room.", t:"tokenized routing · zero billing-ID retention" },
  ];
  return (
    <div className="ppanel" onClick={onClose}>
      <div className="pp" onClick={e=>e.stopPropagation()}>
        <div className="pphead"><div className="pptitle"><ShieldCheck size={19} style={{color:"#8fe6d8"}}/> This room’s privacy</div>
          <div className="ppsub">Not a policy — the architecture. Here’s what’s protecting your people right now.</div></div>
        {rows.map(r=>(
          <div className="pprow" key={r.n}><div className="pi">{r.ic}</div>
            <div><div className="pn">{r.n}</div><div className="pd">{r.d}</div><div className="pt mono">{r.t}</div></div>
            <Check size={16} className="pok"/></div>
        ))}
        <button className="ppclose" onClick={onClose}>Done</button>
      </div>
    </div>
  );
}

/* ---- depth-aware story ---- */
function StoryViewer({ moment, onClose }){
  const ref = useRef(null);
  const [t, setT] = useState({ x:0, y:0 });
  function move(e){ const r=ref.current?.getBoundingClientRect(); if(!r) return; setT({ x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5 }); }
  return (
    <div ref={ref} className="moment" onClick={e=>e.stopPropagation()} onPointerMove={move} onPointerLeave={()=>setT({x:0,y:0})}>
      <div className="mbg" style={{ background:moment.css }}/>
      <div className="msafe-t"/><div className="msafe-b"/>
      <div className="mbar"><i/></div>
      <div className="mh"><Avatar who={moment.who} size={28}/>{moment.who}<span style={{opacity:.75,fontWeight:500}} className="mono">7s</span></div>
      <button className="mclose" onClick={onClose}><X size={15}/></button>
      <div className="mcanvas" style={{ transform:`translate(${t.x*14}px,${t.y*14}px) translateZ(30px)` }}><div className="mt">{moment.text}</div></div>
    </div>
  );
}

/* ---- chat ---- */
function ChatBody({ accent }){
  const [msgs, setMsgs] = useState(seedChat);
  const [val, setVal] = useState("");
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({ block:"end" }); },[msgs]);
  function send(){ if(!val.trim()) return; const t=val.trim(); setVal(""); vibrate(6);
    setMsgs(m=>[...m,{ who:"You", me:true, text:t }]);
    setTimeout(()=> setMsgs(m=>[...m,{ who:"Mei", me:false, text:"omw" }]), 1100); }
  return (
    <>
      {msgs.map((m,i)=>(
        <div key={i} style={{display:"flex",flexDirection:"column"}}>
          {!m.me && (i===0 || msgs[i-1].who!==m.who) && <span className="bwho">{m.who}</span>}
          <div className={"bub "+(m.me?"me":"them")} style={m.me?{background:accent, color:onAccent(accent)}:undefined}>{m.text}</div>
        </div>
      ))}
      <div ref={endRef}/>
      <div className="chatbar" style={{position:"sticky",bottom:0,margin:"8px -14px 0",background:"var(--void)"}}>
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Message… (post-quantum sealed)" onKeyDown={e=>{ if(e.key==="Enter") send(); }}/>
        <button className="csend" style={{ background:accent, color:onAccent(accent) }} onClick={send}><Send size={17}/></button>
      </div>
    </>
  );
}

/* ---- composer with consent circles ---- */
function ComposerSheet({ accent, onClose, onPost }){
  const [type, setType] = useState("media");
  const [text, setText] = useState("");
  const [mediaIx, setMediaIx] = useState(0);
  const [spatial, setSpatial] = useState(true);
  const [circle, setCircle] = useState("Everyone");
  const [q, setQ] = useState(""); const [opts, setOpts] = useState(["",""]);
  const [rt, setRt] = useState(""); const [rw, setRw] = useState("");
  const on = { background:accent, borderColor:accent, color:onAccent(accent) };
  const ready = type==="media" ? text.trim().length>0 : type==="poll" ? (q.trim() && opts.filter(o=>o.trim()).length>=2) : rt.trim().length>0;
  function submit(){
    if(!ready) return;
    if(type==="media") onPost({ type:"splat", splat:SPLATS[mediaIx], caption:text.trim(), circle });
    if(type==="poll") onPost({ type:"poll", q:q.trim(), opts:opts.filter(o=>o.trim()).slice(0,2).map(t=>({t:t.trim(),v:0})), voted:null, circle });
    if(type==="reminder") onPost({ type:"reminder", rtitle:rt.trim(), rwhen:rw.trim()||"soon", target:Date.now()+86400000, circle });
  }
  return (
    <div className="sheetwrap" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="grab"/>
        <div className="sh"><span className="st">New post</span><button onClick={onClose}><X size={19}/></button></div>
        <div className="ctabs">
          {[["media",<ImageIcon size={14} key="i"/>,"Media"],["poll",<BarChart2 size={14} key="p"/>,"Poll"],["reminder",<CalendarClock size={14} key="r"/>,"Event"]].map(([k,ic,l])=>(
            <button key={k} className="ctab" style={type===k?on:undefined} onClick={()=>setType(k)}>{ic}{l}</button>
          ))}
        </div>
        {type==="media" && <>
          <textarea className="ci" rows={2} placeholder="Write a caption…" value={text} onChange={e=>setText(e.target.value)}/>
          <div className="mediapick">{SPLATS.map((s,i)=>(<button key={i} className={"mp"+(mediaIx===i?" on":"")} style={{background:s.bg}} onClick={()=>setMediaIx(i)}/>))}</div>
          <div className="optrow"><div><div className="sl"><Box size={14}/> Make it spatial</div><div className="ss">reconstructs your photo as a 3D memory · ~15MB · on-device</div></div>
            <button className={"swtch"+(spatial?" on":"")} style={spatial?{background:accent}:undefined} onClick={()=>setSpatial(s=>!s)} aria-label="Spatial"><i/></button></div>
        </>}
        {type==="poll" && <>
          <input className="ci" placeholder="Ask the group something…" value={q} onChange={e=>setQ(e.target.value)}/>
          {opts.map((o,i)=>(<input key={i} className="ci" placeholder={`Option ${i+1}`} value={o} onChange={e=>setOpts(os=>os.map((x,j)=>j===i?e.target.value:x))}/>))}
        </>}
        {type==="reminder" && <>
          <input className="ci" placeholder="What’s happening?" value={rt} onChange={e=>setRt(e.target.value)}/>
          <input className="ci" placeholder="When? e.g. Fri 6pm" value={rw} onChange={e=>setRw(e.target.value)}/>
        </>}
        <div style={{marginTop:14}}>
          <div className="shnote" style={{marginBottom:2}}>SHARE WITH · zk-consent circle</div>
          <div className="circlepick">
            {["Everyone","Close Friends","Family"].map(c=>(
              <button key={c} className={"crc"+(circle===c?" on":"")} onClick={()=>setCircle(c)}>{circle===c?<Check size={12}/>:<Lock size={11}/>}{c}</button>
            ))}
          </div>
        </div>
        <div className="shfoot">
          <span className="shnote">stays inside your room</span>
          <button className="postbtn" style={{ background:accent, color:onAccent(accent) }} onClick={submit} disabled={!ready}><Send size={14}/> Share</button>
        </div>
      </div>
    </div>
  );
}

/* ---- join preview ---- */
function JoinPreview({ cfg, v, bandBg, token, slug, onClose }){
  const [step, setStep] = useState(0);
  useEffect(()=>{ const ts=[setTimeout(()=>setStep(1),450),setTimeout(()=>setStep(2),950),setTimeout(()=>setStep(3),1450),setTimeout(()=>setStep(4),1950)]; return ()=>ts.forEach(clearTimeout); },[]);
  const checks = [
    { l:"Authenticity — hash matches an active record" },
    { l:"Integrity — token structure untampered" },
    { l:"Timeliness — inside the 72h window" },
    { l:"State — invite unused (single-use)" },
  ];
  return (
    <div className="scrim" onClick={onClose}>
      <div className="joincard" onClick={e=>e.stopPropagation()}>
        <div className="join-top" style={{ background:bandBg }}><button className="join-close" onClick={onClose}><X size={14}/></button></div>
        <div className="join-body">
          <div className="join-name" style={{ fontFamily:v.nameFont }}>You’re invited to {cfg.name}</div>
          <div className="join-from">{slug}.lattice.space/join?token={token.slice(0,10)}…</div>
          <div className="checks">{checks.map((c,i)=>(<div key={i} className={"chk"+(step>i?" ok":"")}><span className="cbox">{step>i ? <Check size={13}/> : <Clock size={12}/>}</span>{c.l}</div>))}</div>
          <button className="join-cta" disabled={step<4}><GoogleMark/> {step<4 ? "Verifying invite…" : "Continue with Google to join"}</button>
        </div>
      </div>
    </div>
  );
}
