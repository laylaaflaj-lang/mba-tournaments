(() => {
  const themes = {
    blue: ["#eef2f8","#14213c","#11234b","#ffffff","#145bd5","#ffffff","#ffffff","#173768"],
    gold: ["#f4f3ef","#1c2b42","#101e36","#ffffff","#b88724","#ffffff","#ffffff","#1b3152"],
    light:["#f7f9fd","#233654","#477cbb","#ffffff","#2568d8","#ffffff","#ffffff","#315d94"],
    dark: ["#101826","#edf4ff","#091322","#ffffff","#437ee6","#ffffff","#1b2a3e","#294469"]
  };
  const keys = ["bg","text","head","headText","accent","accentText","panel","table"];
  const style = document.createElement("style");
  style.textContent = `
    body{background:var(--mba-bg)!important;color:var(--mba-text)!important}
    header{background:var(--mba-head)!important;color:var(--mba-headText)!important}
    header small{color:var(--mba-headText)!important}
    .panel{background:var(--mba-panel)!important;color:var(--mba-text)!important}
    button{background:var(--mba-accent)!important;color:var(--mba-accentText)!important}
    th{background:var(--mba-table)!important;color:#fff!important}
    input,select{background:var(--mba-panel)!important;color:var(--mba-text)!important}
    .mba-theme-picker{display:flex;align-items:center;gap:8px;margin-top:10px;flex-wrap:wrap}
    .mba-theme-picker label{color:var(--mba-headText)}
    .mba-theme-picker select{padding:6px;min-width:140px}
    .muted{color:color-mix(in srgb,var(--mba-text) 72%,var(--mba-panel))!important}
.good{color:color-mix(in srgb,#0ab871 72%,var(--mba-text))!important}
.bad{color:color-mix(in srgb,#ee5166 72%,var(--mba-text))!important}
.match{border-color:color-mix(in srgb,var(--mba-text) 22%,var(--mba-panel))!important}
    @media print{body{background:white!important;color:black!important}}
  `;
  document.head.appendChild(style);
  function apply(name) {
    const colors = themes[name] || themes.blue;
    keys.forEach((key,i) => document.documentElement.style.setProperty("--mba-" + key,colors[i]));
    try { localStorage.setItem("mba-theme",name); } catch(e) {}
  }
  function init() {
    const header = document.querySelector("header");
    if (!header || document.getElementById("mba-theme")) return;
    const wrap = document.createElement("div");
    wrap.className = "mba-theme-picker noprint";
    wrap.innerHTML = '<label for="mba-theme">🎨 Color Theme</label><select id="mba-theme"><option value="blue">Classic Blue</option><option value="gold">Navy & Gold</option><option value="light">Light</option><option value="dark">Dark</option></select>';
    header.appendChild(wrap);
    const select = wrap.querySelector("select");
    try { select.value = localStorage.getItem("mba-theme") || "blue"; } catch(e) {}
    if (!themes[select.value]) select.value = "blue";
    apply(select.value);
    select.addEventListener("change",() => apply(select.value));
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded",init);
  } else {
    init();
  }
})();

/* MBA Tournaments — Header Alignment Fix */
(() => {
  const style = document.createElement('style');
  style.id = 'mba-header-layout-fix';
  style.textContent = `
    header {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px 12px;
      align-items: end;
    }

    header > h1,
    header > small {
      grid-column: 1 / -1;
    }

    header > h1 {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    header > h1 img {
      margin-right: 0 !important;
    }

    header > .mba-theme-picker {
      grid-column: 1;
    }

    header > #mba-language-control {
      grid-column: 2;
    }

    header > .mba-theme-picker,
    header > #mba-language-control {
      display: flex !important;
      flex-direction: column !important;
      align-items: stretch !important;
      gap: 6px !important;
      min-width: 0;
      margin: 0 !important;
    }

    header .mba-theme-picker label,
    header #mba-language-label {
      color: white !important;
      font-size: 13px;
      margin: 0 !important;
    }

    header .mba-theme-picker select,
    header #mba-language-select {
      width: 100% !important;
      min-width: 0 !important;
      box-sizing: border-box;
      padding: 8px !important;
    }

    header > .mba-clock {
      grid-column: 1 / -1;
      justify-self: center;
      margin: 4px 0 0 !important;
    }

    @media (min-width: 750px) {
      header {
        grid-template-columns:
          minmax(0,1fr) minmax(0,1fr) auto;
      }

      header > .mba-clock {
        grid-column: 3;
        justify-self: end;
      }
    }

    @media print {
      header { display: none !important; }
    }
  `;
  document.head.appendChild(style);
})();

