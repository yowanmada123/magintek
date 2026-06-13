/* =========================================================
   MAGINTEK 3D — interaction layer
   (original modal / filters / WhatsApp / nav / reveal kept intact,
    plus tasteful 3D depth: tilt, glare, parallax, scroll progress)
   ========================================================= */

let mIdx=0, mList=[];

function openM(idx){
  mIdx=idx;
  const allCards=[...document.querySelectorAll('[data-idx]')];
  mList=allCards.map(c=>parseInt(c.dataset.idx));
  if(!mList.includes(idx)) mList=[idx];
  mIdx=mList.indexOf(idx);
  renderM();
  document.getElementById('mOverlay').classList.add('open');
  document.body.style.overflow='hidden';
}

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

    const url = 'https://wa.me/6282231532679?text=' + encodeURIComponent(msg);
    window.open(url, '_blank');
  }
function renderM(){
  const globalIdx=mList[mIdx];
  const d=MD[globalIdx];
  const img=IMGS[Object.keys(IMGS)[globalIdx]]||'';
  document.getElementById('mImg').src=img;
  document.getElementById('mTitle').textContent=d.title;
  document.getElementById('mType').textContent=d.type;
  document.getElementById('mClient').textContent=d.client?('Client: '+d.client):'';
  document.getElementById('mDesc').textContent=d.desc;
  document.getElementById('mTech').innerHTML=d.tech.map(t=>`<span class="mtg">${t}</span>`).join('');
  document.getElementById('mCount').textContent=(mIdx+1)+' / '+mList.length;
  document.getElementById('mPrev').style.opacity=mIdx>0?'1':'0.3';
  document.getElementById('mNext').style.opacity=mIdx<mList.length-1?'1':'0.3';
}
function mNav(d){
  const n=mIdx+d;
  if(n<0||n>=mList.length)return;
  mIdx=n; renderM();
}
function mClose(){document.getElementById('mOverlay').classList.remove('open');document.body.style.overflow='';}
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

// Scroll reveal
const obs=new IntersectionObserver(e=>e.forEach(en=>{if(en.isIntersecting)en.target.classList.add('visible')}),{threshold:.07});
document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el=>obs.observe(el));

// Nav active + glass
const nl=document.querySelectorAll('.nl a');
const navEl=document.getElementById('nav');
const sbar=document.getElementById('sbar');
const orbs=[...document.querySelectorAll('.scene-bg .orb')];
const orbSpeed=[0.18,0.28,0.40];
const hcard=document.querySelector('.hcard');
const floatChips=[...document.querySelectorAll('.hero .fc')];

function onScroll(){
  const y=window.scrollY;
  navEl.classList.toggle('sc',y>40);
  // active section
  let cur='';
  document.querySelectorAll('section[id]').forEach(s=>{if(y>=s.offsetTop-180)cur=s.id});
  nl.forEach(a=>a.classList.toggle('act',a.getAttribute('href')==='#'+cur));
  // scroll progress
  const h=document.documentElement.scrollHeight-window.innerHeight;
  sbar.style.width=(h>0?(y/h*100):0)+'%';
  // parallax orbs (drift up as you scroll)
  orbs.forEach((o,i)=>{o.style.transform=`translate3d(0,${(-y*orbSpeed[i]).toFixed(1)}px,0)`;});
}
window.addEventListener('scroll',onScroll,{passive:true});
onScroll();

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
