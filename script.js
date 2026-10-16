// clock
function tick(){
  const d=new Date();
  const opts={weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'};
  const s=d.toLocaleString('en-US',opts);
  document.getElementById('menuClock').textContent=s;
  const lt=document.getElementById('localTime');
  if(lt) lt.textContent=d.toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'});
}
setInterval(tick,1000);tick();

// boot
let p=0;const bar=document.getElementById('bootBar');
const iv=setInterval(()=>{p+=Math.random()*28;if(p>=100){p=100;clearInterval(iv);setTimeout(()=>document.getElementById('boot').classList.add('hide'),350)}bar.style.width=p+'%';},180);

// typed roles
const roles=['Full-Stack Developer','React & Next.js Expert','Mobile App Builder','SaaS & MVP Specialist','UI Motion Lover'];
let ri=0,ci=0,del=false;const el=document.getElementById('typed');
(function type(){
  const word=roles[ri];
  el.textContent=word.slice(0,ci);
  if(!del){ci++;if(ci>word.length){del=true;return setTimeout(type,1400)}}
  else{ci--;if(ci===0){del=false;ri=(ri+1)%roles.length}}
  setTimeout(type,del?32:62);
})();

// counters
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(e.isIntersecting){
    e.target.classList.add('in');
    e.target.querySelectorAll('[data-count]').forEach(b=>{
      if(b.dataset.done)return;b.dataset.done=1;
      const target=+b.dataset.count;let cur=0;
      const t=setInterval(()=>{cur+=Math.ceil(target/40);if(cur>=target){cur=target;clearInterval(t)}b.textContent=cur;},40);
    });
  }
}),{threshold:.15});
document.querySelectorAll('.reveal').forEach(x=>io.observe(x));

// dark only — locked
document.documentElement.dataset.theme='dark';
const hireTopBtn=document.getElementById('hireTopBtn');
if(hireTopBtn) hireTopBtn.onclick=()=>document.getElementById('contact').scrollIntoView({behavior:'smooth'});

// window buttons fun — no transform fight with tilt
document.querySelectorAll('.t').forEach(b=>b.onclick=()=>{
  const a=b.dataset.action;const win=b.closest('.window');
  if(a==='close'){win.style.opacity='.4';setTimeout(()=>{win.style.opacity='';},600);}
  if(a==='minimize'){win.style.opacity='.6';setTimeout(()=>win.style.opacity='',450);}
  if(a==='zoom'){document.getElementById('top').scrollIntoView({behavior:'smooth'});}
});

// tilt — smooth, no flick when cursor leaves box
// fix: old code set transform directly on mousemove + cleared on leave → snap/flick.
// new: lerp toward target with rAF, clamp inside card, ease back to 0 on leave.
document.querySelectorAll('[data-tilt]').forEach(card=>{
  let tx=0, ty=0, cx=0, cy=0, raf=null, hovering=false;
  const max=parseFloat(card.dataset.tiltMax || '5'); // hero=5, project=2.5 tipis
  function loop(){
    cx += (tx - cx) * 0.12;
    cy += (ty - cy) * 0.12;
    card.style.transform=`perspective(1200px) rotateX(${cy.toFixed(3)}deg) rotateY(${cx.toFixed(3)}deg)`;
    if(hovering || Math.abs(tx-cx)>0.01 || Math.abs(ty-cy)>0.01){
      raf=requestAnimationFrame(loop);
    }else{
      card.style.transform='';
      raf=null;
    }
  }
  function start(){ if(!raf){ raf=requestAnimationFrame(loop); } }
  card.addEventListener('mouseenter',()=>{ hovering=true; card.classList.add('tilting'); start(); });
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    // clamp 0..1 so fast moves outside don't spike
    const px=Math.min(Math.max((e.clientX-r.left)/r.width,0),1)-.5;
    const py=Math.min(Math.max((e.clientY-r.top)/r.height,0),1)-.5;
    tx=px*max*2; ty=-py*max*2;
    hovering=true; start();
  });
  card.addEventListener('mouseleave',()=>{
    hovering=false; tx=0; ty=0;
    card.classList.remove('tilting'); start();
  });
});

// cursor glow
const glow=document.getElementById('cursorGlow');
addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px';});

// filters — 2-phase (hide first, then show) to avoid All→X layout glitch
let filterToken=0;
document.querySelectorAll('.filter').forEach(f=>f.onclick=()=>{
  document.querySelectorAll('.filter').forEach(x=>x.classList.remove('active'));
  f.classList.add('active');
  const v=f.dataset.filter;
  const my=++filterToken;
  const all=[...document.querySelectorAll('.project')];
  const toShow=all.filter(pr=>(v==='all'||pr.dataset.cat.includes(v)));
  const toHide=all.filter(pr=>!(v==='all'||pr.dataset.cat.includes(v)));
  // phase 1: fade out hidden
  toHide.forEach(pr=>{
    pr.classList.remove('filter-in');
    pr.style.animationDelay='';
    if(pr.style.display!=='none'){
      pr.classList.add('filter-out');
    }
  });
  // if nothing to hide, show immediately
  const hideDelay=toHide.length?240:0;
  setTimeout(()=>{
    if(my!==filterToken)return;
    toHide.forEach(pr=>{pr.style.display='none';pr.classList.remove('filter-out');});
    const empty=document.getElementById('projectEmpty');
    if(empty)empty.hidden=toShow.length>0;
    // phase 2: stagger in shown
    toShow.forEach((pr,i)=>{
      const wasHidden=(pr.style.display==='none'||getComputedStyle(pr).display==='none');
      pr.classList.remove('filter-out','filter-in');
      void pr.offsetWidth;
      pr.style.display='';
      // only animate cards that were hidden OR all for consistent feel, with stagger
      pr.style.animationDelay=(i*70)+'ms';
      pr.classList.add('filter-in');
      setTimeout(()=>{if(my===filterToken){pr.classList.remove('filter-in');pr.style.animationDelay='';}},650+i*70);
    });
  },hideDelay);
});

// contact form — real via Formspree → inbox email
// SETUP: daftar gratis di formspree.io → new form → isi inbox kyyzen123@gmail.com → paste ID-nya di bawah
const FORMSPREE_ID='PASTE_FORMSPREE_ID_HERE';
document.getElementById('contactForm').addEventListener('submit',async e=>{
  e.preventDefault();
  const form=e.target,note=document.getElementById('formNote'),btn=form.querySelector('[type="submit"]');
  if(!FORMSPREE_ID||FORMSPREE_ID.includes('PASTE')){
    note.textContent='⚠ Form belum aktif — sementara hubungi via email / Telegram di samping ya.';
    return;
  }
  btn.disabled=true;const old=btn.textContent;btn.textContent='Sending…';
  try{
    const fd=new FormData(form);
    const res=await fetch('https://formspree.io/f/'+FORMSPREE_ID,{method:'POST',headers:{'Accept':'application/json','Content-Type':'application/json'},body:JSON.stringify({name:fd.get('name'),email:fd.get('email'),message:fd.get('msg')})});
    if(res.ok){note.textContent='✓ Message sent! I’ll reply within 24h — check your inbox.';note.style.color='#34d399';form.reset();}
    else{note.textContent='✕ Gagal terkirim, coba lagi atau hubungi via email/Telegram.';}
  }catch{note.textContent='✕ Koneksi bermasalah — coba lagi atau hubungi via email/Telegram.';}
  btn.disabled=false;btn.textContent=old;
});

// spotlight
const overlay=document.getElementById('spotlightOverlay');
const input=document.getElementById('spotlightInput');
const results=document.getElementById('spotlightResults');
const pages=[
  {n:'🏠 Home / Hero',d:'back to top',t:'#top'},
  {n:'👨‍💻 About me',d:'experience & toolbox',t:'#about'},
  {n:'🛠️ Tech stack',d:'capabilities',t:'#stack'},
  {n:'💼 Selected work',d:'2 projects',t:'#work'},
  {n:'🚀 Services',d:'packages via fiverr',t:'#services'},
  {n:'💎 Work process',d:'how we work',t:'#pricing'},
  {n:'✉️ Contact',d:'hire me',t:'#contact'},
];
function renderSpot(q=''){
  results.innerHTML=pages.filter(p=>(p.n+p.d).toLowerCase().includes(q.toLowerCase()))
    .map(p=>`<div class="spot-item" data-t="${p.t}"><span>${p.n}</span><small style="opacity:.6">${p.d} →</small></div>`).join('')||'<p style="padding:12px;opacity:.6">No results</p>';
  results.querySelectorAll('.spot-item').forEach(s=>s.onclick=()=>{
    document.querySelector(s.dataset.t)?.scrollIntoView({behavior:'smooth'});
    overlay.classList.remove('open');
  });
}
renderSpot();
function openSpot(){overlay.classList.add('open');setTimeout(()=>input.focus(),50);renderSpot();}
const dockSearch=document.getElementById('dockSearch');
if(dockSearch) dockSearch.onclick=e=>{e.preventDefault();openSpot();};
overlay.onclick=e=>{if(e.target===overlay)overlay.classList.remove('open');};
input.oninput=()=>renderSpot(input.value);
addEventListener('keydown',e=>{
  if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.classList.contains('open')?overlay.classList.remove('open'):openSpot();}
  if(e.key==='Escape')overlay.classList.remove('open');
});

// dock terminal toast
const toast=document.getElementById('terminalToast');
document.getElementById('dockTerminal').onclick=e=>{
  e.preventDefault();toast.classList.add('show');
  setTimeout(()=>toast.classList.remove('show'),3200);
};

// testimonials — real via Supabase, empty-state ready
// SETUP: isi 2 konstanta ini dari Supabase Dashboard → Project Settings → API
const SUPABASE_URL='PASTE_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY='PASTE_SUPABASE_ANON_KEY_HERE';
const sb=(window.supabase&&SUPABASE_URL.startsWith('http'))?window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY):null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const initials=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).join('').slice(0,2).toUpperCase();
async function loadTesti(){
  const list=document.getElementById('testiList'),empty=document.getElementById('testiEmpty');
  if(!list)return;
  if(!sb){empty.hidden=false;return;} // belum dikonfigurasi → kosong seperti maumu
  list.innerHTML='<div class="testi glass"><p class="muted">Loading reviews…</p></div>';
  const {data,error}=await sb.from('testimonials').select('name,role,message,rating').eq('status','approved').order('created_at',{ascending:false}).limit(12);
  if(error||!data||!data.length){list.innerHTML='';empty.hidden=false;return;}
  empty.hidden=true;
  // sync hero avg rating with real approved reviews
  const avgEl=document.getElementById('avgRating');
  if(avgEl){
    const rs=data.map(t=>+t.rating||0).filter(r=>r>0);
    avgEl.textContent=rs.length?('★ '+(rs.reduce((a,b)=>a+b,0)/rs.length).toFixed(1)):'☆ 0.0';
  }
  list.innerHTML=data.map(t=>`<div class="testi glass reveal in"><p>“${esc(t.message)}”</p><div class="who"><div class="mini-avatar">${esc(initials(t.name))}</div><div><b>${esc(t.name)}</b><span>${esc(t.role||'Client')}</span></div><span class="stars">${'★'.repeat(Math.min(5,Math.max(1,t.rating||5)))}</span></div></div>`).join('');
}
loadTesti();
// stars picker + submit → status pending (muncul setelah kamu approve di Supabase)
let pickedRating=0;
document.querySelectorAll('#starsInput button').forEach(b=>b.onclick=e=>{
  e.preventDefault();pickedRating=+b.dataset.v;
  document.querySelectorAll('#starsInput button').forEach(x=>x.classList.toggle('on',+x.dataset.v<=pickedRating));
});
const reviewBtn=document.getElementById('reviewBtn'),reviewForm=document.getElementById('reviewForm');
if(reviewBtn)reviewBtn.onclick=()=>{reviewForm.hidden=false;reviewForm.scrollIntoView({behavior:'smooth',block:'center'});};
if(reviewForm)reviewForm.addEventListener('submit',async e=>{
  e.preventDefault();
  const note=document.getElementById('reviewNote');
  const fd=new FormData(reviewForm);
  if(!pickedRating){note.textContent='⚠ Pilih rating bintang dulu ya.';return;}
  if(!sb){note.textContent='⚠ Supabase belum dikonfigurasi — isi SUPABASE_URL/KEY di script.js dulu.';return;}
  note.textContent='Sending…';
  const {error}=await sb.from('testimonials').insert({name:String(fd.get('name')).slice(0,60),role:String(fd.get('role')).slice(0,80),message:String(fd.get('message')).slice(0,500),rating:pickedRating,status:'pending'});
  note.textContent=error?'✕ Gagal: '+error.message:'✓ Thanks! Review masuk moderasi, tampil otomatis setelah di-approve.';
  if(!error){reviewForm.reset();pickedRating=0;document.querySelectorAll('#starsInput button').forEach(x=>x.classList.remove('on'));loadTesti();}
});

// lightbox — single image or gallery (data-gallery="a|b|c" + data-captions="x|y|z")
const lb=document.getElementById('lightbox'),lbImg=document.getElementById('lbImg'),lbTitle=document.getElementById('lbTitle'),lbCap=document.getElementById('lbCap'),lbCount=document.getElementById('lbCount'),lbNav=document.querySelector('.lb-nav');
let lbItems=[],lbIdx=0;
function showLB(i){
  if(!lbItems.length)return;
  lbIdx=(i+lbItems.length)%lbItems.length;
  lbImg.src=lbItems[lbIdx].src;
  lbCap.textContent=lbItems[lbIdx].cap||('Shot '+(lbIdx+1)+' of '+lbItems.length);
  lbCount.textContent=(lbIdx+1)+'/'+lbItems.length;
  lbNav.classList.toggle('single',lbItems.length<2);
}
function openTrigger(t){
  const title=t.dataset.title||'Preview';
  lbTitle.textContent=title;
  if(t.dataset.gallery){
    const srcs=t.dataset.gallery.split('|').map(s=>s.trim()).filter(Boolean);
    const caps=(t.dataset.captions||'').split('|').map(s=>s.trim());
    lbItems=srcs.map((src,i)=>({src,cap:caps[i]||''}));
  }else{
    lbItems=[{src:t.dataset.full||t.querySelector('img')?.src||'',cap:''}];
  }
  lb.hidden=false;document.body.style.overflow='hidden';showLB(0);
}
function closeLB(){lb.hidden=true;lbImg.src='';lbItems=[];document.body.style.overflow='';}
document.querySelectorAll('.lb-trigger').forEach(t=>{
  t.addEventListener('click',()=>openTrigger(t));
  t.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openTrigger(t);}});
});
document.getElementById('lbClose').onclick=closeLB;
document.getElementById('lbPrev').onclick=e=>{e.stopPropagation();showLB(lbIdx-1);};
document.getElementById('lbNext').onclick=e=>{e.stopPropagation();showLB(lbIdx+1);};
lb.addEventListener('click',e=>{if(e.target===lb)closeLB();});
addEventListener('keydown',e=>{
  if(lb.hidden)return;
  if(e.key==='Escape')closeLB();
  if(e.key==='ArrowLeft')showLB(lbIdx-1);
  if(e.key==='ArrowRight')showLB(lbIdx+1);
});
