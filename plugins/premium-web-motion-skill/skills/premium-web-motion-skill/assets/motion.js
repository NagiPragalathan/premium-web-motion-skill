/* ============================================================================
   premium-web-motion-skill — drop-in runtime
   Zero dependencies. Pairs with motion.css.

     <script src="motion.js" defer></script>
     <script>Motion.init()</script>          // or it self-inits on DOMContentLoaded

   Everything honours prefers-reduced-motion by showing the finished state.
   Every scroll listener is passive; all writes happen inside requestAnimationFrame.
   ========================================================================== */
(function (global) {
  'use strict';

  var reduceQuery = global.matchMedia('(prefers-reduced-motion: reduce)');
  var coarse = global.matchMedia('(pointer: coarse)');
  var reduced = function () { return reduceQuery.matches; };

  /* ------------------------------------------------------------- math --- */
  function clamp(v, min, max) {
    if (min === undefined) min = 0;
    if (max === undefined) max = 1;
    return Math.min(max, Math.max(min, v));
  }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function smoothstep(e0, e1, v) {
    var x = clamp((v - e0) / (e1 - e0));
    return x * x * (3 - 2 * x);
  }
  /* A phase that ramps in over [a,b] and out over [c,d]. The workhorse of
     multi-phase scroll rigs: `active` is the phase's live weight. */
  function segmentInOut(s, a, b, c, d) {
    var enter = smoothstep(a, b, s), exit = smoothstep(c, d, s);
    return { enter: enter, exit: exit, active: enter * (1 - exit) };
  }

  /* ------------------------------------------------- shared scroll loop --- */
  /* One RAF loop for the whole page. Subscribers get the smoothed scroll
     position; the loop parks itself when everything has settled. */
  var subs = [], target = 0, smooth = 0, raf = null, running = false;

  function requestTick() { if (!raf) raf = global.requestAnimationFrame(tick); }

  function tick() {
    raf = null;
    target = global.scrollY || global.pageYOffset || 0;
    smooth = reduced() ? target : lerp(smooth, target, 0.12);
    if (Math.abs(smooth - target) < 0.08) smooth = target;

    var busy = smooth !== target;
    for (var i = 0; i < subs.length; i++) {
      if (subs[i](smooth) === true) busy = true;   // a subscriber can hold the loop open
    }
    if (busy) raf = global.requestAnimationFrame(tick);
  }

  function onScroll() { requestTick(); }

  function subscribe(fn) {
    subs.push(fn);
    if (!running) {
      running = true;
      global.addEventListener('scroll', onScroll, { passive: true });
      global.addEventListener('resize', requestTick, { passive: true });
    }
    smooth = target = global.scrollY || 0;
    requestTick();
    return function unsubscribe() {
      var i = subs.indexOf(fn);
      if (i > -1) subs.splice(i, 1);
    };
  }

  /* ---------------------------------------------------------- entrance --- */
  /* Releases the pre-paint guard armed in <head>. Call after the last
     entrance animation, or let init() wire it to the slowest [data-anim]. */
  function releaseEntrance() {
    document.documentElement.classList.remove('entrance-pending');
    clearTimeout(global.__entranceFallback);
  }

  function entrance(root) {
    root = root || document;
    var els = root.querySelectorAll('[data-anim]');
    if (!els.length || reduced()) return releaseEntrance();

    // release on the element that finishes last (delay + duration), not the last in DOM order
    var slowest = null, slowestEnd = -1;
    for (var i = 0; i < els.length; i++) {
      var cs = getComputedStyle(els[i]);
      var end = parseFloat(cs.animationDelay) * 1000 + parseFloat(cs.animationDuration) * 1000;
      if (end > slowestEnd) { slowestEnd = end; slowest = els[i]; }
    }
    if (!slowest) return releaseEntrance();
    slowest.addEventListener('animationend', releaseEntrance, { once: true });
  }

  /* ------------------------------------------------------ scroll reveal --- */
  /* Fires once per element, then unobserves. Never re-animates on scroll-back. */
  function reveal(opts) {
    opts = opts || {};
    var sel = opts.selector || '[data-reveal]';
    var els = (opts.root || document).querySelectorAll(sel);
    if (!els.length) return;

    if (reduced() || !('IntersectionObserver' in global)) {
      for (var i = 0; i < els.length; i++) els[i].classList.add('is-visible', 'is-settled');
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-visible');
        e.target.addEventListener('transitionend', function () {
          e.target.classList.add('is-settled');      // drops will-change
        }, { once: true });
        io.unobserve(e.target);
      });
    }, {
      threshold: opts.threshold === undefined ? 0.15 : opts.threshold,
      rootMargin: opts.rootMargin || '0px 0px -40px 0px'
    });

    for (var j = 0; j < els.length; j++) io.observe(els[j]);
    return io;
  }

  /* ---------------------------------------------------------- parallax --- */
  /* <div data-parallax="-120">  —  travels +120px to -120px across the viewport.
     Far layers get the larger number; near layers the smaller. */
  function parallax(opts) {
    opts = opts || {};
    var els = Array.prototype.slice.call(
      (opts.root || document).querySelectorAll(opts.selector || '[data-parallax]'));
    if (!els.length || reduced()) return;

    var mobile = global.innerWidth < 768;
    var layers = els.map(function (el) {
      var dist = parseFloat(el.dataset.parallax || '80');
      return { el: el, dist: mobile ? dist * 0.4 : dist, y: 0 };   // halve the travel on mobile
    });

    return subscribe(function () {
      var busy = false;
      for (var i = 0; i < layers.length; i++) {
        var L = layers[i];
        var r = L.el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > global.innerHeight + 200) continue;   // offscreen: skip
        var p = clamp((global.innerHeight - r.top) / (global.innerHeight + r.height));
        var next = lerp(L.dist, -L.dist, p);
        if (Math.abs(next - L.y) > 0.05) busy = true;
        L.y = next;
        L.el.style.transform = 'translate3d(0,' + next.toFixed(2) + 'px,0)';
      }
      return busy;
    });
  }

  /* ---------------------------------------------- pointer parallax / spot -- */
  /* Writes --mx/--my (percent, for .m-spotlight) and --px/--py (-0.5⬦0.5,
     for layered pointer parallax) on the target element. */
  function pointer(opts) {
    opts = opts || {};
    var el = opts.el || document.documentElement;
    if (reduced() || coarse.matches) return;

    var tx = 0, ty = 0, cx = 0, cy = 0, praf = null;
    var damp = opts.damping === undefined ? 0.12 : opts.damping;

    global.addEventListener('pointermove', function (e) {
      tx = e.clientX / global.innerWidth - 0.5;
      ty = e.clientY / global.innerHeight - 0.5;
      if (!praf) praf = global.requestAnimationFrame(step);
    }, { passive: true });

    function step() {
      praf = null;
      cx = lerp(cx, tx, damp);
      cy = lerp(cy, ty, damp);
      el.style.setProperty('--px', cx.toFixed(4));
      el.style.setProperty('--py', cy.toFixed(4));
      el.style.setProperty('--mx', ((cx + 0.5) * 100).toFixed(2) + '%');
      el.style.setProperty('--my', ((cy + 0.5) * 100).toFixed(2) + '%');
      if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) {
        praf = global.requestAnimationFrame(step);
      }
    }
  }

  /* ---------------------------------------------------------- magnetic --- */
  /* One primary CTA. A page of magnetic elements feels like the layout slides. */
  function magnetic(el, opts) {
    opts = opts || {};
    if (!el || reduced() || coarse.matches) return;
    var strength = opts.strength === undefined ? 0.35 : opts.strength;   // >0.5 outruns the cursor
    var radius = opts.radius === undefined ? 120 : opts.radius;
    var tx = 0, ty = 0, cx = 0, cy = 0, mraf = null;

    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      if (Math.sqrt(dx * dx + dy * dy) > radius + Math.max(r.width, r.height) / 2) return;
      tx = dx * strength; ty = dy * strength;
      if (!mraf) mraf = global.requestAnimationFrame(step);
    });
    el.addEventListener('pointerleave', function () {
      tx = 0; ty = 0;
      if (!mraf) mraf = global.requestAnimationFrame(step);
    });

    function step() {
      mraf = null;
      cx = lerp(cx, tx, 0.15); cy = lerp(cy, ty, 0.15);
      el.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      if (Math.abs(tx - cx) > 0.1 || Math.abs(ty - cy) > 0.1) {
        mraf = global.requestAnimationFrame(step);
      }
    }
  }

  /* -------------------------------------------------------------- tilt --- */
  function tilt(el, opts) {
    opts = opts || {};
    if (!el || reduced() || coarse.matches) return;
    var max = opts.max === undefined ? 12 : opts.max;    // >14deg reads as a glitch
    var persp = opts.perspective === undefined ? 900 : opts.perspective;
    var trx = 0, try_ = 0, rx = 0, ry = 0, traf = null;

    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      trx = -py * max; try_ = px * max;
      if (!traf) traf = global.requestAnimationFrame(step);
    });
    el.addEventListener('pointerleave', function () {
      trx = 0; try_ = 0;
      if (!traf) traf = global.requestAnimationFrame(step);
    });

    function step() {
      traf = null;
      rx = lerp(rx, trx, 0.12); ry = lerp(ry, try_, 0.12);   // the lag IS the sense of mass
      el.style.transform = 'perspective(' + persp + 'px) rotateX(' + rx.toFixed(2) +
                           'deg) rotateY(' + ry.toFixed(2) + 'deg) translateZ(0)';
      if (Math.abs(trx - rx) > 0.05 || Math.abs(try_ - ry) > 0.05) {
        traf = global.requestAnimationFrame(step);
      }
    }
  }

  /* ------------------------------------------------------- count-up ------ */
  function counter(el, opts) {
    opts = opts || {};
    var value = opts.value !== undefined ? opts.value : parseFloat(el.dataset.count || '0');
    var decimals = opts.decimals !== undefined ? opts.decimals : parseInt(el.dataset.decimals || '0', 10);
    var prefix = opts.prefix || el.dataset.prefix || '';
    var suffix = opts.suffix || el.dataset.suffix || '';
    var duration = opts.duration || 1500;

    var render = function (v) { el.textContent = prefix + v.toFixed(decimals) + suffix; };
    render(0);                                   // never render empty — prevents layout shift
    if (reduced()) return render(value);

    var start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var t = clamp((ts - start) / duration);
      var eased = 1 - Math.pow(1 - t, 3);        // easeOutCubic — linear looks like a progress bar
      render(value * eased);
      if (t < 1) global.requestAnimationFrame(frame);
    }

    if (!('IntersectionObserver' in global)) return global.requestAnimationFrame(frame);
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      io.disconnect();
      global.requestAnimationFrame(frame);
    }, { threshold: 0, rootMargin: '-50px' });
    io.observe(el);
  }

  /* ------------------------------------------------------------ scramble -- */
  var SCRAMBLE_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~|}{[]:;?><';

  function scramble(el, opts) {
    opts = opts || {};
    var text = opts.text || el.dataset.scramble || el.textContent;
    var delay = opts.delay || 0;
    var speed = opts.speed || 0.5;               // characters revealed per frame
    var interval = opts.interval || 25;

    if (reduced()) { el.textContent = text; return; }
    el.innerHTML = '&nbsp;';                     // reserve the line box

    setTimeout(function () {
      var cursor = 0, id = setInterval(function () {
        var out = '';
        for (var i = 0; i < text.length; i++) {
          if (text[i] === ' ') { out += ' '; continue; }
          if (i < cursor) out += text[i];
          // random noise only in a 3-char window ahead of the cursor — a wider
          // window reads as TV static rather than a decode
          else if (i < cursor + 3) out += SCRAMBLE_CHARS[(Math.random() * SCRAMBLE_CHARS.length) | 0];
        }
        el.textContent = out;
        cursor += speed;
        if (cursor >= text.length) { clearInterval(id); el.textContent = text; }
      }, interval);
    }, delay);
  }

  /* -------------------------------------------------------- video loop --- */
  /* Crossfades the seam on a video whose loop point isn't clean. */
  function videoLoop(video, opts) {
    opts = opts || {};
    if (!video) return;
    var fadeIn = opts.fadeIn || 500, fadeOut = opts.fadeOut || 550, tail = opts.tail || 0.55;
    video.style.opacity = '0';
    video.removeAttribute('loop');                       // we drive the loop ourselves

    var fadeToken = 0;
    function fade(from, to, ms) {
      var token = ++fadeToken, start = null;
      function step(ts) {
        if (token !== fadeToken) return;              // a newer fade superseded this one
        if (start === null) start = ts;
        var t = clamp((ts - start) / ms);
        video.style.opacity = String(lerp(from, to, t));
        if (t < 1) global.requestAnimationFrame(step);
      }
      global.requestAnimationFrame(step);
    }

    video.addEventListener('canplay', function () {
      video.play().catch(function () {});
      fade(0, 1, fadeIn);
    }, { once: true });

    var fadingOut = false;
    video.addEventListener('timeupdate', function () {
      if (fadingOut || !video.duration) return;
      if (video.duration - video.currentTime <= tail) {
        fadingOut = true;
        fade(parseFloat(video.style.opacity) || 1, 0, fadeOut);
      }
    });

    video.addEventListener('ended', function () {
      fadeToken++;                                    // cancel any in-flight fade
      video.style.opacity = '0';
      setTimeout(function () {
        video.currentTime = 0;
        fadingOut = false;
        video.play().catch(function () {});
        fade(0, 1, fadeIn);
      }, 100);
    });
  }

  /* ------------------------------------------------------ video scrub ---- */
  /* Scroll position drives currentTime. Needs a densely-keyframed encode
     (ffmpeg -g 1) or seeking is unusably slow. Do NOT also loop the video. */
  function videoScrub(video, opts) {
    opts = opts || {};
    if (!video || reduced()) return;
    var section = opts.section || video.parentElement;
    var smoothT = 0, targetT = 0;

    return subscribe(function () {
      if (!video.duration) return false;
      var r = section.getBoundingClientRect();
      var p = clamp(-r.top / Math.max(1, section.offsetHeight - global.innerHeight));
      targetT = p * video.duration;
      smoothT = lerp(smoothT, targetT, 0.12);
      if (Math.abs(smoothT - targetT) < 0.005) smoothT = targetT;
      try { video.currentTime = smoothT; } catch (e) { /* seek not ready */ }
      return smoothT !== targetT;
    });
  }

  /* ---------------------------------------------------------- marquee ---- */
  /* Duplicates the track content exactly once so translateX(-50%) is seamless.
     Any other duplication factor shows a jump at the seam. */
  function marquee(root) {
    var tracks = (root || document).querySelectorAll('.m-marquee__track');
    for (var i = 0; i < tracks.length; i++) {
      var t = tracks[i];
      if (t.dataset.duplicated === 'true') continue;
      t.innerHTML += t.innerHTML;
      t.dataset.duplicated = 'true';
    }
  }

  /* ----------------------------------------------------------- drawer ---- */
  function drawer(opts) {
    opts = opts || {};
    var toggle = opts.toggle || document.querySelector('[data-drawer-toggle]');
    var panel = opts.panel || document.querySelector('[data-drawer-panel]');
    if (!toggle || !panel) return;
    var host = opts.host || document.documentElement;
    var cls = opts.className || 'is-open';
    var open = false;

    function set(next) {
      open = next;
      host.classList.toggle(cls, open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        panel.removeAttribute('inert');
        var first = panel.querySelector('a, button, [tabindex]');
        if (first) first.focus();
      } else {
        panel.setAttribute('inert', '');
      }
    }

    set(false);
    toggle.addEventListener('click', function () { set(!open); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) set(false); });
    global.addEventListener('resize', function () {
      if (open && global.innerWidth >= (opts.breakpoint || 768)) set(false);
    }, { passive: true });
    return { open: function () { set(true); }, close: function () { set(false); } };
  }

  /* -------------------------------------------------------------- init --- */
  function init(opts) {
    opts = opts || {};
    entrance(opts.root);
    reveal(opts.reveal);
    marquee(opts.root);
    parallax(opts.parallax);
    if (opts.pointer !== false) pointer(opts.pointer === true ? {} : opts.pointer);
    document.querySelectorAll('[data-count]').forEach(function (el) { counter(el); });
    document.querySelectorAll('[data-magnetic]').forEach(function (el) { magnetic(el); });
    document.querySelectorAll('[data-tilt]').forEach(function (el) { tilt(el); });
    document.querySelectorAll('[data-scramble]').forEach(function (el) { scramble(el); });
    drawer(opts.drawer);
  }

  var Motion = {
    init: init,
    entrance: entrance, releaseEntrance: releaseEntrance,
    reveal: reveal, parallax: parallax, pointer: pointer,
    magnetic: magnetic, tilt: tilt, counter: counter, scramble: scramble,
    videoLoop: videoLoop, videoScrub: videoScrub, marquee: marquee, drawer: drawer,
    subscribe: subscribe,
    utils: { clamp: clamp, lerp: lerp, smoothstep: smoothstep, segmentInOut: segmentInOut,
             reduced: reduced }
  };

  global.Motion = Motion;
  if (typeof module !== 'undefined' && module.exports) module.exports = Motion;

  if (!global.__MOTION_NO_AUTOINIT) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { init(); }, { once: true });
    } else {
      init();
    }
  }
})(typeof window !== 'undefined' ? window : this);
