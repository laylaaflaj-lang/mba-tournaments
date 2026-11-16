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
