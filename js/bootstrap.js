
(async function(){
  const APP_VERSION = '2026.04.19.phase5-scenario-only-r1';

  async function clearWGLTSiteData(){
    try{ localStorage.clear(); }catch(err){}
    try{ sessionStorage.clear(); }catch(err){}
    try{
      if('caches' in window){
        const names = await caches.keys();
        await Promise.all(names.map(name => caches.delete(name)));
      }
    }catch(err){}
    try{
      if('serviceWorker' in navigator){
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(reg => reg.unregister()));
      }
    }catch(err){}
  }

  try{
    const seenVersion = localStorage.getItem('wglt_app_version');
    if(seenVersion !== APP_VERSION){
      await clearWGLTSiteData();
      try{ localStorage.setItem('wglt_app_version', APP_VERSION); }catch(err){}
      const url = new URL(window.location.href);
      url.searchParams.set('v', APP_VERSION);
      window.location.replace(url.toString());
      return;
    }
  }catch(err){
    console.warn('Version guard skipped', err);
  }

  window.WGLT_APP_VERSION = APP_VERSION;
  window.clearWGLTSiteData = clearWGLTSiteData;

  const files = {
    bench: './data/bench.json',
    flBuckets: './data/fl-buckets.json',
    weekCalendar: './data/week-calendar.json',
    bankProducts: './data/bank-products.json',
    contracts: './data/contracts.json',
    jobs: './data/jobs.json',
    ledgerCatalog: './data/ledger-catalog.json',
    socialWantsDeck: './data/social-wants-deck.json',
    masterData: './data/master-data.json',
    modes: './data/modes.json',
    experienceModes: './data/experience-modes.json',
    presentationRoles: './data/presentation-roles.json',
    teacherTools: './data/teacher-tools.json',
    eliteContracts: './data/elite-contracts.json',
    eliteScenarios: './data/elite-scenarios.json',
    delayedConsequences: './data/delayed-consequences.json',
    realLifeEvents: './data/real-life-events.json',
    financialEvents: './data/financial-events.json',
    opportunityEvents: './data/opportunity-events.json',
    advancedDelayedConsequences: './data/advanced-delayed-consequences.json',
    scenarioIndex: './data/scenario-index.json',
    scenarioSchema: './data/scenarios/scenario.schema.json',
    consequenceSchema: './data/consequences/consequence.schema.json',
    scenarioRealLifeFoundation: './data/scenarios/real-life-foundation.json',
    scenarioFinancialFoundation: './data/scenarios/financial-foundation.json',
    scenarioOpportunityFoundation: './data/scenarios/opportunity-foundation.json',
    scenarioEliteCreditFoundation: './data/scenarios/elite-credit-foundation.json',
    scenarioOpportunityJobExpansionV1: './data/scenarios/opportunity-job-expansion-v1.json',
    scenarioRealLifeExpansionV1: './data/scenarios/real-life-expansion-v1.json',
    scenarioFinancialExpansionV1: './data/scenarios/financial-expansion-v1.json',
    consequenceMapFoundation: './data/consequences/consequence-map-foundation.json'
  };
  const failures = [];
  const entries = [];
  for (const [key, path] of Object.entries(files)) {
    try {
      const res = await fetch(path + '?v=' + encodeURIComponent(APP_VERSION), {cache:'no-store'});
      if(!res.ok) throw new Error(`HTTP ${res.status} loading ${path}`);
      entries.push([key, await res.json()]);
    } catch (err) {
      failures.push({ key, path, message: String(err && err.message || err) });
    }
  }
  if (failures.length) {
    const details = JSON.stringify({ protocol: window.location.protocol, failures }, null, 2);
    throw new Error('JSON bank load failure\n' + details);
  }
  window.WGLT_DATA = Object.fromEntries(entries);
  const s = document.createElement('script');
  s.src = './js/app.js?v=' + encodeURIComponent(APP_VERSION);
  document.body.appendChild(s);
})().catch(err => {
  console.error(err);
  const protocolHint = window.location.protocol === 'file:' ? '<p><strong>Likely cause:</strong> the app is being opened directly from a zip or folder. This build must be served from GitHub Pages, Wix, or a local web server such as <code>python -m http.server</code>.</p>' : '';
  const escaped = String(err && err.message || err).replace(/[&<>]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[ch]));
  document.body.innerHTML = '<div style="padding:24px;font-family:system-ui;color:#fff;background:#111"><h2 style="margin-top:0">Could not load JSON banks</h2>' + protocolHint + '<p>Make sure the <code>data</code> and <code>js</code> folders stay beside <code>index.html</code>.</p><pre style="white-space:pre-wrap;background:#1b1b1b;padding:12px;border-radius:8px;overflow:auto">' + escaped + '</pre></div>';
});
