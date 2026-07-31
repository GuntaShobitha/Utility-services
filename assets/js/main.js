/* STACKLY — interactions */
(function(){
  'use strict';

  // Page loader
  window.addEventListener('load', function(){
    var l = document.getElementById('pageLoader');
    if(l){ setTimeout(function(){ l.classList.add('hidden'); }, 350); }
  });

  // Sticky nav + scroll progress
  var nav = document.querySelector('.nav');
  var bar = document.querySelector('.scroll-progress');
  function onScroll(){
    var y = window.scrollY || 0;
    if(nav){ nav.classList.toggle('solid', y > 40); }
    if(bar){
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? (y/h)*100 : 0;
      bar.style.width = p + '%';
    }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();

  /* ------------------------------------------------------------------
     Mobile menu (drawer)
     Root cause of the old bug: the drawer was a full-screen fixed element
     parked at translateX(100%), which pushed the layout viewport sideways
     on mobile (only `body` had overflow-x:hidden, `html` did not), and its
     state was never reset on a fresh load/refresh. It now toggles with
     opacity/visibility (no transform), and state is reset synchronously on
     init — no scroll or resize event required.
     ------------------------------------------------------------------ */
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.querySelector('.mobile-menu');
  var closeBtn = document.querySelector('.mobile-close');

  function setMenu(open){
    if(!menu) return;
    menu.classList.toggle('open', open);
    menu.setAttribute('aria-hidden', open ? 'false' : 'true');
    document.body.classList.toggle('no-scroll', open);
    if(toggle){
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      var ic = toggle.querySelector('.material-icons-outlined');
      if(ic){ ic.textContent = open ? 'close' : 'menu'; }
    }
    if(open && closeBtn){ closeBtn.focus(); }
  }

  if(menu){
    // Always start from a known-good closed state (fixes refresh glitch)
    setMenu(false);

    if(toggle){
      toggle.addEventListener('click', function(e){
        e.stopPropagation();
        setMenu(!menu.classList.contains('open'));
      });
    }
    if(closeBtn){
      closeBtn.addEventListener('click', function(){ setMenu(false); });
    }
    // Click outside the panel closes
    menu.addEventListener('click', function(e){
      if(e.target === menu){ setMenu(false); }
    });
    // Any link closes
    menu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ setMenu(false); });
    });
    // Escape closes
    document.addEventListener('keydown', function(e){
      if(e.key === 'Escape' && menu.classList.contains('open')){ setMenu(false); }
    });
    // Rotation / resize back to desktop closes and unlocks scroll
    window.addEventListener('resize', function(){
      if(window.innerWidth > 900 && menu.classList.contains('open')){ setMenu(false); }
    });
    window.addEventListener('orientationchange', function(){ setMenu(false); });
    // Restoring from bfcache (back button) must not leave a locked body
    window.addEventListener('pageshow', function(){ setMenu(false); });
  }

  // Reveal on scroll
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, {threshold:.15, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-zoom').forEach(function(el){
    io.observe(el);
  });

  // Counters
  function animateCounter(el){
    var target = parseFloat(el.getAttribute('data-count')) || 0;
    var dur = 1600;
    var start = performance.now();
    function step(now){
      var t = Math.min((now - start)/dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      var v = target * eased;
      el.textContent = (target % 1 !== 0 ? v.toFixed(1) : Math.floor(v)).toString();
      if(t < 1) requestAnimationFrame(step);
      else el.textContent = target.toString();
    }
    requestAnimationFrame(step);
  }
  var ioC = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ animateCounter(e.target); ioC.unobserve(e.target); }
    });
  },{threshold:.4});
  document.querySelectorAll('[data-count]').forEach(function(el){ ioC.observe(el); });

  // FAQ accordion
  document.querySelectorAll('.faq-item').forEach(function(item){
    var q = item.querySelector('.faq-q');
    if(q){
      q.addEventListener('click', function(){
        item.classList.toggle('open');
      });
    }
  });

  // About-section truck: nudges forward on scroll-down, back on scroll-up
  var aboutTruck = document.querySelector('.about-truck');
  if(aboutTruck){
    var lastY = window.scrollY || 0;
    var truckTicking = false;
    window.addEventListener('scroll', function(){
      if(truckTicking) return;
      truckTicking = true;
      requestAnimationFrame(function(){
        var y = window.scrollY || 0;
        if(y > lastY + 2){
          aboutTruck.classList.add('truck-forward');
          aboutTruck.classList.remove('truck-back');
        } else if(y < lastY - 2){
          aboutTruck.classList.add('truck-back');
          aboutTruck.classList.remove('truck-forward');
        }
        lastY = y;
        truckTicking = false;
      });
    }, {passive:true});
  }

  // Expanding highlight cards (touch support — hover already works via CSS)
  var expandCards = document.querySelectorAll('.expand-card');
  if(expandCards.length){
    expandCards.forEach(function(card){
      card.addEventListener('click', function(){
        var already = card.classList.contains('active');
        expandCards.forEach(function(c){ c.classList.remove('active'); });
        if(!already){ card.classList.add('active'); }
      });
    });
  }

  // Tilt cards (subtle 3D)
  document.querySelectorAll('[data-tilt]').forEach(function(el){
    el.addEventListener('mousemove', function(ev){
      var r = el.getBoundingClientRect();
      var x = (ev.clientX - r.left)/r.width - .5;
      var y = (ev.clientY - r.top)/r.height - .5;
      el.style.transform = 'perspective(900px) rotateY(' + (x*8) + 'deg) rotateX(' + (-y*8) + 'deg) translateY(-4px)';
    });
    el.addEventListener('mouseleave', function(){ el.style.transform=''; });
  });

  // Button ripple / spotlight
  document.querySelectorAll('.btn').forEach(function(b){
    b.addEventListener('mousemove', function(ev){
      var r = b.getBoundingClientRect();
      b.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      b.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  });

  // Testimonials auto-scroll
  var track = document.querySelector('[data-testi-track]');
  if(track){
    var pos = 0;
    setInterval(function(){
      if(!track.children.length) return;
      pos += 1;
      if(pos > track.scrollWidth - track.clientWidth) pos = 0;
      track.scrollTo({left:pos, behavior:'auto'});
    }, 30);
  }

  // Contact form
  var cf = document.getElementById('contactForm');
  if(cf){
    cf.addEventListener('submit', function(e){
      e.preventDefault();
      var btn = cf.querySelector('button[type=submit]');
      if(btn){ window.location.href='./404.html' }
      cf.reset();
    });
  }

  // Newsletter
  document.querySelectorAll('.newsletter').forEach(function(nl){
    nl.addEventListener('submit', function(e){
      e.preventDefault();
      var i = nl.querySelector('input');
      if(i){ i.value=''; i.placeholder='Subscribed! Thank you'; }
    });
  });

  // Login validation (email must include @ and .com) + persist to localStorage
  var lf = document.getElementById('loginForm');
  if(lf){
    lf.addEventListener('submit', function(e){
      e.preventDefault();
      var email = document.getElementById('loginEmail');
      var field = email.closest('.field');
      var val = email.value.trim().toLowerCase();
      if(val.indexOf('@') === -1 || val.indexOf('.com') === -1){
        field.classList.add('error');
        return;
      }
      field.classList.remove('error');
      var role = document.getElementById('loginRole').value || 'user';
      var namePart = val.split('@')[0].replace(/[._-]+/g,' ').trim();
      var displayName = namePart.split(' ').map(function(w){
        return w ? w[0].toUpperCase() + w.slice(1) : '';
      }).join(' ');
      try{
        localStorage.setItem('stackly_email', val);
        localStorage.setItem('stackly_role', role);
        localStorage.setItem('stackly_name', displayName);
      }catch(_){}
      window.location.href = (role === 'admin') ? 'admin-dashboard.html' : 'user-dashboard.html';
    });
  }
  var rf = document.getElementById('registerForm');
  if(rf){
    rf.addEventListener('submit', function(e){
      e.preventDefault();
      var email = document.getElementById('regEmail');
      var val = email.value.trim().toLowerCase();
      var field = email.closest('.field');
      if(val.indexOf('@') === -1 || val.indexOf('.com') === -1){
        field.classList.add('error'); return;
      }
      field.classList.remove('error');
      var pw = document.getElementById('regPass').value;
      var cf2 = document.getElementById('regPass2').value;
      var pwField = document.getElementById('regPass2').closest('.field');
      if(pw !== cf2){ pwField.classList.add('error'); return; }
      pwField.classList.remove('error');
      window.location.href = '404.html';
    });
  }

  // Dashboard sidebar toggle
  var dToggle = document.querySelector('[data-dash-toggle]');
  var dSide = document.querySelector('.dash-side');
  if(dToggle && dSide){
    dToggle.addEventListener('click', function(){ dSide.classList.toggle('open'); });
  }

  // 404 particles
  var pWrap = document.querySelector('.err-particles');
  if(pWrap){
    for(var i=0;i<30;i++){
      var p = document.createElement('span');
      p.className='particle';
      p.style.left = Math.random()*100 + '%';
      p.style.animationDelay = (Math.random()*10) + 's';
      p.style.animationDuration = (6 + Math.random()*8) + 's';
      p.style.width = p.style.height = (4 + Math.random()*10) + 'px';
      p.style.background = Math.random() > .5 ? '#8ed36b' : 'rgba(255,255,255,.4)';
      pWrap.appendChild(p);
    }
  }

  // Set year
  document.querySelectorAll('[data-year]').forEach(function(el){ el.textContent = new Date().getFullYear(); });

  // Active nav
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if(page === '' || page === '/'){ page = 'index.html'; }
  document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function(a){
    var h = (a.getAttribute('href')||'').toLowerCase();
    if(h === page) a.classList.add('active');
  });
})();