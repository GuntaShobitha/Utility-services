/* STACKLY Dashboard scaffold — sidebar/topbar builder, localStorage user, guards */
(function(){
  'use strict';
  var K_EMAIL='stackly_email', K_ROLE='stackly_role', K_NAME='stackly_name';
  var email=localStorage.getItem(K_EMAIL)||'';
  var role =localStorage.getItem(K_ROLE)||'';
  var name =localStorage.getItem(K_NAME)||'';
  var body=document.body;
  var pageRole=body.getAttribute('data-role')||'user';
  var active  =body.getAttribute('data-active')||'dashboard';

  // Auth guard
  if(!email || !role){ location.replace('login.html'); return; }
  if(role!==pageRole){ location.replace(role==='admin'?'admin-dashboard.html':'user-dashboard.html'); return; }

  var first   = (name||'User').split(' ')[0] || 'User';
  var initial = (name||email||'?').trim().charAt(0).toUpperCase();
  var subtitle= pageRole==='admin' ? 'Administrator' : 'Account User';

  var userNav=[
    ['dashboard','user-dashboard.html','dashboard','Dashboard'],
    ['profile',  'user-profile.html',  'person',   'Profile'],
    ['projects', 'user-projects.html', 'apartment','Projects'],
    ['reports',  'user-reports.html',  'assessment','Reports'],
    ['messages', 'user-messages.html', 'mail',     'Messages'],
    ['settings', 'user-settings.html', 'settings', 'Settings']
  ];
  var adminNav=[
    ['dashboard','admin-dashboard.html','dashboard','Dashboard'],
    ['users',    'admin-users.html',    'group',    'Manage Users'],
    ['projects', 'admin-projects.html', 'apartment','Manage Projects'],
    ['reports',  'admin-reports.html',  'assessment','Reports'],
    ['analytics','admin-analytics.html','insights', 'Analytics'],
    ['messages', 'admin-messages.html', 'mail',     'Messages'],
    ['settings', 'admin-settings.html', 'settings', 'Settings']
  ];
  var nav = pageRole==='admin' ? adminNav : userNav;


  var dashboardUrl = role === 'admin'
  ? 'admin-dashboard.html'
  : 'user-dashboard.html';


  function esc(s){return (s+'').replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]});}

  // Sidebar
  var side=document.getElementById('dashSidebar');
  if(side){
    var links=nav.map(function(n){
      return '<a class="'+(n[0]===active?'active':'')+'" href="'+n[1]+'"><span class="material-icons-outlined">'+n[2]+'</span> '+n[3]+'</a>';
    }).join('');
    side.innerHTML =
      '<div class="dash-brand"><a href="'+dashboardUrl+'"><img src="images/stackly-logo-recolored.webp" alt="STACKLY"></a></div>'+
      '<nav class="dash-nav">'+links+'</nav>'+
      '<div class="dash-side-profile">'+
        '<div class="av">'+esc(initial)+'</div>'+
        '<div><b class="js-user-name"></b><span class="js-user-email"></span></div>'+
      '</div>'+
      '<a href="#" class="dash-logout" id="dashLogout"><span class="material-icons-outlined">logout</span> Logout</a>';
  }

  // Topbar
  var top=document.getElementById('dashTopbar');
  if(top){
    top.innerHTML =
      '<button class="nav-toggle" data-dash-toggle style="width:40px;height:40px;display:grid;place-items:center" aria-label="Menu"><span class="material-icons-outlined">menu</span></button>'+
      '<div class="dash-search"><span class="material-icons-outlined">search</span><input placeholder="Search '+(pageRole==='admin'?'users, projects, invoices':'reports, projects, articles')+'..."></div>'+
      '<div class="dash-icons">'+
      '<button onclick="window.location.href=\'./404.html\'" class="dash-icon-btn" title="Notifications"><span class="material-icons-outlined">notifications</span><span class="dot"></span></button>'+
'<button onclick="window.location.href=\'./404.html\'" class="dash-icon-btn" title="Messages"><span class="material-icons-outlined">mail</span></button>'+
        '<div class="dash-profile"><div class="av sm">'+esc(initial)+'</div><div><b class="js-user-name"></b><span>'+subtitle+'</span></div></div>'+
      '</div>';
  }

  // Scroll region: sidebar + topbar stay fixed, only content scrolls
  var main=document.querySelector('.dash-main');
  var bar=document.getElementById('dashTopbar');
  if(main && bar && !main.querySelector('.dash-scroll')){
    var scroller=document.createElement('div');
    scroller.className='dash-scroll';
    var node=bar.nextSibling;
    while(node){
      var next=node.nextSibling;
      scroller.appendChild(node);
      node=next;
    }
    main.appendChild(scroller);
  }

  // Populate placeholders across the page
  document.querySelectorAll('.js-user-name').forEach(function(el){el.textContent = name || 'User';});
  document.querySelectorAll('.js-user-email').forEach(function(el){el.textContent = email;});
  document.querySelectorAll('.js-user-first').forEach(function(el){el.textContent = first;});
  document.querySelectorAll('.js-user-initial').forEach(function(el){el.textContent = initial;});
  document.querySelectorAll('.js-user-role').forEach(function(el){el.textContent = subtitle;});

  // Sidebar toggle
  var toggle=document.querySelector('[data-dash-toggle]');
  var sidebar=document.querySelector('.dash-side');
  if(toggle && sidebar){
    toggle.addEventListener('click', function(){
      var open=sidebar.classList.toggle('open');
      document.body.classList.toggle('sidebar-open', open);
    });
  }
  function closeSide(){
    if(!sidebar) return;
    sidebar.classList.remove('open');
    document.body.classList.remove('sidebar-open');
  }
  // Close sidebar when a nav link is tapped, on overlay tap, or on Escape
  if(sidebar){
    sidebar.querySelectorAll('.dash-nav a').forEach(function(a){
      a.addEventListener('click', function(){
        if(window.innerWidth<=1000){ closeSide(); }
      });
    });
    document.addEventListener('click', function(e){
      if(window.innerWidth>1000) return;
      if(!document.body.classList.contains('sidebar-open')) return;
      if(sidebar.contains(e.target) || (toggle && toggle.contains(e.target))) return;
      closeSide();
    });
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeSide(); });
    window.addEventListener('resize', function(){ if(window.innerWidth>1000) closeSide(); });
  }


  // Logout
  var logout=document.getElementById('dashLogout');
  if(logout){
    logout.addEventListener('click', function(e){
      e.preventDefault();
      try{
        localStorage.removeItem(K_EMAIL);
        localStorage.removeItem(K_ROLE);
        localStorage.removeItem(K_NAME);
      }catch(_){ }
      location.href='login.html';
    });
  }

  // Chart.js declarative bootstrap
  // if(window.Chart){
  //   Chart.defaults.font.family="Manrope, Inter, system-ui, sans-serif";
  //   Chart.defaults.color="#5b6b62";
  //   document.querySelectorAll('canvas[data-chart]').forEach(function(el){
  //     try{ var cfg=JSON.parse(el.getAttribute('data-chart')); new Chart(el, cfg); }
  //     catch(err){ console.warn('chart parse', err); }
  //   });
  // }

  // Animations
  if(window.AOS){ AOS.init({duration:650, once:true, easing:'ease-out-cubic'}); }
  if(window.gsap){
    gsap.from('.widget',    {y:18, opacity:0, duration:.55, stagger:.07, ease:'power2.out'});
    gsap.from('.panel',     {y:22, opacity:0, duration:.6,  stagger:.09, delay:.15, ease:'power2.out'});
    gsap.from('.dash-head', {y:-10,opacity:0, duration:.5, ease:'power2.out'});
  }

  // Animated counters within dashboards
  document.querySelectorAll('[data-count]').forEach(function(el){
    var target=parseFloat(el.getAttribute('data-count'))||0;
    var suffix=el.getAttribute('data-suffix')||'';
    var prefix=el.getAttribute('data-prefix')||'';
    var dur=1400, start=performance.now();
    function step(now){
      var t=Math.min((now-start)/dur,1);
      var eased=1-Math.pow(1-t,3);
      var v=target*eased;
      el.textContent = prefix + (target%1!==0 ? v.toFixed(1) : Math.floor(v).toLocaleString()) + suffix;
      if(t<1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  // Settings save button demo
  document.querySelectorAll('[data-save-form]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var btn=f.querySelector('button[type=submit]');
      if(!btn) return;
      var t=btn.textContent;
      btn.textContent='Saved ✓'; btn.disabled=true;
      setTimeout(function(){ btn.textContent=t; btn.disabled=false; }, 1600);
    });
  });

  // Profile form save also updates localStorage name
  var pf=document.getElementById('profileForm');
  if(pf){
    pf.addEventListener('submit', function(e){
      e.preventDefault();
      var n=document.getElementById('pfName');
      if(n && n.value.trim()){
        try{ localStorage.setItem(K_NAME, n.value.trim()); }catch(_){}
        document.querySelectorAll('.js-user-name').forEach(function(el){el.textContent=n.value.trim();});
        document.querySelectorAll('.js-user-first').forEach(function(el){el.textContent=n.value.trim().split(' ')[0];});
      }
      var btn=pf.querySelector('button[type=submit]');
      if(btn){window.location.href='./404.html'}
    });
  }
})();

document.querySelectorAll("canvas[data-chart]").forEach(canvas => {
    try {
        const config = JSON.parse(canvas.dataset.chart);
        new Chart(canvas.getContext("2d"), config);
    } catch (err) {
        console.error("chart parse error", err);
    }
});