/* =========================================================
   MAGINTEK 3D — interaction layer
   (original modal / filters / WhatsApp / nav / reveal kept intact,
    plus tasteful 3D depth: tilt, glare, parallax, scroll progress)
   ========================================================= */

// Theme toggle (dark/light) — attribute set on <html> is initialized inline
// in <head> before first paint; this just wires up the toggle buttons.
function setTheme(t){
  document.documentElement.setAttribute('data-theme', t);
  try{ localStorage.setItem('mgt-theme', t); }catch(e){}
}
document.querySelectorAll('.theme-toggle').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const cur = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });
});

// FAQ accordion
function toggleFaq(btn){
  const item = btn.closest('.faqi');
  const answer = item.querySelector('.faqa');
  const wasOpen = item.classList.contains('open');
  item.closest('.faql').querySelectorAll('.faqi.open').forEach(other=>{
    other.classList.remove('open');
    other.querySelector('.faqa').style.maxHeight = '';
  });
  if(!wasOpen){
    item.classList.add('open');
    answer.style.maxHeight = answer.scrollHeight + 'px';
  }
}
// Default-open FAQ item's expanded height comes from the .faqi.open .faqa
// CSS rule (a generous fixed max-height) instead of a scrollHeight read here
// — that read would force a synchronous layout of the whole (large) page
// right at load time. toggleFaq() below still measures scrollHeight exactly,
// but only in response to a click, well after first paint.

let mIdx=0, mList=[];

// MD/IMGS (project detail text + image map) are only needed once someone
// actually opens a portfolio item, so they're loaded on first click rather
// than blocking initial page load — see index.template.html for context.
let dataReady=null;
function loadScript(src){
  return new Promise((resolve,reject)=>{
    const s=document.createElement('script');
    s.src=src;
    s.onload=()=>resolve();
    s.onerror=()=>reject(new Error('Failed to load '+src));
    document.body.appendChild(s);
  });
}
function ensureData(){
  if(!dataReady) dataReady=Promise.all([loadScript('js/data-md.min.js'),loadScript('js/data-imgs.min.js')]);
  return dataReady;
}

// Start loading MD/IMGS as soon as the page is idle rather than waiting for
// the first click. Without this they only start downloading at click time,
// where they queue on the connection behind whatever lazy-loaded thumbnails
// are still in flight — on a slow connection that can add several seconds
// before the modal has anything to show. Idle-time preload means the data
// is normally already there by the time someone actually reaches the
// portfolio section and clicks a card.
function prefetchModalData(){ ensureData().catch(()=>{}); }
if('requestIdleCallback' in window) requestIdleCallback(prefetchModalData,{timeout:3000});
else setTimeout(prefetchModalData,1500);

function openM(idx){
  const mOverlay=document.getElementById('mOverlay');
  mOverlay.classList.add('open','m-loading');
  document.body.style.overflow='hidden';
  ensureData().then(()=>{
    mIdx=idx;
    const allCards=[...document.querySelectorAll('[data-idx]')];
    mList=allCards.map(c=>parseInt(c.dataset.idx));
    if(!mList.includes(idx)) mList=[idx];
    mIdx=mList.indexOf(idx);
    renderM();
    mOverlay.classList.remove('m-loading');
  });
}
document.addEventListener('click',e=>{
  const card=e.target.closest('[data-idx]');
  if(card) openM(parseInt(card.dataset.idx));
});

function sendToWA() {
    const name = document.querySelector('.cfg input[placeholder="Your full name"]').value;
    const company = document.querySelector('.cfg input[placeholder="Company / project name"]').value;
    const email = document.querySelector('.cfg input[type="email"]').value;
    const wa = document.querySelector('.cfg input[placeholder="08xx-xxxx-xxxx"]').value;
    const service = document.querySelector('.cfg input[placeholder="Web Dev / Mobile App / IT Consulting..."]').value;
    const budget = document.querySelector('.cfg input[placeholder^="Rp"]').value;
    const desc = document.querySelector('.cfg textarea').value;

    if (!name || !email || !desc) {
      alert('Please fill in at least Name, Email, and Project Description.');
      return;
    }

    const msg =
  `Hello MAGINTEK! I would like to discuss a project.

  *Name:* ${name}
  *Company:* ${company || '-'}
  *Email:* ${email}
  *WhatsApp:* ${wa || '-'}
  *Service:* ${service || '-'}
  *Budget:* ${budget || '-'}

  *Description:*
  ${desc}`;

    const url = 'https://wa.me/6285778133205?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }
// Loads the modal image with a generous retry-with-backoff burst, then keeps
// quietly retrying in the background indefinitely — so a flaky connection
// heals itself without anyone needing to notice or click anything. The
// "failed" message only appears once the fast burst is exhausted, and even
// then it keeps trying underneath; it isn't a dead end.
const RETRY_DELAYS=[500,1000,2000,3000,5000];
const BACKGROUND_RETRY_MS=6000;
let modalRetryTimer=null;
function loadModalImage(url,attempt){
  attempt=attempt||0;
  clearTimeout(modalRetryTimer);
  const mImg=document.getElementById('mImg');
  const miBox=mImg.closest('.mi');
  const mErr=document.getElementById('mErr');
  if(attempt===0){ mErr.hidden=true; miBox.classList.add('img-loading'); }
  mImg.onload=()=>{ miBox.classList.remove('img-loading'); mErr.hidden=true; };
  mImg.onerror=()=>{
    if(attempt<RETRY_DELAYS.length){
      setTimeout(()=>loadModalImage(url,attempt+1),RETRY_DELAYS[attempt]);
    }else{
      miBox.classList.remove('img-loading');
      mErr.hidden=false;
      modalRetryTimer=setTimeout(()=>loadModalImage(url,attempt),BACKGROUND_RETRY_MS);
    }
  };
  mImg.src=attempt?url+(url.includes('?')?'&':'?')+'_r='+Date.now():url;
}
let mCurrentImgUrl='';
function retryModalImg(){ if(mCurrentImgUrl) loadModalImage(mCurrentImgUrl,0); }

// Kept alive in a module-level array: an Image() with no other reference can
// be garbage-collected mid-download in some engines, silently cancelling the
// preload (and, worse, potentially leaving a half-fetched response behind).
const modalPreloadCache=[];
function preloadModalImage(url){
  if(!url) return;
  const im=new Image();
  im.src=url;
  modalPreloadCache.push(im);
  if(modalPreloadCache.length>8) modalPreloadCache.shift();
}

function renderM(){
  const globalIdx=mList[mIdx];
  const d=MD[globalIdx];
  const imgKeys=Object.keys(IMGS);
  const img=IMGS[imgKeys[globalIdx]]||'';
  mCurrentImgUrl=img;
  loadModalImage(img);
  // Preload the neighboring images so prev/next feels instant once someone
  // starts browsing through the list.
  [mIdx-1,mIdx+1].forEach(i=>{
    if(i<0||i>=mList.length) return;
    preloadModalImage(IMGS[imgKeys[mList[i]]]);
  });
  document.getElementById('mTitle').textContent=d.title;
  document.getElementById('mType').textContent=d.type;
  document.getElementById('mClient').textContent=d.client?('Client: '+d.client):'';
  document.getElementById('mDesc').textContent=d.desc;
  document.getElementById('mTech').innerHTML=d.tech.map(t=>`<span class="mtg">${t}</span>`).join('');
  const mVisit=document.getElementById('mVisit');
  mVisit.hidden=false;
  if(d.url){
    mVisit.href=d.url;
    mVisit.style.opacity='1';
    mVisit.style.pointerEvents='auto';
  }else{
    mVisit.removeAttribute('href');
    mVisit.style.opacity='0.35';
    mVisit.style.pointerEvents='none';
  }
  document.getElementById('mCount').textContent=(mIdx+1)+' / '+mList.length;
  document.getElementById('mPrev').style.opacity=mIdx>0?'1':'0.3';
  document.getElementById('mNext').style.opacity=mIdx<mList.length-1?'1':'0.3';
}
function mNav(d){
  const n=mIdx+d;
  if(n<0||n>=mList.length)return;
  mIdx=n; renderM();
}
function mClose(){document.getElementById('mOverlay').classList.remove('open');document.body.style.overflow='';clearTimeout(modalRetryTimer);}
function mCloseOut(e){if(e.target===document.getElementById('mOverlay'))mClose();}
document.addEventListener('keydown',e=>{
  if(!document.getElementById('mOverlay').classList.contains('open'))return;
  if(e.key==='Escape')mClose();
  if(e.key==='ArrowLeft')mNav(-1);
  if(e.key==='ArrowRight')mNav(1);
});

// Filters
function filterW(btn,cat){
  document.querySelectorAll('#wGrid .pfb,#wGrid ~ .pff .pfb').forEach(b=>b.classList.remove('act'));
  document.querySelectorAll('#portfolio .pfb').forEach(b=>b.classList.remove('act'));
  btn.classList.add('act');
  document.querySelectorAll('#wGrid .pc').forEach(c=>{
    c.style.display=(cat==='all'||c.dataset.cat.includes(cat))?'block':'none';
  });
}
function filterM(btn,cat){
  document.querySelectorAll('#mGrid .pfb').forEach(b=>b.classList.remove('act'));
  document.querySelectorAll('#portfolio-mobile .pfb').forEach(b=>b.classList.remove('act'));
  btn.classList.add('act');
  document.querySelectorAll('#mGrid .pc').forEach(c=>{
    c.style.display='block';
  });
}

// Portfolio Website/Mobile choice modal
function openPfChoice(e){
  e.preventDefault();
  document.getElementById('pfChoice').classList.add('open');
  document.body.style.overflow='hidden';
  if(window.closeDrawer) closeDrawer();
  return false;
}
function closePfChoice(){
  document.getElementById('pfChoice').classList.remove('open');
  document.body.style.overflow='';
}
document.addEventListener('keydown',e=>{
  if(e.key==='Escape' && document.getElementById('pfChoice').classList.contains('open')) closePfChoice();
});

// Scroll reveal
const obs=new IntersectionObserver(e=>e.forEach(en=>{if(en.isIntersecting)en.target.classList.add('visible')}),{threshold:.07});
document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el=>obs.observe(el));

// Hero background video: keep it replaying forever. `loop` handles the normal
// case; this restarts it if a browser still fires `ended`, resumes it after the
// tab comes back, and starts it on first interaction if autoplay was blocked.
(function(){
  const v=document.querySelector('.hero-vid');
  if(!v) return;
  v.muted=true;
  const play=()=>{const p=v.play();if(p&&p.catch)p.catch(()=>{});};
  v.addEventListener('ended',()=>{v.currentTime=0;play();});
  v.addEventListener('pause',()=>{if(!document.hidden)play();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)play();});
  ['pointerdown','keydown','touchstart','scroll'].forEach(ev=>addEventListener(ev,play,{once:true,passive:true}));
  play();
})();

// Section entrance: every content block below the hero animates in when it
// scrolls into view; blocks entering together are staggered. The animation
// class is removed once it finishes so hover/tilt transforms keep working.
(function(){
  if(!('IntersectionObserver' in window)||matchMedia('(prefers-reduced-motion:reduce)').matches) return;
  const SEL='.chip,.sh,.ss,.dl,.pff,.reviews-eyebrow,.reviews-title,.reviews-subtitle,.reviews-aggregate,.reviews-carousel-wrapper,'+
    '.ag>div>*,.phb,.fi,.sv,.tc,.pc,.cc,.tli,.edc,.faqi,.ctg>div>*,.cci,.cfcard,footer>*';
  const found=[...document.querySelectorAll('section:not(#hero),footer')].flatMap(s=>[...s.querySelectorAll(SEL)]);
  // keep only the innermost matches so nothing animates twice
  const items=found.filter(el=>!found.some(o=>o!==el&&el.contains(o)));
  const io=new IntersectionObserver(entries=>{
    const hits=entries.filter(en=>en.isIntersecting).map(en=>en.target)
      .sort((a,b)=>{const ra=a.getBoundingClientRect(),rb=b.getBoundingClientRect();return (ra.top-rb.top)||(ra.left-rb.left);});
    hits.forEach((el,i)=>{
      io.unobserve(el);
      el.style.setProperty('--rv-d',Math.min(i*.08,.6)+'s');
      el.classList.add('rv-go');
      el.addEventListener('animationend',()=>{el.classList.remove('rv','rv-go');el.style.removeProperty('--rv-d');},{once:true});
    });
  },{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  items.forEach(el=>{el.classList.add('rv');io.observe(el);});
})();

// Mobile nav drawer
const hbtn=document.getElementById('hbtn');
const mdrawer=document.getElementById('mdrawer');
function openDrawer(){mdrawer.classList.add('open');hbtn.classList.add('open');hbtn.setAttribute('aria-expanded','true');document.body.classList.add('no-scroll');}
function closeDrawer(){mdrawer.classList.remove('open');hbtn.classList.remove('open');hbtn.setAttribute('aria-expanded','false');document.body.classList.remove('no-scroll');}
window.closeDrawer=closeDrawer;
if(hbtn&&mdrawer){
  hbtn.addEventListener('click',()=>{mdrawer.classList.contains('open')?closeDrawer():openDrawer();});
  mdrawer.querySelector('.mdrawer-backdrop').addEventListener('click',closeDrawer);
  mdrawer.querySelector('.mdrawer-close').addEventListener('click',closeDrawer);
  mdrawer.querySelectorAll('.mdrawer-nl a').forEach(a=>a.addEventListener('click',closeDrawer));
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer();});
}

// Nav active + glass
const nl=document.querySelectorAll('.nl a, .mdrawer-nl a');
const navEl=document.getElementById('nav');
const sbar=document.getElementById('sbar');
const orbs=[...document.querySelectorAll('.scene-bg .orb')];
const orbSpeed=[0.18,0.28,0.40];
const hcard=document.querySelector('.hcard');
const floatChips=[...document.querySelectorAll('.hero .fc')];

const sectionEls=[...document.querySelectorAll('section[id]')];
let sectionOffsets=[];
function measureSections(){
  sectionOffsets=sectionEls.map(s=>({id:s.id,top:s.offsetTop}));
}
window.addEventListener('resize',measureSections,{passive:true});

function onScroll(){
  const y=window.scrollY;
  navEl.classList.toggle('sc',y>40);
  // active section
  let cur='';
  sectionOffsets.forEach(s=>{if(y>=s.top-180)cur=s.id});
  nl.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+cur));
  // scroll progress
  const h=document.documentElement.scrollHeight-window.innerHeight;
  sbar.style.width=(h>0?(y/h*100):0)+'%';
  // parallax orbs (drift up as you scroll)
  orbs.forEach((o,i)=>{o.style.transform=`translate3d(0,${(-y*orbSpeed[i]).toFixed(1)}px,0)`;});
}
window.addEventListener('scroll',onScroll,{passive:true});

// Both of the above read layout geometry (offsetTop / scrollHeight), which
// forces the browser to flush style/layout the moment they run. Running that
// synchronously at load time competes with first paint on a page this size —
// and none of it matters until the user actually scrolls — so defer the
// first measurement to an idle moment instead of paying for it upfront.
function initScrollState(){ measureSections(); onScroll(); }
if('requestIdleCallback' in window) requestIdleCallback(initScrollState,{timeout:1000});
else setTimeout(initScrollState,0);

/* ---------- 3D TILT ---------- */
const fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;

function initTilt(){
  if(!fine || reduce) return;
  const sel='.pc, .cc, .sv, .tc, .edc, .fi, .hcard, .pcard, .cfcard';
  document.querySelectorAll(sel).forEach(card=>{
    card.classList.add('tilt');
    const glare=document.createElement('div');
    glare.className='glare';
    card.appendChild(glare);

    const soft = card.classList.contains('hcard')||card.classList.contains('pcard')||card.classList.contains('cfcard');
    const max = soft ? 6 : 9;
    let raf=0;

    card.addEventListener('pointerenter',()=>{
      card.style.transition='transform 0s, box-shadow .3s';
      card.classList.add('is-tilt');
    });
    card.addEventListener('pointermove',e=>{
      const r=card.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5;
      const py=(e.clientY-r.top)/r.height-.5;
      cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        card.style.transform=`perspective(1000px) rotateX(${(-py*max).toFixed(2)}deg) rotateY(${(px*max).toFixed(2)}deg) translateY(-7px)`;
        glare.style.setProperty('--gx',(px*100+50)+'%');
        glare.style.setProperty('--gy',(py*100+50)+'%');
      });
    });
    card.addEventListener('pointerleave',()=>{
      cancelAnimationFrame(raf);
      card.style.transition='transform .55s cubic-bezier(.16,1,.3,1), box-shadow .4s';
      card.style.transform='';
      card.classList.remove('is-tilt');
    });
  });
}
initTilt();

/* ---------- HERO pointer parallax ---------- */
if(fine && !reduce){
  const hero=document.querySelector('.hero');
  if(hero){
    hero.addEventListener('pointermove',e=>{
      const r=hero.getBoundingClientRect();
      const px=(e.clientX-r.left)/r.width-.5;
      const py=(e.clientY-r.top)/r.height-.5;
      if(hcard && !hcard.classList.contains('is-tilt')){
        hcard.style.transition='transform .5s cubic-bezier(.16,1,.3,1)';
        hcard.style.transform=`perspective(1000px) rotateY(${(px*5).toFixed(2)}deg) rotateX(${(-py*5).toFixed(2)}deg)`;
      }
      floatChips.forEach((c,i)=>{
        const d=(i+1)*10;
        c.style.transform=`translate3d(${(px*d).toFixed(1)}px,${(py*d).toFixed(1)}px,0)`;
      });
    });
    hero.addEventListener('pointerleave',()=>{
      if(hcard && !hcard.classList.contains('is-tilt')) hcard.style.transform='';
      floatChips.forEach(c=>c.style.transform='');
    });
  }
}

/* ---------- WRITING gallery lightbox (moved here so it runs after injection) ---------- */
(function(){
  const grid=document.getElementById('writingGrid');
  if(!grid) return;
  const items=[...grid.querySelectorAll('.cc')].map(c=>({
    img:c.querySelector('.cc-img').src,
    title:c.querySelector('.cc-t').textContent,
    type:c.querySelector('.cc-s').textContent
  }));
  let idx=0;
  function wRender(){
    const d=items[idx];
    document.getElementById('wImg').src=d.img;
    document.getElementById('wTitle').textContent=d.title;
    document.getElementById('wType').textContent=d.type;
    document.getElementById('wCount').textContent=(idx+1)+' / '+items.length;
    document.getElementById('wPrev').style.opacity=idx>0?'1':'0.3';
    document.getElementById('wNext').style.opacity=idx<items.length-1?'1':'0.3';
  }
  window.wOpen=function(i){idx=i;wRender();document.getElementById('wOverlay').classList.add('open');document.body.style.overflow='hidden';};
  window.wNav=function(d){const n=idx+d;if(n<0||n>=items.length)return;idx=n;wRender();};
  window.wClose=function(){document.getElementById('wOverlay').classList.remove('open');document.body.style.overflow='';};
  window.wCloseOut=function(e){if(e.target===document.getElementById('wOverlay'))wClose();};
  document.addEventListener('keydown',e=>{
    if(!document.getElementById('wOverlay').classList.contains('open'))return;
    if(e.key==='Escape')wClose();
    if(e.key==='ArrowLeft')wNav(-1);
    if(e.key==='ArrowRight')wNav(1);
  });
})();
