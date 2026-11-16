/* MBA Tournaments — English / Malayalam UI language selector.
   UI-only: does not modify Firebase data, team/player names, or scores. */
(() => {
  'use strict';

  const translations = {
    'Realtime tournaments · Fixtures · Standings · History': 'തത്സമയ ടൂർണമെന്റുകൾ · മത്സരക്രമം · പോയിന്റ് പട്ടിക · ചരിത്രം',
    'Connecting…': 'ബന്ധിപ്പിക്കുന്നു…',
    'Loading database…': 'ഡാറ്റ ലോഡ് ചെയ്യുന്നു…',
    'Public viewer · Login for editing': 'എല്ലാവർക്കും കാണാം · തിരുത്താൻ ലോഗിൻ ചെയ്യുക',
    'Email Login': 'ഇമെയിൽ ലോഗിൻ',
    'Google Login': 'ഗൂഗിൾ ലോഗിൻ',
    'Link Google Login': 'ഗൂഗിൾ ലോഗിൻ ബന്ധിപ്പിക്കുക',
    'Logout': 'ലോഗൗട്ട്',
    'Matches': 'മത്സരങ്ങൾ',
    'Standings': 'പോയിന്റ് പട്ടിക',
    'History': 'ചരിത്രം',
    'Admin': 'അഡ്മിൻ',
    'A4 Print': 'A4 പ്രിന്റ്',
    'Not played': 'കളിച്ചിട്ടില്ല',
    'Enter score': 'സ്കോർ നൽകുക',
    'Edit score': 'സ്കോർ തിരുത്തുക',
    'Win 3 points / Loss 0 · 30-point games': 'ജയം 3 പോയിന്റ് / തോൽവി 0 · 30 പോയിന്റ് മത്സരങ്ങൾ',
    'Overall Points Table': 'മൊത്തം പോയിന്റ് പട്ടിക',
    'All Tournament History': 'മുൻ ടൂർണമെന്റുകളുടെ ചരിത്രം',
    'No tournaments yet': 'ഇതുവരെ ടൂർണമെന്റുകളില്ല',
    'No tournaments yet.': 'ഇതുവരെ ടൂർണമെന്റുകളില്ല.',
    'Super Admin can create one.': 'സൂപ്പർ അഡ്മിന് ഒന്ന് സൃഷ്ടിക്കാം.',
    'Open': 'തുറക്കുക',
    'View-only account.': 'കാണാനുള്ള അനുമതി മാത്രം.',
    'Tournament Management': 'ടൂർണമെന്റ് നിയന്ത്രണം',
    '+ New tournament': '+ പുതിയ ടൂർണമെന്റ്',
    'Title': 'പേര്',
    'Date': 'തീയതി',
    'Team and Player Names': 'ടീമുകളും കളിക്കാരും',
    'Save names & details': 'പേരുകളും വിവരങ്ങളും സേവ് ചെയ്യുക',
    'Existing scores remain unchanged. Historical results stay available.': 'നിലവിലുള്ള സ്കോറുകളും പഴയ ഫലങ്ങളും മാറ്റമില്ലാതെ തുടരും.',
    'Admin Permissions': 'അഡ്മിൻ അനുമതികൾ',
    'Enter an existing Firebase Authentication user\'s UID. Never enter passwords. Super Admin cannot remove own access here.': 'നിലവിലുള്ള Firebase ഉപയോക്താവിന്റെ UID നൽകുക. പാസ്‌വേഡ് നൽകരുത്. സ്വന്തം Super Admin അനുമതി ഇവിടെ നീക്കാനാവില്ല.',
    'User UID': 'ഉപയോക്തൃ UID',
    'Role': 'ചുമതല',
    'Viewer': 'കാണുന്നയാൾ',
    'Edit scores': 'സ്കോറുകൾ തിരുത്തുക',
    'Edit tournaments, names and fixtures': 'ടൂർണമെന്റുകൾ, പേരുകൾ, മത്സരക്രമം എന്നിവ തിരുത്തുക',
    'Save permissions': 'അനുമതികൾ സേവ് ചെയ്യുക',
    'Current admins': 'നിലവിലെ അഡ്മിനുകൾ',
    'Disable': 'പ്രവേശനം നിർത്തുക',
    'Enable': 'പ്രവേശനം അനുവദിക്കുക',
    'Team': 'ടീം',
    'PTS': 'പോയിന്റ്',
    'VS': 'VS',
    'Classic Blue': 'ക്ലാസിക് ബ്ലൂ',
    'Navy & Gold': 'നേവി & ഗോൾഡ്',
    'Light': 'ലൈറ്റ്',
    'Dark': 'ഡാർക്ക്',
    '🎨 Color Theme': '🎨 കളർ തീം'
  };

  const sourceText = new WeakMap();
  let language = 'en';
  try { if (localStorage.getItem('mba-language') === 'ml') language = 'ml'; } catch (_) {}

  function translateText(text) {
    const trimmed = text.trim();
    if (!trimmed) return text;
    const normalized = trimmed.replace(/\s+/g, ' ');
    let converted = translations[normalized];
    if (!converted) {
      converted = normalized
        .replace(/(\d+\/\d+) Completed\b/g, '$1 പൂർത്തിയായി')
        .replace(/^Court (\d+)$/, 'കോർട്ട് $1')
        .replace(/^Slot (\d+)(.*)$/, 'സ്ലോട്ട് $1$2')
        .replace(/^Team (\d+)$/, 'ടീം $1')
        .replace(/^(AB|CD|EF) League$/, '$1 ലീഗ്')
        .replace(/Viewer \(no admin permission\)/g, 'കാണാനുള്ള അനുമതി മാത്രം');
    }
    if (converted === normalized) return text;
    // Preserve whitespace around text nodes; do not change data or input values.
    return text.replace(trimmed, converted);
  }

  function updateTexts() {
    document.documentElement.lang = language;
    const label = document.getElementById('mba-language-label');
    const labelText = language === 'ml' ? '🌐 ഭാഷ' : '🌐 Language';
    if (label && label.textContent !== labelText) label.textContent = labelText;
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.closest('script, style, textarea, code, pre, #mba-language-control')) continue;
      if (!sourceText.has(node)) sourceText.set(node, node.nodeValue);
      const original = sourceText.get(node);
      const wanted = language === 'ml' ? translateText(original) : original;
      if (node.nodeValue !== wanted) node.nodeValue = wanted;
    }
  }

  function init() {
    const header = document.querySelector('header');
    if (!header || document.getElementById('mba-language-control')) return;
    const wrap = document.createElement('div');
    wrap.id = 'mba-language-control';
    wrap.className = 'noprint';
    wrap.style.cssText = 'margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap';
    const label = document.createElement('label');
    label.id = 'mba-language-label';
    label.htmlFor = 'mba-language-select';
    label.textContent = '🌐 Language';
    label.style.cssText = 'margin:0;color:white';
    const select = document.createElement('select');
    select.id = 'mba-language-select';
    select.setAttribute('aria-label', 'App language');
    select.innerHTML = '<option value="en">English</option><option value="ml">മലയാളം</option>';
    select.value = language;
    select.addEventListener('change', () => {
      language = select.value;
      try { localStorage.setItem('mba-language', language); } catch (_) {}
      updateTexts();
    });
    wrap.append(label, select);
    header.appendChild(wrap);

    let queued = false;
    const observer = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      queueMicrotask(() => { queued = false; updateTexts(); });
    });
    observer.observe(document.body, { childList: true, subtree: true });
    updateTexts();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
