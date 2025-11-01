/**
 * scripts/main.js
 * Starter UI script: mobile nav toggle, smooth scrolling, and basic AJAX form handler.
 * Drop this into `scripts/main.js` and include <script src="scripts/main.js" defer></script> in your HTML.
 */
(function (){
  'use strict';

  /* Utility: safe selector */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* Toggle mobile nav: expects .nav and .nav-toggle elements */
  function initNavToggle(){
    const toggle = $('.nav-toggle');
    const nav = document.getElementById('main-nav') || $('.nav');
    if(!toggle || !nav) return;

    toggle.addEventListener('click', () => {
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!expanded));
      nav.classList.toggle('open');
    });

    // Close mobile nav when a link is clicked and update aria state
    if(nav.querySelectorAll){
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          if(nav.classList.contains('open')){
            nav.classList.remove('open');
            toggle.setAttribute('aria-expanded','false');
          }
        });
      });
    }
  }

  /* highlight active link in nav based on current path */
  function markActiveNav(){
    const nav = document.getElementById('main-nav');
    if(!nav) return;
    const links = Array.from(nav.querySelectorAll('a'));
    const file = (location.pathname.split('/').pop() || 'index.html');
    links.forEach(a => {
      const href = a.getAttribute('href');
      // treat root as index.html
      const normalized = href === './' ? 'index.html' : href;
      if(normalized && (normalized === file || (normalized === 'index.html' && file === ''))){
        a.classList.add('active');
      } else {
        a.classList.remove('active');
      }
    });
  }


  /* Education Search Feature */
  function initEducationSearch() {
    const searchInput = document.getElementById('education-search');
    const searchResults = document.getElementById('search-results');
    const searchResultsList = document.getElementById('search-results-list');
    const searchCount = document.getElementById('search-count');
    const clearBtn = document.getElementById('clear-search');
    
    if (!searchInput) return; // Not on education page
    
    // Build search index from all articles
    const articles = [];
    
    // Get all education articles
    document.querySelectorAll('.education-article').forEach(article => {
      const id = article.getAttribute('id');
      const title = article.querySelector('h2')?.textContent || '';
      const badge = article.querySelector('.badge')?.textContent || 'General';
      const content = article.querySelector('.article-content')?.textContent || '';
      
      // Only include articles with actual content (not placeholders)
      if (content && !content.includes('currently being developed')) {
        articles.push({
          id,
          title,
          badge,
          content: content.substring(0, 500), // First 500 chars for preview
          fullContent: content.toLowerCase()
        });
      }
    });
    
    // Also index navigation items
    document.querySelectorAll('.education-section').forEach(section => {
      const sectionTitle = section.querySelector('h2')?.textContent || '';
      section.querySelectorAll('.topic-item a').forEach(link => {
        const href = link.getAttribute('href');
        const linkText = link.textContent;
        const targetArticle = articles.find(a => `#${a.id}` === href);
        
        // Add navigation context to articles
        if (targetArticle && !targetArticle.keywords) {
          targetArticle.keywords = [];
        }
        if (targetArticle) {
          targetArticle.keywords.push(linkText.toLowerCase());
          targetArticle.keywords.push(sectionTitle.toLowerCase());
        }
      });
    });
    
    function highlightText(text, query) {
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    }
    
    function performSearch(query) {
      if (!query || query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }
      
      const lowerQuery = query.toLowerCase();
      const results = articles.filter(article => {
        const titleMatch = article.title.toLowerCase().includes(lowerQuery);
        const contentMatch = article.fullContent.includes(lowerQuery);
        const keywordMatch = article.keywords?.some(k => k.includes(lowerQuery));
        return titleMatch || contentMatch || keywordMatch;
      });
      
      // Sort by relevance (title matches first)
      results.sort((a, b) => {
        const aTitle = a.title.toLowerCase().includes(lowerQuery);
        const bTitle = b.title.toLowerCase().includes(lowerQuery);
        if (aTitle && !bTitle) return -1;
        if (!aTitle && bTitle) return 1;
        return 0;
      });
      
      displayResults(results, query);
    }
    
    function displayResults(results, query) {
      searchResults.style.display = 'block';
      searchCount.textContent = `${results.length} result${results.length !== 1 ? 's' : ''}`;
      
      if (results.length === 0) {
        searchResultsList.innerHTML = `
          <div class="no-results">
            <div class="no-results-icon">🔍</div>
            <p>No results found for "<strong>${query}</strong>"</p>
            <p style="font-size: 0.9rem; margin-top: 0.5rem;">Try different keywords or browse the topics below.</p>
          </div>
        `;
        return;
      }
      
      searchResultsList.innerHTML = results.map(article => {
        // Get excerpt around the search term
        const queryPos = article.fullContent.indexOf(query.toLowerCase());
        let excerpt = article.content;
        
        if (queryPos > -1) {
          const start = Math.max(0, queryPos - 100);
          const end = Math.min(article.fullContent.length, queryPos + 200);
          excerpt = '...' + article.fullContent.substring(start, end) + '...';
        }
        
        return `
          <div class="search-result-item" onclick="window.location.href='#${article.id}'">
            <span class="badge">${article.badge}</span>
            <h3>${highlightText(article.title, query)}</h3>
            <p>${highlightText(excerpt, query)}</p>
          </div>
        `;
      }).join('');
    }
    
    // Debounce search input
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        performSearch(e.target.value.trim());
      }, 300);
    });
    
    // Clear search
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchResults.style.display = 'none';
      searchInput.focus();
    });
    
    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.education-search')) {
        // Don't hide if clicking on a search result
        if (!e.target.closest('.search-result-item')) {
          // Just blur, don't hide results
        }
      }
    });
  }

  /* Smooth scrolling for same-page links */
  function initSmoothScroll(){
    let scrollOrigin = null; // Track where user clicked from
    
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if(!a) return;
      const href = a.getAttribute('href');
      if(href === '#' || href === '#!' ) return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        
        // Save scroll position before jumping
        scrollOrigin = window.pageYOffset || document.documentElement.scrollTop;
        
        target.scrollIntoView({behavior:'smooth', block:'start'});
        // update focus for accessibility
        target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
        window.setTimeout(()=> target.removeAttribute('tabindex'), 1000);
        
        // Show back button after scrolling
        window.setTimeout(() => showBackButton(scrollOrigin), 600);
      }
    });
  }
  
  /* Back to navigation button */
  function showBackButton(originY) {
    // Remove existing button if any
    let backBtn = document.getElementById('back-to-nav');
    if(backBtn) backBtn.remove();
    
    // Create back button
    backBtn = document.createElement('button');
    backBtn.id = 'back-to-nav';
    backBtn.className = 'back-to-nav';
    backBtn.innerHTML = '↑ Back to Navigation';
    backBtn.setAttribute('aria-label', 'Return to previous position');
    
    // Add click handler
    backBtn.addEventListener('click', () => {
      window.scrollTo({
        top: originY,
        behavior: 'smooth'
      });
      // Remove button after clicking
      window.setTimeout(() => backBtn.remove(), 600);
    });
    
    document.body.appendChild(backBtn);
    
    // Fade in
    window.setTimeout(() => backBtn.classList.add('visible'), 50);
    
    // Auto-hide after 10 seconds
    window.setTimeout(() => {
      if(backBtn && backBtn.parentNode) {
        backBtn.classList.remove('visible');
        window.setTimeout(() => backBtn.remove(), 300);
      }
    }, 10000);
  }

  /* Simple AJAX form handler
     - Form should have data-ajax attribute to enable
     - Uses fetch to submit to form.action (or POST to current location)
     - Expects text or JSON responses
  */
  async function handleFormSubmit(form){
    const submitBtn = form.querySelector('[type="submit"]');
    const data = new FormData(form);
    const action = form.getAttribute('action') || window.location.href;
    const method = (form.getAttribute('method') || 'POST').toUpperCase();

    // UI: disable button
    if(submitBtn) submitBtn.disabled = true;

    try{
      const res = await fetch(action, {method, body: data});
      let body;
      const contentType = res.headers.get('content-type') || '';
      if(contentType.includes('application/json')) body = await res.json();
      else body = await res.text();

      // dispatch a success event with response
      form.dispatchEvent(new CustomEvent('ajax:success', {detail:{status:res.status, body}}));
    }catch(err){
      form.dispatchEvent(new CustomEvent('ajax:error', {detail:{error:err}}));
    }finally{
      if(submitBtn) submitBtn.disabled = false;
    }
  }

  function initAjaxForms(){
    const forms = $$('form[data-ajax]');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleFormSubmit(form);
      });

      // Example: add default listeners to show basic UI feedback
      form.addEventListener('ajax:success', (ev) => {
        const message = form.querySelector('.form-message');
        if(message){
          message.textContent = 'Thanks — we received your message.';
          message.classList.add('success');
        } else {
          alert('Form sent — thank you!');
        }
        form.reset();
      });

      form.addEventListener('ajax:error', (ev) => {
        const message = form.querySelector('.form-message');
        if(message){
          message.textContent = 'Sorry — something went wrong. Please try again later.';
          message.classList.add('error');
        } else {
          alert('Error sending form.');
        }
      });
    });
  }

  /* Init function */
  function init(){
    initNavToggle();
    initSmoothScroll();
    initAjaxForms();
    markActiveNav();
    initPlantPage();
    initEducationSearch();
    // add more init calls here (modals, lightbox, analytics setup, etc.)
  }

  // Run on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* Plant page helper: compute days since germination and basic timeline behaviour */
  function initPlantPage(){
    try{
      // compute days since and animate count up
      const dateEls = Array.from(document.querySelectorAll('[data-germinated]'));
      dateEls.forEach(el => {
        const d = el.getAttribute('data-germinated');
        if(!d) return;
        const then = new Date(d + 'T00:00:00');
        if(isNaN(then)) return;
        const now = new Date();
        const days = Math.floor((now - then) / (1000*60*60*24));
        const span = el.querySelector('.days-since');
        if(span){
          // animate from 0 to days
          let start = 0;
          const duration = 900;
          const startTime = performance.now();
          const step = (t) => {
            const progress = Math.min(1, (t - startTime) / duration);
            const val = Math.floor(progress * days);
            span.textContent = val;
            if(progress < 1) requestAnimationFrame(step);
            else span.textContent = days;
          };
          requestAnimationFrame(step);
        }
      });

      // progress-bar animation (find any progress-bar and animate to its inline width if set)
      const bars = Array.from(document.querySelectorAll('.progress-bar'));
      bars.forEach(bar => {
        // read the intended width from inline style if present (e.g., style="width:65%")
        const inline = bar.getAttribute('style') || '';
        const match = inline.match(/width:\s*(\d+)%/i);
        const target = match ? match[1] + '%' : '100%';
        // start at 0 then set to target after a tick for transition
        bar.style.width = '0%';
        window.setTimeout(()=> bar.style.width = target, 50);
      });

      // modal / popout behavior: open modal with entry content
      const modal = document.getElementById('plant-modal');
      const modalPanel = modal && modal.querySelector('.modal-panel');
      const modalBody = modal && modal.querySelector('.modal-body');
      const modalTitle = modal && modal.querySelector('.modal-title');
      const modalPhoto = modal && modal.querySelector('.modal-photo');

      function openModal(title, bodyHtml, photos){
        if(!modal) return;
        const gallery = modal.querySelector('.modal-gallery');
        // set title & body
        if(modalTitle) modalTitle.textContent = title || 'Details';
        if(modalBody) modalBody.innerHTML = bodyHtml || '';

        // populate gallery
        if(gallery){
          gallery.innerHTML = '';
          const list = Array.isArray(photos) ? photos : (photos ? String(photos).split(',') : []);
          const trimmed = list.map(s => s.trim()).filter(Boolean);
          if(trimmed.length === 0){
            gallery.style.display = 'none';
          } else {
            gallery.style.display = '';
            trimmed.forEach((src, idx) => {
              const img = document.createElement('img');
              // lazy-load thumbnails when modal opens
              img.dataset.src = src;
              img.loading = 'lazy';
              img.alt = `${title} photo ${idx+1}`;
              img.tabIndex = 0;
              img.dataset.index = idx;
              img.addEventListener('click', () => {
                if(modalPhoto) modalPhoto.src = src;
                // set selected class
                gallery.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');
              });
              img.addEventListener('keydown', (ev) => { if(ev.key === 'Enter' || ev.key === ' ') img.click(); });
              // set src synchronously so images load when the modal opens; keep as lazy attribute too
              img.src = img.dataset.src;
              gallery.appendChild(img);
            });
            // set first as selected
            const first = gallery.querySelector('img');
            if(first){ first.classList.add('selected'); if(modalPhoto) modalPhoto.src = first.src; }
          }
        }

        // add swipe support for modalPhoto (mobile)
        let touchStartX = 0;
        let touchEndX = 0;
        function onTouchStart(e){ touchStartX = e.changedTouches[0].clientX; }
        function onTouchEnd(e){
          touchEndX = e.changedTouches[0].clientX;
          const dx = touchEndX - touchStartX;
          if(Math.abs(dx) > 40){
            const imgs = Array.from(gallery.querySelectorAll('img'));
            const current = imgs.findIndex(i => i.classList.contains('selected'));
            if(current === -1) return;
            if(dx < 0 && current < imgs.length - 1){ imgs[current+1].click(); }
            else if(dx > 0 && current > 0){ imgs[current-1].click(); }
          }
        }
        if(modalPhoto){
          modalPhoto.addEventListener('touchstart', onTouchStart, {passive:true});
          modalPhoto.addEventListener('touchend', onTouchEnd, {passive:true});
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden','false');
        // trap focus simplistically by focusing close button
        const btn = modal.querySelector('.modal-close'); if(btn) btn.focus();

        // remember handlers so we can remove them on close
        modal._onTouchStart = onTouchStart;
        modal._onTouchEnd = onTouchEnd;
      }

      function closeModal(){
        if(!modal) return;
        // remove swipe listeners if present
        if(modalPhoto && modal._onTouchStart){
          modalPhoto.removeEventListener('touchstart', modal._onTouchStart);
          modalPhoto.removeEventListener('touchend', modal._onTouchEnd);
          delete modal._onTouchStart; delete modal._onTouchEnd;
        }
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
      }

      // attach listeners to timeline details buttons
      const detailBtns = Array.from(document.querySelectorAll('.timeline-details'));
      detailBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const entry = btn.closest('.timeline-entry');
          if(!entry) return;
          const time = entry.querySelector('time') ? entry.querySelector('time').textContent.trim() : '';
          const text = entry.querySelector('p') ? entry.querySelector('p').outerHTML : '';
          const photos = entry.getAttribute('data-photos') || '';
          openModal(time, text, photos);
        });
      });

      // clicking the date/time itself opens the same modal and shows photos
      const timeEls = Array.from(document.querySelectorAll('.timeline-entry time'));
      timeEls.forEach(t => {
        t.addEventListener('click', (e) => {
          e.stopPropagation();
          const entry = t.closest('.timeline-entry');
          if(!entry) return;
          const time = t.textContent.trim();
          const text = entry.querySelector('p') ? entry.querySelector('p').outerHTML : '';
          const photos = entry.getAttribute('data-photos') || '';
          openModal(time, text, photos);
        });
      });

      // close modal via close button or backdrop
      if(modal){
        const closeBtn = modal.querySelector('.modal-close');
        if(closeBtn) closeBtn.addEventListener('click', closeModal);
        const backdrop = modal.querySelector('[data-dismiss]');
        if(backdrop) backdrop.addEventListener('click', closeModal);
        document.addEventListener('keydown', (ev) => { if(ev.key === 'Escape') closeModal(); });
      }

      // Conditions editor: LocalStorage-backed
      function loadConditions(){
        try{
          const raw = localStorage.getItem('plant_conditions');
          if(!raw) return null;
          return JSON.parse(raw);
        }catch(e){return null}
      }

      function saveConditions(obj){
        try{ localStorage.setItem('plant_conditions', JSON.stringify(obj)); }catch(e){}
      }

      function renderConditions(){
        const cond = loadConditions();
        if(!cond) return;
        // update stat grid visible values
        const statGrid = document.querySelector('.current-conditions');
        if(!statGrid) return;
        // naive updates: find elements by order — replace entire block for simplicity
        const elems = statGrid.querySelectorAll('ul > li');
        if(elems && elems.length >= 6){
          elems[0].querySelector('.muted').textContent = String(cond.day || '—');
          elems[1].querySelector('.muted').textContent = String(cond.light || '—');
          elems[2].querySelector('.muted').textContent = String(cond.temp ? cond.temp + '°F' : '—');
          elems[3].querySelector('.muted').textContent = String(cond.rh ? cond.rh + '%' : '—');
          elems[4].querySelector('.muted').textContent = String(cond.vpd || '—');
          elems[5].querySelector('.muted').textContent = String(cond.lights ? cond.lights + '% output' : '—');
        }
        // if day provided, update animated counter data-germinated to compute days if user provided germination date logic isn't used
        const dayInput = document.querySelector('[data-germinated]');
        if(dayInput && cond && cond.germinatedDate){
          dayInput.setAttribute('data-germinated', cond.germinatedDate);
        }
      }

      function initConditionsEditor(){
        const editBtn = document.getElementById('edit-conditions');
        const form = document.getElementById('cond-form');
        const cancel = document.getElementById('cond-cancel');
        if(!editBtn || !form) return;
        // prefill form from stored conditions or DOM
        function prefill(){
          const cond = loadConditions() || {};
          form.elements['day'].value = cond.day || '';
          form.elements['light'].value = cond.light || '';
          form.elements['temp'].value = cond.temp || '';
          form.elements['rh'].value = cond.rh || '';
          form.elements['vpd'].value = cond.vpd || '';
          form.elements['lights'].value = cond.lights || '';
        }
        editBtn.addEventListener('click', ()=>{ prefill(); form.style.display = ''; editBtn.style.display = 'none'; form.elements['day'].focus(); });
        cancel.addEventListener('click', ()=>{ form.style.display = 'none'; editBtn.style.display = ''; });
        form.addEventListener('submit', (ev)=>{
          ev.preventDefault();
          const data = {
            day: Number(form.elements['day'].value) || null,
            light: form.elements['light'].value || null,
            temp: form.elements['temp'].value ? Number(form.elements['temp'].value) : null,
            rh: form.elements['rh'].value ? Number(form.elements['rh'].value) : null,
            vpd: form.elements['vpd'].value ? Number(form.elements['vpd'].value) : null,
            lights: form.elements['lights'].value ? Number(form.elements['lights'].value) : null,
            // store approximate germinatedDate so the counter can use it if provided elsewhere
            germinatedDate: form.dataset && form.dataset.germinatedDate || null
          };
          saveConditions(data);
          renderConditions();
          // close editor
          form.style.display = 'none';
          editBtn.style.display = '';
          // update days counter immediately if day was set (we'll just update the visible day number)
          const daySpan = document.querySelector('.current-conditions .days-since');
          if(daySpan && data.day){ daySpan.textContent = String(data.day); }
        });
      }

      // Notes: LocalStorage-backed notes list
      function loadNotes(){ try{ const raw = localStorage.getItem('plant_notes'); return raw? JSON.parse(raw): []; }catch(e){return []} }
      function saveNotes(arr){ try{ localStorage.setItem('plant_notes', JSON.stringify(arr)); }catch(e){} }
      function renderNotes(){ const notes = loadNotes(); const container = document.getElementById('notes-list'); if(!container) return; const list = notes.concat([]); // local copy
        container.innerHTML = '<ul>' + list.map(n=>`<li>${n}</li>`).join('') + '</ul>'; }
      function initNotesEditor(){ const form = document.getElementById('note-form'); if(!form) return; form.addEventListener('submit', (ev)=>{ ev.preventDefault(); const text = form.elements['note'].value.trim(); if(!text) return; const stamped = (new Date()).toISOString().slice(0,10) + ' — ' + text; const notes = loadNotes(); notes.unshift(stamped); saveNotes(notes); renderNotes(); form.reset(); }); renderNotes(); }

      // initialize editors and render persisted data
      initConditionsEditor(); renderConditions(); initNotesEditor();

      // Clicking the current-conditions card opens a centered modal that blurs the background
      try{
        const condBox = document.querySelector('.current-conditions');
        const condModal = document.getElementById('cond-modal');
        if(condBox && condModal){
          // make the on-page box compact visually
          condBox.classList.add('compact');

          condBox.addEventListener('click', (e) => {
            // if user clicked the inline edit button or inside the cond-form, don't open modal
            if(e.target.closest('#edit-conditions') || e.target.closest('#cond-form') || e.target.tagName === 'BUTTON') return;
            const body = condModal.querySelector('.modal-body'); body.innerHTML = '';
            // Try to read saved conditions first, then fallback to DOM values
            const cond = loadConditions() || (function(){
              const container = document.querySelector('.current-conditions');
              if(!container) return null;
              const items = Array.from(container.querySelectorAll('ul > li'));
              const keys = ['Day','Light cycle','Temperature','Relative humidity','VPD','Lights'];
              const obj = {};
              items.forEach((li, idx) => { const k = keys[idx] || ('field'+idx); const v = li.querySelector('.muted') ? li.querySelector('.muted').textContent.trim() : li.textContent.trim(); obj[k]=v; });
              return obj;
            })();

            // render modal through helper (keeps consistent look for per-entry conds)
            renderConditionsModal(cond, 'Current conditions');
          });

          // close handlers for conditions modal
          const condClose = condModal.querySelector('.modal-close'); if(condClose) condClose.addEventListener('click', ()=>{ condModal.classList.remove('open'); condModal.setAttribute('aria-hidden','true'); });
          const condBackdrop = condModal.querySelector('[data-dismiss]'); if(condBackdrop) condBackdrop.addEventListener('click', ()=>{ condModal.classList.remove('open'); condModal.setAttribute('aria-hidden','true'); });
          document.addEventListener('keydown', (ev)=>{ if(ev.key === 'Escape') condModal.classList.remove('open'); });
        }
      }catch(e){ /* ignore if modal not present */ }

      // helper to render conditions into the cond-modal from an object
      function renderConditionsModal(condObj, title){
        const condModal = document.getElementById('cond-modal');
        if(!condModal) return;
        const body = condModal.querySelector('.modal-body'); body.innerHTML = '';
        if(!condObj){ body.textContent = 'No conditions available.'; body.style.color = '#eaf3ea'; condModal.classList.add('open'); condModal.setAttribute('aria-hidden','false'); return; }
        const wrap = document.createElement('div'); wrap.className = 'cond-modal-body';
        wrap.innerHTML = `<p style="margin-top:0; color: #dfffe8 !important;">${title || 'Conditions'} for <strong style="color: #dfffe8 !important;">Bubble Gummy Auto</strong></p>`;
        const list = document.createElement('dl');
        list.style.display = 'grid'; list.style.gridTemplateColumns = '1fr 1fr'; list.style.gap = '.5rem'; list.style.marginTop = '.5rem';
        function addRow(k,v){ if(v === undefined || v === null) return; list.innerHTML += `<div><dt style="font-weight:700;color:#dfffe8 !important;">${k}</dt><dd style="margin:0;color:#cfe9d8 !important;">${v}</dd></div>`; }
        addRow('Day', condObj.day || condObj.Day || condObj['day'] || '');
        addRow('Light cycle', condObj.light || condObj['Light cycle'] || '');
        addRow('Temperature', (condObj.temp || condObj.Temperature) || '');
        addRow('Relative humidity', (condObj.rh || condObj['Relative humidity']) || '');
        addRow('VPD', condObj.vpd || condObj.VPD || '');
        addRow('Lights', (condObj.lights || condObj.Lights) || '');
        wrap.appendChild(list);
        const foot = document.createElement('div'); foot.style.marginTop = '.75rem'; foot.innerHTML = `<button class="btn btn-primary" id="cond-edit-from-modal" style="background: var(--brand); color: white; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Edit conditions</button>`;
        wrap.appendChild(foot);
        body.appendChild(wrap);
        // wire edit
        const editBtnModal = body.querySelector('#cond-edit-from-modal');
        if(editBtnModal){ editBtnModal.addEventListener('click', ()=>{ condModal.classList.remove('open'); condModal.setAttribute('aria-hidden','true'); const editBtn = document.getElementById('edit-conditions'); if(editBtn) editBtn.click(); }); }
        condModal.classList.add('open'); condModal.setAttribute('aria-hidden','false');
        const close = condModal.querySelector('.modal-close'); if(close) close.focus();
      }

      // wire per-entry small condition buttons
      try{
        const condButtons = Array.from(document.querySelectorAll('.entry-cond'));
        condButtons.forEach(b => {
          b.addEventListener('click', (ev) => {
            ev.stopPropagation();
            const raw = b.getAttribute('data-conds') || '';
            const parts = raw.split(';').map(s => s.trim()).filter(Boolean);
            const obj = {};
            parts.forEach(p => {
              const idx = p.indexOf('=');
              if(idx === -1) return;
              const k = p.slice(0,idx).trim();
              const v = p.slice(idx+1).trim();
              // normalize keys
              obj[k] = v;
            });
            renderConditionsModal(obj, b.closest('.timeline-entry') ? (b.closest('.timeline-entry').querySelector('time')||{}).textContent : 'Conditions');
          });
        });
      }catch(e){ /* ignore */ }

    }catch(e){
      // fail silently if not on plant page
    }
  }

  /* =========== Redesigned Plant Selector =========== */
  function initPlantSelector() {
    try {
      const plantCards = $$('.plant-card');
      const plantDetails = $$('.plant-detail');
      
      if (plantCards.length === 0) return;

      // Handle plant card clicks
      plantCards.forEach(card => {
        card.addEventListener('click', function() {
          const plantId = this.getAttribute('data-plant');
          
          // Don't switch if clicking on empty placeholder
          if (this.classList.contains('plant-card-empty')) return;
          
          // Update active card
          plantCards.forEach(c => c.classList.remove('active'));
          this.classList.add('active');
          
          // Show corresponding detail view
          plantDetails.forEach(detail => {
            detail.classList.remove('active');
            if (detail.id === `plant-detail-${plantId}`) {
              detail.classList.add('active');
            }
          });

          // Smooth scroll to detail
          const detailSection = $(`#plant-detail-${plantId}`);
          if (detailSection) {
            setTimeout(() => {
              detailSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
          }
        });
      });

      // Enhanced stats editing for redesigned layout
      const editBtn = $('#edit-conditions');
      const condForm = $('#cond-form');
      const cancelBtn = $('#cond-cancel');
      
      if (editBtn && condForm) {
        editBtn.addEventListener('click', () => {
          const isVisible = condForm.style.display !== 'none';
          condForm.style.display = isVisible ? 'none' : 'block';
          
          if (!isVisible) {
            // Populate form with current values
            const day = $('#stat-light')?.closest('.plant-detail')?.querySelector('[data-germinated]');
            if (day) {
              const germDate = new Date(day.getAttribute('data-germinated'));
              const now = new Date();
              const daysSince = Math.floor((now - germDate) / (1000 * 60 * 60 * 24));
              condForm.elements['day'].value = daysSince;
            }
            condForm.elements['light'].value = $('#stat-light')?.textContent || '';
            condForm.elements['temp'].value = $('#stat-temp')?.textContent.replace('°F', '') || '';
            condForm.elements['rh'].value = $('#stat-rh')?.textContent.replace('%', '') || '';
            condForm.elements['vpd'].value = $('#stat-vpd')?.textContent.replace(' kPa', '') || '';
            condForm.elements['lights'].value = $('#stat-lights')?.textContent.replace('%', '') || '';
            
            // Smooth scroll to form
            condForm.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        });
        
        if (cancelBtn) {
          cancelBtn.addEventListener('click', () => {
            condForm.style.display = 'none';
          });
        }
        
        condForm.addEventListener('submit', (e) => {
          e.preventDefault();
          
          // Update displayed values
          const light = condForm.elements['light'].value;
          const temp = condForm.elements['temp'].value;
          const rh = condForm.elements['rh'].value;
          const vpd = condForm.elements['vpd'].value;
          const lights = condForm.elements['lights'].value;
          
          if ($('#stat-light')) $('#stat-light').textContent = light;
          if ($('#stat-temp')) $('#stat-temp').textContent = temp + '°F';
          if ($('#stat-rh')) $('#stat-rh').textContent = rh + '%';
          if ($('#stat-vpd')) $('#stat-vpd').textContent = vpd + ' kPa';
          if ($('#stat-lights')) $('#stat-lights').textContent = lights + '%';
          
          // Save to localStorage
          try {
            const conditions = { light, temp, rh, vpd, lights };
            localStorage.setItem('plant_conditions_redesign', JSON.stringify(conditions));
          } catch (e) {}
          
          // Hide form with animation
          condForm.style.display = 'none';
          
          // Show success feedback
          const statsHeader = $('.stats-header');
          if (statsHeader) {
            const feedback = document.createElement('span');
            feedback.textContent = '✓ Saved';
            feedback.style.cssText = 'color: var(--brand); font-weight: 600; font-size: 0.9rem; animation: fadeIn 0.3s ease;';
            statsHeader.appendChild(feedback);
            setTimeout(() => feedback.remove(), 2000);
          }
        });
        
        // Load saved conditions on page load
        try {
          const saved = localStorage.getItem('plant_conditions_redesign');
          if (saved) {
            const conditions = JSON.parse(saved);
            if ($('#stat-light')) $('#stat-light').textContent = conditions.light || '20/4';
            if ($('#stat-temp')) $('#stat-temp').textContent = (conditions.temp || '78') + '°F';
            if ($('#stat-rh')) $('#stat-rh').textContent = (conditions.rh || '45') + '%';
            if ($('#stat-vpd')) $('#stat-vpd').textContent = (conditions.vpd || '1.8') + ' kPa';
            if ($('#stat-lights')) $('#stat-lights').textContent = (conditions.lights || '80') + '%';
          }
        } catch (e) {}
      }

      // Enhanced notes system for redesigned layout
      const noteForm = $('#note-form');
      const notesList = $('#notes-list');
      
      if (noteForm && notesList) {
        function loadNotes() {
          try {
            const raw = localStorage.getItem('plant_notes_redesign');
            return raw ? JSON.parse(raw) : [];
          } catch (e) {
            return [];
          }
        }
        
        function saveNotes(notes) {
          try {
            localStorage.setItem('plant_notes_redesign', JSON.stringify(notes));
          } catch (e) {}
        }
        
        function renderNotes() {
          const notes = loadNotes();
          if (notes.length === 0) {
            notesList.innerHTML = '<div style="text-align:center; padding:2rem; color:var(--muted)">No notes yet. Add your first care note above.</div>';
            return;
          }
          
          notesList.innerHTML = notes.map(note => `
            <div class="note-item">
              <div class="note-date">${note.date}</div>
              <div class="note-content">${note.text}</div>
            </div>
          `).join('');
        }
        
        noteForm.addEventListener('submit', (e) => {
          e.preventDefault();
          
          const text = noteForm.elements['note'].value.trim();
          if (!text) return;
          
          const date = new Date().toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          });
          
          const notes = loadNotes();
          notes.unshift({ date, text });
          saveNotes(notes);
          renderNotes();
          noteForm.reset();
          
          // Add a little success animation
          const addBtn = noteForm.querySelector('button[type="submit"]');
          if (addBtn) {
            const originalText = addBtn.innerHTML;
            addBtn.innerHTML = '✓ Added';
            addBtn.style.background = 'var(--brand)';
            setTimeout(() => {
              addBtn.innerHTML = originalText;
              addBtn.style.background = '';
            }, 1500);
          }
        });
        
        // Initial render
        renderNotes();
      }

      // Animate stat cards on page load
      const statCards = $$('.stat-card');
      statCards.forEach((card, index) => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        setTimeout(() => {
          card.style.transition = 'all 0.4s ease';
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, index * 50);
      });

    } catch (e) {
      // Fail silently if not on redesigned plants page
    }
  }

  /* =========== Dashboard Actions & Tracking =========== */
  function initDashboardActions() {
    try {
      const actionModal = $('#action-modal');
      const actionForm = $('#action-form');
      const modalTitle = actionModal ? actionModal.querySelector('h3') : null;
      const amountGroup = $('#amount-group');
      const nutrientsGroup = $('#nutrients-group');
      
      if (!actionModal || !actionForm) {
        console.log('Action modal or form not found');
        return;
      }
      
      // LocalStorage helpers
      function loadPlantData() {
        try {
          const raw = localStorage.getItem('plant_tracking_data');
          return raw ? JSON.parse(raw) : {};
        } catch (e) {
          return {};
        }
      }
      
      function savePlantData(data) {
        try {
          localStorage.setItem('plant_tracking_data', JSON.stringify(data));
        } catch (e) {}
      }
      
      function calculateDaysSince(dateString) {
        if (!dateString) return null;
        const then = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - then) / (1000 * 60 * 60 * 24));
        return diff;
      }
      
      // Open modal
      function openActionModal(actionType, plantId) {
        console.log('openActionModal called:', actionType, plantId);
        console.log('actionModal:', actionModal);
        console.log('actionForm:', actionForm);
        
        const titles = {
          water: '💧 Water Plant',
          feed: '🌱 Feed Plant',
          note: '📝 Add Note'
        };
        
        if (modalTitle) {
          modalTitle.textContent = titles[actionType] || 'Log Action';
        }
        
        // Set hidden fields
        const typeField = actionForm.elements['action-type'];
        const plantField = actionForm.elements['plant-id'];
        
        if (typeField) typeField.value = actionType;
        if (plantField) plantField.value = plantId;
        
        // Set current datetime
        const now = new Date();
        const dateTimeLocal = now.toISOString().slice(0, 16);
        const dateField = actionForm.elements['action-datetime'];
        if (dateField) dateField.value = dateTimeLocal;
        
        // Show/hide conditional fields
        if (amountGroup) {
          amountGroup.style.display = (actionType === 'water' || actionType === 'feed') ? 'block' : 'none';
        }
        if (nutrientsGroup) {
          nutrientsGroup.style.display = (actionType === 'feed') ? 'block' : 'none';
        }
        
        // Clear form fields safely
        const amountField = actionForm.elements['action-amount'];
        const nutrientsField = actionForm.elements['action-nutrients'];
        const notesField = actionForm.elements['action-notes'];
        
        if (amountField) amountField.value = '';
        if (nutrientsField) nutrientsField.value = '';
        if (notesField) notesField.value = '';
        
        console.log('Adding active class to modal');
        actionModal.classList.add('active');
        
        // Focus first visible input
        if (amountField && amountGroup && amountGroup.style.display !== 'none') {
          amountField.focus();
        } else if (notesField) {
          notesField.focus();
        }
      }
      
      // Close modal
      function closeActionModal() {
        actionModal.classList.remove('active');
      }
      
      // Update care tracking display
      function updateCareTracking(plantId, actionType, dateTime) {
        const plantCard = $(`.plant-card[data-plant="${plantId}"]`);
        if (!plantCard) return;
        
        const careTracking = plantCard.querySelector('.care-tracking');
        if (!careTracking) return;
        
        const days = calculateDaysSince(dateTime);
        const daysText = days === 0 ? 'Today' : days === 1 ? '1 day ago' : `${days} days ago`;
        
        if (actionType === 'water') {
          const waterValue = careTracking.querySelector('.care-item:nth-child(1) .care-value');
          if (waterValue) waterValue.textContent = daysText;
        } else if (actionType === 'feed') {
          const feedValue = careTracking.querySelector('.care-item:nth-child(2) .care-value');
          if (feedValue) feedValue.textContent = daysText;
        }
      }
      
      // Update tasks dashboard
      function updateTasksDashboard() {
        const plantData = loadPlantData();
        const wateringList = $('#watering-due-list');
        const feedingList = $('#feeding-due-list');
        
        if (!wateringList || !feedingList) return;
        
        const wateringDue = [];
        const feedingDue = [];
        
        // Check each plant
        Object.keys(plantData).forEach(plantId => {
          const plant = plantData[plantId];
          if (!plant.lastWatered && !plant.lastFed) return; // Skip germinating plants
          
          // Check watering (every 2-3 days)
          if (plant.lastWatered) {
            const daysSince = calculateDaysSince(plant.lastWatered);
            if (daysSince >= 2) {
              wateringDue.push({ id: plantId, name: plant.name || plantId, days: daysSince });
            }
          }
          
          // Check feeding (every 5-7 days)
          if (plant.lastFed) {
            const daysSince = calculateDaysSince(plant.lastFed);
            if (daysSince >= 5) {
              feedingDue.push({ id: plantId, name: plant.name || plantId, days: daysSince });
            }
          }
        });
        
        // Update watering list
        if (wateringDue.length === 0) {
          wateringList.innerHTML = '<div class="task-item"><p style="margin:0; color: #6c757d;">All caught up! 🎉</p></div>';
        } else {
          wateringList.innerHTML = wateringDue.map(p => `
            <div class="task-item">
              <p><strong>${p.name}</strong></p>
              <p class="task-detail">Last watered ${p.days} days ago</p>
            </div>
          `).join('');
        }
        
        // Update feeding list
        if (feedingDue.length === 0) {
          feedingList.innerHTML = '<div class="task-item"><p style="margin:0; color: #6c757d;">All caught up! 🎉</p></div>';
        } else {
          feedingList.innerHTML = feedingDue.map(p => `
            <div class="task-item">
              <p><strong>${p.name}</strong></p>
              <p class="task-detail">Last fed ${p.days} days ago</p>
            </div>
          `).join('');
        }
      }
      
      // Add timeline entry
      function addTimelineEntry(plantId, actionType, dateTime, amount, nutrients, notes) {
        const detailView = $(`#plant-detail-${plantId}`);
        if (!detailView) return;
        
        const timeline = detailView.querySelector('.timeline');
        if (!timeline) return;
        
        const icons = { water: '💧', feed: '🌱', note: '📝' };
        const titles = { water: 'Watered', feed: 'Fed', note: 'Note Added' };
        const badges = { water: 'badge-info', feed: 'badge-success', note: 'badge-primary' };
        
        const date = new Date(dateTime);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        
        let description = '';
        if (actionType === 'water' && amount) description = `Amount: ${amount}`;
        if (actionType === 'feed' && amount && nutrients) description = `${amount} of ${nutrients}`;
        if (notes) description += (description ? '. ' : '') + notes;
        
        const entry = document.createElement('div');
        entry.className = 'timeline-entry';
        entry.setAttribute('data-type', actionType);
        entry.innerHTML = `
          <div class="entry-dot"></div>
          <div class="entry-content">
            <time>${dateStr}</time>
            <h3>${icons[actionType]} ${titles[actionType]} <span class="badge ${badges[actionType]}">${actionType}</span></h3>
            ${description ? `<p>${description}</p>` : ''}
          </div>
        `;
        
        // Insert at top of timeline
        timeline.insertBefore(entry, timeline.firstChild);
      }
      
      // Handle action button clicks
      const actionButtons = $$('.btn-action');
      console.log('Found action buttons:', actionButtons.length);
      
      actionButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          e.preventDefault();
          const action = btn.getAttribute('data-action');
          const plant = btn.getAttribute('data-plant');
          console.log('Button clicked:', action, plant);
          openActionModal(action, plant);
        });
      });
      
      // Handle form submission
      actionForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const actionType = actionForm.elements['action-type'].value;
        const plantId = actionForm.elements['plant-id'].value;
        const dateTime = actionForm.elements['action-datetime'].value;
        const amount = actionForm.elements['action-amount'] ? actionForm.elements['action-amount'].value : '';
        const nutrients = actionForm.elements['action-nutrients'] ? actionForm.elements['action-nutrients'].value : '';
        const notes = actionForm.elements['action-notes'] ? actionForm.elements['action-notes'].value : '';
        
        // Load current data
        const plantData = loadPlantData();
        
        // Initialize plant if not exists
        if (!plantData[plantId]) {
          plantData[plantId] = {
            name: plantId,
            logs: []
          };
        }
        
        // Update last action dates
        if (actionType === 'water') {
          plantData[plantId].lastWatered = dateTime;
        } else if (actionType === 'feed') {
          plantData[plantId].lastFed = dateTime;
        }
        
        // Add log entry
        plantData[plantId].logs.unshift({
          type: actionType,
          date: dateTime,
          amount: amount,
          nutrients: nutrients,
          notes: notes
        });
        
        // Save data
        savePlantData(plantData);
        
        // Update UI
        updateCareTracking(plantId, actionType, dateTime);
        addTimelineEntry(plantId, actionType, dateTime, amount, nutrients, notes);
        updateTasksDashboard();
        
        // DOPAMINE EFFECTS! 🎉
        const messages = {
          water: ['💧 Watered successfully!', '💦 Plant hydrated!', '🌊 Great watering!'],
          feed: ['🌱 Nutrients added!', '🍃 Fed successfully!', '💚 Plant nourished!'],
          note: ['📝 Note saved!', '✍️ Logged successfully!', '📋 Note added!']
        };
        const icons = {
          water: '💧',
          feed: '🌱',
          note: '📝'
        };
        
        const messageList = messages[actionType] || ['✓ Action logged!'];
        const message = messageList[Math.floor(Math.random() * messageList.length)];
        
        // Show success notification
        showSuccessNotification(message, icons[actionType]);
        
        // Create confetti at modal center
        const modalRect = actionModal.getBoundingClientRect();
        createConfetti(modalRect.left + modalRect.width / 2, modalRect.top + modalRect.height / 2);
        
        // Celebrate the plant card
        const plantCard = $(`.plant-card[data-plant="${plantId}"]`);
        if (plantCard) {
          celebrateElement(plantCard);
          
          // Add shimmer effect briefly
          plantCard.classList.add('shimmer');
          setTimeout(() => plantCard.classList.remove('shimmer'), 2000);
        }
        
        // Close modal with slight delay for effect
        setTimeout(() => closeActionModal(), 300);
      });
      
      // Handle cancel button
      const cancelBtn = actionModal.querySelector('.btn-cancel');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', closeActionModal);
      }
      
      // Close on backdrop click
      actionModal.addEventListener('click', (e) => {
        if (e.target === actionModal) {
          closeActionModal();
        }
      });
      
      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && actionModal.classList.contains('active')) {
          closeActionModal();
        }
      });
      
      // Initialize with saved data
      updateTasksDashboard();
      
      // Update care tracking from saved data
      const plantData = loadPlantData();
      Object.keys(plantData).forEach(plantId => {
        const plant = plantData[plantId];
        if (plant.lastWatered) updateCareTracking(plantId, 'water', plant.lastWatered);
        if (plant.lastFed) updateCareTracking(plantId, 'feed', plant.lastFed);
      });
      
    } catch (e) {
      console.error('Dashboard actions error:', e);
    }
  }
  
  /* =========== Timeline Filtering =========== */
  function initTimelineFilters() {
    try {
      const filterBtns = $$('.filter-btn');
      
      filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
          const filter = this.getAttribute('data-filter');
          
          // Update active button
          filterBtns.forEach(b => b.classList.remove('active'));
          this.classList.add('active');
          
          // Find timeline entries in active plant detail
          const activePlantDetail = $('.plant-detail.active');
          if (!activePlantDetail) return;
          
          const entries = activePlantDetail.querySelectorAll('.timeline-entry');
          
          entries.forEach(entry => {
            if (filter === 'all') {
              entry.style.display = '';
            } else {
              const type = entry.getAttribute('data-type');
              entry.style.display = type === filter ? '' : 'none';
            }
          });
        });
      });
      
    } catch (e) {
      // Not on plants page or no filters
    }
  }
  
  /* =========== DOPAMINE EFFECTS =========== */
  function showSuccessNotification(message, icon = '✓') {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
      <span class="checkmark">${icon}</span>
      <span>${message}</span>
    `;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  function createRipple(event) {
    const button = event.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }
  
  function createConfetti(x, y) {
    const colors = ['#2f9e44', '#37b34a', '#4caf50', '#66bb6a', '#81c784'];
    const shapes = ['▀', '▄', '■', '●', '♦'];
    
    for (let i = 0; i < 15; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.textContent = shapes[Math.floor(Math.random() * shapes.length)];
      confetti.style.left = x + (Math.random() * 100 - 50) + 'px';
      confetti.style.top = y + 'px';
      confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.fontSize = (Math.random() * 20 + 10) + 'px';
      confetti.style.animationDelay = (Math.random() * 0.3) + 's';
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      
      document.body.appendChild(confetti);
      
      setTimeout(() => confetti.remove(), 5000);
    }
  }
  
  function celebrateElement(element) {
    element.classList.add('celebrating');
    setTimeout(() => element.classList.remove('celebrating'), 500);
  }
  
  function addRippleEffect() {
    // Add ripple to all action buttons
    $$('.btn-action, .btn-save, .btn-primary').forEach(btn => {
      if (!btn.classList.contains('ripple-container')) {
        btn.classList.add('ripple-container');
        btn.addEventListener('click', createRipple);
      }
    });
  }

  /* Initialize all functions */
  document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    markActiveNav();
    initSmoothScroll();
    initEducationSearch();
    initPlantPage();
    initPlantSelector(); // New redesigned plant selector
    initDashboardActions(); // Dashboard functionality
    initTimelineFilters(); // Timeline filtering
    addRippleEffect(); // Add satisfying ripple effects
    
    // Add celebration effect to plant cards on click
    $$('.plant-card').forEach(card => {
      card.addEventListener('click', function() {
        if (!this.classList.contains('active')) {
          celebrateElement(this);
        }
      });
    });
    
    // Add hover sound-like feedback to stat cards
    $$('.stat-card').forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-4px) scale(1.02)';
      });
      card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
      });
    });
  });

})();
