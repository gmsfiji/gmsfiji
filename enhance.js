/* Greenmelons — interaction & animation upgrade pass.
   Additive only: everything disables itself under prefers-reduced-motion
   and on coarse-pointer (touch) devices. */
(()=>{
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

/* 1. scroll progress bar */
const bar=document.createElement('div');bar.className='gm-progress';bar.setAttribute('aria-hidden','true');document.body.appendChild(bar);
let tb=false;
const updBar=()=>{const h=document.documentElement,max=h.scrollHeight-innerHeight;bar.style.transform='scaleX('+(max>0?scrollY/max:0)+')';tb=false};
addEventListener('scroll',()=>{if(!tb){tb=true;requestAnimationFrame(updBar)}},{passive:true});updBar();

/* 2. back to top */
const tt=document.createElement('button');tt.type='button';tt.className='to-top';tt.setAttribute('aria-label','Back to top');
tt.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 5l-7 7 1.4 1.4L11 8.8V19h2V8.8l4.6 4.6L19 12z"/></svg>';
document.body.appendChild(tt);
tt.addEventListener('click',()=>scrollTo({top:0,behavior:still?'auto':'smooth'}));
let ttb=false;
const updTT=()=>{tt.classList.toggle('show',scrollY>900);ttb=false};
addEventListener('scroll',()=>{if(!ttb){ttb=true;requestAnimationFrame(updTT)}},{passive:true});updTT();

/* 3. auto-stagger reveal delays among siblings (existing CSS reads --i) */
const groups=new Map();
document.querySelectorAll('[data-r]').forEach(elm=>{const p=elm.parentElement;const g=groups.get(p)||[];g.push(elm);groups.set(p,g)});
groups.forEach(g=>g.forEach((elm,i)=>elm.style.setProperty('--i',Math.min(i,6))));

/* 4. tour button attention pulse (stops the moment the tour opens) */
const fab=document.querySelector('.tour-fab');
if(fab&&!still){
 const arm=()=>setTimeout(()=>{if(!document.body.classList.contains('touring'))fab.classList.add('attn')},3200);
 if(document.readyState==='complete')arm();else addEventListener('load',arm);
 addEventListener('gm:tour',()=>fab.classList.remove('attn'));
 fab.addEventListener('click',()=>fab.classList.remove('attn'));
}

/* 5. generic count-up for any [data-count] element */
document.querySelectorAll('[data-count]').forEach(elm=>{
 const end=parseFloat(elm.dataset.count),suf=elm.dataset.suffix||'';
 const io=new IntersectionObserver(es=>{if(!es[0].isIntersecting)return;io.disconnect();
  if(still){elm.textContent=end+suf;return}
  const t0=performance.now(),D=1400;
  (function f(t){const p=Math.min(1,(t-t0)/D),e=1-Math.pow(1-p,3);elm.textContent=Math.round(end*e)+suf;if(p<1)requestAnimationFrame(f)})(t0);
 },{threshold:.5});io.observe(elm);
});

/* 6. magnetic buttons + tilt cards + cursor glow (desktop, motion-safe only) */
if(fine&&!still){
 /* spotlight glow follows the pointer */
 const glow=document.createElement('div');glow.className='gm-glow';glow.setAttribute('aria-hidden','true');/* cursor glow removed */
 let gx=innerWidth/2,gy=innerHeight/2,tx=gx,ty=gy,gRun=false;
 const gStep=()=>{gx+=(tx-gx)*.09;gy+=(ty-gy)*.09;glow.style.transform='translate('+(gx-260)+'px,'+(gy-260)+'px)';if(Math.abs(tx-gx)>.4||Math.abs(ty-gy)>.4)requestAnimationFrame(gStep);else gRun=false};
 addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;if(!gRun){gRun=true;requestAnimationFrame(gStep)}},{passive:true});

 const mag=new Map(),tilt=new Map();
 document.querySelectorAll('.btn,.cta,.tour-fab,.theme,.menu-btn').forEach(m=>{
  m.addEventListener('pointerenter',()=>mag.set(m,{x:0,y:0,tx:0,ty:0}));
  m.addEventListener('pointermove',e=>{const r=m.getBoundingClientRect(),it=mag.get(m);if(!it)return;it.tx=(e.clientX-(r.left+r.width/2))*.16;it.ty=(e.clientY-(r.top+r.height/2))*.2});
  m.addEventListener('pointerleave',()=>{const it=mag.get(m);if(it){it.tx=0;it.ty=0}});
 });
 document.querySelectorAll('.p,.ways article').forEach(c=>{
  c.addEventListener('pointerenter',()=>tilt.set(c,{rx:0,ry:0,trx:0,try:0,hov:1}));
  c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect(),it=tilt.get(c);if(!it)return;
   const px=(e.clientX-r.left)/r.width-.5,py=(e.clientY-r.top)/r.height-.5;
   it.try=px*6;it.trx=-py*6;c.style.setProperty('--gx',(px*100+50)+'%');c.style.setProperty('--gy',(py*100+50)+'%')});
  c.addEventListener('pointerleave',()=>{const it=tilt.get(c);if(it){it.trx=0;it.try=0;it.hov=0}});
 });
 let run=false;
 const step=()=>{
  let live=false;
  mag.forEach((it,m)=>{it.x+=(it.tx-it.x)*.18;it.y+=(it.ty-it.y)*.18;
   if(Math.abs(it.x)>.05||Math.abs(it.y)>.05||it.tx||it.ty){m.style.translate=it.x.toFixed(1)+'px '+it.y.toFixed(1)+'px';live=true}else if(m.style.translate){m.style.translate=''}});
  tilt.forEach((it,c)=>{it.rx+=(it.trx-it.rx)*.12;it.ry+=(it.try-it.ry)*.12;
   if(Math.abs(it.rx)>.02||Math.abs(it.ry)>.02||it.hov){c.style.transform='perspective(900px) rotateX('+it.rx.toFixed(2)+'deg) rotateY('+it.ry.toFixed(2)+'deg)';c.classList.toggle('glare',it.hov===1);live=true}
   else{c.style.transform='';c.classList.remove('glare');tilt.delete(c)}});
  if(live)requestAnimationFrame(step);else run=false;
 };
 const kick=()=>{if(!run){run=true;requestAnimationFrame(step)}};
 addEventListener('pointermove',kick,{passive:true});
}
})();
