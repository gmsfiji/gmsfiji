const b=document.querySelector('.menu-btn'),n=document.getElementById('nav'),t=document.querySelector('.top');
b.addEventListener('click',()=>b.setAttribute('aria-expanded',n.classList.toggle('open')));
n.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{n.classList.remove('open');b.setAttribute('aria-expanded','false')}));
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
let tick=false;
function onScroll(){t.classList.toggle('solid',scrollY>60);tick=false}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(onScroll)}},{passive:true});onScroll();
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.15});
document.querySelectorAll('[data-r]').forEach(el=>io.observe(el));

/* ---- Fijian motif fields: motifs drift away from the cursor and settle back ---- */
(()=>{
  const motifs=[...document.querySelectorAll('#motifs symbol')].map(s=>({vb:s.getAttribute('viewBox'),html:s.innerHTML}));
  if(!motifs.length)return;
  const mouse={x:-9999,y:-9999,r:150};
  const setMouse=(x,y)=>{mouse.x=x;mouse.y=y};
  /* phones/tablets: motifs just float on their own; only a real mouse pushes them */
  const touchy=matchMedia('(hover:none), (pointer:coarse)');
  addEventListener('pointermove',e=>{if(e.pointerType==='mouse'&&!touchy.matches)setMouse(e.clientX,e.clientY)},{passive:true});
  document.addEventListener('pointerleave',()=>setMouse(-9999,-9999));

  const fields=[...document.querySelectorAll('[data-field]')].map(host=>{
    const color=host.dataset.color,alpha=+host.dataset.alpha||.15;
    const canvas=document.createElement('canvas');canvas.className='motif-field';canvas.setAttribute('aria-hidden','true');
    host.prepend(canvas);
    const imgs=motifs.map(m=>{const i=new Image();i.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${m.vb}">${m.html.replaceAll('currentColor',color)}</svg>`);return i});
    const f={host,canvas,ctx:canvas.getContext('2d'),imgs,alpha,parts:[],visible:false,w:0,h:0,dpr:1};
    f.build=()=>{
      const r=host.getBoundingClientRect();f.dpr=Math.min(devicePixelRatio||1,2);
      f.w=r.width;f.h=r.height;canvas.width=f.w*f.dpr;canvas.height=f.h*f.dpr;f.ctx.setTransform(f.dpr,0,0,f.dpr,0,0);
      const small=f.w<700,sp=small?118:165,size=small?36:48;f.size=size;f.parts=[];
      let row=0;
      for(let y=sp/2;y<f.h+sp/2;y+=sp,row++){
        let col=0;
        for(let x=(row%2?sp:sp/2);x<f.w+sp/2;x+=sp,col++){
          f.parts.push({x,y,bx:x,by:y,d:Math.random()*20+5,k:(row+col*2)%imgs.length,ph:Math.random()*6.283,sp:.35+Math.random()*.35,am:5+Math.random()*6,rt:(Math.random()-.5)*.35});
        }
      }
      f.draw();
    };
    f.draw=()=>{
      const c=f.ctx,s=f.size;c.clearRect(0,0,f.w,f.h);c.globalAlpha=f.alpha;
      for(const p of f.parts){const im=f.imgs[p.k];if(!(im.complete&&im.naturalWidth))continue;
        if(p.a){c.save();c.translate(p.x,p.y);c.rotate(p.a);c.drawImage(im,-s/2,-s/2,s,s);c.restore()}else c.drawImage(im,p.x-s/2,p.y-s/2,s,s)}
    };
    f.step=()=>{
      const r=f.host.getBoundingClientRect(),mx=mouse.x-r.left,my=mouse.y-r.top,T=performance.now()/1000,float=touchy.matches;
      for(const p of f.parts){
        if(float){ /* gentle ambient drift + slow sway, no interaction */
          p.x=p.bx+Math.sin(T*p.sp+p.ph)*p.am;p.y=p.by+Math.cos(T*p.sp*.8+p.ph)*p.am;p.a=Math.sin(T*p.sp*.7+p.ph)*p.rt;continue;
        }
        const dx=mx-p.x,dy=my-p.y,dist=Math.hypot(dx,dy);
        if(dist<mouse.r){const force=(mouse.r-dist)/mouse.r,a=Math.atan2(dy,dx);p.x-=force*Math.cos(a)*p.d;p.y-=force*Math.sin(a)*p.d}
        else{p.x+=(p.bx-p.x)*.1;p.y+=(p.by-p.y)*.1}
      }
      f.draw();
    };
    return f;
  });

  fields.forEach(f=>{
    const vis=new IntersectionObserver(es=>{f.visible=es[0].isIntersecting;kick()},{rootMargin:'100px'});vis.observe(f.host);
    new ResizeObserver(()=>f.build()).observe(f.host);
    f.imgs.forEach(i=>i.addEventListener('load',()=>f.draw()));
  });

  let running=false;
  function loop(){
    const live=fields.filter(f=>f.visible);
    if(!live.length){running=false;return}
    live.forEach(f=>f.step());requestAnimationFrame(loop);
  }
  function kick(){if(!still&&!running&&fields.some(f=>f.visible)){running=true;requestAnimationFrame(loop)}}
})();

/* ---- dark mode switch ---- */
(()=>{
  const root=document.documentElement,btn=document.querySelector('.theme');if(!btn)return;
  const sync=()=>{const d=root.dataset.theme==='dark';btn.setAttribute('aria-pressed',d);btn.setAttribute('aria-label',d?'Switch to light mode':'Switch to dark mode')};
  sync();
  btn.addEventListener('click',()=>{
    root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
    try{localStorage.setItem('gm-theme',root.dataset.theme)}catch(e){}
    sync();
  });
})();

/* ---- logo: replay the name animation on hover ---- */
(()=>{
  const m=document.querySelector('.mark');if(!m||still)return;
  let busy=false;
  m.addEventListener('mouseenter',()=>{if(busy)return;busy=true;m.classList.remove('play');void m.offsetWidth;m.classList.add('play');setTimeout(()=>busy=false,2200)});
})();

/* ---- contact form: sends in the background and shows our own thank-you ---- */
(()=>{
  const form=document.getElementById('contact-form');if(!form)return;
  const btn=form.querySelector('button[type=submit]'),err=form.querySelector('.form-error'),done=document.querySelector('.sent');
  const label=btn.textContent;
  form.addEventListener('submit',async e=>{
    e.preventDefault();err.hidden=true;
    if(!form.checkValidity()){form.reportValidity();return}
    btn.disabled=true;btn.textContent='Sending\u2026';
    try{
      const r=await fetch(form.action,{method:'POST',body:new FormData(form),headers:{Accept:'application/json'}});
      if(r.ok){form.hidden=true;done.hidden=false;done.focus();form.reset();return}
      let msg='Something went wrong sending that. Please try again.';
      try{const j=await r.json();if(j.errors&&j.errors.length)msg=j.errors.map(x=>x.message).join(' ')}catch(_){}
      throw new Error(msg);
    }catch(x){err.textContent=x.message&&x.message!=='Failed to fetch'?x.message:'We couldn\u2019t send that \u2014 check your connection and try again.';err.hidden=false}
    btn.disabled=false;btn.textContent=label;
  });
})();

/* ---- hero logo tilts toward the cursor ---- */
(()=>{
  const st=document.querySelector('.stage');if(!st||still)return;const hero=st.closest('.hero');
  hero.addEventListener('pointermove',e=>{const r=st.getBoundingClientRect(),x=(e.clientX-(r.left+r.width/2))/innerWidth,y=(e.clientY-(r.top+r.height/2))/innerHeight;
    st.style.setProperty('--ry',(x*26).toFixed(2)+'deg');st.style.setProperty('--rx',(-y*26).toFixed(2)+'deg')},{passive:true});
  hero.addEventListener('pointerleave',()=>{st.style.setProperty('--ry','0deg');st.style.setProperty('--rx','0deg')});
})();


/* ---- micro details: seed spit ---- */
(()=>{
  if(still)return;
  /* seeds pop out of CTAs on hover */
  const last=new WeakMap();
  const spit=el=>{
    const now=performance.now();if(now-(last.get(el)||0)<700||el.disabled)return;last.set(el,now);
    const r=el.getBoundingClientRect(),n=6;
    for(let i=0;i<n;i++){
      const s=document.createElement('i');s.className='seed';
      s.style.left=(r.left+r.width*(.25+Math.random()*.5))+'px';s.style.top=(r.top+r.height*.3)+'px';
      document.body.appendChild(s);
      const dx=(Math.random()-.5)*150,up=60+Math.random()*70,fall=40+Math.random()*50,rot=(Math.random()-.5)*540;
      s.animate([
        {transform:'translate(0,0) scale(.4) rotate(0)',opacity:1,easing:'cubic-bezier(.2,.8,.4,1)'},
        {transform:`translate(${dx*.55}px,${-up}px) scale(1) rotate(${rot*.5}deg)`,opacity:1,offset:.45,easing:'cubic-bezier(.5,0,.9,.6)'},
        {transform:`translate(${dx}px,${fall}px) scale(.9) rotate(${rot}deg)`,opacity:0}
      ],{duration:900+Math.random()*350,delay:i*35,fill:'both'}).onfinish=()=>s.remove();
    }
  };
  document.querySelectorAll('.btn,.cta,nav a,.menu-btn,.theme').forEach(b=>b.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')spit(b)}));

})();


/* ---- the hero melon rolls out of its corner and tumbles down the page as you scroll ---- */
(()=>{
  const st=document.querySelector('.stage'),wrap=st&&st.querySelector('.melon-wrap');
  if(!wrap||still)return;
  const wide=matchMedia('(min-width:901px)');
  const r=document.createElement('div');r.className='roller';r.setAttribute('aria-hidden','true');
  r.innerHTML='<svg viewBox="832 -4 250 222">'+wrap.innerHTML.replace(/\smask="[^"]*"/g,'')+'</svg>';
  document.body.appendChild(r);
  const ease=t=>1-Math.pow(1-t,3),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  let cur=scrollY,run=false;
  function frame(){
    const ty=scrollY;cur+=(ty-cur)*.14;
    if(!wide.matches){wrap.style.opacity='';r.style.opacity=0;run=Math.abs(ty-cur)>.5;if(run)requestAnimationFrame(frame);return}
    const b=st.getBoundingClientRect(),k=b.width/1173.63;
    const sw=250*k,sh=222*k,sx=b.left+957*k,sy=b.top+scrollY+107*k;   // melon centre at scroll 0
    const lift=clamp(cur/150,0,1),t=ease(clamp(cur/720,0,1));
    const xr=innerWidth-58,yr=innerHeight-86;
    const x=sx+(xr-sx)*t+Math.sin(cur/280)*26*t;
    const y=sy+(yr-sy)*t-Math.abs(Math.sin(cur/85))*18*lift;
    const s=1-.55*t,rot=cur*.45;
    r.style.width=sw+'px';
    r.style.transform=`translate(${x-sw/2}px,${y-sh/2}px) rotate(${rot}deg) scale(${s})`;
    r.style.opacity=lift>0.02?1:0;
    wrap.style.opacity=lift>0.02?String(1-lift):'';
    run=Math.abs(ty-cur)>.3;if(run)requestAnimationFrame(frame);
  }
  const kick=()=>{if(!run){run=true;requestAnimationFrame(frame)}};
  addEventListener('scroll',kick,{passive:true});addEventListener('resize',kick);frame();
})();

/* ---- funnel: panel/way links preselect the enquiry form; mobile sticky CTA ---- */
(()=>{
  document.querySelectorAll('.plink[data-pt]').forEach(a=>a.addEventListener('click',()=>{
    const f=document.getElementById('contact-form');if(!f)return;
    const set=(n,v)=>{const s=f.elements[n];if(s&&[...s.options].some(o=>o.text===v))s.value=v};
    set('project_type',a.dataset.pt);set('client_type',a.dataset.ct);
  }));
  const cta=document.querySelector('.sticky-cta'),hero=document.querySelector('.hero'),contact=document.getElementById('contact');
  if(!cta)return;let past=false,atContact=false;
  const upd=()=>cta.classList.toggle('on',past&&!atContact);
  new IntersectionObserver(e=>{past=!e[0].isIntersecting;upd()}).observe(hero);
  new IntersectionObserver(e=>{atContact=e[0].isIntersecting;upd()},{threshold:.15}).observe(contact);
})();

/* ---- marketing pass: sticky phone CTA, "start this" links prefill the form ---- */
(()=>{
  const cta=document.querySelector('.sticky-cta'),hero=document.querySelector('.hero'),contact=document.getElementById('contact');
  if(cta&&hero&&contact){let h=true,c=false;const upd=()=>cta.classList.toggle('show',!h&&!c);
    new IntersectionObserver(e=>{h=e[0].isIntersecting;upd()}).observe(hero);
    new IntersectionObserver(e=>{c=e[0].isIntersecting;upd()},{threshold:.1}).observe(contact);}
  const sel=document.querySelector('select[name=project_type]');
  document.querySelectorAll('.index li').forEach(li=>{
    const name=li.querySelector('h3').textContent.trim();
    const a=document.createElement('a');a.className='go';a.href='#contact';a.textContent='Start this \u2192';
    a.addEventListener('click',()=>{if(sel)[...sel.options].forEach(o=>{if(o.text===name)sel.value=o.text})});
    li.appendChild(a);
  });
})();
