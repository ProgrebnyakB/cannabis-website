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
    // add more init calls here (modals, lightbox, analytics setup, etc.)
  }

  // Run on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
