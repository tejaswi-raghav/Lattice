import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import {
  Lock, Check, Image as ImageIcon, BarChart2, CalendarClock, Send, Copy,
  Heart, MessageCircle, Plus, X, Home, UserPlus, ChevronLeft, KeyRound,
  Clock, Eye, EyeOff, Grid3X3, Mail, Users, ArrowRight, Box, Maximize2,
  Move3d, Search, ShieldCheck, Database, GitMerge, Radio, Cpu
} from "lucide-react";

/* ================================================================== *
 *  LATTICE — social, dropped from 2040.                               *
 *  Void-glass UI on the flat-first 2019 hierarchy the spec mandates.  *
 *  Real features from the spec, made tangible:                        *
 *   · FHE chat (TFHE-rs): ciphertext-only server + "server view"      *
 *   · Local-first core: OPFS SQLite + Automerge CRDT status HUD       *
 *   · Client-side search (local FTS — zero network)                   *
 *   · Volumetric splat posts: inline parallax → orbit viewer → WebXR  *
 *   · Depth-aware stories, 360° canvas, token invites (CSPRNG/72h)    *
 *   · Haptic micro-feedback via navigator.vibrate                     *
 * ================================================================== */

const SYS = `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif`;
const MONO = `ui-monospace, 'SF Mono', SFMono-Regular, Menlo, monospace`;
const HOLO = `linear-gradient(115deg,#6ee7ff,#8b7bff 45%,#ff6ad5 90%)`;
const HOLO_RING = `conic-gradient(from 210deg,#6ee7ff,#8b7bff,#ff6ad5,#6ee7ff)`;

const buzz = (ms=8)=>{ try{ navigator.vibrate?.(ms); }catch{} };

function onAccent(hex){
  const c = hex.replace("#",""); const r=parseInt(c.slice(0,2),16), g=parseInt(c.slice(2,4),16), b=parseInt(c.slice(4,6),16);
  return (0.299*r+0.587*g+0.114*b) > 150 ? "#0a0a0c" : "#ffffff";
}
/* pseudo-ciphertext for the FHE demos (b = As + e, visually) */
function cipher(str){
  let out = "";
  for(let i=0;i<str.length;i++){
    const v = (str.charCodeAt(i) * 2654435761 + i*97) >>> 0;
    out += v.toString(16).slice(0,4);
  }
  out += "9f2e1c4b8a3d5e70".slice(0, Math.max(0, 24-out.length));
  return out.replace(/(.{4})/g,"$1 ").trim();
}

/* 7 aesthetic presets (spec table) + Hologram default */
const VIBES = {
  holo:     { label:"Hologram",      accent:"#8b7bff", banner:HOLO, nameFont:SYS, nameWeight:800, nameSize:21 },
  grunge:   { label:"Soft Grunge",   accent:"#a83b3b", banner:"linear-gradient(120deg,#1c1b1a,#3d2f2b)", nameFont:"'Courier New', monospace", nameWeight:700, nameSize:19 },
  girly:    { label:"2014 Girly",    accent:"#82c3a6", banner:"linear-gradient(120deg,#ffb6c9,#ffd1dc)", nameFont:"Georgia, serif", nameWeight:700, nameSize:20 },
  sleaze:   { label:"Indie Sleaze",  accent:"#f5a623", banner:"linear-gradient(120deg,#22252a,#4a4436)", nameFont:"'Arial Black', Impact, sans-serif", nameWeight:900, nameSize:18 },
  academia: { label:"Dark Academia", accent:"#cca43b", banner:"linear-gradient(120deg,#2b251f,#54432c)", nameFont:"'EB Garamond', Garamond, serif", nameWeight:600, nameSize:22 },
  cottage:  { label:"Cottagecore",   accent:"#a4906a", banner:"linear-gradient(120deg,#4a4636,#7a7355)", nameFont:"'Libre Baskerville', serif", nameWeight:700, nameSize:19 },
  vapor:    { label:"Vaporwave",     accent:"#ff2d8e", banner:"linear-gradient(120deg,#0c0c1e,#5a2b7a 60%,#ff2d8e)", nameFont:"'Helvetica Neue', sans-serif", nameWeight:700, nameSize:20 },
};
const CANVASES = [
  { id:"none",   label:"None",   css:null },
  { id:"nebula", label:"Nebula", css:"linear-gradient(120deg,#0b1030,#3a1a5e 50%,#8b7bff)" },
  { id:"aurora", label:"Aurora", css:"linear-gradient(120deg,#031c1e,#0e4d46 45%,#6ee7ff)" },
  { id:"ember",  label:"Ember",  css:"linear-gradient(120deg,#1c0b10,#7a2b3a 55%,#ff6a6a)" },
  { id:"ion",    label:"Ion",    css:"linear-gradient(120deg,#0c0c1e,#4a2b7a 55%,#ff6ad5)" },
  { id:"jade",   label:"Jade",   css:"linear-gradient(120deg,#04140e,#1c5e46 55%,#7fffc7)" },
];
const SPLATS = [
  { bg:"linear-gradient(160deg,#3d1b2e,#c94f6d)", mid:"radial-gradient(closest-side,#ffb88c,#e8707caa 70%,transparent)", fg:"radial-gradient(closest-side,#fff0e0,#ffb88c99 60%,transparent)" },
  { bg:"linear-gradient(160deg,#0e2a4a,#3b8ac9)", mid:"radial-gradient(closest-side,#a8e0ff,#5fa8d6aa 70%,transparent)", fg:"radial-gradient(closest-side,#ffffff,#bfe8ff99 60%,transparent)" },
  { bg:"linear-gradient(160deg,#0e3324,#2e8a5e)", mid:"radial-gradient(closest-side,#b8f0c2,#6fbf8caa 70%,transparent)", fg:"radial-gradient(closest-side,#eafff0,#a8e8b099 60%,transparent)" },
  { bg:"linear-gradient(160deg,#2a1a4a,#7a5ac9)", mid:"radial-gradient(closest-side,#d8c8ff,#a98fd9aa 70%,transparent)", fg:"radial-gradient(closest-side,#ffffff,#e2ccff99 60%,transparent)" },
];
const PAL = { You:"#8b7bff", Arjun:"#4fae8c", Mei:"#e0608a", Sana:"#5fa8d6", Theo:"#a98fd9", Dev:"#e8a05c" };

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&family=Libre+Baskerville:wght@400;700&display=swap');
*{box-sizing:border-box; margin:0;}
:root{ --void:#060608; --glass:rgba(255,255,255,.05); --glass2:rgba(255,255,255,.08); --hair:rgba(255,255,255,.09);
  --hair2:rgba(255,255,255,.14); --ink:#f2f2f7; --dim:#9a9aa6; --dim2:#6a6a76; --ok:#62f4b3; }
.t-root{ font-family:${SYS}; -webkit-font-smoothing:antialiased; color:var(--ink); background:var(--void); }
button{ font-family:inherit; }
.mono{ font-family:${MONO}; }
.av{ border-radius:50%; display:grid;place-items:center; font-weight:600; flex:none; user-select:none; }
.glass{ background:var(--glass); border:1px solid var(--hair); backdrop-filter:blur(22px) saturate(1.5); }
.holotext{ background:${HOLO}; -webkit-background-clip:text; background-clip:text; color:transparent; }

/* ============ LANDING ============ */
.land{ background:
  radial-gradient(900px 540px at 50% -220px, rgba(139,123,255,.16), transparent 60%),
  radial-gradient(700px 420px at 85% 10%, rgba(110,231,255,.07), transparent 55%),
  var(--void); min-height:100vh; }
.nav{ max-width:1080px; margin:0 auto; display:flex; align-items:center; justify-content:space-between; padding:22px 28px; }
.brand{ font-size:18px; font-weight:700; letter-spacing:-.02em; display:flex; align-items:center; gap:10px; color:var(--ink); }
.brand .bmark{ width:24px;height:24px; border-radius:8px; background:${HOLO_RING}; display:grid; place-items:center; transform:rotate(45deg); }
.brand .bmark i{ width:9px;height:9px;border-radius:3px;background:var(--void); }
.navlink{ font-size:13px; color:var(--dim); background:none; border:none; cursor:pointer; }
.hero{ max-width:1080px; margin:0 auto; padding:66px 28px 0; text-align:center; }
.kicker{ font-family:${MONO}; font-size:11.5px; font-weight:600; color:var(--dim); letter-spacing:.22em; text-transform:uppercase; }
.hero h1{ font-size:clamp(44px,7.6vw,86px); font-weight:800; letter-spacing:-.04em; line-height:1.02; margin-top:18px; color:var(--ink); }
.hero .sub{ font-size:clamp(16.5px,2.3vw,21px); color:var(--dim); font-weight:450; margin-top:20px; letter-spacing:-.01em; line-height:1.5; }
.ctas{ display:flex; gap:14px; justify-content:center; margin-top:32px; }
.cta-w{ background:var(--ink); color:#0a0a0c; border:none; border-radius:999px; padding:14px 26px; font-size:15px; font-weight:600; cursor:pointer; display:inline-flex; align-items:center; gap:8px; }
.cta-w:hover{ background:#fff; }
.cta-g{ background:none; color:#8fb8ff; border:none; font-size:15px; font-weight:500; cursor:pointer; padding:14px 8px; }
.specline{ display:flex; gap:9px; justify-content:center; flex-wrap:wrap; margin-top:30px; }
.spec{ font-family:${MONO}; font-size:11px; letter-spacing:.06em; color:var(--dim); border:1px solid var(--hair); border-radius:999px; padding:6px 12px; background:var(--glass); }
.stage{ position:relative; display:flex; justify-content:center; padding:58px 0 90px; }
.halo{ position:absolute; top:30px; width:460px; height:460px; border-radius:50%; background:${HOLO_RING}; filter:blur(90px); opacity:.22; }
.slab{ position:relative; width:302px; border-radius:40px; padding:8px; background:rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.14); backdrop-filter:blur(10px);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.18), 0 60px 120px -40px rgba(0,0,0,.95); }
.slab:before{ content:""; position:absolute; inset:-1px; border-radius:41px; padding:1px; background:${HOLO};
  -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude; opacity:.5; pointer-events:none; }
.screen{ border-radius:33px; overflow:hidden; background:#0a0a0e; text-align:left; }

.mrow{ max-width:840px; margin:0 auto; padding:108px 28px; text-align:center; border-bottom:1px solid rgba(255,255,255,.06); }
.mrow:last-child{ border-bottom:none; }
.mrow h2{ font-size:clamp(32px,5.2vw,54px); font-weight:800; letter-spacing:-.035em; line-height:1.06; color:var(--ink); }
.mrow h2 em{ font-style:normal; color:var(--dim2); }
.mrow p{ font-size:16.5px; color:var(--dim); max-width:35em; margin:18px auto 0; line-height:1.6; font-weight:450; }
.chipline{ display:flex; gap:10px; justify-content:center; flex-wrap:wrap; margin-top:26px; }
.vchip{ display:inline-flex; align-items:center; gap:8px; border:1px solid var(--hair); border-radius:999px; padding:9px 16px; font-size:13.5px; font-weight:600; background:var(--glass); color:var(--ink); }
.vchip i{ width:10px;height:10px;border-radius:50%; display:inline-block; }
.demo3d{ margin:36px auto 0; width:min(320px,84vw); border-radius:22px; overflow:hidden; border:1px solid var(--hair2); }
.demohint{ font-family:${MONO}; font-size:11px; letter-spacing:.08em; color:var(--dim2); margin-top:14px; text-transform:uppercase; }

/* FHE live demo */
.fhedemo{ margin:34px auto 0; max-width:460px; text-align:left; border-radius:20px; padding:18px; }
.fhedemo .fl{ font-family:${MONO}; font-size:10.5px; letter-spacing:.12em; text-transform:uppercase; color:var(--dim); margin-bottom:8px; display:flex; align-items:center; gap:7px; }
.fhedemo input{ width:100%; background:rgba(255,255,255,.04); border:1px solid var(--hair); border-radius:12px; padding:12px 14px; color:var(--ink); font-family:inherit; font-size:14.5px; outline:none; }
.fhedemo input:focus{ border-color:rgba(139,123,255,.5); }
.cipherout{ margin-top:12px; font-family:${MONO}; font-size:12px; line-height:1.7; color:#8fd8ff; word-break:break-all; background:rgba(110,231,255,.05); border:1px dashed rgba(110,231,255,.25); border-radius:12px; padding:12px 14px; min-height:64px; }
.fhedemo .fc{ font-size:12px; color:var(--dim2); margin-top:10px; line-height:1.5; }

.pricing{ padding:96px 28px 104px; border-top:1px solid rgba(255,255,255,.06); }
.pin{ max-width:840px; margin:0 auto; text-align:center; }
.pin h2{ font-size:clamp(30px,4.8vw,48px); font-weight:800; letter-spacing:-.035em; color:var(--ink); }
.psub{ font-size:16px; color:var(--dim); margin-top:14px; }
.prow{ display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:44px; text-align:left; }
@media(max-width:700px){ .prow{ grid-template-columns:1fr; } }
.pcard{ border-radius:24px; padding:28px; }
.pcard .pk{ font-family:${MONO}; font-size:10.5px; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--dim); }
.pcard .pn{ font-size:22px; font-weight:800; letter-spacing:-.02em; margin-top:8px; color:var(--ink); }
.pcard .pv{ font-size:38px; font-weight:800; letter-spacing:-.03em; margin-top:14px; color:var(--ink); }
.pcard .pv span{ font-size:14.5px; font-weight:500; color:var(--dim); letter-spacing:0; }
.pcard ul{ list-style:none; padding:0; margin:18px 0 0; }
.pcard li{ font-size:14px; color:var(--dim); line-height:1.55; padding:5px 0; display:flex; gap:9px; }
.pcard li svg{ flex:none; margin-top:3px; color:var(--ok); }
.golden{ margin-top:26px; font-size:13.5px; font-weight:600; color:var(--ink); }
.foot{ border-top:1px solid rgba(255,255,255,.06); padding:28px; text-align:center; font-size:12px; color:var(--dim2); line-height:1.8; font-family:${MONO}; letter-spacing:.03em; }

/* ============ FLOW ============ */
.flow{ background:radial-gradient(700px 420px at 50% -180px, rgba(139,123,255,.12), transparent 60%), var(--void);
  min-height:100vh; display:flex; justify-content:center; padding:46px 22px 80px; }
.fcard{ width:100%; max-width:420px; }
.back{ display:inline-flex; align-items:center; gap:5px; background:none;border:none; cursor:pointer; color:var(--dim); font-size:13px; margin-bottom:22px; }
.fstep{ font-family:${MONO}; font-size:10.5px; font-weight:600; letter-spacing:.2em; text-transform:uppercase; color:var(--dim2); }
.ftitle{ font-size:27px; font-weight:800; letter-spacing:-.03em; margin:10px 0 8px; color:var(--ink); }
.fmuted{ color:var(--dim); font-size:14px; line-height:1.55; }
.gbtn{ width:100%; display:flex; align-items:center; justify-content:center; gap:10px; cursor:pointer; border-radius:14px; padding:14px; font-weight:600; font-size:14.5px; margin-top:26px; color:var(--ink); background:var(--glass2); border:1px solid var(--hair2); }
.gbtn:hover{ background:rgba(255,255,255,.12); }
.gicon{ width:18px;height:18px; }
.fnote{ display:flex; gap:9px; align-items:flex-start; margin-top:16px; padding:13px 14px; border-radius:14px; font-size:12px; color:var(--dim); line-height:1.55; }
.field{ margin-top:22px; }
.flabel{ font-size:12.5px; font-weight:600; color:var(--dim); margin-bottom:8px; display:flex; justify-content:space-between; }
.flabel .cnt{ font-family:${MONO}; color:var(--dim2); font-weight:500; font-size:10.5px; }
.finput{ width:100%; border:1px solid var(--hair); border-radius:13px; padding:12px 14px; font-size:15px; font-family:inherit; color:var(--ink); background:rgba(255,255,255,.04); outline:none; }
.finput:focus{ border-color:rgba(139,123,255,.5); }
textarea.finput{ resize:none; min-height:60px; }
.vgrid{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; }
@media(max-width:400px){ .vgrid{ grid-template-columns:repeat(3,1fr); } }
.vopt{ cursor:pointer; border:1px solid var(--hair); border-radius:13px; overflow:hidden; background:var(--glass); text-align:center; padding:0; }
.vopt.on{ border-color:rgba(255,255,255,.55); }
.vopt .vsw{ height:36px; }
.vopt .vn{ font-size:10px; font-weight:600; padding:6px 3px 7px; color:var(--dim); }
.vopt.on .vn{ color:var(--ink); }
.cgrid{ display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
.copt{ cursor:pointer; border:1px solid var(--hair); border-radius:13px; overflow:hidden; height:52px; position:relative; background:var(--glass); padding:0; }
.copt.on{ border-color:rgba(255,255,255,.55); }
.copt span{ position:absolute; left:8px; bottom:6px; font-size:10.5px; font-weight:600; color:#fff; text-shadow:0 1px 4px rgba(0,0,0,.6); }
.copt.none span{ color:var(--dim2); text-shadow:none; }
.copt .pano{ position:absolute; top:6px; right:7px; font-family:${MONO}; font-size:8.5px; font-weight:600; color:#fff; background:rgba(0,0,0,.4); padding:2px 6px; border-radius:999px; letter-spacing:.06em; }
.mini{ border-radius:18px; overflow:hidden; margin-top:8px; }
.mini .mb{ height:72px; }
.mini .mn{ padding:12px 14px 14px; }
.deploybtn{ width:100%; margin-top:26px; background:var(--ink); color:#0a0a0c; border:none; border-radius:999px; padding:15px; font-weight:700; font-size:14.5px; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:8px; }
.dscreen{ text-align:center; max-width:420px; margin-top:7vh; }
.spin{ width:50px;height:50px;border-radius:50%; border:3px solid rgba(255,255,255,.12); border-top-color:#8b7bff; margin:0 auto 22px; animation:spin .9s linear infinite; }
@keyframes spin{to{transform:rotate(360deg)}}
.durl{ font-family:${MONO}; font-weight:600; font-size:16px; margin-top:12px; }
.dsteps{ margin-top:20px; text-align:left; border-radius:18px; padding:14px 16px; }
.dstep{ display:flex; gap:10px; align-items:center; font-family:${MONO}; font-size:11.5px; color:var(--dim); padding:6px 0; letter-spacing:.02em; }
.dstep svg{ color:var(--ok); flex:none; }

/* ============ APP ============ */
.app{ background:var(--void); min-height:100vh; display:flex; justify-content:center; }
.appcol{ width:100%; max-width:500px; min-height:100vh; display:flex; flex-direction:column;
  border-left:1px solid rgba(255,255,255,.07); border-right:1px solid rgba(255,255,255,.07); }
@media(max-width:520px){ .appcol{ border:none; } }
.topbar{ position:sticky; top:0; z-index:30; background:rgba(6,6,8,.8); backdrop-filter:blur(20px) saturate(1.4);
  border-bottom:1px solid var(--hair); padding:0 16px; height:56px; display:flex; align-items:center; justify-content:space-between; }
.roomname{ line-height:1.05; letter-spacing:-.02em; color:var(--ink); }
.topicons{ display:flex; gap:14px; color:var(--ink); align-items:center; }
.topicons button{ background:none; border:none; cursor:pointer; color:var(--ink); padding:0; display:grid; place-items:center; }
.syncpill{ display:inline-flex; align-items:center; gap:6px; font-family:${MONO}; font-size:9.5px; letter-spacing:.1em; color:var(--dim);
  border:1px solid var(--hair); border-radius:999px; padding:4px 9px; background:var(--glass); cursor:pointer; text-transform:uppercase; }
.syncpill .dot{ width:6px;height:6px;border-radius:50%; background:var(--ok); box-shadow:0 0 8px rgba(98,244,179,.8); }
.roomband{ height:76px; position:relative; background-size:cover; }
.roomband:after{ content:""; position:absolute; inset:0; background:linear-gradient(180deg,transparent 30%,rgba(6,6,8,.7)); }
.roomband .bmeta{ position:absolute; left:16px; bottom:10px; display:flex; gap:7px; z-index:2; }
.bpill{ font-family:${MONO}; font-size:9.5px; font-weight:500; letter-spacing:.06em; color:#fff; background:rgba(0,0,0,.4); backdrop-filter:blur(8px); padding:4px 9px; border-radius:999px; display:inline-flex; gap:5px; align-items:center; text-transform:uppercase; }
.stories{ display:flex; gap:16px; padding:14px 16px 12px; overflow-x:auto; scrollbar-width:none; border-bottom:1px solid var(--hair); }
.stories::-webkit-scrollbar{display:none;}
.story{ display:flex; flex-direction:column; align-items:center; gap:6px; cursor:pointer; background:none; border:none; padding:0; }
.ring{ width:62px;height:62px; border-radius:50%; padding:2px; background:${HOLO_RING}; }
.ring.seen{ background:rgba(255,255,255,.16); }
.ring .rin{ width:100%; height:100%; border-radius:50%; background:var(--void); padding:2.5px; }
.sn{ font-size:10.5px; color:var(--dim); max-width:62px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.story.you .ring{ background:rgba(255,255,255,.16); }
.youplus{ position:relative; }
.youplus .pb{ position:absolute; right:-1px; bottom:-1px; width:20px;height:20px; border-radius:50%; background:${HOLO}; border:2.5px solid var(--void); display:grid; place-items:center; color:#0a0a0c; }
.vtog{ display:flex; border-bottom:1px solid var(--hair); }
.vtb{ flex:1; display:flex; justify-content:center; padding:12px 0 11px; background:none; border:none; cursor:pointer; color:var(--dim2); border-bottom:1.5px solid transparent; margin-bottom:-1px; }
.vtb.on{ color:var(--ink); border-bottom-color:var(--ink); }
.feed{ padding:14px 12px 100px; display:flex; flex-direction:column; gap:14px; }
.welcome{ border-radius:18px; padding:14px 16px; }
.welcome .wl{ font-family:${MONO}; font-size:9.5px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--dim2); }
.welcome .wq{ font-size:14.5px; color:var(--ink); line-height:1.5; margin-top:5px; }
.post{ border-radius:20px; overflow:hidden; }
.phead{ display:flex; align-items:center; gap:10px; padding:12px 14px; }
.pa{ font-weight:600; font-size:13.5px; color:var(--ink); }
.pt{ font-family:${MONO}; font-size:10px; color:var(--dim2); margin-top:2px; letter-spacing:.04em; }

/* volumetric block */
.vol{ aspect-ratio:1/1; position:relative; overflow:hidden; perspective:900px; cursor:pointer; touch-action:pan-y; background:#000; }
.vlayer{ position:absolute; inset:-8%; will-change:transform; }
.vlayer.mid{ inset:10%; }
.vlayer.fg{ inset:26%; }
.vbadge{ position:absolute; top:12px; right:12px; z-index:5; display:inline-flex; align-items:center; gap:5px; font-family:${MONO}; font-size:9.5px; font-weight:600; letter-spacing:.1em; color:#fff; background:rgba(0,0,0,.45); backdrop-filter:blur(8px); padding:5px 10px; border-radius:999px; border:1px solid rgba(255,255,255,.18); }
.vexpand{ position:absolute; bottom:12px; right:12px; z-index:5; width:34px;height:34px;border-radius:50%; background:rgba(0,0,0,.45); backdrop-filter:blur(8px); border:1px solid rgba(255,255,255,.18); color:#fff; cursor:pointer; display:grid; place-items:center; }
.vcap{ position:absolute; left:12px; bottom:12px; z-index:5; background:rgba(0,0,0,.45); backdrop-filter:blur(8px); color:#fff; padding:6px 11px; border-radius:10px; font-size:12.5px; font-weight:500; }
.orbitwrap{ position:fixed; inset:0; z-index:80; background:rgba(3,3,5,.96); display:grid; place-items:center; padding:18px; }
.orbitstage{ width:min(430px,92vw); aspect-ratio:1/1; perspective:1000px; position:relative; cursor:grab; touch-action:none; }
.orbitstage:active{ cursor:grabbing; }
.orbitcube{ position:absolute; inset:0; transform-style:preserve-3d; border-radius:24px; }
.olayer{ position:absolute; inset:0; border-radius:24px; }
.olayer.mid{ inset:9%; }
.olayer.fg{ inset:24%; }
.ohud{ position:absolute; top:16px; left:16px; right:16px; display:flex; align-items:center; justify-content:space-between; color:#fff; z-index:5; }
.ohud .ot{ font-size:13px; font-weight:600; display:inline-flex; gap:8px; align-items:center; }
.ohud button{ background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.18); color:#fff; width:32px;height:32px;border-radius:50%; cursor:pointer; display:grid; place-items:center; }
.ofoot{ position:absolute; bottom:18px; left:0; right:0; text-align:center; color:#fff; z-index:5; }
.ofoot .oh{ font-family:${MONO}; font-size:10px; letter-spacing:.12em; opacity:.55; text-transform:uppercase; }
.spatialbtn{ margin-top:12px; display:inline-flex; align-items:center; gap:8px; background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.22); color:#fff; font-size:13px; font-weight:600; padding:10px 18px; border-radius:999px; cursor:pointer; backdrop-filter:blur(10px); }

.acts{ display:flex; align-items:center; gap:16px; padding:10px 14px 4px; }
.acts button{ background:none; border:none; cursor:pointer; color:var(--ink); padding:0; display:grid; place-items:center; }
.acts .liked{ color:#ff6ad5; }
.acts .quiet{ margin-left:auto; font-family:${MONO}; font-size:9px; color:var(--dim2); font-weight:500; letter-spacing:.1em; text-transform:uppercase; }
.pbody{ padding:2px 14px 13px; font-size:14px; color:var(--ink); line-height:1.5; }
.pbody b{ font-weight:600; }
.pbody .cmt{ color:var(--dim2); font-size:12.5px; margin-top:4px; cursor:pointer; }
.remcard{ margin:2px 14px 13px; border:1px solid var(--hair); border-radius:16px; padding:13px; display:flex; gap:12px; align-items:center; background:rgba(255,255,255,.03); }
.remcard .cal{ width:44px;height:44px;border-radius:13px; display:grid;place-items:center; flex:none; }
.remcard .rt{ font-weight:600; font-size:14.5px; color:var(--ink); }
.remcard .rw{ font-family:${MONO}; font-size:10px; color:var(--dim2); margin-top:3px; letter-spacing:.03em; }
.cdown{ margin-left:auto; text-align:right; }
.cdown .cv{ font-family:${MONO}; font-weight:700; font-size:14px; }
.cdown .cl{ font-family:${MONO}; font-size:8.5px; color:var(--dim2); text-transform:uppercase; letter-spacing:.12em; margin-top:2px; }
.pollwrap{ padding:2px 14px 10px; }
.pollq{ font-size:14.5px; font-weight:600; color:var(--ink); margin-bottom:9px; }
.popt{ position:relative; border:1px solid var(--hair); border-radius:12px; padding:11px 13px; margin-bottom:7px; cursor:pointer; overflow:hidden; background:rgba(255,255,255,.03); }
.popt .pfill{ position:absolute; inset:0; opacity:.2; width:0; transition:width .5s ease; }
.popt .pl{ position:relative; display:flex; justify-content:space-between; font-size:13.5px; color:var(--ink); }
.popt.voted{ cursor:default; }
.popt .pct{ font-family:${MONO}; color:var(--dim); font-weight:600; font-size:12px; }
.pollmeta{ font-family:${MONO}; font-size:10px; color:var(--dim2); padding:2px 0 6px; letter-spacing:.05em; }
.endcap{ text-align:center; padding:24px 16px 8px; }
.endcap .ering{ width:56px;height:56px; border-radius:50%; padding:2px; background:${HOLO_RING}; margin:0 auto; }
.endcap .ering i{ display:grid; place-items:center; width:100%; height:100%; border-radius:50%; background:var(--void); color:var(--ink); }
.endcap .et{ font-size:14px; font-weight:600; color:var(--ink); margin-top:12px; }
.endcap .es{ font-size:12.5px; color:var(--dim2); margin-top:4px; }
.searchbar{ display:flex; align-items:center; gap:9px; margin:12px 12px 0; border-radius:14px; padding:10px 14px; }
.searchbar input{ flex:1; background:none; border:none; outline:none; color:var(--ink); font-family:inherit; font-size:14px; }
.searchbar input::placeholder{ color:var(--dim2); }
.searchbar .slocal{ font-family:${MONO}; font-size:8.5px; letter-spacing:.12em; color:var(--ok); text-transform:uppercase; }
.mem{ display:grid; grid-template-columns:repeat(3,1fr); gap:4px; padding:12px 12px 100px; }
.memcell{ aspect-ratio:1/1; position:relative; cursor:pointer; border:1px solid var(--hair); border-radius:14px; padding:0; overflow:hidden; background:#000; }
.memcell .who{ position:absolute; left:6px; bottom:6px; font-size:9.5px; font-weight:600; color:#fff; background:rgba(0,0,0,.45); padding:2px 7px; border-radius:999px; }
.memcell .m3d{ position:absolute; top:6px; right:6px; color:#fff; filter:drop-shadow(0 1px 3px rgba(0,0,0,.6)); }
.memnote{ grid-column:1/-1; text-align:center; font-family:${MONO}; font-size:10px; letter-spacing:.08em; color:var(--dim2); padding:12px 20px 4px; text-transform:uppercase; }
.chat{ display:flex; flex-direction:column; flex:1; }
.fhehead{ display:flex; align-items:center; justify-content:space-between; padding:10px 14px; border-bottom:1px solid var(--hair); }
.fhehead .fh{ display:inline-flex; align-items:center; gap:8px; font-family:${MONO}; font-size:10px; letter-spacing:.12em; color:var(--ok); text-transform:uppercase; }
.serverbtn{ display:inline-flex; align-items:center; gap:6px; background:var(--glass); border:1px solid var(--hair); color:var(--dim); font-family:${MONO}; font-size:9.5px; letter-spacing:.08em; padding:6px 11px; border-radius:999px; cursor:pointer; text-transform:uppercase; }
.serverbtn.on{ color:#8fd8ff; border-color:rgba(110,231,255,.4); background:rgba(110,231,255,.07); }
.chatscroll{ flex:1; overflow-y:auto; padding:14px 14px 6px; display:flex; flex-direction:column; gap:9px; }
.cnote{ text-align:center; font-family:${MONO}; font-size:10px; letter-spacing:.06em; color:var(--dim2); margin:4px 0 10px; line-height:1.9; text-transform:uppercase; }
.bub{ max-width:74%; padding:10px 14px; border-radius:18px; font-size:14.5px; line-height:1.45; }
.bub.them{ align-self:flex-start; background:var(--glass2); border:1px solid var(--hair); color:var(--ink); border-bottom-left-radius:6px; }
.bub.me{ align-self:flex-end; color:#0a0a0c; border-bottom-right-radius:6px; }
.bub.ct{ font-family:${MONO}; font-size:10.5px; line-height:1.7; color:#8fd8ff !important; background:rgba(110,231,255,.06) !important; border:1px dashed rgba(110,231,255,.3) !important; word-break:break-all; }
.bwho{ font-size:10.5px; color:var(--dim2); margin:0 0 3px 6px; font-weight:600; }
.chatbar{ display:flex; gap:9px; padding:10px 14px calc(10px + env(safe-area-inset-bottom)); border-top:1px solid var(--hair); background:rgba(6,6,8,.8); backdrop-filter:blur(16px); }
.chatbar input{ flex:1; background:rgba(255,255,255,.05); border:1px solid var(--hair); border-radius:999px; padding:11px 16px; color:var(--ink); font-family:inherit; font-size:14.5px; outline:none; }
.csend{ width:40px;height:40px;border-radius:50%; border:none; cursor:pointer; display:grid;place-items:center; flex:none; }
.inv{ padding:18px 16px 100px; }
.invh{ font-size:20px; font-weight:800; letter-spacing:-.02em; color:var(--ink); }
.invs{ font-size:13px; color:var(--dim); margin-top:5px; line-height:1.55; }
.kcard{ border-radius:20px; padding:16px; margin-top:16px; }
.klbl{ font-family:${MONO}; font-size:9.5px; font-weight:600; letter-spacing:.16em; text-transform:uppercase; color:var(--dim2); }
.klink{ font-family:${MONO}; font-size:12px; font-weight:500; margin-top:9px; word-break:break-all; line-height:1.6; color:var(--ink); }
.kmeta{ display:flex; gap:7px; margin-top:11px; flex-wrap:wrap; }
.kpill{ font-family:${MONO}; font-size:9px; font-weight:500; color:var(--dim); border:1px solid var(--hair); background:rgba(255,255,255,.03); padding:4px 9px; border-radius:999px; display:inline-flex; gap:5px; align-items:center; letter-spacing:.06em; text-transform:uppercase; }
.krow{ display:flex; gap:9px; margin-top:14px; flex-wrap:wrap; }
.kbtn{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; border:none; font-weight:600; font-size:13px; padding:10px 16px; border-radius:11px; }
.kghost{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; background:var(--glass); color:var(--ink); border:1px solid var(--hair); font-weight:600; font-size:12.5px; padding:10px 14px; border-radius:11px; }
.emailrow{ display:flex; gap:8px; margin-top:12px; }
.emailrow input{ flex:1; background:rgba(255,255,255,.04); border:1px solid var(--hair); border-radius:11px; padding:10px 13px; color:var(--ink); font-family:inherit; font-size:13px; outline:none; }
.kstat{ font-family:${MONO}; font-size:11px; color:var(--dim2); margin-top:12px; letter-spacing:.04em; }
.kstat b{ color:var(--ink); }
.invrow{ display:flex; align-items:center; gap:11px; padding:12px 2px; border-bottom:1px solid rgba(255,255,255,.06); }
.invrow:last-child{ border-bottom:none; }
.tagv{ margin-left:auto; font-family:${MONO}; font-size:9px; font-weight:600; padding:4px 10px; border-radius:999px; border:1px solid var(--hair); background:rgba(255,255,255,.03); letter-spacing:.06em; text-transform:uppercase; }
.tabbar{ position:sticky; bottom:0; z-index:30; display:flex; background:rgba(6,6,8,.85); backdrop-filter:blur(20px) saturate(1.4); border-top:1px solid var(--hair); padding:6px 8px calc(8px + env(safe-area-inset-bottom)); }
.tabb{ flex:1; display:grid; place-items:center; background:none; border:none; cursor:pointer; color:var(--ink); padding:9px 0; opacity:.4; }
.tabb.on{ opacity:1; }
.tabb.plus{ opacity:1; }
.tabb.plus .pring{ width:36px;height:36px;border-radius:12px; background:${HOLO}; display:grid; place-items:center; color:#0a0a0c; }
.sheetwrap{ position:fixed; inset:0; z-index:60; background:rgba(0,0,0,.6); display:flex; align-items:flex-end; justify-content:center; }
.sheet{ width:100%; max-width:500px; background:rgba(18,18,24,.92); backdrop-filter:blur(30px) saturate(1.5); border:1px solid var(--hair2); border-bottom:none; border-radius:24px 24px 0 0; padding:8px 16px calc(18px + env(safe-area-inset-bottom)); animation:up .22s ease; }
@keyframes up{ from{ transform:translateY(40px); opacity:.6; } to{ transform:none; opacity:1; } }
.grab{ width:38px; height:4px; border-radius:3px; background:rgba(255,255,255,.2); margin:8px auto 14px; }
.sh{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.sh .st{ font-size:16px; font-weight:700; color:var(--ink); }
.sh button{ background:none; border:none; cursor:pointer; color:var(--dim); }
.ctabs{ display:flex; gap:7px; margin-bottom:12px; }
.ctab{ display:inline-flex; align-items:center; gap:6px; cursor:pointer; border:1px solid var(--hair); background:rgba(255,255,255,.04); color:var(--dim); font-size:12.5px; font-weight:600; padding:8px 13px; border-radius:999px; }
.ctab.on{ color:#0a0a0c; }
.ci{ width:100%; background:rgba(255,255,255,.05); border:1px solid var(--hair); border-radius:12px; padding:11px 13px; color:var(--ink); font-family:inherit; font-size:14.5px; outline:none; resize:none; }
.ci + .ci{ margin-top:8px; }
.mediapick{ display:flex; gap:8px; margin-top:10px; }
.mp{ flex:1; height:52px; border-radius:12px; cursor:pointer; border:2px solid transparent; padding:0; }
.mp.on{ border-color:rgba(255,255,255,.7); }
.spatialrow{ display:flex; align-items:center; justify-content:space-between; margin-top:12px; padding:12px 13px; border:1px solid var(--hair); border-radius:13px; background:rgba(255,255,255,.03); gap:10px; }
.spatialrow .sl{ font-size:13px; font-weight:600; color:var(--ink); display:flex; gap:8px; align-items:center; }
.spatialrow .ss{ font-size:11px; color:var(--dim2); margin-top:3px; line-height:1.45; }
.swtch{ width:44px; height:26px; border-radius:999px; border:none; cursor:pointer; position:relative; background:rgba(255,255,255,.14); transition:background .15s; flex:none; }
.swtch i{ position:absolute; top:3px; left:3px; width:20px; height:20px; border-radius:50%; background:#fff; transition:transform .15s; }
.swtch.on i{ transform:translateX(18px); }
.shfoot{ display:flex; align-items:center; justify-content:space-between; margin-top:14px; }
.shnote{ font-family:${MONO}; font-size:9.5px; color:var(--dim2); letter-spacing:.1em; text-transform:uppercase; }
.postbtn{ display:inline-flex; align-items:center; gap:7px; cursor:pointer; border:none; font-weight:700; font-size:13.5px; padding:11px 20px; border-radius:999px; }
.postbtn[disabled]{ opacity:.4; cursor:default; }

/* privacy HUD */
.hudwrap{ position:fixed; inset:0; z-index:75; background:rgba(0,0,0,.6); display:grid; place-items:center; padding:20px; }
.hud{ width:100%; max-width:380px; border-radius:24px; padding:20px; background:rgba(14,14,20,.92); backdrop-filter:blur(30px) saturate(1.5); border:1px solid var(--hair2); }
.hud .ht{ display:flex; align-items:center; justify-content:space-between; margin-bottom:6px; }
.hud .htl{ font-size:16px; font-weight:700; color:var(--ink); display:flex; align-items:center; gap:9px; }
.hud .hs{ font-size:12px; color:var(--dim2); line-height:1.5; margin-bottom:12px; }
.hud button.hclose{ background:none; border:none; color:var(--dim); cursor:pointer; }
.hrow{ display:flex; align-items:center; gap:11px; padding:11px 2px; border-bottom:1px solid rgba(255,255,255,.06); }
.hrow:last-child{ border-bottom:none; }
.hrow .hic{ width:34px;height:34px;border-radius:11px; background:var(--glass2); display:grid; place-items:center; color:var(--ink); flex:none; }
.hrow .hn{ font-size:13px; font-weight:600; color:var(--ink); }
.hrow .hd{ font-family:${MONO}; font-size:10px; color:var(--dim2); margin-top:2px; letter-spacing:.03em; }
.hrow .hok{ margin-left:auto; display:inline-flex; align-items:center; gap:5px; font-family:${MONO}; font-size:9px; color:var(--ok); letter-spacing:.1em; text-transform:uppercase; }
.hrow .hok .dot{ width:6px;height:6px;border-radius:50%; background:var(--ok); box-shadow:0 0 8px rgba(98,244,179,.8); }

/* story viewer */
.scrim{ position:fixed; inset:0; background:rgba(3,3,5,.95); z-index:70; display:grid; place-items:center; padding:18px; }
.moment{ width:100%; max-width:350px; aspect-ratio:9/16; border-radius:24px; overflow:hidden; position:relative; perspective:800px; border:1px solid var(--hair2); }
.moment .mbg{ position:absolute; inset:0; z-index:0; }
.moment .msafe-t{ position:absolute; top:0; left:0; right:0; height:14%; z-index:4; }
.moment .msafe-b{ position:absolute; bottom:0; left:0; right:0; height:14%; z-index:4; }
.moment .mcanvas{ position:absolute; inset:14% 8%; z-index:2; display:grid; place-items:center; text-align:center; will-change:transform; }
.moment .mh{ position:absolute; top:16px; left:14px; right:14px; display:flex; align-items:center; gap:8px; color:#fff; font-size:13px; font-weight:600; z-index:5; }
.moment .mt{ font-weight:800; font-size:26px; color:#fff; line-height:1.2; letter-spacing:-.02em; text-shadow:0 2px 18px rgba(0,0,0,.6); }
.moment .mbar{ position:absolute; top:9px; left:14px; right:14px; height:2.5px; border-radius:3px; background:rgba(255,255,255,.25); overflow:hidden; z-index:5; }
.moment .mbar i{ display:block; height:100%; background:#fff; animation:fill 7s linear forwards; }
@keyframes fill{from{width:0}to{width:100%}}
.mclose{ position:absolute; top:12px; right:12px; cursor:pointer; background:rgba(0,0,0,.4); border:1px solid rgba(255,255,255,.15); color:#fff; width:30px;height:30px;border-radius:50%; display:grid;place-items:center; z-index:6; }
.joincard{ width:100%; max-width:370px; border-radius:24px; overflow:hidden; background:rgba(14,14,20,.94); backdrop-filter:blur(30px); border:1px solid var(--hair2); color:var(--ink); }
.join-top{ height:88px; position:relative; }
.join-body{ padding:18px 20px 22px; }
.join-name{ font-size:19px; font-weight:800; letter-spacing:-.02em; color:var(--ink); }
.join-from{ font-family:${MONO}; font-size:10.5px; color:var(--dim2); margin-top:5px; letter-spacing:.03em; }
.checks{ margin:16px 0 4px; }
.chk{ display:flex; align-items:center; gap:10px; padding:9px 0; font-size:12.5px; color:var(--dim2); border-bottom:1px solid rgba(255,255,255,.06); }
.chk.ok{ color:var(--ink); }
.chk .cbox{ width:22px;height:22px;border-radius:8px; display:grid;place-items:center; background:var(--glass2); color:var(--dim2); flex:none; }
.chk.ok .cbox{ background:var(--ok); color:#062018; }
.join-cta{ width:100%; margin-top:14px; display:flex; align-items:center; justify-content:center; gap:10px; background:var(--glass2); border:1px solid var(--hair2); border-radius:12px; padding:13px; font-weight:600; font-size:14px; cursor:pointer; color:var(--ink); }
.join-cta[disabled]{ opacity:.5; cursor:default; }
.join-close{ position:absolute; top:12px; right:12px; cursor:pointer; background:rgba(0,0,0,.35); border:1px solid rgba(255,255,255,.15); color:#fff; width:28px;height:28px;border-radius:50%; display:grid;place-items:center; z-index:2; }
@media (prefers-reduced-motion: reduce){ *{ animation:none !important; transition:none !important; } }
`;

function Avatar({ who, size=32 }){
  const c = PAL[who] || "#8e8e98";
  return <div className="av" style={{ width:size,height:size,fontSize:size*0.4,
    background:`linear-gradient(150deg,${c},${c}99)`, color:onAccent(c) }}>{who[0]}</div>;
}
function GoogleMark(){
  return (<svg className="gicon" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.1 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.6l6.3 5.2C41.3 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z"/></svg>);
}

/* ---- volumetric tilt block ---- */
function VolBlock({ splat, caption, onExpand, depth=14, rounded }){
  const ref = useRef(null);
  const [t, setT] = useState({ x:0, y:0 });
  const move = useCallback(e=>{
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    setT({ x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5 });
  },[]);
  return (
    <div ref={ref} className="vol" style={rounded?{borderRadius:rounded}:undefined}
      onPointerMove={move} onPointerLeave={()=>setT({x:0,y:0})} onClick={onExpand}>
      <div className="vlayer" style={{ background:splat.bg, transform:`translate(${t.x*-depth}px, ${t.y*-depth}px) scale(1.06)` }}/>
      <div className="vlayer mid" style={{ background:splat.mid, transform:`translate(${t.x*depth*1.4}px, ${t.y*depth*1.4}px)` }}/>
      <div className="vlayer fg" style={{ background:splat.fg, transform:`translate(${t.x*depth*2.6}px, ${t.y*depth*2.6}px)` }}/>
      <span className="vbadge"><Box size={11}/> SPLAT</span>
      {onExpand && <button className="vexpand" aria-label="Open 3D viewer" onClick={e=>{e.stopPropagation(); buzz(6); onExpand();}}><Maximize2 size={14}/></button>}
      {caption && <span className="vcap">{caption}</span>}
    </div>
  );
}

/* ---- orbit viewer ---- */
function OrbitViewer({ splat, author, caption, onClose }){
  const [rot, setRot] = useState({ x:-8, y:14 });
  const drag = useRef(null);
  function down(e){ buzz(5); drag.current = { sx:e.clientX, sy:e.clientY, rx:rot.x, ry:rot.y }; e.currentTarget.setPointerCapture(e.pointerId); }
  function move(e){
    if(!drag.current) return;
    const dx = e.clientX - drag.current.sx, dy = e.clientY - drag.current.sy;
    setRot({ x: Math.max(-38, Math.min(38, drag.current.rx - dy*0.25)), y: drag.current.ry + dx*0.3 });
  }
  const Z = 60;
  return (
    <div className="orbitwrap" onClick={onClose}>
      <div className="orbitstage" onClick={e=>e.stopPropagation()} onPointerDown={down} onPointerMove={move} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}}>
        <div className="ohud">
          <span className="ot"><Box size={15}/> {author}’s spatial memory</span>
          <button onClick={onClose} aria-label="Close"><X size={15}/></button>
        </div>
        <div className="orbitcube" style={{ transform:`rotateX(${rot.x}deg) rotateY(${rot.y}deg)` }}>
          <div className="olayer" style={{ background:splat.bg, transform:`translateZ(${-Z}px) scale(1.12)` }}/>
          <div className="olayer mid" style={{ background:splat.mid, transform:`translateZ(0px)` }}/>
          <div className="olayer fg" style={{ background:splat.fg, transform:`translateZ(${Z}px)` }}/>
        </div>
        <div className="ofoot">
          <div className="oh"><Move3d size={11} style={{verticalAlign:"-2px"}}/> drag to orbit · HSML volume · rendered on-device · 0 telemetry</div>
          <button className="spatialbtn" onClick={e=>{e.stopPropagation(); buzz(10);}}><Box size={14}/> Enter Spatial Space</button>
          {caption && <div style={{fontSize:13,marginTop:10,opacity:.8}}>{caption}</div>}
        </div>
      </div>
    </div>
  );
}

/* -------- seed content -------- */
const seedStories = [
  { id:"st1", who:"Arjun", css:"linear-gradient(160deg,#0e3324,#2e8a5e)", text:"summit before sunrise 🏔️", seen:false },
  { id:"st2", who:"Mei",   css:"linear-gradient(160deg,#3d1b2e,#c94f6d)", text:"that ramen again. no regrets.", seen:false },
  { id:"st3", who:"Sana",  css:"linear-gradient(160deg,#0e2a4a,#3b8ac9)", text:"rooftop, golden hour", seen:true },
];
const REMIND_TARGET = Date.now() + 1000*60*60*52 + 1000*60*23;
const seedPosts = [
  { id:"p1", author:"Arjun", time:"1h", type:"reminder", rtitle:"Cabin weekend 🛶", rwhen:"6 going · local notify · never pushed", target:REMIND_TARGET, liked:false, comments:9 },
  { id:"p2", author:"Mei", time:"3h", type:"splat", splat:SPLATS[0], caption:"new spot, would absolutely return", liked:true, comments:4 },
  { id:"p3", author:"Sana", time:"5h", type:"poll", q:"Movie night pick?", opts:[{t:"Spirited Away",v:4},{t:"Paddington 2",v:6}], voted:null, comments:7 },
  { id:"p4", author:"Theo", time:"7h", type:"splat", splat:SPLATS[1], caption:"golden hour did its thing", liked:false, comments:3 },
  { id:"p5", author:"Dev", time:"1d", type:"splat", splat:SPLATS[3], caption:"first attempt at focaccia 🍞", liked:false, comments:6 },
  { id:"p6", author:"You", time:"2d", type:"splat", splat:SPLATS[2], caption:"trail from last weekend", liked:false, comments:2 },
];
function fmtLeft(ms){
  if(ms<=0) return { v:"now", l:"happening" };
  const d=Math.floor(ms/86400000), h=Math.floor(ms%86400000/3600000), m=Math.floor(ms%3600000/60000), s=Math.floor(ms%60000/1000);
  if(d>0) return { v:`${d}d ${h}h`, l:"to go" };
  if(h>0) return { v:`${h}h ${m}m`, l:"to go" };
  return { v:`${m}m ${s}s`, l:"to go" };
}

/* ================================================================== */
export default function App(){
  const [stage, setStage] = useState("landing");
  const [cfg, setCfg] = useState({ name:"Moonbase", desc:"our corner of the internet — slow, private, ours 🌙", vibe:"holo", canvas:"nebula" });
  return (
    <div className="t-root">
      <style>{STYLES}</style>
      {stage==="landing"   && <Landing onStart={()=>setStage("signup")}/>}
      {stage==="signup"    && <Signup onBack={()=>setStage("landing")} onAuthed={()=>setStage("customize")}/>}
      {stage==="customize" && <Customize cfg={cfg} setCfg={setCfg} onBack={()=>setStage("signup")} onDeploy={()=>setStage("deploying")}/>}
      {stage==="deploying" && <Deploying cfg={cfg} onDone={()=>setStage("space")}/>}
      {stage==="space"     && <Space cfg={cfg}/>}
    </div>
  );
}

/* -------- hero device demo -------- */
function PhoneDemo(){
  return (
    <div className="screen">
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 14px 10px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        <span style={{fontWeight:800,fontSize:17,letterSpacing:"-.02em",color:"#f2f2f7"}}>Moonbase</span>
        <span style={{display:"inline-flex",gap:5,alignItems:"center",fontFamily:MONO,fontSize:8.5,letterSpacing:".12em",color:"#62f4b3"}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"#62f4b3"}}/>LOCAL
        </span>
      </div>
      <div style={{display:"flex",gap:12,padding:"11px 12px",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
        {["Arjun","Mei","Sana"].map(w=>(
          <div key={w} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
            <div style={{width:44,height:44,borderRadius:"50%",padding:2,background:HOLO_RING}}>
              <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"#0a0a0e",padding:2}}><Avatar who={w} size={36}/></div>
            </div>
            <span style={{fontSize:9,color:"#9a9aa6"}}>{w}</span>
          </div>
        ))}
      </div>
      <div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 12px"}}>
        <Avatar who="Mei" size={24}/><b style={{fontSize:12,color:"#f2f2f7"}}>Mei</b>
        <span style={{fontFamily:MONO,fontSize:8.5,color:"#6a6a76"}}>3H</span>
      </div>
      <VolBlock splat={SPLATS[0]} depth={8}/>
      <div style={{display:"flex",gap:12,padding:"9px 12px 2px",color:"#f2f2f7"}}><Heart size={18} fill="#ff6ad5" color="#ff6ad5"/><MessageCircle size={18}/><Send size={18}/></div>
      <div style={{padding:"4px 12px 14px",fontSize:11.5,color:"#f2f2f7"}}><b>Mei</b> new spot, would absolutely return</div>
    </div>
  );
}

/* ---------------- landing ---------------- */
function Landing({ onStart }){
  const [plain, setPlain] = useState("movie night friday?");
  return (
    <div className="land">
      <nav className="nav">
        <div className="brand"><span className="bmark"><i/></span> Lattice</div>
        <button className="navlink" onClick={onStart}>Sign in</button>
      </nav>

      <section className="hero">
        <div className="kicker">Dropped from 2040</div>
        <h1>The network that<br/><span className="holotext">can’t even see you.</span></h1>
        <p className="sub">A private, volumetric sanctuary for your people. Memories with physical depth.<br/>Messages encrypted beyond anyone’s reach — including ours. No ads. No algorithm. No audience.</p>
        <div className="ctas">
          <button className="cta-w" onClick={onStart}>Start your Lattice <ArrowRight size={16}/></button>
          <button className="cta-g" onClick={onStart}>See how it works ›</button>
        </div>
        <div className="specline">
          {["FHE · TFHE-rs","3D GAUSSIAN SPLATS","CRDT SYNC","SQLITE · OPFS","IEEE 2874 · HSML","0 TELEMETRY"].map(s=>(
            <span className="spec" key={s}>{s}</span>
          ))}
        </div>
      </section>

      <div className="stage">
        <div className="halo"/>
        <div className="slab"><PhoneDemo/></div>
      </div>

      <section className="mrow">
        <h2>Social media asked you to perform.<br/><em>Lattice asks you to belong.</em></h2>
        <p>Every network before this one was built for an audience — likes to chase, strangers to impress, an algorithm to please. Lattice is built for six people who already love each other. Post the photo. Nobody’s ranking it.</p>
      </section>

      <section className="mrow">
        <h2>Memories with <span className="holotext">depth.</span></h2>
        <p>Upload one ordinary photo and Lattice reconstructs it as a volumetric memory — millions of 3D Gaussians you can tilt, orbit, and anchor in your actual room through WebXR or a glasses-free holographic display. Rendered on your device. Compressed to under 15MB. Never touched by a cloud.</p>
        <div className="demo3d"><VolBlock splat={SPLATS[1]} depth={18} caption="move your cursor — this photo has depth"/></div>
        <div className="demohint">Live demo · drag any splat inside Lattice to orbit it</div>
      </section>

      <section className="mrow">
        <h2>Even we can’t read it.<br/><em>Mathematically.</em></h2>
        <p>Your messages are encrypted on your device with fully homomorphic encryption. The server stores and processes only ciphertext — lattice math (yes, that’s the name) that would take longer than the universe’s lifetime to crack. Try it:</p>
        <div className="fhedemo glass">
          <div className="fl"><Lock size={11}/> Your message · encrypted before it ever leaves</div>
          <input value={plain} maxLength={60} onChange={e=>setPlain(e.target.value)} placeholder="Type something private…"/>
          <div className="cipherout">{plain ? cipher(plain) : "…"}</div>
          <div className="fc">This is all the server ever sees. <span className="mono" style={{color:"#8fd8ff"}}>b = As + e</span> — the Learning-With-Errors problem. No key ever leaves your device.</div>
        </div>
      </section>

      <section className="mrow">
        <h2>Works on a train.<br/><em>Syncs like magic.</em></h2>
        <p>Lattice is local-first: a full SQLite database lives inside your browser, so the feed, search, and posting work with zero connection. When you’re back online, CRDT change-logs merge your world with your people’s — no conflicts, no central referee. Even search runs entirely on your device; your queries never cross the network.</p>
      </section>

      <section className="mrow">
        <h2>A feed that <em>ends.</em></h2>
        <p>Newest to oldest, your people only, and then — done. No infinite scroll, no recommendations, no “you might also like.” When you’ve caught up, Lattice tells you, and lets you leave. That’s not a missing feature. That’s the feature.</p>
      </section>

      <section className="mrow">
        <h2>Every room has a <em>soul.</em></h2>
        <p>Name it. Write its manifesto. Dress it in the internet era your group actually lived in, and wrap it in a 360° canvas. Your Lattice should look like your people — not like everyone else’s app.</p>
        <div className="chipline">
          {Object.values(VIBES).map(v=>(
            <span className="vchip" key={v.label} style={{fontFamily:v.nameFont}}><i style={{background:v.accent}}/>{v.label}</span>
          ))}
        </div>
      </section>

      <div className="pricing">
        <div className="pin">
          <h2>Own it. Don’t rent it.</h2>
          <p className="psub">Nothing here is ad-supported, so nothing here is free-with-your-data. Two honest ways to run a Lattice.</p>
          <div className="prow">
            <div className="pcard glass">
              <div className="pk">Self-hosted</div>
              <div className="pn">Own it once</div>
              <div className="pv">$249 <span>one time</span></div>
              <ul>
                <li><Check size={15}/> The full stack, yours forever — one script deploys it to your server</li>
                <li><Check size={15}/> Unlimited members and rooms, free security updates</li>
                <li><Check size={15}/> Your data never touches our machines</li>
              </ul>
            </div>
            <div className="pcard glass">
              <div className="pk">Managed</div>
              <div className="pn">Private instance</div>
              <div className="pv">$12 <span>/ month flat</span></div>
              <ul>
                <li><Check size={15}/> Zero setup — your single-tenant instance, deployed for you</li>
                <li><Check size={15}/> Priced by storage, never by people</li>
                <li><Check size={15}/> FHE means even we can’t read your rooms — export & self-host anytime</li>
              </ul>
            </div>
          </div>
          <div className="golden">No per-user pricing, ever. Inviting a friend should never cost money.</div>
        </div>
      </div>

      <footer className="foot">LATTICE · PRIVATE / VOLUMETRIC / ENCRYPTED · BUILT TO BECOME A PUBLIC BENEFIT CORPORATION</footer>
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
      <p className="fmuted">Google’s OpenID Connect confirms it’s you — scopes limited to email and identity, no passwords stored, no phone number required. Your FHE keys are generated on your device, after.</p>
      <button className="gbtn" onClick={()=>{ setLoading(true); buzz(6); setTimeout(onAuthed,900); }} disabled={loading}>
        <GoogleMark/> {loading ? "Connecting…" : "Continue with Google"}
      </button>
      <div className="fnote glass">
        <Lock size={15} style={{flex:"none",marginTop:1,color:"#62f4b3"}}/>
        <span>OAuth only — Lattice receives a verified email, never your credentials. Everything else is encrypted client-side before it exists anywhere.</span>
      </div>
    </div></div>
  );
}

/* ---------------- customize ---------------- */
function Customize({ cfg, setCfg, onBack, onDeploy }){
  const v = VIBES[cfg.vibe];
  const canvas = CANVASES.find(c=>c.id===cfg.canvas);
  const set = (k,val)=> setCfg(c=>({ ...c, [k]:val }));
  return (
    <div className="flow"><div className="fcard">
      <button className="back" onClick={onBack}><ChevronLeft size={15}/> Back</button>
      <div className="fstep">Step 2 / 3</div>
      <h1 className="ftitle">Make it yours</h1>
      <p className="fmuted">Name your room, write its manifesto, pick its era and canvas. Styling syncs to <span className="mono" style={{fontSize:12}}>:root</span> instantly — change all of it later.</p>
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
            <button key={k} className={"vopt"+(cfg.vibe===k?" on":"")} onClick={()=>{buzz(4); set("vibe",k);}}>
              <div className="vsw" style={{ background:t.banner }}/>
              <div className="vn">{t.label}</div>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="flabel"><span>Background canvas · 360° panorama, optional</span></label>
        <div className="cgrid">
          {CANVASES.map(c=>(
            <button key={c.id} className={"copt"+(cfg.canvas===c.id?" on":"")+(c.css?"":" none")} style={c.css?{ background:c.css }:undefined} onClick={()=>{buzz(4); set("canvas",c.id);}}>
              {c.css && <span className="pano">360°</span>}
              <span>{c.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="field">
        <label className="flabel"><span>Preview</span></label>
        <div className="mini glass">
          <div className="mb" style={{ background:(canvas?.css) || v.banner }}/>
          <div className="mn">
            <div style={{ fontFamily:v.nameFont, fontWeight:v.nameWeight, fontSize:Math.min(v.nameSize,22), lineHeight:1.15, color:"var(--ink)" }}>{cfg.name}</div>
            <div style={{ fontSize:12, color:"var(--dim2)", marginTop:5, lineHeight:1.45 }}>{cfg.desc || "no manifesto yet"}</div>
          </div>
        </div>
      </div>
      <button className="deploybtn" onClick={()=>{buzz(8); onDeploy();}}>Deploy my Lattice <ArrowRight size={16}/></button>
    </div></div>
  );
}

/* ---------------- deploying ---------------- */
function Deploying({ cfg, onDone }){
  const [done, setDone] = useState(false);
  const slug = cfg.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "room";
  useEffect(()=>{ const t1=setTimeout(()=>setDone(true),2200), t2=setTimeout(onDone,3800); return ()=>{clearTimeout(t1);clearTimeout(t2);}; },[]);
  const steps = [
    "FHE keypair — generated on your device",
    "Local core — SQLite in your browser (OPFS)",
    "CRDT sync — Automerge change-log ready",
    "Postgres — single-tenant, yours only",
    "Auth — Google OIDC, email scope only",
    "Storage — volumetric assets, 500MB ceiling",
  ];
  return (
    <div className="flow"><div className="dscreen">
      {!done ? <>
        <div className="spin"/>
        <h1 className="ftitle">Weaving {cfg.name}…</h1>
        <p className="fmuted">Provisioning your single-tenant stack.</p>
        <div className="dsteps glass">
          {steps.map((s,i)=>(<div className="dstep" key={i}><Check size={12}/> {s}</div>))}
        </div>
      </> : <>
        <div style={{width:52,height:52,borderRadius:"50%",padding:2,background:HOLO_RING,margin:"0 auto 20px"}}>
          <div style={{width:"100%",height:"100%",borderRadius:"50%",background:"var(--void)",display:"grid",placeItems:"center"}}><Check size={26} color="#f2f2f7"/></div>
        </div>
        <h1 className="ftitle">You’re live.</h1>
        <p className="fmuted">Your room is ready, private, and mathematically unreadable to everyone but your people.</p>
        <div className="durl holotext">{slug}.lattice.space</div>
      </>}
    </div></div>
  );
}

/* ---------------- THE APP ---------------- */
function Space({ cfg }){
  const v = VIBES[cfg.vibe];
  const canvas = CANVASES.find(c=>c.id===cfg.canvas);
  const [tab, setTab] = useState("home");
  const [posts, setPosts] = useState(seedPosts);
  const [stories, setStories] = useState(seedStories);
  const [moment, setMoment] = useState(null);
  const [orbit, setOrbit] = useState(null);
  const [compose, setCompose] = useState(false);
  const [hud, setHud] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [query, setQuery] = useState("");
  const [now, setNow] = useState(Date.now());

  useEffect(()=>{ const i=setInterval(()=>setNow(Date.now()),1000); return ()=>clearInterval(i); },[]);
  useEffect(()=>{ if(!moment) return; const t=setTimeout(()=>setMoment(null),7000); return ()=>clearTimeout(t); },[moment]);

  const slug = cfg.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "room";
  const token = "a4f8c2e9b7d3f6e2k7Q2mZ4pXw9rT1uV";
  const accent = v.accent;
  const bandBg = canvas?.css || v.banner;
  const splatPosts = posts.filter(p=>p.type==="splat");
  const found = useMemo(()=>{
    const q = query.trim().toLowerCase();
    if(!q) return splatPosts;
    return splatPosts.filter(p=>(p.caption||"").toLowerCase().includes(q) || p.author.toLowerCase().includes(q));
  },[query, posts]);

  function like(id){ buzz(6); setPosts(ps=>ps.map(p=>p.id===id?{...p,liked:!p.liked}:p)); }
  function vote(id, oi){ buzz(5); setPosts(ps=>ps.map(p=>{ if(p.id!==id||p.voted!=null) return p;
    const opts=p.opts.map((o,i)=>i===oi?{...o,v:o.v+1}:o); return {...p,opts,voted:oi}; })); }
  function sendInvite(){
    if(!email.trim() || !email.includes("@")) return;
    buzz(6); setSent(true); setEmail(""); setTimeout(()=>setSent(false), 2200);
  }
  const go = t => { buzz(4); setTab(t); };

  return (
    <div className="app">
      <div className="appcol">
        <div className="topbar">
          <div className="roomname" style={{ fontFamily:v.nameFont, fontWeight:v.nameWeight, fontSize:v.nameSize }}>{cfg.name}</div>
          <div className="topicons">
            <button className="syncpill" onClick={()=>{buzz(4); setHud(true);}} aria-label="System status">
              <span className="dot"/> local · synced
            </button>
            <button onClick={()=>go("chat")} aria-label="Messages"><Send size={21}/></button>
          </div>
        </div>

        {(tab==="home"||tab==="mem") && (
          <>
            <div className="roomband" style={{ background:bandBg }}>
              <div className="bmeta">
                <span className="bpill"><Users size={10}/> 6 members</span>
                <span className="bpill"><Lock size={10}/> invite-only</span>
                {canvas?.css && <span className="bpill"><Box size={10}/> 360°</span>}
              </div>
            </div>
            <div className="stories">
              <button className="story you" onClick={()=>{buzz(5); setMoment({ who:"You", css:bandBg, text:"add to your story" });}}>
                <div className="youplus">
                  <div className="ring"><div className="rin"><Avatar who="You" size={51}/></div></div>
                  <span className="pb"><Plus size={12}/></span>
                </div>
                <span className="sn">Your story</span>
              </button>
              {stories.map(s=>(
                <button key={s.id} className="story" onClick={()=>{ buzz(5); setMoment(s); setStories(st=>st.map(x=>x.id===s.id?{...x,seen:true}:x)); }}>
                  <div className={"ring"+(s.seen?" seen":"")}><div className="rin"><Avatar who={s.who} size={51}/></div></div>
                  <span className="sn">{s.who}</span>
                </button>
              ))}
            </div>
            <div className="vtog">
              <button className={"vtb"+(tab==="home"?" on":"")} onClick={()=>go("home")} aria-label="Stream"><Home size={20}/></button>
              <button className={"vtb"+(tab==="mem"?" on":"")} onClick={()=>go("mem")} aria-label="Memories"><Grid3X3 size={20}/></button>
            </div>
          </>
        )}

        {tab==="home" && (
          <div className="feed">
            {cfg.desc && (
              <div className="welcome glass">
                <div className="wl">Welcome to {cfg.name}</div>
                <div className="wq">{cfg.desc}</div>
              </div>
            )}
            {posts.map(p=>{
              const total = p.type==="poll" ? p.opts.reduce((a,o)=>a+o.v,0) : 0;
              const left = p.type==="reminder" && p.target ? fmtLeft(p.target-now) : null;
              return (
                <div className="post glass" key={p.id}>
                  <div className="phead">
                    <Avatar who={p.author}/>
                    <div><div className="pa">{p.author}</div><div className="pt">{p.time.toUpperCase()} · E2E</div></div>
                  </div>
                  {p.type==="splat" && <VolBlock splat={p.splat} onExpand={()=>setOrbit(p)}/>}
                  {p.type==="reminder" && (
                    <div className="remcard">
                      <div className="cal" style={{ background:accent, color:onAccent(accent) }}><CalendarClock size={20}/></div>
                      <div><div className="rt">{p.rtitle}</div><div className="rw">{p.rwhen}</div></div>
                      {left && <div className="cdown"><div className="cv" style={{color:accent}}>{left.v}</div><div className="cl">{left.l}</div></div>}
                    </div>
                  )}
                  {p.type==="poll" && (
                    <div className="pollwrap">
                      <div className="pollq">{p.q}</div>
                      {p.opts.map((o,i)=>{
                        const pct = total ? Math.round(o.v/total*100) : 0; const voted = p.voted!=null;
                        return (
                          <div key={i} className={"popt"+(voted?" voted":"")} onClick={()=>vote(p.id,i)}>
                            <div className="pfill" style={{ width: voted ? pct+"%" : 0, background:accent }}/>
                            <div className="pl"><span>{o.t}{p.voted===i?" ✓":""}</span>{voted && <span className="pct">{pct}%</span>}</div>
                          </div>
                        );
                      })}
                      {p.voted!=null && <div className="pollmeta">{total} VOTES · ONE PER PERSON</div>}
                    </div>
                  )}
                  {p.type==="text" && <div className="pbody" style={{fontSize:15}}>{p.text}</div>}
                  <div className="acts">
                    <button className={p.liked?"liked":""} onClick={()=>like(p.id)} aria-label="Love">
                      <Heart size={21} fill={p.liked?"#ff6ad5":"none"}/>
                    </button>
                    <button aria-label="Comment"><MessageCircle size={21}/></button>
                    <span className="quiet">no counts · just your people</span>
                  </div>
                  {p.type==="splat" && p.caption && (
                    <div className="pbody"><b>{p.author}</b> {p.caption}
                      {p.comments>0 && <div className="cmt">View all {p.comments} comments</div>}
                    </div>
                  )}
                  {p.type!=="splat" && p.comments>0 && <div className="pbody"><div className="cmt" style={{marginTop:0}}>View all {p.comments} comments</div></div>}
                </div>
              );
            })}
            <div className="endcap">
              <div className="ering"><i><Check size={22}/></i></div>
              <div className="et">You’re all caught up</div>
              <div className="es">You’ve seen everything from your people. Go be present.</div>
            </div>
          </div>
        )}

        {tab==="mem" && (
          <>
            <div className="searchbar glass">
              <Search size={16} color="var(--dim2)"/>
              <input placeholder="Search memories…" value={query} onChange={e=>setQuery(e.target.value)}/>
              <span className="slocal">local only</span>
            </div>
            <div className="mem">
              {found.map(p=>(
                <button key={p.id} className="memcell" onClick={()=>{buzz(5); setOrbit(p);}}>
                  <div style={{position:"absolute",inset:0,background:p.splat.bg}}/>
                  <div style={{position:"absolute",inset:"18%",background:p.splat.mid}}/>
                  <span className="m3d"><Box size={12}/></span>
                  <span className="who">{p.author}</span>
                </button>
              ))}
              <div className="memnote">{query ? `${found.length} found — query never left this device` : "every memory, pinned forever in 3D — search runs on-device"}</div>
            </div>
          </>
        )}

        {tab==="chat" && <ChatFHE accent={accent}/>}

        {tab==="invite" && (
          <div className="inv">
            <div className="invh">Invite friends</div>
            <div className="invs">By link or email — nobody’s phone number is ever exposed. Tokens carry 192 bits of CSPRNG entropy; only their SHA-256 hash is stored.</div>
            <div className="kcard glass">
              <div className="klbl">Your invite link</div>
              <div className="klink">{slug}.lattice.space/join?token=<span style={{color:accent}}>{token.slice(0,16)}…</span></div>
              <div className="kmeta">
                <span className="kpill"><KeyRound size={10}/> CSPRNG · 192-bit</span>
                <span className="kpill"><Clock size={10}/> 72h expiry</span>
                <span className="kpill"><Check size={10}/> single-use</span>
              </div>
              <div className="krow">
                <button className="kbtn" style={{ background:accent, color:onAccent(accent) }} onClick={()=>{ buzz(6); try{navigator.clipboard?.writeText(`https://${slug}.lattice.space/join?token=${token}`);}catch{} setCopied(true); setTimeout(()=>setCopied(false),1600); }}>
                  {copied ? <><Check size={14}/> Copied</> : <><Copy size={14}/> Copy link</>}
                </button>
                <button className="kghost" onClick={()=>{buzz(5); setShowJoin(true);}}><Eye size={14}/> Preview join</button>
              </div>
              <div className="emailrow">
                <input placeholder="or invite by email" value={email}
                  onChange={e=>setEmail(e.target.value)} onKeyDown={e=>{ if(e.key==="Enter") sendInvite(); }}/>
                <button className="kbtn" style={{ background:accent, color:onAccent(accent) }} onClick={sendInvite}>{sent ? <><Check size={14}/> Sent</> : <><Mail size={14}/> Invite</>}</button>
              </div>
              <div className="kstat"><b>3</b> joined · <b>3</b> seats left</div>
            </div>
            <div style={{marginTop:20}}>
              <div className="klbl" style={{marginBottom:2}}>People you’ve brought in</div>
              {[["Theo","brought 2 of their own"],["Sana","posts on Fridays"],["Dev","newest member"]].map(([n,w])=>(
                <div className="invrow" key={n}>
                  <Avatar who={n} size={38}/>
                  <div><div className="pa">{n}</div><div className="pt">{w}</div></div>
                  <span className="tagv" style={{ color:accent }}>via your link</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="tabbar">
          <button className={"tabb"+(tab==="home"?" on":"")} onClick={()=>go("home")} aria-label="Home"><Home size={23}/></button>
          <button className={"tabb"+(tab==="mem"?" on":"")} onClick={()=>go("mem")} aria-label="Memories"><Grid3X3 size={23}/></button>
          <button className="tabb plus" onClick={()=>{buzz(7); setCompose(true);}} aria-label="New post"><span className="pring"><Plus size={19}/></span></button>
          <button className={"tabb"+(tab==="chat"?" on":"")} onClick={()=>go("chat")} aria-label="Chat"><Send size={22}/></button>
          <button className={"tabb"+(tab==="invite"?" on":"")} onClick={()=>go("invite")} aria-label="Invite"><UserPlus size={23}/></button>
        </div>
      </div>

      {compose && (
        <ComposerSheet accent={accent} onClose={()=>setCompose(false)}
          onPost={(p)=>{ setPosts(ps=>[{ ...p, id:"p"+Date.now(), author:"You", time:"now", liked:false, comments:0 }, ...ps]); setCompose(false); setTab("home"); buzz(10); }}/>
      )}

      {hud && <PrivacyHUD onClose={()=>setHud(false)}/>}
      {orbit && <OrbitViewer splat={orbit.splat} author={orbit.author} caption={orbit.caption} onClose={()=>setOrbit(null)}/>}
      {moment && (
        <div className="scrim" onClick={()=>setMoment(null)}>
          <StoryViewer moment={moment} onClose={()=>setMoment(null)}/>
        </div>
      )}
      {showJoin && <JoinPreview cfg={cfg} v={v} bandBg={bandBg} token={token} slug={slug} onClose={()=>setShowJoin(false)}/>}
    </div>
  );
}

/* ---------------- privacy HUD (local-first system status) ---------------- */
function PrivacyHUD({ onClose }){
  const rows = [
    { ic:<Lock size={16}/>, n:"FHE keypair", d:"TFHE-rs · generated on-device · never exported" },
    { ic:<Database size={16}/>, n:"Local core", d:"SQLite · OPFS · worker thread · 12ms reads" },
    { ic:<GitMerge size={16}/>, n:"CRDT sync", d:"Automerge · 0 pending changes · conflict-free" },
    { ic:<Cpu size={16}/>, n:"Search index", d:"FTS5 · fully local · queries never leave device" },
    { ic:<Radio size={16}/>, n:"Spatial layer", d:"HSML ready · HSTP idle · no display connected" },
    { ic:<ShieldCheck size={16}/>, n:"Telemetry", d:"0 bytes transmitted · ever" },
  ];
  return (
    <div className="hudwrap" onClick={onClose}>
      <div className="hud" onClick={e=>e.stopPropagation()}>
        <div className="ht">
          <span className="htl"><ShieldCheck size={18} color="#62f4b3"/> System</span>
          <button className="hclose" onClick={onClose}><X size={17}/></button>
        </div>
        <div className="hs">Everything below runs on your device. This panel is the entire relationship between you and any server.</div>
        {rows.map(r=>(
          <div className="hrow" key={r.n}>
            <span className="hic">{r.ic}</span>
            <div><div className="hn">{r.n}</div><div className="hd">{r.d}</div></div>
            <span className="hok"><span className="dot"/>OK</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- FHE chat with server view ---------------- */
function ChatFHE({ accent }){
  const [msgs, setMsgs] = useState([
    { who:"Mei", me:false, text:"who's bringing the speaker fri?", ct:cipher("who's bringing the speaker fri?") },
    { who:"Arjun", me:false, text:"i got it. also packing the board games", ct:cipher("i got it. also packing the board games") },
    { who:"You", me:true, text:"yesss bring catan, we owe Theo a rematch", ct:cipher("yesss bring catan, we owe Theo a rematch") },
  ]);
  const [val, setVal] = useState("");
  const [serverView, setServerView] = useState(false);
  const [encrypting, setEncrypting] = useState(null);
  const endRef = useRef(null);
  useEffect(()=>{ endRef.current?.scrollIntoView({ block:"end" }); },[msgs, serverView, encrypting]);
  function send(){
    if(!val.trim()) return; const t=val.trim(); setVal(""); buzz(6);
    const ct = cipher(t);
    setEncrypting({ who:"You", me:true, text:t, ct });
    setTimeout(()=>{ setEncrypting(null); setMsgs(m=>[...m,{ who:"You", me:true, text:t, ct }]); }, 550);
    setTimeout(()=> setMsgs(m=>[...m,{ who:"Mei", me:false, text:"omw 🌙", ct:cipher("omw") }]), 1500);
  }
  return (
    <div className="chat">
      <div className="fhehead">
        <span className="fh"><Lock size={11}/> FHE · TFHE-rs · keys never leave your device</span>
        <button className={"serverbtn"+(serverView?" on":"")} onClick={()=>{buzz(5); setServerView(s=>!s);}}>
          {serverView ? <><EyeOff size={11}/> your view</> : <><Eye size={11}/> server view</>}
        </button>
      </div>
      <div className="chatscroll">
        <div className="cnote">just the 6 of you · no typing dots · no read receipts<br/>{serverView ? "this is everything the server can ever see" : "the server stores only ciphertext — tap server view"}</div>
        {msgs.map((m,i)=>(
          <div key={i} style={{display:"flex",flexDirection:"column"}}>
            {!m.me && !serverView && (i===0 || msgs[i-1].who!==m.who) && <span className="bwho">{m.who}</span>}
            <div className={"bub "+(m.me?"me":"them")+(serverView?" ct":"")}
              style={m.me && !serverView ? {background:accent, color:onAccent(accent)} : undefined}>
              {serverView ? m.ct : m.text}
            </div>
          </div>
        ))}
        {encrypting && (
          <div style={{display:"flex",flexDirection:"column"}}>
            <div className="bub me ct">{encrypting.ct}</div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div className="chatbar">
        <input value={val} onChange={e=>setVal(e.target.value)} placeholder="Message… (encrypts on your device)" onKeyDown={e=>{ if(e.key==="Enter") send(); }}/>
        <button className="csend" style={{ background:accent, color:onAccent(accent) }} onClick={send}><Send size={17}/></button>
      </div>
    </div>
  );
}

/* ---------------- depth-aware story viewer ---------------- */
function StoryViewer({ moment, onClose }){
  const ref = useRef(null);
  const [t, setT] = useState({ x:0, y:0 });
  function move(e){
    const r = ref.current?.getBoundingClientRect(); if(!r) return;
    setT({ x:(e.clientX-r.left)/r.width-.5, y:(e.clientY-r.top)/r.height-.5 });
  }
  return (
    <div ref={ref} className="moment" onClick={e=>e.stopPropagation()} onPointerMove={move} onPointerLeave={()=>setT({x:0,y:0})}>
      <div className="mbg" style={{ background:moment.css }}/>
      <div className="msafe-t"/><div className="msafe-b"/>
      <div className="mbar"><i/></div>
      <div className="mh"><Avatar who={moment.who} size={28}/>{moment.who}<span style={{opacity:.7,fontWeight:500,fontFamily:MONO,fontSize:10}}>NOW · 7S</span></div>
      <button className="mclose" onClick={onClose}><X size={15}/></button>
      <div className="mcanvas" style={{ transform:`translate(${t.x*14}px, ${t.y*14}px) translateZ(30px)` }}>
        <div className="mt">{moment.text}</div>
      </div>
    </div>
  );
}

/* ---------------- composer sheet ---------------- */
function ComposerSheet({ accent, onClose, onPost }){
  const [type, setType] = useState("media");
  const [text, setText] = useState("");
  const [mediaIx, setMediaIx] = useState(0);
  const [spatial, setSpatial] = useState(true);
  const [q, setQ] = useState(""); const [opts, setOpts] = useState(["",""]);
  const [rt, setRt] = useState(""); const [rw, setRw] = useState("");
  const on = { background:accent, borderColor:accent, color:onAccent(accent) };
  const ready = type==="media" ? text.trim().length>0 : type==="poll" ? (q.trim() && opts.filter(o=>o.trim()).length>=2) : rt.trim().length>0;
  function submit(){
    if(!ready) return;
    if(type==="media") onPost({ type:"splat", splat:SPLATS[mediaIx], caption:text.trim() });
    if(type==="poll") onPost({ type:"poll", q:q.trim(), opts:opts.filter(o=>o.trim()).slice(0,2).map(t=>({t:t.trim(),v:0})), voted:null });
    if(type==="reminder") onPost({ type:"reminder", rtitle:rt.trim(), rwhen:(rw.trim()||"soon")+" · local notify", target:Date.now()+86400000 });
  }
  return (
    <div className="sheetwrap" onClick={onClose}>
      <div className="sheet" onClick={e=>e.stopPropagation()}>
        <div className="grab"/>
        <div className="sh"><span className="st">New post</span><button onClick={onClose}><X size={19}/></button></div>
        <div className="ctabs">
          {[["media",<ImageIcon size={14} key="i"/>,"Media"],["poll",<BarChart2 size={14} key="p"/>,"Poll"],["reminder",<CalendarClock size={14} key="r"/>,"Reminder"]].map(([k,ic,l])=>(
            <button key={k} className="ctab" style={type===k?on:undefined} onClick={()=>{buzz(4); setType(k);}}>{ic}{l}</button>
          ))}
        </div>
        {type==="media" && <>
          <textarea className="ci" rows={2} placeholder="Write a caption…" value={text} onChange={e=>setText(e.target.value)}/>
          <div className="mediapick">
            {SPLATS.map((s,i)=>(<button key={i} className={"mp"+(mediaIx===i?" on":"")} style={{background:s.bg}} onClick={()=>{buzz(4); setMediaIx(i);}}/>))}
          </div>
          <div className="spatialrow">
            <div>
              <div className="sl"><Box size={14}/> Make it spatial</div>
              <div className="ss">Regresses millions of 3D Gaussians from your photo · .spz under 15MB · rendered on-device</div>
            </div>
            <button className={"swtch"+(spatial?" on":"")} style={spatial?{background:accent}:undefined} onClick={()=>{buzz(5); setSpatial(s=>!s);}} aria-label="Toggle spatial"><i/></button>
          </div>
        </>}
        {type==="poll" && <>
          <input className="ci" placeholder="Ask the group something…" value={q} onChange={e=>setQ(e.target.value)}/>
          {opts.map((o,i)=>(<input key={i} className="ci" placeholder={`Option ${i+1}`} value={o} onChange={e=>setOpts(os=>os.map((x,j)=>j===i?e.target.value:x))}/>))}
        </>}
        {type==="reminder" && <>
          <input className="ci" placeholder="What’s happening?" value={rt} onChange={e=>setRt(e.target.value)}/>
          <input className="ci" placeholder="When? e.g. Fri 6pm" value={rw} onChange={e=>setRw(e.target.value)}/>
        </>}
        <div className="shfoot">
          <span className="shnote">encrypted · stays inside your room</span>
          <button className="postbtn" style={{ background:accent, color:onAccent(accent) }} onClick={submit} disabled={!ready}><Send size={14}/> Share</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- join preview ---------------- */
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
        <div className="join-top" style={{ background:bandBg }}>
          <button className="join-close" onClick={onClose}><X size={14}/></button>
        </div>
        <div className="join-body">
          <div className="join-name" style={{ fontFamily:v.nameFont }}>You’re invited to {cfg.name}</div>
          <div className="join-from">{slug}.lattice.space/join?token={token.slice(0,10)}…</div>
          <div className="checks">
            {checks.map((c,i)=>(
              <div key={i} className={"chk"+(step>i?" ok":"")}>
                <span className="cbox">{step>i ? <Check size={13}/> : <Clock size={12}/>}</span>{c.l}
              </div>
            ))}
          </div>
          <button className="join-cta" disabled={step<4}>
            <GoogleMark/> {step<4 ? "Verifying invite…" : "Continue with Google to join"}
          </button>
        </div>
      </div>
    </div>
  );
}
