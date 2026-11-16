
import {initializeApp} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js';
import {getAuth,onAuthStateChanged,signInWithEmailAndPassword,signInWithPopup,GoogleAuthProvider,signOut,linkWithPopup,sendPasswordResetEmail} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js';
import {getDatabase,ref,onValue,set,push,update,remove} from 'https://www.gstatic.com/firebasejs/11.10.0/firebase-database.js';

const firebaseConfig={
  apiKey:'AIzaSyA4brWx7RplhjJxNjATmj8JSTQ1ujjvbHI',
  authDomain:'mba-league-tournament.firebaseapp.com',
  databaseURL:'https://mba-league-tournament-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId:'mba-league-tournament',
  storageBucket:'mba-league-tournament.firebasestorage.app',
  messagingSenderId:'78415593867',
  appId:'1:78415593867:web:02c3514950fdd58e4e2f8e',
  measurementId:'G-P2LCCH207V'
};
const app=initializeApp(firebaseConfig),auth=getAuth(app),db=getDatabase(app);
const defaults=[
  {name:'Team Ameen Ashan',players:['Ameen Ashan','Askar','Janshar','Salam','Shuhaib','Marcelo']},
  {name:'Team Nithin',players:['Nithin','Ameen BH','Hakkeem','Irshad','Anil','Hari']},
  {name:'Team Faisal',players:['Faisal','Jaisal','Rashid','Sabir','Anoop','Nipun']},
  {name:'Thunder Smash',players:['Mubarak','Jafar','Shameer','Nabhan','Bava','Mohamed']}
];
const schedule=[[0,1,2,3],[0,2,1,3],[0,3,1,2]],games=[];
for(let round=0;round<3;round++)for(let pair=0;pair<3;pair++){
  let slot=round*3+pair+1,p=schedule[round];
  games.push({id:'c1s'+slot,slot,court:1,pair,a:p[0],b:p[1]},
             {id:'c2s'+slot,slot,court:2,pair,a:p[2],b:p[3]});
}
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let user=null,admins={},tournaments={},scores={},tid='',tab='matches',ready=false;
let editingMatchId=null,entryMode='score',selectedWinner='a';
const status=s=>{$('#status').textContent=s};
const myRole=()=>user&&admins[user.uid]?.active?admins[user.uid]:null;
const allowed=p=>{let r=myRole();return !!r&&(r.role==='super'||r.permissions?.[p]===true)};
const current=()=>tournaments[tid]||null;
const pair=(team,p)=>current().teams[team].players.slice(p*2,p*2+2).join(' & ');
const isMalayalam=()=>document.querySelector('#mba-language-select')?.value==='ml';

// Existing score records {a:30,b:25} are preserved.
// New result-only records have {mode:'winner',winner:'a'|'b'} and NO invented scores.
function numericResult(s){
  if(!s || s.mode==='winner')return null;
  if(s.a==null||s.b==null||String(s.a).trim()===''||String(s.b).trim()==='')return null;
  let a=Number(s.a),b=Number(s.b);
  if(!Number.isInteger(a)||!Number.isInteger(b)||a<0||b<0||a>30||b>30||a===b||Math.max(a,b)!==30)return null;
  return {a,b};
}
function winningSide(s){
  if(!s)return null;
  if(s.mode==='winner')return s.winner==='a'||s.winner==='b'?s.winner:null;
  const n=numericResult(s);
  return n?(n.a>n.b?'a':'b'):null;
}
function outcome(g){
  const side=winningSide(scores[tid]?.[g.id]);
  return side?g[side]:null;
}
function standings(){
  const t=current();if(!t)return [];
  let r=t.teams.map((x,i)=>({i,name:x.name,p:0,w:0,l:0,pts:0,for:0,against:0}));
  for(const g of games){
    const w=outcome(g);if(w===null)continue;
    const n=numericResult(scores[tid]?.[g.id]);
    for(const side of ['a','b']){
      let x=r[g[side]];
      x.p++;x.w+=+(w===g[side]);x.l+=+(w!==g[side]);x.pts+=w===g[side]?3:0;
      // Only actual numeric scores affect points-for/against. Result-only adds no fictitious points.
      if(n){x.for+=n[side];x.against+=n[side==='a'?'b':'a']}
    }
  }
  return r.sort((a,b)=>b.pts-a.pts||((b.for-b.against)-(a.for-a.against))||a.name.localeCompare(b.name));
}
function table(rows){
  return `<div class="scroll"><table><tr><th>#</th><th>Team</th><th>P</th><th>W</th><th>L</th><th>PTS</th></tr>${rows.map((x,i)=>`<tr><td>${i+1}</td><td>${esc(x.name)}</td><td>${x.p}</td><td>${x.w}</td><td>${x.l}</td><td><b>${x.pts}</b></td></tr>`).join('')}</table></div>`;
}

// Only one winner can be selected (radio buttons). Admin can later edit or add actual score.
function resultEditor(g,s){
  if(!allowed('scores')||editingMatchId!==g.id)return '';
  const a=esc(pair(g.a,g.pair)),b=esc(pair(g.b,g.pair));
  const n=numericResult(s);
  const aValue=n?String(n.a):'',bValue=n?String(n.b):'';
  const isScore=entryMode==='score';
  return `<div class="mba-result-editor noprint" data-editor="${esc(g.id)}">
    <strong>Result entry / ഫലം രേഖപ്പെടുത്തുക</strong>
    <div class="mba-mode-options">
      <label class="mba-choice"><input type="radio" name="mba-entry-mode" data-entry-mode="score" ${isScore?'checked':''}> Enter score</label>
      <label class="mba-choice"><input type="radio" name="mba-entry-mode" data-entry-mode="winner" ${!isScore?'checked':''}> WIN / LOSS only</label>
    </div>
    ${isScore?`<div class="mba-score-fields">
       <label>${a}<input id="mba-score-a" type="number" inputmode="numeric" min="0" max="30" placeholder="0–30" value="${aValue}"></label>
       <label>${b}<input id="mba-score-b" type="number" inputmode="numeric" min="0" max="30" placeholder="0–30" value="${bValue}"></label>
       </div><p class="muted">Winning score must be 30; no ties. / ജയിക്കുന്ന സ്കോർ 30 ആയിരിക്കണം.</p>`:
       `<p class="muted">Tick the winner. Other team is automatically LOST. / ജയിച്ച ടീമിനെ ടിക്ക് ചെയ്യുക.</p>
        <label class="mba-choice"><input type="radio" name="mba-winner" data-winner="a" ${selectedWinner==='a'?'checked':''}> ${a} — WON</label>
        <label class="mba-choice"><input type="radio" name="mba-winner" data-winner="b" ${selectedWinner==='b'?'checked':''}> ${b} — WON</label>
        <p class="muted">Score: Not recorded. Winner +3 points, loser 0.</p>`}
    <div class="mba-editor-actions">
      <button data-result-save="${esc(g.id)}">Save result / സേവ്</button>
      <button type="button" class="mba-secondary" data-result-cancel>Cancel</button>
      ${s?`<button type="button" class="mba-danger" data-result-clear="${esc(g.id)}">Clear result</button>`:''}
    </div>
  </div>`;
}
function winnerOnlyNames(g,side){
  const winSide=winningSide(scores[tid]?.[g.id]);
  const cls=side===winSide?'mba-win':'mba-loss';
  const badge=side===winSide?'win':'loss';
  const won=side===winSide;
  const word=isMalayalam()?(won?'ജയിച്ചു':'തോറ്റു'):(won?'WON':'LOST');
  return `<b class="${cls}">${esc(pair(g[side],g.pair))} <span class="mba-result-label ${badge}" data-won="${won}">${word}</span></b>`;
}
function matchView(){
  const t=current();if(!t)return '';
  const done=games.filter(g=>outcome(g)!==null).length;
  return `<section class="panel"><h2>${esc(t.name)} — ${done}/18 Completed</h2><p class="muted">${esc(t.date||'')} · Win 3 points / Loss 0 · 30-point games</p><button id="print" class="noprint">A4 Print</button></section>`+
  [1,2].map(c=>`<section class="panel"><h2>Court ${c}</h2>${games.filter(g=>g.court===c).map(g=>{
    const s=scores[tid]?.[g.id],w=outcome(g);
    const only=s?.mode==='winner'&&w!==null;
    const score=numericResult(s);
    const left=only?winnerOnlyNames(g,'a'):`<b>${esc(pair(g.a,g.pair))}</b>`;
    const right=only?winnerOnlyNames(g,'b'):`<b>${esc(pair(g.b,g.pair))}</b>`;
    const display=score?`<b>${score.a} – ${score.b}</b>`:only?'<b class="muted">Score not recorded</b>':'<b>Not played</b>';
    return `<div class="match"><div class="muted">Slot ${g.slot} · ${['AB','CD','EF'][g.pair]}</div>
       <div class="row">${left}<span>VS</span>${right}</div>
       <div class="muted">${esc(t.teams[g.a].name)} / ${esc(t.teams[g.b].name)}</div>
       <div class="row">${display}${allowed('scores')?`<button class="noprint" data-score="${g.id}">${s?'Edit':'Enter'} result</button>`:''}</div>
       ${w!==null?`<div class="good">🏆 ${esc(pair(w,g.pair))} · +3 pts</div>`:''}
       ${resultEditor(g,s)}
     </div>`;
  }).join('')}</section>`).join('');
}
function standingsView(){
  const t=current();if(!t)return '';
  const r=standings();
  return `<section class="panel"><h2>Overall Points Table</h2>${table(r)}</section>`+
  [0,1,2].map(p=>{
    const rows=t.teams.map((team,i)=>{
      let x={name:pair(i,p),p:0,w:0,l:0,pts:0};
      for(let g of games.filter(g=>g.pair===p&&(g.a===i||g.b===i))){
        let w=outcome(g);if(w!==null){x.p++;x.w+=+(w===i);x.l+=+(w!==i);x.pts+=w===i?3:0}
      }
      return x;
    }).sort((a,b)=>b.pts-a.pts||a.name.localeCompare(b.name));
    return `<section class="panel"><h2>${['AB','CD','EF'][p]} League</h2>${table(rows)}</section>`;
  }).join('');
}
function adminView(){
  if(!allowed('tournaments')&&!allowed('scores')&&myRole()?.role!=='super')return `<section class="panel">View-only account.</section>`;
  const t=current();
  return `<section class="panel"><h2>Tournament Management</h2>
    ${allowed('tournaments')?`<button id="newTournament">+ New tournament</button>`:''}
    ${t&&allowed('tournaments')?`<div><label>Title<input id="tname" value="${esc(t.name)}"></label><label>Date<input id="tdate" type="date" value="${esc(t.date||'')}"></label>
    <h3>Team and Player Names</h3>${t.teams.map((team,i)=>`<div class="match"><label>Team ${i+1}<input data-team="${i}" value="${esc(team.name)}"></label><div class="fields">${team.players.map((name,j)=>`<label>${'ABCDEF'[j]}<input data-player="${i}-${j}" value="${esc(name)}"></label>`).join('')}</div></div>`).join('')}
    <button id="saveTournament">Save names & details</button><p class="muted">Existing scores remain unchanged. Historical results stay available.</p></div>`:''}</section>`+
    (myRole()?.role==='super'?`<section class="panel"><h2>Admin Permissions</h2><p class="muted">Enter an existing Firebase Authentication user's UID. Never enter passwords. Super Admin cannot remove own access here.</p>
    <label>User UID<input id="adminUid" placeholder="Firebase Auth UID"></label><label>Role<select id="adminRole"><option value="admin">Admin</option><option value="viewer">Viewer</option></select></label>
    <label><input id="canScores" type="checkbox"> Edit scores</label><label><input id="canTournaments" type="checkbox"> Edit tournaments, names and fixtures</label>
    <button id="saveAdmin">Save permissions</button><h3>Current admins</h3>${Object.entries(admins).map(([uid,a])=>`<div class="match"><span>${esc(uid)} · ${esc(a.role)} · ${a.active?'Active':'Disabled'}</span>${uid!==user.uid?`<button data-disable="${esc(uid)}">${a.active?'Disable':'Enable'}</button>`:''}</div>`).join('')}</section>`:'');
}
function authView(){
  const b=$('#authButtons'),a=$('#authState');
  if(!user){a.textContent='Public viewer · Login for editing';b.innerHTML='<button id="emailLogin">Email Login</button><button id="googleLogin">Google Login</button>';return}
  a.textContent=`${user.email||'Signed in'} · ${myRole()?.role||'Viewer (no admin permission)'}`;
  b.innerHTML=`${user.providerData.some(p=>p.providerId==='google.com')?'':'<button id="linkGoogle">Link Google Login</button>'}<button id="logout">Logout</button>`;
}
function render(){
  authView();
  let keys=Object.entries(tournaments).sort((a,b)=>(b[1].date||'').localeCompare(a[1].date||''));
  if(!tournaments[tid]&&keys.length)tid=keys[0][0];
  $('#tabs').innerHTML=`<select id="tournamentSelect" aria-label="Tournament">${keys.map(([k,t])=>`<option value="${esc(k)}" ${k===tid?'selected':''}>${esc(t.name)} (${esc(t.date||'')})</option>`).join('')}</select>`+
    ['matches','standings','history','admin'].filter(x=>x!=='admin'||myRole()).map(x=>`<button data-tab="${x}" ${tab===x?'style="background:#11234b"':''}>${{matches:'Matches',standings:'Standings',history:'History',admin:'Admin'}[x]}</button>`).join('');
  let content=!ready?'<section class="panel">Loading database…</section>':
    tab==='history'?`<section class="panel"><h2>All Tournament History</h2>${keys.length?keys.map(([k,t])=>`<div class="match"><b>${esc(t.name)}</b> · ${esc(t.date||'')} <button data-open="${esc(k)}">Open</button></div>`).join(''):'No tournaments yet'}</section>`:
    !current()&&tab!=='admin'?'<section class="panel">No tournaments yet. Super Admin can create one.</section>':
    tab==='matches'?matchView():tab==='standings'?standingsView():adminView();
  $('#content').innerHTML=content;
  bind();
}
async function saveResult(id){
  if(!allowed('scores')||!current()||!games.some(g=>g.id===id)||editingMatchId!==id)return;
  let result;
  if(entryMode==='winner'){
    if(selectedWinner!=='a'&&selectedWinner!=='b')return alert('Choose the winning team.');
    result={mode:'winner',winner:selectedWinner};
  }else{
    let a=$('#mba-score-a')?.value.trim(),b=$('#mba-score-b')?.value.trim();
    if(a===''||b==='')return alert('Enter both scores, or select WIN / LOSS only.');
    const x=Number(a),y=Number(b);
    if(!Number.isInteger(x)||!Number.isInteger(y)||x<0||y<0||x>30||y>30||x===y||Math.max(x,y)!==30){
      return alert('Valid score: winner must have 30, no ties.');
    }
    result={a:x,b:y};
  }
  const savedTid=tid;
  try{
    await set(ref(db,`scores/${savedTid}/${id}`),result);
    editingMatchId=null;
    render();
  }catch(e){alert('Save failed: '+e.message)}
}
function bind(){
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;editingMatchId=null;render()});
  $('#tournamentSelect')?.addEventListener('change',e=>{tid=e.target.value;editingMatchId=null;render()});
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{tid=b.dataset.open;editingMatchId=null;tab='matches';render()});
  $('#print')?.addEventListener('click',()=>window.print());
  $('#emailLogin')?.addEventListener('click',async()=>{const email=prompt('Email address');if(!email)return;const password=prompt('Password (do not share)');if(password===null)return;try{await signInWithEmailAndPassword(auth,email,password)}catch(e){alert(e.message)}});
  $('#googleLogin')?.addEventListener('click',async()=>{try{await signInWithPopup(auth,new GoogleAuthProvider())}catch(e){alert(e.message)}});
  $('#linkGoogle')?.addEventListener('click',async()=>{if(!confirm('Link this Google account to your current Email/Password login? Use the SAME Gmail address.'))return;try{await linkWithPopup(user,new GoogleAuthProvider());alert('Google account linked')}catch(e){alert('Linking failed: '+e.message)}});
  $('#logout')?.addEventListener('click',()=>signOut(auth));

  document.querySelectorAll('[data-score]').forEach(b=>b.onclick=()=>{
    if(!allowed('scores'))return;
    const id=b.dataset.score,g=games.find(x=>x.id===id);
    if(!g)return;
    if(editingMatchId===id){editingMatchId=null;render();return}
    const s=scores[tid]?.[id];
    editingMatchId=id;
    entryMode=s?.mode==='winner'?'winner':'score';
    selectedWinner=winningSide(s)||'a';
    render();
  });
  document.querySelectorAll('[data-entry-mode]').forEach(el=>el.addEventListener('change',()=>{if(!allowed('scores'))return;entryMode=el.dataset.entryMode;render()}));
  document.querySelectorAll('[data-winner]').forEach(el=>el.addEventListener('change',()=>{if(!allowed('scores'))return;selectedWinner=el.dataset.winner}));
  document.querySelectorAll('[data-result-save]').forEach(b=>b.onclick=()=>saveResult(b.dataset.resultSave));
  document.querySelectorAll('[data-result-cancel]').forEach(b=>b.onclick=()=>{editingMatchId=null;render()});
  document.querySelectorAll('[data-result-clear]').forEach(b=>b.onclick=async()=>{
    if(!allowed('scores')||editingMatchId!==b.dataset.resultClear)return;
    if(!confirm('Clear this match result? / ഈ മത്സരഫലം നീക്കണോ?'))return;
    try{await remove(ref(db,`scores/${tid}/${b.dataset.resultClear}`));editingMatchId=null;render()}catch(e){alert(e.message)}
  });

  $('#newTournament')?.addEventListener('click',async()=>{let name=prompt('Tournament name','MBA Badminton League');if(!name?.trim())return;let date=prompt('Tournament date YYYY-MM-DD','2026-11-14');if(date===null)return;try{let r=push(ref(db,'tournaments'));await set(r,{name:name.trim(),date,teams:structuredClone(defaults),createdAt:Date.now()});tid=r.key;tab='admin'}catch(e){alert(e.message)}});
  $('#saveTournament')?.addEventListener('click',async()=>{let t=structuredClone(current());t.name=$('#tname').value.trim();t.date=$('#tdate').value;document.querySelectorAll('[data-team]').forEach(el=>t.teams[+el.dataset.team].name=el.value);document.querySelectorAll('[data-player]').forEach(el=>{let [i,j]=el.dataset.player.split('-').map(Number);t.teams[i].players[j]=el.value});try{await set(ref(db,`tournaments/${tid}`),t);alert('Saved')}catch(e){alert(e.message)}});
  $('#saveAdmin')?.addEventListener('click',async()=>{let uid=$('#adminUid').value.trim();if(!uid||uid===user.uid)return alert('Enter another existing user UID');try{await set(ref(db,`admins/${uid}`),{active:true,role:$('#adminRole').value,permissions:{scores:$('#canScores').checked,tournaments:$('#canTournaments').checked}});alert('Permissions saved')}catch(e){alert(e.message)}});
  document.querySelectorAll('[data-disable]').forEach(b=>b.onclick=async()=>{let uid=b.dataset.disable;if(!confirm('Change access for this admin?'))return;try{await update(ref(db,`admins/${uid}`),{active:!admins[uid].active})}catch(e){alert(e.message)}});
}

const resultStyle=document.createElement('style');
resultStyle.textContent=`
  .mba-result-editor{margin-top:12px;padding:12px;border:1px solid #91a5c080;border-radius:10px;background:rgba(127,156,196,.11)}
  .mba-result-editor .mba-mode-options{display:flex;flex-wrap:wrap;gap:12px;margin:10px 0}
  .mba-result-editor .mba-choice{display:flex;align-items:center;gap:8px;margin:9px 0;min-width:0}
  .mba-result-editor input[type="radio"]{width:18px!important;height:18px!important;max-width:18px!important;flex:0 0 auto;display:inline-block!important;margin:0;padding:0}
  .mba-result-editor .mba-score-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .mba-result-editor .mba-score-fields label{min-width:0;overflow-wrap:anywhere}
  .mba-result-editor .mba-score-fields input{display:block;width:100%!important;box-sizing:border-box;margin-top:6px}
  .mba-result-editor .mba-editor-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}
  .mba-result-editor .mba-secondary{background:#64748b!important;color:white!important}
  .mba-result-editor .mba-danger{background:#b42336!important;color:white!important}
  .mba-win,.mba-score-win{color:#087c48!important;font-weight:850!important}
  .mba-loss,.mba-score-loss{color:#c6283d!important;font-weight:750!important}
  .mba-result-label{display:inline-block;margin-left:7px;padding:2px 6px;border-radius:6px;font-size:11px;font-weight:800;vertical-align:middle}
  .mba-result-label.win{background:#dcfce7;color:#14532d}
  .mba-result-label.loss{background:#ffe4e6;color:#9f1239}
  html[data-match-theme="dark"] .mba-win{color:#70f0af!important}
  html[data-match-theme="dark"] .mba-loss{color:#ffa0a9!important}
  @media print{.mba-result-editor{display:none!important}}
`;
document.head.appendChild(resultStyle);

onAuthStateChanged(auth,u=>{user=u;onValue(ref(db,'admins'),s=>{admins=s.val()||{};render()},e=>{admins={};render()});render()});
onValue(ref(db,'tournaments'),s=>{tournaments=s.val()||{};ready=true;render()},e=>{ready=true;status('Database read error: '+e.message);render()});
onValue(ref(db,'scores'),s=>{scores=s.val()||{};render()},e=>status('Scores read error: '+e.message));
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(console.warn));
