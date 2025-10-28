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

  /* Smooth scrolling for same-page links */
  function initSmoothScroll(){
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if(!a) return;
      const href = a.getAttribute('href');
      if(href === '#' || href === '#!' ) return;
      const target = document.querySelector(href);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        // update focus for accessibility
        target.setAttribute('tabindex','-1');
        target.focus({preventScroll:true});
        window.setTimeout(()=> target.removeAttribute('tabindex'), 1000);
      }
    });
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
        if(!condObj){ body.textContent = 'No conditions available.'; condModal.classList.add('open'); condModal.setAttribute('aria-hidden','false'); return; }
        const wrap = document.createElement('div'); wrap.className = 'cond-modal-body';
        wrap.innerHTML = `<p style="margin-top:0; color: #dfffe8;">${title || 'Conditions'} for <strong>Bubble Gummy Auto</strong></p>`;
        const list = document.createElement('dl');
        list.style.display = 'grid'; list.style.gridTemplateColumns = '1fr 1fr'; list.style.gap = '.5rem'; list.style.marginTop = '.5rem';
        function addRow(k,v){ if(v === undefined || v === null) return; list.innerHTML += `<div><dt style="font-weight:700;color:#eaf3ea">${k}</dt><dd style="margin:0;color:#cfe9d8">${v}</dd></div>`; }
        addRow('Day', condObj.day || condObj.Day || condObj['day'] || '');
        addRow('Light cycle', condObj.light || condObj['Light cycle'] || '');
        addRow('Temperature', (condObj.temp || condObj.Temperature) || '');
        addRow('Relative humidity', (condObj.rh || condObj['Relative humidity']) || '');
        addRow('VPD', condObj.vpd || condObj.VPD || '');
        addRow('Lights', (condObj.lights || condObj.Lights) || '');
        wrap.appendChild(list);
        const foot = document.createElement('div'); foot.style.marginTop = '.75rem'; foot.innerHTML = `<button class="btn btn-primary" id="cond-edit-from-modal">Edit conditions</button>`;
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

})();
