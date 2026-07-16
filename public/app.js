(function () {
  const state = { rate: null, hours: null, goal: null, model: null, profession: null };
  const results = {};
  let gateSubmitted = false;
  let bookingUrl = 'https://www.authoritydotio.com/masterclass-schedule63952453';

  function trackEvent(name, payload) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, payload || {}));
  }

  function setDotDone(i, done) {
    document.querySelectorAll('[data-pd="' + i + '"]').forEach((el) => el.classList.toggle('done', done));
  }

  fetch('/api/config')
    .then((r) => r.json())
    .then((cfg) => {
      bookingUrl = cfg.bookingUrl || '#';
      document.getElementById('cta-book').href = bookingUrl;
    })
    .catch(() => {});

  window.addEventListener('DOMContentLoaded', function () {
    const rateEl = document.getElementById('rate');
    const goalEl = document.getElementById('goal');

    rateEl.addEventListener('input', function () {
      document.getElementById('btn0').disabled = !(parseFloat(this.value) > 0);
    });
    goalEl.addEventListener('input', function () {
      document.getElementById('btn2').disabled = !(parseFloat(this.value) > 0);
    });
    rateEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && parseFloat(this.value) > 0) go(1);
    });
    goalEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' && parseFloat(this.value) > 0) go(3);
    });
  });

  function go(n) {
    if (n === 1) {
      const v = parseFloat(document.getElementById('rate').value);
      if (!(v > 0)) return;
      state.rate = v;
    }
    if (n === 3) {
      const v = parseFloat(document.getElementById('goal').value);
      if (!(v > 0)) return;
      state.goal = v;
    }
    document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
    document.getElementById('s' + n).classList.add('active');
    for (let i = 0; i <= n; i++) setDotDone(i, true);
    trackEvent('quiz_step_complete', { step: n });
  }

  function goBack(n) {
    document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
    document.getElementById('s' + n).classList.add('active');
    trackEvent('quiz_step_back', { step: n });
  }

  function selOpt(key, val, el) {
    el.parentElement.querySelectorAll('.opt').forEach((b) => b.classList.remove('sel'));
    el.classList.add('sel');
    state[key] = val;
    if (key === 'hours') document.getElementById('btn1').disabled = false;
    if (key === 'model') document.getElementById('btn3').disabled = false;
  }

  function fillEx(v) {
    document.getElementById('profession').value = v;
  }

  function fmt(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M';
    if (n >= 1000) return '$' + Math.round(n / 1000) + 'K';
    return '$' + Math.round(n);
  }

  function computeResults() {
    const { rate, hours, goal, model, profession } = state;
    const WEEKS = 48;
    const ceiling = Math.round(rate * hours * WEEKS);
    const gap = Math.max(0, goal - ceiling);
    const locked = 100 - model;
    const hrsNeeded = Math.round(goal / (rate * WEEKS));
    const worthPerHr = Math.round(goal / (hours * WEEKS));
    const reclaimHrs = Math.max(2, hours - Math.round(hours * 0.25));

    Object.assign(results, { ceiling, gap, locked, hrsNeeded, worthPerHr, reclaimHrs });

    document.getElementById('r-ceiling').textContent = fmt(ceiling);
    document.getElementById('r-goal').textContent = fmt(goal);
    document.getElementById('r-hrs-needed').textContent = hrsNeeded + ' hrs/wk';
    document.getElementById('r-hrs-sub').textContent =
      hrsNeeded > hours
        ? "That's " + (hrsNeeded - hours) + ' more hours than you currently work — every single week'
        : 'Nearly your full current load, with zero room to grow';
    document.getElementById('r-worth').textContent = fmt(worthPerHr) + '/hr';
    document.getElementById('r-current-rate').textContent = '$' + rate;
    document.getElementById('r-reclaim').textContent = reclaimHrs + ' hrs/wk';
    document.getElementById('print-name').textContent = profession;

    const goalAbove = goal > ceiling;
    document.getElementById('res-title').textContent = goalAbove
      ? 'Your goal is above what your current model will ever allow.'
      : 'You could reach your goal — but one slow month ends it.';
    document.getElementById('res-sub').textContent = goalAbove
      ? 'To hit ' + fmt(goal) + ' at your current rate you\'d need to work ' + hrsNeeded + " hours every week. That's not a hustle problem. It's a model problem."
      : 'Your time is worth ' + fmt(worthPerHr) + '/hr at your goal — you\'re currently at $' + rate + '. And at ' + locked + '% time-locked, your income stops the moment you do.';

    const maxV = Math.max(ceiling, goal);
    const ceilPct = Math.round((Math.min(ceiling, goal) / maxV) * 85);
    setTimeout(() => {
      document.getElementById('gap-fill-goal').style.width = '85%';
      document.getElementById('gap-fill-ceiling').style.width = ceilPct + '%';
      document.getElementById('gap-marker-ceiling').style.left = ceilPct + '%';
      document.getElementById('gap-marker-goal').style.left = '85%';
    }, 150);
    document.getElementById('gap-label-ceiling').textContent = 'Current ceiling: ' + fmt(ceiling);
    document.getElementById('gap-label-goal').textContent = 'Income goal: ' + fmt(goal);
    document.getElementById('gap-amount').textContent = gap > 0 ? fmt(gap) : 'At ceiling';
    document.getElementById('gap-sub-text').textContent =
      gap > 0
        ? 'No rate increase or extra hours closes a ' + fmt(gap) + ' gap — only a different model does.'
        : "You're at your ceiling. Every dollar still requires your direct presence.";

    const lev = model;
    let lc, lb, ld;
    if (lev === 0) {
      lc = '#A32D2D'; lb = '#FCEBEB';
      ld = 'Fully time-locked. Every dollar requires your presence. One slow month and the whole thing stops.';
    } else if (lev <= 25) {
      lc = '#854F0B'; lb = '#FAEEDA';
      ld = "Mostly time-locked. You've started the shift, but most of your income still depends on your hours.";
    } else if (lev <= 50) {
      lc = '#0F6E56'; lb = '#E1F5EE';
      ld = 'Balanced. Half your income has leverage. The other half is a ceiling waiting to press down on you.';
    } else {
      lc = '#185FA5'; lb = '#E6F1FB';
      ld = "Good leverage. Most income doesn't require your direct time — now it's about compounding what's working.";
    }
    const circ = document.getElementById('lev-circle');
    circ.style.background = lb;
    circ.style.color = lc;
    circ.textContent = lev;
    document.getElementById('lev-desc').textContent = ld;

    document.getElementById('insight-text').textContent = goalAbove
      ? 'Your time is worth ' + fmt(worthPerHr) + '/hr at your goal — you\'re currently earning $' + rate + '/hr. That ' + fmt(worthPerHr - rate) + "/hr gap isn't closed by working harder or raising your rate alone. It closes when your expertise earns beyond the hours you work. A scalable asset gives you back " + reclaimHrs + ' hours a week — and keeps earning while you\'re in them.'
      : 'Your time is worth ' + fmt(worthPerHr) + '/hr at your goal — close to your current rate, but 100% of it requires you to show up. A scalable asset gives you back ' + reclaimHrs + " hours a week and keeps earning the weeks you don't.";

    trackEvent('results_view', { profession, ceiling, goal, gap, leverageScore: model });
  }

  function submitGate() {
    const btn = document.getElementById('gate-btn');
    const profession = document.getElementById('profession').value.trim();
    const name = document.getElementById('gate-name').value.trim();
    const email = document.getElementById('gate-email').value.trim();
    const validEmail = /\S+@\S+\.\S+/.test(email);

    let errorMsg = null;
    if (profession.length < 3) errorMsg = 'Please enter your profession above →';
    else if (!name) errorMsg = 'Please enter your first name →';
    else if (!validEmail) errorMsg = 'Please enter a valid email →';

    if (errorMsg) {
      const original = btn.textContent;
      btn.textContent = errorMsg;
      btn.classList.add('err');
      setTimeout(() => {
        btn.textContent = original;
        btn.classList.remove('err');
      }, 2200);
      return;
    }
    if (gateSubmitted) return;
    gateSubmitted = true;
    btn.disabled = true;
    btn.textContent = 'Unlocking your blueprint...';

    state.profession = profession;
    computeResults();

    const { rate, hours, goal, model } = state;
    const payload = {
      firstName: name,
      email,
      profession,
      rate,
      hours,
      goal,
      ceiling: results.ceiling,
      gap: results.gap,
      leverageScore: model,
      timeLockedPct: results.locked,
      hoursNeeded: results.hrsNeeded,
      worthPerHr: results.worthPerHr,
      reclaimHrs: results.reclaimHrs,
    };

    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(() => {}).finally(() => {
      trackEvent('email_submit', { profession });
      document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
      document.getElementById('s-results').classList.add('active');
      document.getElementById('transition-box').style.display = 'block';
      for (let i = 0; i <= 5; i++) setDotDone(i, true);
      generateBlueprint(payload);
    });
  }

  const msgs = [
    'Analysing your expertise...',
    "Mapping your process to the 4 C's...",
    'Building your value-based pricing...',
    'Calculating your week comparison...',
    'Finalising your blueprint...',
  ];

  function generateBlueprint(payload) {
    const spinnerWrap = document.getElementById('spinner-wrap');
    spinnerWrap.style.display = 'block';
    spinnerWrap.scrollIntoView({ behavior: 'smooth', block: 'center' });
    let i = 0;
    const iv = setInterval(() => {
      i = (i + 1) % msgs.length;
      document.getElementById('spin-text').textContent = msgs[i];
    }, 2200);

    fetch('/api/blueprint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error('blueprint request failed');
        return r.json();
      })
      .then((bp) => {
        clearInterval(iv);
        renderBP(bp, payload);
        trackEvent('blueprint_render', { profession: payload.profession, fallback: false });
      })
      .catch(() => {
        clearInterval(iv);
        document.getElementById('spinner-wrap').style.display = 'none';
        renderFallback(payload);
        trackEvent('blueprint_render', { profession: payload.profession, fallback: true });
      });
  }

  function renderBP(bp, payload) {
    document.getElementById('bp-headline').textContent = bp.headline || '';
    document.getElementById('bp-summary').textContent = bp.summary || '';
    document.getElementById('c-curriculum').textContent = (bp.fourCs && bp.fourCs.curriculum) || '';
    document.getElementById('c-coaching').textContent = (bp.fourCs && bp.fourCs.coaching) || '';
    document.getElementById('c-community').textContent = (bp.fourCs && bp.fourCs.community) || '';
    document.getElementById('c-pop').textContent = (bp.fourCs && bp.fourCs.pop) || '';
    document.getElementById('bp-asset').textContent = bp.assetName || '';
    document.getElementById('bp-size').textContent = bp.clientSize || '';
    document.getElementById('bp-price').textContent = (bp.valuePricing && bp.valuePricing.recommendedPrice) || '';
    document.getElementById('m-title').textContent = (bp.mastery && bp.mastery.title) || '';
    document.getElementById('m-body').textContent = (bp.mastery && bp.mastery.body) || '';
    document.getElementById('me-title').textContent = (bp.method && bp.method.title) || '';
    document.getElementById('me-body').textContent = (bp.method && bp.method.body) || '';
    document.getElementById('mn-title').textContent = (bp.mentorship && bp.mentorship.title) || '';
    document.getElementById('mn-body').textContent = (bp.mentorship && bp.mentorship.body) || '';

    const wk = bp.weekComparison || {};
    document.getElementById('w-now-sessions').textContent = wk.nowSessions || '';
    document.getElementById('w-now-admin').textContent = wk.nowAdmin || '';
    document.getElementById('w-now-mktg').textContent = wk.nowMktg || '';
    document.getElementById('w-now-income').textContent = wk.nowIncome || '';
    document.getElementById('w-after-calls').textContent = wk.afterCalls || '';
    document.getElementById('w-after-delivery').textContent = wk.afterDelivery || '';
    document.getElementById('w-after-income').textContent = wk.afterIncome || '';
    document.getElementById('w-after-stop').textContent = wk.afterStop || 'Continues earning';
    document.getElementById('week-note').textContent = wk.note || '';

    const vp = bp.valuePricing || {};
    document.getElementById('p-cost').textContent = vp.problemCost || '';
    document.getElementById('p-cost-desc').textContent = (vp.yearsStruggling || '') + ' avg. years struggling';
    document.getElementById('p-range').textContent = vp.priceRange || '';
    document.getElementById('p-why-val').textContent = vp.recommendedPrice || '';
    document.getElementById('p-why-desc').textContent = vp.whyItWorks || '';
    document.getElementById('p-note').textContent = vp.pricingNote || '';

    const ns = bp.nextSteps || {};
    document.getElementById('ns-title').textContent = ns.title || 'Start extracting your methodology this week';
    document.getElementById('ns-body').textContent =
      ns.body ||
      "Your income ceiling is clear. The next step is turning your expertise into a structured program — and the fastest path there is a conversation with our team. We'll show you exactly how to go from where you are to a fully scalable online education business.";

    document.getElementById('spinner-wrap').style.display = 'none';
    document.getElementById('blueprint-section').style.display = 'block';
  }

  function renderFallback(payload) {
    document.getElementById('bp-headline').textContent =
      'Your expertise as ' + payload.profession + ' can become a scalable asset — here is where to start.';
    document.getElementById('bp-summary').textContent =
      "We couldn't generate your full personalised blueprint right now, but your income ceiling diagnosis stands: your time is worth " +
      fmt(payload.worthPerHr) +
      '/hr at your goal, and a scalable asset could reclaim ' +
      payload.reclaimHrs +
      ' hours a week.';
    ['c-curriculum', 'c-coaching', 'c-community', 'c-pop', 'bp-asset', 'm-title', 'm-body', 'me-title', 'me-body', 'mn-title', 'mn-body', 'w-now-sessions', 'w-now-admin', 'w-now-mktg', 'w-now-income', 'w-after-calls', 'w-after-delivery', 'w-after-income', 'p-cost', 'p-cost-desc', 'p-range', 'p-why-val', 'p-why-desc', 'p-note'].forEach((id) => {
      document.getElementById(id).textContent = '';
    });
    document.getElementById('bp-size').textContent = '';
    document.getElementById('bp-price').textContent = '';
    document.getElementById('w-after-stop').textContent = 'Continues earning';
    document.getElementById('week-note').textContent = '';

    document.getElementById('ns-title').textContent = 'Start extracting your methodology this week';
    document.getElementById('ns-body').textContent =
      "Your income ceiling is clear. The next step is turning your expertise into a structured program — and the fastest path there is a conversation with our team. We'll show you exactly how to go from where you are to a fully scalable online education business.";

    document.getElementById('blueprint-section').style.display = 'block';
  }

  function downloadPdf() {
    trackEvent('pdf_download', { profession: state.profession });
    window.print();
  }

  function restart() {
    document.querySelectorAll('.step').forEach((s) => s.classList.remove('active'));
    document.getElementById('s0').classList.add('active');
    for (let i = 0; i <= 5; i++) setDotDone(i, false);
    setDotDone(0, true);
    ['rate', 'goal', 'profession'].forEach((id) => (document.getElementById(id).value = ''));
    ['gate-name', 'gate-email'].forEach((id) => (document.getElementById(id).value = ''));
    document.querySelectorAll('.opt').forEach((b) => b.classList.remove('sel'));
    ['btn0', 'btn1', 'btn2', 'btn3'].forEach((id) => (document.getElementById(id).disabled = true));
    document.getElementById('blueprint-section').style.display = 'none';
    document.getElementById('spinner-wrap').style.display = 'none';
    document.getElementById('transition-box').style.display = 'none';
    document.getElementById('gate-btn').disabled = false;
    document.getElementById('gate-btn').textContent = 'Unlock my blueprint →';
    document.getElementById('gate-btn').classList.remove('err');
    gateSubmitted = false;
    Object.keys(state).forEach((k) => (state[k] = null));
  }

  window.AA = { go, goBack, selOpt, fillEx, submitGate, downloadPdf, restart, trackEvent };
})();
