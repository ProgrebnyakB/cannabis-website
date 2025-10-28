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
              img.src = src;
              img.alt = `${title} photo ${idx+1}`;
              img.tabIndex = 0;
              img.addEventListener('click', () => {
                if(modalPhoto) modalPhoto.src = src;
                // set selected class
                gallery.querySelectorAll('img').forEach(i => i.classList.remove('selected'));
                img.classList.add('selected');
              });
              img.addEventListener('keydown', (ev) => { if(ev.key === 'Enter' || ev.key === ' ') img.click(); });
              gallery.appendChild(img);
            });
            // set first as selected
            const first = gallery.querySelector('img');
            if(first){ first.classList.add('selected'); if(modalPhoto) modalPhoto.src = first.src; }
          }
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden','false');
        // trap focus simplistically by focusing close button
        const btn = modal.querySelector('.modal-close'); if(btn) btn.focus();
      }

      function closeModal(){
        if(!modal) return;
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

    }catch(e){
      // fail silently if not on plant page
    }
  }

})();
