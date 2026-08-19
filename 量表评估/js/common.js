/* ===== 星瞳·量表评估 共享逻辑 v2 ===== */
/* DOM 快捷函数 */
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const SCALES_NS = 'xingtong_scales_v1';
const SCALES = {
  chexi: { key: 'chexi', name: '儿童执行功能量表', en: 'CHEXI', path: '../chexi/index.html' },
  cshq:  { key: 'cshq',  name: '儿童睡眠习惯问卷',   en: 'CSHQ',  path: '../cshq/index.html' },
  cebq:  { key: 'cebq',  name: '儿童饮食行为量表',   en: 'CEBQ',  path: '../cebq/index.html' },
  srs2:  { key: 'srs2',  name: '社交反应量表第二版', en: 'SRS-2', path: '../srs2/index.html' },
  rbsr:  { key: 'rbsr',  name: '重复刻板行为量表',   en: 'RBS-R', path: '../rbsr/index.html' }
};

/* ===================== 存储 =====================
   记录结构：
   { id, scale, scaleName, child:{name,id,age,gender,note,rater},
     time, total, verdict, dims:[{name,val,max,pct,note}],
     answers:[], answerLabels:[], refNote } */
function loadRecords(){
  try{ return JSON.parse(localStorage.getItem(SCALES_NS)) || []; }catch(e){ return []; }
}
function saveRecords(recs){ localStorage.setItem(SCALES_NS, JSON.stringify(recs)); }
function addRecord(rec){
  const recs = loadRecords();
  rec.id = rec.id || ('R' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,5).toUpperCase());
  rec.time = rec.time || new Date().toISOString();
  recs.push(rec);
  saveRecords(recs);
  return rec;
}
function deleteRecord(id){
  saveRecords(loadRecords().filter(r => r.id !== id));
}
function getRecord(id){ return loadRecords().find(r => r.id === id); }
function scaleCount(key){
  return loadRecords().filter(r => r.scale === key).length;
}
function fmtTime(iso){
  if(!iso) return '—';
  const d = new Date(iso);
  const p = n => String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

/* ---- 患儿信息 ---- */
function getChildInfo(){
  return {
    name: $('#c_name').value.trim(),
    id: $('#c_id').value.trim(),
    age: $('#c_age').value.trim(),
    gender: $('#c_gender').value,
    note: $('#c_note').value.trim()
  };
}
function requireChild(){
  const c = getChildInfo();
  if(!c.name && !c.id){ toast('请至少填写患儿姓名或编号'); return null; }
  return c;
}

/* ---- 校验：所有题目必须作答 ---- */
function verifyAllAnswered(answers){
  const missing = [];
  answers.forEach((a,i)=>{ if(a===null||a===undefined||a==='') missing.push(i); });
  return missing;
}
function highlightMissing(answers){
  const missing = verifyAllAnswered(answers);
  if(missing.length){
    $$('.q-item').forEach(el=>el.style.borderColor='');
    missing.forEach(i=>{
      const el = $('#qi'+i);
      if(el){ el.style.borderColor='var(--danger)'; el.style.background='#FDF3F3'; }
    });
    const first = $('#qi'+missing[0]);
    if(first) first.scrollIntoView({behavior:'smooth',block:'center'});
  }
  return missing;
}
function clearMissing(){
  $$('.q-item').forEach(el=>{ el.style.borderColor=''; el.style.background=''; });
}

/* ---- 结果记录 ---- */
function recordResult(scaleKey, scaleName, child, total, verdict, dims, answers, answerLabels, refNote, answerText){
  const rec = addRecord({ scale: scaleKey, scaleName, child, total, verdict, dims, answers, answerLabels, refNote, answerText });
  return rec;
}

/* ---- 记录表格 ---- */
function renderRecordsTable(tbodyId){
  const recs = loadRecords();
  const tb = document.getElementById(tbodyId);
  if(!tb) return;
  if(!recs.length){
    tb.innerHTML = `<tr><td colspan="7"><div class="empty"><span class="ic">🗂</span>还没有保存任何评估记录<br>完成一份量表后，结果会自动出现在这里</div></td></tr>`;
    return;
  }
  tb.innerHTML = recs.slice().reverse().map(r => {
    const verdictClass = vCls(r.verdict);
    return `<tr>
      <td style="font-weight:600">${r.child && (r.child.name||r.child.id) || '—'}</td>
      <td><span class="tag info">${r.scaleName}</span></td>
      <td class="score-cell">${r.total != null ? r.total : '—'}</td>
      <td><span class="tag ${verdictClass}">${r.verdict || '—'}</span></td>
      <td style="color:var(--soft)">${fmtTime(r.time)}</td>
      <td>
        <button class="btn btn-ghost btn-sm" onclick="viewRecordDetail('${r.id}')">分析</button>
        <button class="btn btn-danger btn-sm" onclick="delRecord('${r.id}')">删除</button>
      </td>
    </tr>`;
  }).join('');
}
function vCls(v){
  if(!v) return 'info';
  if(v.indexOf('高')>=0 || v.indexOf('重')>=0 || v.indexOf('显著')>=0 || v.indexOf('异常')>=0 || v.indexOf('明显')>=0) return 'high';
  if(v.indexOf('中')>=0 || v.indexOf('边缘')>=0 || v.indexOf('可疑')>=0 || v.indexOf('关注')>=0) return 'mid';
  return 'low';
}
function delRecord(id){
  if(!confirm('确定删除这条评估记录吗？')) return;
  deleteRecord(id);
  renderRecordsTable('recordsBody');
  updateSummary();
  toast('已删除','ok');
}
function updateSummary(){
  const recs = loadRecords();
  document.querySelectorAll('[data-count-total]').forEach(el => el.textContent = recs.length);
  Object.keys(SCALES).forEach(k => {
    const el = document.querySelector(`[data-count-${k}]`);
    if(el) el.textContent = scaleCount(k);
  });
}

/* ---- Toast ---- */
let toastTimer=null;
function toast(msg,type){
  let t = document.getElementById('toast');
  if(!t){ t = document.createElement('div'); t.id='toast'; t.className='toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast' + (type==='ok'?' ok show':' show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 2600);
}

/* ===================== 结果详情窗口（二级弹窗） ===================== */
function viewRecordDetail(id){
  const r = getRecord(id);
  if(!r) return;
  const child = r.child||{};
  const dimBars = (r.dims||[]).map(d=>{
    const pct = d.max ? Math.round((d.val||0)/d.max*100) : (d.pct!=null?d.pct:0);
    const color = pct>=66?'var(--danger)':pct>=40?'var(--warn)':'var(--ok)';
    return `<div class="dim-box">
      <div class="dm-head"><span class="dm-name">${esc(d.name)}</span><span class="dm-val">${d.val||0}<small> / ${d.max||'—'}</small></span></div>
      <div class="dim-bar"><i style="width:${Math.min(100,pct)}%;background:${color}"></i></div>
      ${d.note?`<div style="font-size:11px;color:var(--soft);margin-top:6px">${d.note}</div>`:''}
    </div>`;
  }).join('');
  const answersHtml = r.answers && r.answers.length ? r.answers.map((a,i)=>{
    const lbl = r.answerLabels && r.answerLabels[i] != null ? r.answerLabels[i] : (a==null?'未答':a);
    const qtext = (r.answerText && r.answerText[i]) ? r.answerText[i] : ('第 '+(i+1)+' 题');
    return `<tr><td class="q-no">${i+1}</td><td style="white-space:normal;min-width:180px">${esc(qtext)}</td><td>${a==null?'<span style="color:var(--danger)">未答</span>':lbl}</td></tr>`;
  }).join('') : '<tr><td colspan="3" style="color:var(--soft)">未保存逐题答案</td></tr>';

  const overlay = document.createElement('div');
  overlay.className='modal-mask';
  overlay.id='detailMask';
  overlay.innerHTML = `
  <div class="modal modal-lg">
    <div class="m-head">
      <div><h3>${esc(r.scaleName)} · 评估分析</h3>
      <div class="m-meta">${child.name||''} ${child.id?('· '+child.id):''} ${child.age?('· '+child.age):''} · ${fmtTime(r.time)}</div></div>
      <button class="m-x" onclick="closeDetail()">✕</button>
    </div>
    <div class="m-body">
      <div class="detail-top">
        <div class="dt-total"><div class="v">${r.total!=null?r.total:'—'}</div><div class="k">原始总分</div></div>
        <div class="dt-verdict ${vCls(r.verdict)}"><span class="ico">${vCls(r.verdict)==='high'?'⚠':vCls(r.verdict)==='mid'?'◐':'✓'}</span>${r.verdict||'—'}</div>
      </div>
      ${r.refNote?`<div class="ref-note">${r.refNote}</div>`:''}
      <div class="sec-label">分维度分析</div>
      <div class="dim-grid">${dimBars}</div>
      <div class="sec-label">逐题作答</div>
      <div style="max-height:260px;overflow:auto;border:1px solid var(--line);border-radius:10px">
        <table><thead><tr><th style="width:44px">#</th><th>题目</th><th style="width:120px">作答</th></tr></thead><tbody>${answersHtml}</tbody></table>
      </div>
    </div>
    <div class="m-actions">
      <button class="btn btn-ghost" onclick="closeDetail()">关闭</button>
      <button class="btn btn-accent" onclick="exportSingleRecord('${r.id}')">⬇ 导出本条 Excel</button>
      <button class="btn btn-primary" onclick="exportRecordsXlsx()">⬇ 导出全部记录</button>
    </div>
  </div>`;
  document.body.appendChild(overlay);
  setTimeout(()=>overlay.classList.add('show'),10);
}
function closeDetail(){
  const m = $('#detailMask');
  if(m){ m.classList.remove('show'); setTimeout(()=>m.remove(),250); }
}
function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* ===================== XLSX 导出 ===================== */
let _sheetjsLoaded = null;
function loadSheetJS(cb){
  if(window.XLSX){ cb(); return; }
  if(_sheetjsLoaded){ _sheetjsLoaded.then(cb); return; }
  _sheetjsLoaded = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
    s.onload = ()=>resolve();
    s.onerror = ()=>{ _sheetjsLoaded=null; reject(); };
    document.head.appendChild(s);
  });
  _sheetjsLoaded.then(cb).catch(()=>{ toast('导出组件加载失败，将导出 CSV'); exportCsv(); });
}
function exportRecordsXlsx(){
  const recs = loadRecords();
  if(!recs.length){ toast('暂无记录可导出'); return; }
  loadSheetJS(()=>doExportXlsx(recs));
}
function exportSingleRecord(id){
  const r = getRecord(id);
  if(!r){ toast('记录不存在'); return; }
  loadSheetJS(()=>doExportXlsx([r]));
}
function doExportXlsx(recs){
  // 主表
  const mainRows = recs.map(r => {
    const c = r.child || {};
    return {
      '量表': r.scaleName, '量表代码': r.scale,
      '患儿姓名': c.name||'', '编号': c.id||'', '年龄': c.age||'', '性别': c.gender||'',
      '填表人': c.rater||'', '备注': c.note||'',
      '原始总分': r.total!=null?r.total:'', '判定结果': r.verdict||'',
      '记录时间': fmtTime(r.time)
    };
  });
  // 分维度明细
  const dimHeaders = ['记录ID','量表','患儿','原始总分','判定','时间'];
  const maxDims = Math.max(0, ...recs.map(r=>(r.dims||[]).length));
  for(let i=0;i<maxDims;i++) dimHeaders.push('维度'+(i+1)+'','维度'+(i+1)+'值','维度'+(i+1)+'占比%');
  const dimRows = recs.map(r=>{
    const c=r.child||{}; const dims=r.dims||[];
    const row=[r.id, r.scaleName, c.name||c.id||'', r.total!=null?r.total:'', r.verdict||'', fmtTime(r.time)];
    for(let i=0;i<maxDims;i++){
      const d=dims[i]||{};
      const pct = d.max?Math.round((d.val||0)/d.max*100):(d.pct!=null?d.pct:'');
      row.push(d.name||'', d.val!=null?d.val:'', pct!==''?pct+'%':'');
    }
    return row;
  });
  // 逐题答案
  const ansHeaders=['记录ID','量表','患儿','题目序号','题目','作答'];
  const ansRows=[];
  recs.forEach(r=>{
    const c=r.child||{};
    (r.answers||[]).forEach((a,i)=>{
      const lbl = r.answerLabels && r.answerLabels[i]!=null ? r.answerLabels[i] : (a==null?'未答':a);
      ansRows.push([r.id, r.scaleName, c.name||c.id||'', i+1, (r.answerText&&r.answerText[i])||'', a==null?'未答':lbl]);
    });
  });

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(mainRows);
  const ws2 = XLSX.utils.aoa_to_sheet([dimHeaders, ...dimRows]);
  const ws3 = XLSX.utils.aoa_to_sheet([ansHeaders, ...ansRows]);
  ws1['!cols']=[{wch:18},{wch:8},{wch:10},{wch:10},{wch:8},{wch:8},{wch:8},{wch:16},{wch:8},{wch:20},{wch:18}];
  XLSX.utils.book_append_sheet(wb, ws1, '量表汇总');
  XLSX.utils.book_append_sheet(wb, ws2, '分维度明细');
  XLSX.utils.book_append_sheet(wb, ws3, '逐题答案');
  const fname = '星瞳_量表评估记录_' + new Date().toISOString().slice(0,10) + '.xlsx';
  XLSX.writeFile(wb, fname);
  toast('已导出：' + fname, 'ok');
}
function exportCsv(){
  const recs = loadRecords();
  if(!recs.length) return;
  const rows = [['量表','患儿','总分','判定','时间']];
  recs.forEach(r=>{ const c=r.child||{}; rows.push([r.scaleName, c.name||c.id||'', r.total!=null?r.total:'', r.verdict||'', fmtTime(r.time)]); });
  const csv = '﻿' + rows.map(r=>r.map(x=>'"'+String(x==null?'':x).replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob = new Blob([csv],{type:'text/csv;charset=utf-8'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '星瞳_量表评估记录_' + new Date().toISOString().slice(0,10) + '.csv';
  a.click();
  URL.revokeObjectURL(a.href);
  toast('已导出 CSV（备用）','ok');
}

/* ---- 导航 ---- */
function goHome(){ location.href = '../index.html'; }
function goRecords(){ location.href = '../records/index.html'; }

/* ===================== 动效工具 ===================== */
/* 数字滚动：el 从 0 滚到 target，duration ms */
function animateNum(el, target, duration=1000){
  if(!el) return;
  target = parseFloat(target);
  if(isNaN(target)){ el.textContent = '0'; return; }
  const decimals = (String(target).split('.')[1]||'').length;
  const start = performance.now();
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduced){ el.textContent = target.toFixed(decimals); return; }
  function tick(t){
    const p = Math.min((t-start)/duration, 1);
    const ease = 1 - Math.pow(1-p, 3);
    el.textContent = (target*ease).toFixed(decimals);
    if(p<1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
/* 条形图动画：容器内 .dim-bar i 或 [data-w] 元素从 0 展开到目标宽度 */
function animateBars(scope){
  if(!scope) return;
  const bars = scope.querySelectorAll ? scope.querySelectorAll('.dim-bar i') : [];
  bars.forEach(bar=>{
    const target = parseFloat(bar.dataset.w || bar.style.width || 0);
    bar.style.width = '0%';
    requestAnimationFrame(()=>{
      setTimeout(()=>{ bar.style.width = target + '%'; }, 60);
    });
  });
}

/* 通用建议 HTML 生成器：sugs = [{t, warn?}] */
function sugHtml(sugs, title='参考建议'){
  if(!sugs || !sugs.length) return '';
  return `<div class="res-sug">
    <div class="sug-head"><span class="ic">💡</span>${title}</div>
    <div class="sug-body">
      ${sugs.map((s,i)=>`<div class="sug-item ${s.warn?'sug-warn':''}"><span class="n">${i+1}</span><span class="t">${s.t}</span></div>`).join('')}
    </div>
  </div>`;
}

document.addEventListener('DOMContentLoaded', () => { updateSummary(); });
