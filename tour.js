/* Greenmelons Guided Pitch — humanized voice edition.
   Optional, starts only on a tap. Uses prerecorded audio in /audio if present,
   otherwise the most natural browser voice, with prosody variation and
   karaoke captions so the narration feels like a real person. */
(()=>{
const SPEED=1.12,/* narration speed: 1 = normal, higher = faster */SS=window.speechSynthesis,still=matchMedia('(prefers-reduced-motion: reduce)').matches,onAgency=!!document.getElementById('agency-brief'),KEY='gm-tour-state',PAGE=onAgency?'agency':'home',TAP='Tap anywhere to turn the sound on.';
const SCRIPT={
intro:['','Hey, welcome to Greenmelons. Fresh minds, serious creative. We help businesses and marketing agencies turn ideas into finished work \u2014 without the extra overhead of building a bigger team. Whether you need creative support for your own marketing, or an extra pair of hands behind the scenes, we\u2019re here to help you get the work done. So, let\u2019s start with one question. Are you here as a business, or are you an agency?'],
b1:['#value','Here\u2019s the thing. Marketing teams are busy, and the work never really slows down. Greenmelons gives you more creative capacity to get things done, without hiring for every new requirement.'],
b2:['#for','Think of us as your creative department. Your marketing, our creative department. We work alongside your team, so your projects keep moving.'],
b3:['#services','Here\u2019s what we can take on. Campaign creative, social and digital content, sales and marketing collateral, brand identity, website design, and campaign planning. The scope of every project is agreed with you up front.'],
b4:['#how','And here\u2019s how it works. You brief us. We plan the work together, agreeing scope, timeline and pricing. Then we create, with agreed feedback rounds, and deliver files that are ready to use.'],
b5:['#support','Need more than a one-off project? We can also talk about ongoing creative support, with scope and fees agreed in advance. Your team doesn\u2019t have to do it all.'],
b6:['#contact','Got a project in mind? Let\u2019s make something happen. Send us a brief, and we\u2019ll come back to you by email.'],
a1:['#value','When briefs stack up and deadlines get tight, extra capacity makes all the difference. We give agencies additional production capacity, without growing permanent headcount.'],
a2:['#for','You win the work. We\u2019ll help you deliver. We can work behind the scenes, white-label where needed, with confidentiality and arrangements agreed for each engagement.'],
a3:['#support','That could be a single project, or recurring support, with scope and fees agreed in advance. Our agency page has the full detail.'],
a4:['#how','The process is simple. You brief us, we plan the work together, we create and refine through agreed feedback rounds, and we hand over files ready for your workflow. Got a brief? Let\u2019s make something happen.'],
g1:['#top-hero','You win the work. We\u2019ll help you deliver. Greenmelons is a flexible creative partner for agencies that need extra hands, production support, or a reliable extension of their team.'],
g2:['.make','Here\u2019s what we can support. White-label creative, overflow capacity, campaign adaptations and rollouts, and digital and print collateral. We work within your workflow, and never compete for your client relationships.'],
g3:['.process','The process is simple. You send the brief, we plan the work together, we create and refine through agreed feedback rounds, and we hand over files ready for your workflow.'],
g4:['.ways','We can work project by project, or on an ongoing basis. Tell us how often and how much you need, and we\u2019ll propose an arrangement.'],
g5:['#agency-brief','Ready when you are. Got a brief? Let\u2019s make something happen. Send us an agency brief, and we\u2019ll come back to you by email.']};
const ROUTES={business:['b1','b2','b3','b4','b5','b6'],agency:onAgency?['g1','g2','g3','g4','g5']:['a1','a2','a3','a4']};
const NAMES={intro:'Welcome',b1:'The challenge',b2:'Your creative department',b3:'Services',b4:'How we work',b5:'Ongoing support',b6:'Send a brief',a1:'The challenge',a2:'Working behind the scenes',a3:'Ongoing support',a4:'How we work',g1:'Agency partnerships',g2:'What we support',g3:'How we work',g4:'Ways to work',g5:'Send an agency brief'};
let S=null,tok=0,voice=null,FILES=false,hl=null;
const track=(n,d)=>{try{(window.dataLayer=window.dataLayer||[]).push(Object.assign({event:'gm_tour_'+n},d||{}));dispatchEvent(new CustomEvent('gm:tour',{detail:Object.assign({name:n},d||{})}))}catch(e){}};
const save=o=>{try{if(o)sessionStorage.setItem(KEY,JSON.stringify(o));else if(S)sessionStorage.setItem(KEY,JSON.stringify({aud:S.aud,page:PAGE,i:S.i,muted:!!S.muted,paused:!!S.paused}))}catch(e){}};
const wipe=()=>{try{sessionStorage.removeItem(KEY)}catch(e){}};
const ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M3 9v6h4l5 4V5L7 9H3zm13.5 3a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4zM14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6z"/></svg>';
/* --- voice choice: hunt for neural / natural voices, ban robotic ones --- */
const score=v=>{const n=(v.name+' '+v.lang).toLowerCase();if(!/^en/.test(v.lang))return-999;let s=0;
 if(/natural|neural|online/.test(n))s+=120;if(/premium|enhanced|generative/.test(n))s+=90;
 if(/microsoft/.test(n))s+=45;if(/google/.test(n))s+=35;if(/apple|siri/.test(n))s+=30;
 if(/en-(au|nz)/.test(v.lang))s+=12;if(/en-(gb|us)/.test(v.lang))s+=8;
 if(/female|samantha|ava|aria|jenny|sonia|natasha|libby|zoe|karen|moira|serena|allison|catherine|hazel|susan|clara|kate|stephanie|michelle/.test(n))s+=15;
 if(/male|david|mark|guy|daniel|ryan|george|james|christopher/.test(n))s+=5;
 if(/compact|espeak|sapi|fred|albert|bad news|bells|boing|cellos|good news|jester|organ|superstar|trinoids|whisper|zarvox|bubbles|hysterical|junior|ralph|kathy|princess/.test(n))s-=200;return s};
const pickVoice=()=>{if(!SS)return;voice=SS.getVoices().map(v=>[score(v),v]).sort((a,b)=>b[0]-a[0]).map(x=>x[1])[0]||null};
if(SS){pickVoice();SS.onvoiceschanged=pickVoice}
/* wake the speech engine on the first real gesture so the first word never gets clipped */
let woke=false;
const wake=()=>{if(woke||!SS)return;woke=true;try{const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.rate=2;SS.speak(u)}catch(e){}};
addEventListener('pointerdown',wake,{once:true,capture:true});addEventListener('keydown',wake,{once:true,capture:true});
/* --- human prosody: deterministic per-line jitter so pause/replay stays consistent --- */
const rng=seed=>{let a=seed;return()=>{a=(a*1664525+1013904223)>>>0;return a/4294967296}};
const seedOf=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
function prosody(text,seed){
 const r=rng(seed),sents=text.match(/[^.!?]+[.!?]+/g)||[text];
 return sents.map(t=>{const q=/\?\s*$/.test(t),x=/!\s*$/.test(t);
  return{text:t.trim(),rate:SPEED+(r()-.5)*.06,pitch:1+(r()-.5)*.05+(q?.07:0)+(x?.05:0)}})}
/* --- background instrumental: modern, energetic dance-pop groove, generated live (Web Audio, no files).
   Four-on-the-floor kick, claps, off-beat hats, pumping synth stabs, rolling bass and a bright arp hook.
   Drop audio/music.mp3 in to use your own track instead. Ducks under the voice,
   follows pause / sound-off, and only ever starts from the Start Tour tap. --- */
const MUS=(()=>{
 const FULL=.9,DUCK=.38,FILEV=.22;
 let ctx=null,master=null,bus=null,noise=null,timer=0,next=0,bar=0,playing=false,fileA=null,useFile=false,target=0,susp=0;
 const hz=m=>440*Math.pow(2,(m-69)/12);
 /* C - G - Am - F */
 const CH=[[60,64,67],[59,62,67],[60,64,69],[60,65,69]],ROOT=[48,43,45,41];
 const ARP=[0,1,2,3,4,3,2,1,0,2,4,2,3,1,2,4],STAB=[0,3,6,10,12];
 const BPM=122,S16=60/BPM/4,BAR=S16*16;
 function build(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  ctx=new AC();master=ctx.createGain();master.gain.value=0;
  const lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=9000;
  const comp=ctx.createDynamicsCompressor();
  bus=ctx.createGain();bus.gain.value=1;                       /* sidechain "pump" bus for melodic parts */
  const dl=ctx.createDelay(1.5);dl.delayTime.value=S16*3;const fb=ctx.createGain();fb.gain.value=.32;const wet=ctx.createGain();wet.gain.value=.3;
  dl.connect(fb);fb.connect(dl);dl.connect(wet);
  bus.connect(lp);bus.connect(dl);wet.connect(lp);lp.connect(master);master.connect(comp);comp.connect(ctx.destination);
  ctx.__dry=lp;ctx.__send=dl;
  const len=ctx.sampleRate;noise=ctx.createBuffer(1,len,ctx.sampleRate);const d=noise.getChannelData(0);for(let i=0;i<len;i++)d[i]=Math.random()*2-1;
  return true;
 }
 const env=(g,t,peak,att,dec)=>{g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(peak,t+att);g.gain.exponentialRampToValueAtTime(.0005,t+att+dec)};
 function kick(t){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.setValueAtTime(165,t);o.frequency.exponentialRampToValueAtTime(46,t+.11);
  env(g,t,.62,.003,.34);o.connect(g);g.connect(ctx.__dry);o.start(t);o.stop(t+.4);
  bus.gain.setValueAtTime(.2,t);bus.gain.linearRampToValueAtTime(1,t+S16*3.2);   /* pump */
 }
 function nz(t,type,freq,q,peak,dec,out){
  const n=ctx.createBufferSource(),f=ctx.createBiquadFilter(),g=ctx.createGain();n.buffer=noise;f.type=type;f.frequency.value=freq;f.Q.value=q;
  env(g,t,peak,.002,dec);n.connect(f);f.connect(g);g.connect(out||ctx.__dry);n.start(t,Math.random()*.5);n.stop(t+dec+.05);
 }
 const clap=t=>{nz(t,'bandpass',1600,.9,.2,.14);nz(t+.012,'bandpass',2200,.9,.12,.1)};
 const hat=(t,open,p)=>nz(t,'highpass',7500,.7,p,open?.11:.04);
 function saw(m,t,dur,peak,cut,det,out){
  const g=ctx.createGain(),f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(cut,t);f.frequency.exponentialRampToValueAtTime(Math.max(300,cut*.35),t+dur);
  det.forEach(d=>{const o=ctx.createOscillator();o.type='sawtooth';o.frequency.value=hz(m);o.detune.value=d;o.connect(f);o.start(t);o.stop(t+dur+.05)});
  env(g,t,peak,.004,dur);f.connect(g);g.connect(out);return g;
 }
 function pluck(m,t,peak,send){
  const g=ctx.createGain(),o=ctx.createOscillator(),o2=ctx.createOscillator();o.type='square';o2.type='triangle';o.frequency.value=o2.frequency.value=hz(m);
  const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(5000,t);f.frequency.exponentialRampToValueAtTime(1200,t+.16);
  o.connect(f);o2.connect(f);env(g,t,peak,.003,.2);f.connect(g);g.connect(bus);o.start(t);o2.start(t);o.stop(t+.25);o2.stop(t+.25);
 }
 function sched(){
  if(!ctx||useFile)return;
  while(next<ctx.currentTime+1.2){
   const k=bar%4,c=CH[k],t0=next;
   for(let i=0;i<16;i++){
    const t=t0+i*S16;
    if(i%4===0)kick(t);
    if(bar>=1&&(i===4||i===12))clap(t);
    if(i%4===2)hat(t,true,.07);else if(i%2===0&&bar>=1)hat(t,false,.025);else if(i%2===1)hat(t,false,.012);
    if(bar>=1&&i%4===2)saw(ROOT[k]+(i===14&&k%2?12:0),t,S16*3.4,.17,700,[-6,6],bus);
    if(STAB.includes(i))c.forEach(m=>saw(m,t,S16*1.9,.034,3200,[-9,0,9],bus));
    if(bar>=2){const a=[c[0]+12,c[1]+12,c[2]+12,c[0]+24,c[1]+24][ARP[i]];pluck(a,t,i%4===0?.05:.034)}
   }
   next+=BAR;bar++;
  }
 }
 function level(v){
  target=v;
  if(useFile){if(fileA){if(v>0){fileA.volume=Math.min(1,FILEV*v);if(fileA.paused)fileA.play().catch(()=>{})}else fileA.pause()}return}
  if(!ctx)return;
  clearTimeout(susp);
  if(v>0){if(ctx.state==='suspended')ctx.resume();master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(v,ctx.currentTime,.4)}
  else{master.gain.cancelScheduledValues(ctx.currentTime);master.gain.setTargetAtTime(0,ctx.currentTime,.3);susp=setTimeout(()=>{if(target===0&&ctx&&ctx.state==='running')ctx.suspend()},1800)}
 }
 return{
  start(){
   if(playing){return}
   playing=true;
   if(!ctx&&!build()){playing=false;return}
   if(ctx.state==='suspended')ctx.resume();
   if(!timer){next=ctx.currentTime+.15;timer=setInterval(sched,300);sched()}
  },
  useTrack(){
   if(useFile||!playing)return;useFile=true;
   fileA=new Audio('audio/music.mp3');fileA.loop=true;fileA.volume=0;
   if(ctx)master.gain.setTargetAtTime(0,ctx.currentTime,.4);
   this.sync();
  },
  unlock(){if(ctx&&ctx.state==='suspended'&&target>0)ctx.resume()},
  blocked(){return playing&&!useFile&&!!ctx&&ctx.state==='suspended'&&target>0},
  sync(){
   if(!playing)return;
   const live=S&&!S.paused&&!S.muted;
   level(live?(el.classList.contains('speaking')?DUCK:FULL):0);
  }
 };
})();
/* --- UI shell --- */
const fab=document.createElement('button');fab.type='button';fab.className='tour-fab';fab.innerHTML=ICON+'<span>Meet Greenmelons</span>';document.body.appendChild(fab);
const el=document.createElement('div');el.className='tour';el.hidden=true;el.setAttribute('role','region');el.setAttribute('aria-label','Greenmelons guided tour');document.body.appendChild(el);
new MutationObserver(()=>MUS.sync()).observe(el,{attributes:true,attributeFilter:['class']});
function show(h,focus){const fa=!focus&&el.contains(document.activeElement)?document.activeElement.dataset.a:null;el.hidden=false;el.innerHTML=h;document.body.classList.add('touring');MUS.sync();const t=focus?el.querySelector('button,a'):fa&&el.querySelector('[data-a="'+fa+'"]');if(t)t.focus()}
function setHl(sel){if(hl)hl.classList.remove('tour-hl');hl=sel?document.querySelector(sel):null;if(hl)hl.classList.add('tour-hl')}
function stopAudio(){tok++;el.classList.remove('speaking');if(SS)SS.cancel();if(S&&S.audio){S.audio.pause()}if(S&&S.timer){clearTimeout(S.timer);S.timer=0}}
function close(why){wipe();stopAudio();if(S&&why)track(why,{step:S.ids&&S.ids[S.i]});S=null;setHl(null);el.hidden=true;document.body.classList.remove('touring');MUS.sync()}
const note='<p class="t-note">'+ICON+'<span>Your Greenmelons tour is ready. <b>Turn up your volume</b> and let us show you what we can do.</span></p>';
function offer(aud){show('<h2>Meet Greenmelons</h2>'+note+'<div class="t-row"><button type="button" class="btn lime" data-a="start"'+(aud?' data-aud="'+aud+'"':'')+'>Start Tour</button><button type="button" class="t-link" data-a="dismiss">Not now</button></div>',1)}
function ask(){S.ask=1;save();show('<h2>First, tell us what brings you here.</h2><div class="t-row col"><button type="button" class="btn lime" data-a="business">I\u2019m a Business</button><button type="button" class="btn lime" data-a="agency">I\u2019m an Agency</button></div><button type="button" class="t-link" data-a="exit">Exit tour</button>',1)}
const capWords=id=>SCRIPT[id][1].split(/\s+/).map(w=>'<span class="w">'+w+'</span>').join(' ');
function render(){
  save();
  const id=S.ids[S.i],n=S.ids.length,pct=Math.round((S.i+(S.paused?0:.4))/n*100);
  const wave='<span class="t-wave" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span>';
  show('<div class="t-top"><span class="t-live">'+wave+ICON+'<span>'+(S.paused?'Paused':'Now showing')+': <b>'+NAMES[id]+'</b></span></span><button type="button" class="t-ic" data-a="mute" aria-pressed="'+S.muted+'">'+(S.muted?'Sound off':'Sound on')+'</button><button type="button" class="t-ic" data-a="exit" aria-label="Exit tour">Exit</button></div><p class="t-cap">'+capWords(id)+'</p>'+(S.note?'<p class="t-small">'+S.note+'</p>':'')+'<div class="t-bar" role="progressbar" aria-valuemin="0" aria-valuemax="'+n+'" aria-valuenow="'+(S.i+1)+'" aria-label="Tour progress"><i style="width:'+pct+'%"></i></div><div class="t-row"><button type="button" class="btn lime" data-a="'+(S.paused?'play':'pause')+'">'+(S.paused?'Play':'Pause')+'</button><button type="button" class="btn ghost" data-a="next">Skip</button><span class="t-count">'+(S.i+1)+' of '+n+'</span></div>');
}
/* --- karaoke: light words up as they're spoken (approximate, cancels cleanly) --- */
function karaoke(id,my){
 if(still)return;
 const spans=el.querySelectorAll('.t-cap .w');if(!spans.length)return;
 const parts=prosody(SCRIPT[id][1],seedOf(id));let idx=0,t=420;
 parts.forEach(p=>{
  const ws=p.text.split(/\s+/).filter(Boolean),n=ws.length;
  const ms=Math.max(850,p.text.length*66/p.rate),per=ms/Math.max(1,n);
  for(let k=0;k<n;k++){const j=idx++;
   setTimeout(()=>{if(my!==tok||!S)return;for(let m=0;m<=j&&m<spans.length;m++)spans[m].classList.add('on')},Math.round(t+k*per))}
  t+=ms+200;
 });
}
/* --- narration --- */
function after(my,id){if(my!==tok)return;el.classList.remove('speaking');if(id==='intro'&&!S.route){ask();return}setTimeout(()=>{if(my===tok&&!S.paused)go(S.i+1)},600)}
function speakLine(id,my,done){
 if(!SS){S.note='Voice isn\u2019t available in this browser. Captions only.';render();S.timer=setTimeout(done,Math.max(4500,SCRIPT[id][1].length*62));return}
 const parts=prosody(SCRIPT[id][1],seedOf(id));let i=0;
 el.classList.add('speaking');
 (function next(){
  if(my!==tok)return;
  if(i>=parts.length){el.classList.remove('speaking');done();return}
  const p=parts[i++];
  const u=new SpeechSynthesisUtterance(p.text);u.lang='en';if(voice)u.voice=voice;u.rate=p.rate;u.pitch=p.pitch;
  u.onend=()=>{if(my!==tok)return;setTimeout(next,200)};
  u.onerror=ev=>{if(my!==tok||(ev&&/canceled|interrupted/.test(ev.error)))return;el.classList.remove('speaking');if(ev&&ev.error==='not-allowed'){S.blocked=1;S.note=TAP;render();return}S.note='Voice unavailable right now. Captions only.';render();S.timer=setTimeout(done,Math.max(4500,SCRIPT[id][1].length*62))};
  SS.speak(u);
 })();
}
function narrate(id,my){
 const text=SCRIPT[id][1];
 const timed=()=>{S.timer=setTimeout(()=>after(my,id),Math.max(4500,text.length*62))};
 karaoke(id,my);
 if(S.muted){timed();return}
 const viaTts=()=>speakLine(id,my,()=>after(my,id));
 if(FILES){
  let a=S.audio&&S.audio.__id===id?S.audio:null;
  if(!a){a=new Audio('audio/'+id+'.mp3');a.__id=id;S.audio=a}
  el.classList.add('speaking');
  a.playbackRate=SPEED;a.onended=()=>after(my,id);a.onerror=()=>{S.audio=null;viaTts()};
  const p=a.play();if(p&&p.catch)p.catch(()=>{S.audio=null;viaTts()});return;
 }
 viaTts();
}
function go(i){
 if(i>=S.ids.length)return finish();
 stopAudio();S.i=i;S.paused=false;S.ci=0;S.audio=null;S.note='';const id=S.ids[i],sel=SCRIPT[id][0]||(onAgency?'#top-hero':'.hero'),t=document.querySelector(sel),my=tok;
 setHl(sel);if(t)scrollTo({top:Math.max(0,t.getBoundingClientRect().top+scrollY-70),behavior:still?'auto':'smooth'});
 if(id!=='intro')track('section',{section:id});
 render();setTimeout(()=>{if(my===tok)narrate(id,my)},still?100:900);
}
function pause(){if(!S||S.paused||S.ask)return;const id=S.ids[S.i];tok++;el.classList.remove('speaking');if(SS)SS.cancel();if(S.audio)S.audio.pause();if(S.timer){clearTimeout(S.timer);S.timer=0}S.paused=true;render();track('pause',{section:id})}
function play(){if(!S||!S.paused)return;S.paused=false;render();narrate(S.ids[S.i],++tok)}
function finish(){
 const agency=S.aud==='agency',href=agency?(onAgency?'#agency-brief':'agency.html#agency-brief'):'#contact';
 track('complete',{pathway:S.aud});wipe();stopAudio();S=null;setHl(null);
 show('<h2>Got a project in mind?</h2><p>Let\u2019s make something happen.</p><div class="t-row"><a class="btn lime" href="'+href+'" data-a="cta" data-aud="'+(agency?'agency':'business')+'">Send Us a Brief</a><button type="button" class="t-link" data-a="exit">Close</button></div>',1);
}
function begin(opts){
 wake();MUS.start();
 S={aud:null,ids:['intro'],i:0,paused:false,muted:false,ci:0,route:0};
 track('start');
 try{fetch('audio/intro.mp3',{method:'HEAD'}).then(r=>{FILES=r.ok}).catch(()=>{})}catch(e){}
 try{fetch('audio/music.mp3',{method:'HEAD'}).then(r=>{if(r.ok)MUS.useTrack()}).catch(()=>{})}catch(e){}
 if(opts&&opts.aud)choose(opts.aud);else go(0);
}
function choose(aud){
 const wasAsk=S.ask;stopAudio();S={aud,ids:ROUTES[aud],i:0,paused:false,muted:S.muted,ci:0,route:1};track('pathway',{pathway:aud});
 if(aud==='business'&&onAgency){save({aud:'business',page:'home',i:0,muted:!!S.muted,paused:false});location.href='index.html';return}
 go(0);
}
el.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a;
 if(a==='start'){begin(b.dataset.aud?{aud:b.dataset.aud}:null)}
 else if(a==='business'||a==='agency')choose(a);
 else if(a==='pause')pause();else if(a==='play')play();
 else if(a==='next'&&S){track('skip',{section:S.ids[S.i]});if(S.ids[S.i]==='intro'&&!S.route){stopAudio();ask()}else go(S.i+1)}
 else if(a==='mute'&&S){S.muted=!S.muted;const wasPaused=S.paused;stopAudio();S.audio=null;render();if(!wasPaused)narrate(S.ids[S.i],tok)}
 else if(a==='cta'){track('cta_click',{pathway:b.dataset.aud});const f=document.getElementById('contact-form');if(f&&b.dataset.aud==='business'&&f.elements.client_type)f.elements.client_type.value='Business';close()}
 else if(a==='exit')close('exit');else close();
});
fab.addEventListener('click',()=>{if(S)return;track('button_click');offer()});
/* scrolling by hand never pauses the tour; Escape closes it */
addEventListener('keydown',e=>{if(e.key==='Escape'&&!el.hidden)close('exit')});
/* --- keep the tour going across pages: resume where it left off after navigation --- */
function gate(){
 const un=()=>{if(!S)return;wake();MUS.unlock();
  if(S.blocked){S.blocked=0;S.note='';stopAudio();S.audio=null;render();if(!S.paused&&!S.ask)narrate(S.ids[S.i],tok)}
  else if(S.note===TAP){S.note='';render()}};
 ['pointerdown','keydown','touchstart'].forEach(ev=>addEventListener(ev,un,{once:true,capture:true}));
 setTimeout(()=>{if(S&&!S.ask&&!S.muted&&!S.note&&MUS.blocked()){S.note=TAP;render()}},1300);
}
function resume(){
 let st=null;try{st=JSON.parse(sessionStorage.getItem(KEY)||'null')}catch(e){}
 if(!st||S)return;
 const muted=!!st.muted;
 if(!st.aud){S={aud:null,ids:['intro'],i:0,paused:false,muted,ci:0,route:0};MUS.start();ask();gate();return}
 const aud=onAgency?'agency':st.aud,ids=ROUTES[aud],same=st.page===PAGE&&st.aud===aud&&st.i<ids.length;
 S={aud,ids,i:0,paused:false,muted,ci:0,route:1};MUS.start();go(same?st.i:0);
 if(same&&st.paused)pause();
 gate();
}
if(document.readyState==='complete')setTimeout(resume,150);else addEventListener('load',()=>setTimeout(resume,150));
})();
