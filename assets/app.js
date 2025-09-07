// ---------- Utilidades ----------
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => [...ctx.querySelectorAll(sel)];
const storage = {
  get: (k, def=[]) => JSON.parse(localStorage.getItem(k) || JSON.stringify(def)),
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
};
const todayISO = () => new Date().toISOString().slice(0,10);

function flash(msg, type='ok', ms=2500){
  const box = $('#flash');
  box.textContent = msg;
  box.className = `flash show ${type==='err'?'err':''}`;
  setTimeout(()=>{ box.className = 'flash'; box.textContent=''; }, ms);
}

// ===== DataProvider (API PHP) =====
const USE_API = true;
const API_BASE = '/control-accesos/api';

const DEMO_USERS = {
  admin: {password: 'admin', role: 'admin'},
  recepcion: {password: 'admin', role: 'recepcion'},
  seguridad: {password: 'admin', role: 'seguridad'},
  rh: {password: 'admin', role: 'rh'}
};

const dataProvider = {
  async login(username, password){
    if(!USE_API){
      const u = DEMO_USERS[username];
      if(u && u.password===password) return {ok:true, data:{username, role:u.role}};
      return {ok:false, error:'Credenciales inválidas'};
    }
    const r = await fetch(`${API_BASE}/auth/login.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({username, password})
    });
    return r.json();
  },
  async empleadosList(q=''){
    if(!USE_API) return {ok:true, data: storage.get('empleados', [])};
    const r = await fetch(`${API_BASE}/empleados/list.php${q?`?q=${encodeURIComponent(q)}`:''}`);
    return r.json();
  },
  async empleadoCreate(emp){
    if(!USE_API){
      const list = storage.get('empleados', []); list.push({...emp, dentro:false}); storage.set('empleados', list);
      return {ok:true, data:{id:emp.id}};
    }
    const r = await fetch(`${API_BASE}/empleados/create.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(emp)
    });
    return r.json();
  },
  async empleadoToggle(id){
    if(!USE_API){
      const list = storage.get('empleados', []);
      const e = list.find(x=>x.id===id); if(e){ e.dentro=!e.dentro; storage.set('empleados', list); return {ok:true,data:{id, dentro:e.dentro}}; }
      return {ok:false, error:'No existe'};
    }
    const r = await fetch(`${API_BASE}/empleados/toggle.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    return r.json();
  },
  async empleadoDelete(id){
    if(!USE_API){
      const list = storage.get('empleados', []).filter(x=>x.id!==id); storage.set('empleados', list);
      return {ok:true};
    }
    const r = await fetch(`${API_BASE}/empleados/delete.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    return r.json();
  },
  async visitasList(){
    if(!USE_API) return {ok:true, data: storage.get('visitas', [])};
    const r = await fetch(`${API_BASE}/visitas/list.php`);
    const j = await r.json();
    if(j.ok){
      j.data = j.data.map(x=>({ ...x, id: `V${x.id}` }));
    }
    return j;
  },
  async visitaCreate(v){
    if(!USE_API){
      const list = storage.get('visitas', []);
      const id=`V${Date.now()}`; list.push({id, ...v, dentro:true}); storage.set('visitas', list);
      return {ok:true, data:{id}};
    }
    const r = await fetch(`${API_BASE}/visitas/create.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(v)
    });
    return r.json();
  },
  async visitaToggle(idWithPrefix){
    if(!USE_API){
      const list = storage.get('visitas', []);
      const v = list.find(x=>x.id===idWithPrefix); if(v){ v.dentro=!v.dentro; storage.set('visitas', list); return {ok:true, data:{id:idWithPrefix, dentro:v.dentro}}; }
      return {ok:false, error:'No existe'};
    }
    const id = parseInt(String(idWithPrefix).replace(/^V/,''),10);
    const r = await fetch(`${API_BASE}/visitas/toggle.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    return r.json();
  },
  async visitaDelete(idWithPrefix){
    if(!USE_API){
      const list = storage.get('visitas', []).filter(x=>x.id!==idWithPrefix); storage.set('visitas', list);
      return {ok:true};
    }
    const id = parseInt(String(idWithPrefix).replace(/^V/,''),10);
    const r = await fetch(`${API_BASE}/visitas/delete.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    return r.json();
  },
  async eventosList(){
    if(!USE_API) return {ok:true, data: storage.get('eventos', [])};
    const r = await fetch(`${API_BASE}/eventos/list.php`);
    const j = await r.json();
    if(j.ok){
      j.data = j.data.map(x=>({ ...x, id:`E${x.id}` }));
    }
    return j;
  },
  async eventoCreate(ev){
    if(!USE_API){ const list = storage.get('eventos', []); const id=`E${Date.now()}`; list.push({id, ...ev}); storage.set('eventos', list); return {ok:true, data:{id}}; }
    const r = await fetch(`${API_BASE}/eventos/create.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(ev)
    });
    return r.json();
  },
  async eventoDelete(idWithPrefix){
    if(!USE_API){ const list = storage.get('eventos', []).filter(x=>x.id!==idWithPrefix); storage.set('eventos', list); return {ok:true}; }
    const id = parseInt(String(idWithPrefix).replace(/^E/,''),10);
    const r = await fetch(`${API_BASE}/eventos/delete.php`, {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({id})
    });
    return r.json();
  },
  async reporteOcupacion(fecha){
    if(!USE_API){
      const emps = storage.get('empleados', []);
      const viss = storage.get('visitas', []);
      const rows = [1,2,3,4,5].map(piso=>{
        const total = emps.filter(e=>e.dentro && e.piso===piso).length +
                      viss.filter(v=>v.dentro && v.piso===piso).length;
        return {Piso:piso, Personas: total};
      });
      return {ok:true, data: rows};
    }
    const r = await fetch(`${API_BASE}/reportes/ocupacion.php?fecha=${encodeURIComponent(fecha)}`);
    return r.json();
  },
  async reportePersonas(desde,hasta){
    if(!USE_API){
      const logs = storage.get('logs', []);
      const rows = logs
        .filter(l=>l.ts.slice(0,10)>=desde && l.ts.slice(0,10)<=hasta)
        .map(l=>({Fecha:l.ts.slice(0,10), Hora:l.ts.slice(11,19), Tipo:l.tipo, Detalle:l.detalle}));
      return {ok:true, data: rows};
    }
    const r = await fetch(`${API_BASE}/reportes/personas.php?desde=${encodeURIComponent(desde)}&hasta=${encodeURIComponent(hasta)}`);
    return r.json();
  }
};

// ---------- Estado ----------
const state = {
  publicMode: true,
  user: null,
  empleados: [],
  visitas: [],
  eventos: []
};

// ---------- ACL ----------
const ACL = {
  public:     ['inicio','login','visitas','reportes'],
  admin:      ['dashboard','empleados','visitas','eventos','reportes'],
  recepcion:  ['dashboard','visitas','eventos','reportes'],
  seguridad:  ['dashboard','visitas','reportes'],
  rh:         ['dashboard','empleados','reportes']
};

const toggleTabsByAuth = (isAuth, role) => {
  $('#tabInicio').hidden = !true;
  $('#tabLogin').hidden = isAuth;
  ['dashboard','empleados','visitas','eventos','reportes'].forEach(view=>{
    const btn = $$(`.tab[data-view="${view}"]`)[0];
    if(!btn) return;
    btn.hidden = !isAuth || !ACL[role]?.includes(view);
  });
};

const showView = (id) => {
  const publicAllowed = ['inicio','login','visitas','reportes'];
  if(!state.user && !publicAllowed.includes(id)){
    flash('Inicia sesión para acceder', 'err');
    return;
  }
  $$('.view').forEach(v => v.classList.remove('visible'));
  $(`#view-${id}`).classList.add('visible');
  $$('.tab').forEach(b => b.classList.toggle('active', b.dataset.view === id));
};

function renderEmpleados(list=state.empleados){
  const body = $('#tablaEmpleados tbody');
  if(!body) return;
  body.innerHTML = '';
  list.forEach(emp=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${emp.nombre}</td>
      <td>${emp.id}</td>
      <td>${emp.piso}</td>
      <td><span class="chip ${emp.dentro?'ok':'out'}">${emp.dentro?'Dentro':'Fuera'}</span></td>
      <td class="row">
        <button class="btn btn-ghost" data-action="toggle" data-id="${emp.id}">${emp.dentro?'Salida':'Entrada'}</button>
        <button class="btn btn-ghost danger" data-action="del" data-id="${emp.id}">Eliminar</button>
      </td>`;
    body.appendChild(tr);
  });
}

function renderVisitas(){
  const body = $('#tablaVisitas tbody');
  if(!body) return;
  body.innerHTML = '';
  state.visitas.forEach(v=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${v.nombre}</td><td>${v.empresa||'-'}</td><td>${v.anfitrion}</td>
      <td>${v.piso}</td>
      <td><span class="chip ${v.dentro?'ok':'out'}">${v.dentro?'Dentro':'Fuera'}</span></td>
      <td class="row">
        <button class="btn btn-ghost" data-action="toggle-visita" data-id="${v.id}">${v.dentro?'Salida':'Entrada'}</button>
        <button class="btn btn-ghost danger" data-action="del-visita" data-id="${v.id}">Eliminar</button>
      </td>`;
    body.appendChild(tr);
  });
}

function renderEventos(){
  const body = $('#tablaEventos tbody');
  if(!body) return;
  body.innerHTML = '';
  state.eventos.forEach(ev=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${ev.nombre}</td><td>${String(ev.fecha).slice(0,10)}</td><td>${ev.piso}</td>
      <td><button class="btn btn-ghost danger" data-action="del-evento" data-id="${ev.id}">Eliminar</button></td>`;
    body.appendChild(tr);
  });
}

function renderDashboard(){
  const empDentro = state.empleados.filter(e=>e.dentro).length;
  const visDentro = state.visitas.filter(v=>v.dentro).length;
  $('#statEmpleados') && ($('#statEmpleados').textContent = empDentro);
  $('#statVisitas') && ($('#statVisitas').textContent = visDentro);
  const hoy = todayISO();
  $('#statEventos') && ($('#statEventos').textContent = state.eventos.filter(e=>String(e.fecha).slice(0,10)===hoy).length);

  const byPiso = [1,2,3,4,5].map(piso=>{
    const total = state.empleados.filter(e=>e.dentro && +e.piso===piso).length +
                  state.visitas.filter(v=>v.dentro && +v.piso===piso).length;
    return {piso, total};
  });
  const tb = $('#tablaOcupacion tbody');
  if(tb){
    tb.innerHTML = '';
    byPiso.forEach(r=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${r.piso}</td><td>${r.total}</td>`;
      tb.appendChild(tr);
    });
  }

  if(empDentro+visDentro===0) flash('No hay personas dentro del edificio ahora mismo');
}

function renderReporte(data, headers){
  const thead = $('#tablaReporte thead');
  const tbody = $('#tablaReporte tbody');
  if(!thead || !tbody) return;
  thead.innerHTML = `<tr>${headers.map(h=>`<th>${h}</th>`).join('')}</tr>`;
  tbody.innerHTML = data.map(row=>`<tr>${headers.map(h=>`<td>${row[h]}</td>`).join('')}</tr>`).join('');
}

async function refreshAll(){
  let r = await dataProvider.empleadosList();
  if(r.ok){ state.empleados = r.data; } else { flash(r.error || 'Error leyendo empleados','err'); }
  renderEmpleados();

  r = await dataProvider.visitasList();
  if(r.ok){ state.visitas = r.data; } else { flash(r.error || 'Error leyendo visitas','err'); }
  renderVisitas();

  r = await dataProvider.eventosList();
  if(r.ok){ state.eventos = r.data; } else { flash(r.error || 'Error leyendo eventos','err'); }
  renderEventos();

  renderDashboard();
}

window.addEventListener('DOMContentLoaded', ()=>{
  $('#btnSoyVisitante')?.addEventListener('click', ()=>{
    state.publicMode = true;
    showView('visitas');
    const tableCard = document.getElementById('cardVisitasTabla');
    if(tableCard) tableCard.style.display = 'none';
    flash('Registro de visitantes (público). Completa el formulario y entrega el pase en recepción.');
  });
  $('#btnSoyEmpleado')?.addEventListener('click', ()=>{
    state.publicMode = false;
    showView('login');
  });

  $$('.tab').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      showView(btn.dataset.view);
    });
  });

  $('#formLogin')?.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const resp = await dataProvider.login(data.username, data.password);
    if(resp.ok){
      const {username, role} = resp.data;
      state.user = {username, role};
      $('#currentUser').textContent = `${username} (${role})`;
      toggleTabsByAuth(true, role);
      $('#btnLogout').hidden = false;
      showView('dashboard');
      state.publicMode = false;
      await refreshAll();
      const tableCard = document.getElementById('cardVisitasTabla'); if(tableCard) tableCard.style.display = '';
    }else{
      flash(resp.error || 'Credenciales inválidas','err');
    }
  });

  $('#btnLogout')?.addEventListener('click', ()=>{
    state.user = null;
    $('#currentUser').textContent = '';
    toggleTabsByAuth(false);
    state.publicMode = true;
    showView('inicio');
    const tableCard = document.getElementById('cardVisitasTabla'); if(tableCard) tableCard.style.display = 'none';
  });

  // Empleados
  $('#formEmpleado')?.addEventListener('submit', async e=>{
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const exists = state.empleados.some(x=>x.id===f.id);
    if(exists){ flash('ID ya registrado','err'); return; }
    const r = await dataProvider.empleadoCreate({nombre:f.nombre, id:f.id, piso:+f.piso});
    if(r.ok){ flash('Empleado creado'); await refreshAll(); e.target.reset(); }
    else{ flash(r.error || 'No se pudo crear','err'); }
  });

  $('#tablaEmpleados')?.addEventListener('click', async e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    const id = btn.dataset.id;
    if(btn.dataset.action==='toggle'){
      const r = await dataProvider.empleadoToggle(id);
      if(!r.ok) flash(r.error || 'Error al cambiar estado','err');
      await refreshAll();
    }
    if(btn.dataset.action==='del'){
      if(confirm('¿Eliminar empleado?')){
        const r = await dataProvider.empleadoDelete(id);
        if(!r.ok) flash(r.error || 'Error al eliminar','err');
        await refreshAll();
      }
    }
  });

  $('#searchEmpleado')?.addEventListener('input', async e=>{
    const q = e.target.value.trim();
    const r = await dataProvider.empleadosList(q);
    if(r.ok){ renderEmpleados(r.data); }
  });

  $('#exportEmpleados')?.addEventListener('click', ()=>{
    const rows = state.empleados.map(e=>({...e, rol: 'empleado'}));
    exportCSV('empleados.csv', rows, ['nombre','id','piso','dentro','rol']);
  });

  // Visitas
  $('#formVisita')?.addEventListener('submit', async e=>{
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const r = await dataProvider.visitaCreate({
      nombre:f.nombre, empresa:f.empresa||'', anfitrion:f.anfitrion, piso:+f.piso
    });
    if(r.ok){ flash('Visita registrada'); await refreshAll(); e.target.reset(); }
    else{ flash(r.error || 'No se pudo registrar','err'); }
  });

  $('#tablaVisitas')?.addEventListener('click', async e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    if(state.publicMode){ flash('Acción solo para personal autorizado','err'); return; }
    const id = btn.dataset.id;
    if(btn.dataset.action==='toggle-visita'){
      const r = await dataProvider.visitaToggle(id);
      if(!r.ok) flash(r.error || 'Error al cambiar estado','err');
      await refreshAll();
    }
    if(btn.dataset.action==='del-visita'){
      if(confirm('¿Eliminar visita?')){
        const r = await dataProvider.visitaDelete(id);
        if(!r.ok) flash(r.error || 'Error al eliminar','err');
        await refreshAll();
      }
    }
  });

  // Eventos
  $('#formEvento')?.addEventListener('submit', async e=>{
    e.preventDefault();
    const f = Object.fromEntries(new FormData(e.target));
    const r = await dataProvider.eventoCreate({nombre:f.nombre, fecha:f.fecha, piso:+f.piso});
    if(r.ok){ flash('Evento creado'); await refreshAll(); e.target.reset(); }
    else{ flash(r.error || 'No se pudo crear','err'); }
  });

  $('#tablaEventos')?.addEventListener('click', async e=>{
    const btn = e.target.closest('button'); if(!btn) return;
    if(btn.dataset.action==='del-evento'){
      const id = btn.dataset.id;
      if(confirm('¿Eliminar evento?')){
        const r = await dataProvider.eventoDelete(id);
        if(!r.ok) flash(r.error || 'Error al eliminar','err');
        await refreshAll();
      }
    }
  });

  // Reportes
  $('#formReporte')?.addEventListener('submit', async e=>{
    e.preventDefault();
    const {desde, hasta, tipo} = Object.fromEntries(new FormData(e.target));
    if(tipo==='ocupacion'){
      const r = await dataProvider.reporteOcupacion(desde);
      if(r.ok){
        const rows = r.data;
        renderReporte(rows, ['Piso','Personas']);
        $('#exportReporte').onclick = ()=> exportCSV('reporte_ocupacion.csv', rows, ['Piso','Personas']);
      }else{
        flash(r.error || 'No se pudo generar','err');
      }
    }else{
      const r = await dataProvider.reportePersonas(desde,hasta);
      if(r.ok){
        const rows = r.data;
        renderReporte(rows, ['Fecha','Hora','Tipo','Detalle']);
        $('#exportReporte').onclick = ()=> exportCSV('reporte_personas.csv', rows, ['Fecha','Hora','Tipo','Detalle']);
      }else{
        flash(r.error || 'No se pudo generar','err');
      }
    }
  });

  const frmRep = $('#formReporte');
  if (frmRep) {
    frmRep.desde.value = todayISO();
    frmRep.hasta.value = todayISO();
  }

  toggleTabsByAuth(false);
  showView('inicio');
  const tableCard0 = document.getElementById('cardVisitasTabla'); if(tableCard0) tableCard0.style.display = 'none';
});

function exportCSV(filename, rows, headers){
  const head = headers.join(',');
  const body = rows.map(r=>headers.map(h=>JSON.stringify(r[h] ?? '')).join(',')).join('\n');
  const csv = head + '\n' + body;
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}
