/* Premium enhancement layer: hero animations, particles, parallax, role cards, magnetic btns, tilt, marquee, AOS-lite. Additive only. */
(function(){
  'use strict';

  // ---- AOS-lite (IntersectionObserver based) ----
  function initAOS(){
    const els=document.querySelectorAll('[data-aos]');
    if(!('IntersectionObserver' in window)){els.forEach(e=>e.classList.add('aos-animate'));return;}
    const io=new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const d=parseInt(e.target.dataset.aosDelay||'0',10);
          setTimeout(()=>e.target.classList.add('aos-animate'),d);
          io.unobserve(e.target);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -8% 0px'});
    els.forEach(el=>io.observe(el));
  }

  // ---- Hero: build particles + split title + parallax ----
  function initHero(){
    const heroes=document.querySelectorAll('.page-hero');
    heroes.forEach(hero=>{
      // Decorative particles intentionally omitted on inner-page heroes
      // (kept minimal & professional per design refinement).
      // split title
      const h1=hero.querySelector('h1');
      if(h1 && !h1.classList.contains('split-title')){
        const words=h1.textContent.trim().split(/\s+/);
        h1.classList.add('split-title');
        h1.innerHTML=words.map((w,i)=>`<span class="w" style="animation-delay:${.1+i*.08}s">${w}&nbsp;</span>`).join('');
      }
      // mouse parallax
      hero.setAttribute('data-parallax','');
      const bg=hero.querySelector('.hero-bg');
      const decos=hero.querySelectorAll('.deco');
      hero.addEventListener('mousemove',(e)=>{
        const r=hero.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width - .5;
        const y=(e.clientY-r.top)/r.height - .5;
        if(bg) bg.style.transform=`scale(1.18) translate(${x*-14}px,${y*-14}px)`;
        decos.forEach((d,i)=>{
          const f=(i+1)*8;
          d.style.transform=`translate(${x*f}px,${y*f}px)`;
        });
      });
      // scroll parallax on bg
      window.addEventListener('scroll',()=>{
        const y=window.scrollY;
        if(bg && y<window.innerHeight) bg.style.backgroundPosition=`center ${50 + y*0.06}%`;
      },{passive:true});
    });
  }

  // ---- Role Cards (login) ----
  function initRoleCards(){
    const wrap=document.querySelector('.role-cards');
    if(!wrap) return;
    const hidden=document.getElementById('loginRole');
    const cards=wrap.querySelectorAll('.role-card');
    function activate(role){
      cards.forEach(c=>c.classList.toggle('active',c.dataset.role===role));
      if(hidden) hidden.value=role;
    }
    cards.forEach(card=>{
      card.addEventListener('mousemove',(e)=>{
        const r=card.getBoundingClientRect();
        card.style.setProperty('--mx',(e.clientX-r.left)+'px');
        card.style.setProperty('--my',(e.clientY-r.top)+'px');
      });
      card.addEventListener('click',(e)=>{
        const ripple=document.createElement('span');
        ripple.className='ripple';
        const r=card.getBoundingClientRect();
        const size=Math.max(r.width,r.height);
        ripple.style.width=ripple.style.height=size+'px';
        ripple.style.left=(e.clientX-r.left-size/2)+'px';
        ripple.style.top=(e.clientY-r.top-size/2)+'px';
        card.appendChild(ripple);
        setTimeout(()=>ripple.remove(),650);
        activate(card.dataset.role);
      });
      card.addEventListener('keydown',(e)=>{
        if(e.key==='Enter'||e.key===' '){e.preventDefault();activate(card.dataset.role);}
      });
    });
    // default from hidden input
    if(hidden && hidden.value) activate(hidden.value);
  }

  // ---- Magnetic buttons ----
  function initMagnetic(){
    document.querySelectorAll('.btn-primary, .btn-accent').forEach(btn=>{
      btn.addEventListener('mousemove',(e)=>{
        const r=btn.getBoundingClientRect();
        const x=e.clientX-r.left-r.width/2;
        const y=e.clientY-r.top-r.height/2;
        btn.style.transform=`translate(${x*.15}px,${y*.2}px)`;
      });
      btn.addEventListener('mouseleave',()=>{btn.style.transform=''});
    });
  }

  // ---- Card tilt ----
  function initTilt(){
    document.querySelectorAll('.tilt, .mv-card, .service-card').forEach(el=>{
      el.addEventListener('mousemove',(e)=>{
        const r=el.getBoundingClientRect();
        const x=(e.clientX-r.left)/r.width - .5;
        const y=(e.clientY-r.top)/r.height - .5;
        el.style.transform=`perspective(900px) rotateX(${y*-4}deg) rotateY(${x*6}deg) translateY(-4px)`;
      });
      el.addEventListener('mouseleave',()=>{el.style.transform=''});
    });
  }

  // ---- Marquee auto-duplicate ----
  function initMarquee(){
    document.querySelectorAll('.marquee-track').forEach(t=>{
      if(t.dataset.dup) return;
      t.innerHTML+=t.innerHTML;
      t.dataset.dup='1';
    });
  }

  function ready(fn){document.readyState!=='loading'?fn():document.addEventListener('DOMContentLoaded',fn)}
  ready(function(){
    initAOS();initHero();initRoleCards();initMagnetic();initTilt();initMarquee();
  });
})();
