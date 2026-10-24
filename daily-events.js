/* AETHER daily editorial runtime. Separate from main site's 51-day progress. No external APIs. */
(()=>{
"use strict";
const STORE="aether-editorial-v1";
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE)||"{}")||{}}catch{}
const packs=(window.AETHER_DAILY_PACKS||[]).filter((p,i,a)=>p&&p.id&&a.findIndex(q=>q.id===p.id)===i).sort((a,b)=>a.id.localeCompare(b.id));
const E=window.AETHER_ED={
 packs,escape:esc,answers:saved.answers&&typeof saved.answers==="object"?saved.answers:{},
 selected:packs.some(p=>p.id===saved.selected)?saved.selected:(packs.at(-1)?.id||""),
 voice:typeof saved.voice==="string"?saved.voice:"",transcript:!!saved.transcript,
 render:null
};
const save=()=>{try{localStorage.setItem(STORE,JSON.stringify({selected:E.selected,voice:E.voice,transcript:E.transcript,answers:E.answers}))}catch{}};
function show(message){let n=document.getElementById("daily-toast");if(!n){n=document.createElement("div");n.id="daily-toast";n.setAttribute("role","status");document.body.appendChild(n)}n.textContent=message;n.classList.add("show");clearTimeout(show.timer);show.timer=setTimeout(()=>n.classList.remove("show"),3500)}
function speak(sentence){
 if(!("speechSynthesis" in window)||!window.SpeechSynthesisUtterance){show("当前浏览器不支持系统语音朗读，请使用 Safari 或 Chrome。");return}
 try{
 const synth=window.speechSynthesis;
 synth.cancel();
 const u=new SpeechSynthesisUtterance(sentence);u.lang="en-US";u.rate=0.88;u.pitch=1;
 const vs=synth.getVoices().filter(v=>v.lang?.toLowerCase().replace("_","-").startsWith("en-us"));
 const chosen=vs.find(v=>v.voiceURI===E.voice)||vs.find(v=>v.localService)||vs[0];
 if(chosen)u.voice=chosen;
 u.onerror=e=>{if(e.error!=="interrupted"&&e.error!=="canceled")show("朗读未成功，请再点击一次或在声线菜单切换。")};
 synth.speak(u);
 if(synth.paused)synth.resume();
 }catch{show("系统语音暂不可用，请重试。")}
}
document.addEventListener("click",e=>{
 const btn=e.target.closest("button");if(!btn)return;
 if(btn.hasAttribute("data-say")){speak(btn.dataset.say);return}
 if(btn.hasAttribute("data-pack")){E.selected=btn.dataset.pack;E.transcript=false;save();E.render?.();window.scrollTo({top:0,behavior:"instant"});return}
 if(btn.hasAttribute("data-q")){
 const p=E.packs.find(x=>x.id===E.selected)||E.packs.at(-1);if(!p)return;
 const type=btn.dataset.q,i=Number(btn.dataset.i),choice=Number(btn.dataset.c);
 const q=(type==="g"?p.quiz:p.listeningQuestions)?.[i];
 if(!q||!Number.isInteger(choice)||choice<0||choice>=q[1].length)return;
 const key=p.id+type+i;if(Object.prototype.hasOwnProperty.call(E.answers,key))return;
 E.answers[key]=choice;save();E.render?.();return;
 }
 if(btn.id==="show"){E.transcript=!E.transcript;save();E.render?.();return}
 if(btn.id==="reset"){
 const prefix=E.selected;for(const key of Object.keys(E.answers))if(key.startsWith(prefix+"g")||key.startsWith(prefix+"l"))delete E.answers[key];
 save();E.render?.();show("本课练习已重置；其他日期的答案保留。");
 }
});
document.addEventListener("change",e=>{if(e.target.id==="voice"){E.voice=e.target.value;save();show("已切换声线，下一次点击朗读生效。")}});
if("speechSynthesis" in window){
 window.speechSynthesis.getVoices();
 window.speechSynthesis.addEventListener?.("voiceschanged",()=>{if(document.getElementById("voice")&&document.getElementById("voice").options.length<=1)E.render?.()});
}
const style=document.createElement("style");style.textContent=`
:root{font-family:system-ui,-apple-system,"PingFang SC",sans-serif;color-scheme:dark;--bg:#090c14;--panel:#181d2b;--panel2:#202636;--line:#34394b;--text:#f5f3f0;--sub:#b4b8c6;--accent:#e0c49c}
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;min-width:320px;background:radial-gradient(ellipse at 75% 0%,#242137 0%,transparent 45%),var(--bg);color:var(--text)}
#app{max-width:1050px;margin:0 auto;padding:36px clamp(16px,4vw,42px) 90px}
h1{font-size:clamp(29px,5vw,51px);line-height:1.13;letter-spacing:-.045em;margin:18px 0}h2{font-size:clamp(22px,3vw,30px);margin:0 0 20px;letter-spacing:-.025em}h3{font-size:20px;margin:0 0 9px}small{font-size:12px;color:var(--accent);font-weight:500}
p{line-height:1.75;margin:8px 0}.muted{color:var(--sub);font-size:14px}b{font-weight:650}section{margin-top:25px;background:#151927cf;border:1px solid var(--line);border-radius:20px;padding:clamp(17px,3vw,29px)}
.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(235px,1fr));gap:12px}.item{padding:18px;background:var(--panel);border:1px solid var(--line);border-radius:13px;margin:11px 0;min-width:0}
.grid .item{margin:0}.row{display:flex;flex-wrap:wrap;gap:9px;align-items:center}
button,select{font:inherit;border:1px solid #525366;border-radius:10px;padding:10px 14px;background:var(--panel2);color:var(--text);cursor:pointer;min-height:42px;max-width:100%;overflow-wrap:anywhere}
button:hover{border-color:var(--accent)}button:focus-visible,select:focus-visible,a:focus-visible{outline:2px solid var(--accent);outline-offset:3px}
button.good{border-color:#70c29c;background:#1e4539}button:disabled{opacity:.75;cursor:default}button[data-say]{margin:9px 8px 0 0;border-color:#807258;color:#f0d3aa}
label{display:block;margin:18px 0;color:var(--sub);font-size:13px}select{display:block;margin-top:8px;width:min(100%,400px)}
ol{line-height:2;padding-left:22px}#daily-toast{position:fixed;left:50%;bottom:25px;transform:translate(-50%,20px);opacity:0;transition:.25s;pointer-events:none;background:#f4e2c5;color:#222;border-radius:12px;padding:12px 18px;z-index:50;max-width:90vw}#daily-toast.show{opacity:1;transform:translate(-50%,0)}
@media(prefers-color-scheme:light){:root{color-scheme:light;--bg:#f3f1ed;--panel:#fff;--panel2:#eee9e2;--line:#d9d2c9;--text:#252734;--sub:#646a76;--accent:#825d33}body{background:radial-gradient(ellipse at 70% 0%,#e4dfd8,transparent 50%),var(--bg)}section{background:#f9f7f3}button[data-say]{color:#73542f}}
@media(max-width:600px){#app{padding-top:24px}section{border-radius:16px}.grid{grid-template-columns:1fr}.item{padding:15px}}
`;document.head.appendChild(style);
document.addEventListener("DOMContentLoaded",()=>{if(typeof E.render==="function")E.render();else show("课程渲染脚本未加载，请刷新页面。")},{once:true});
})();