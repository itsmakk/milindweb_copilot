/* =========================================================
   MilindWeb Hospital — OPD Registration SPA
   ---------------------------------------------------------
   1. Auth guard: any hospital_* role (reception, doctor, admin, etc.)
   2. Patient search / new patient
   3. Visit form: doctor, department, vitals, symptoms, prescriptions, outcome
   4. Save → confirmation step with print button
   ========================================================= */
(function () {
  'use strict';

  const CFG = window.MW_CONFIG || {};
  const API = (CFG.apiBaseUrl || '/api/v1').replace(/\/$/, '');

  // -----------------------------------------------------------------
  // State
  // -----------------------------------------------------------------
  const state = {
    me: null,
    role: null,
    patient: null,         // selected patient object (or null)
    doctors: [],
    departments: [],
    deptData: [],           // for symptom autocomplete
    medicineData: [],
    visit: null,            // created visit
    prescriptions: [],      // working list before save
  };

  // -----------------------------------------------------------------
  // Helpers
  // -----------------------------------------------------------------
  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.from(document.querySelectorAll(sel)); }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }
  function toast(msg, kind = 'info', ms = 3000) {
    const t = document.createElement('div');
    t.className = 'opd-toast opd-toast--' + kind;
    t.setAttribute('role', 'status');
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transition = 'opacity 0.2s'; }, ms - 200);
    setTimeout(() => t.remove(), ms);
  }

  async function api(method, path, body) {
    const auth = window.MW_AUTH;
    if (!auth) throw new Error('MW_AUTH missing');
    const r = await auth.fetch(API + path, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body == null ? undefined : JSON.stringify(body),
    });
    const text = await r.text();
    let json = null;
    try { json = text ? JSON.parse(text) : null; } catch (_) { /* non-JSON */ }
    if (!r.ok) {
      const message = (json && (json.message || (json.error && json.error.message))) || ('HTTP ' + r.status);
      const err = new Error(Array.isArray(message) ? message.join('; ') : message);
      err.status = r.status;
      err.body = json;
      throw err;
    }
    return json && json.data !== undefined ? json.data : json;
  }

  // -----------------------------------------------------------------
  // Auth + bootstrap
  // -----------------------------------------------------------------
  async function boot() {
    const auth = window.MW_AUTH;
    if (!auth) {
      showFatal('Auth library not loaded. Make sure /auth/oidc-client.js is included before opd.js.');
      return;
    }
    await auth.ready();
    if (!auth.getSession()) {
      sessionStorage.setItem('mw.opd.returnTo', location.pathname + location.search);
      location.replace('/auth/login.html');
      return;
    }
    let me;
    try { me = await api('GET', '/auth/me'); }
    catch (e) {
      showFatal('Could not verify your sign-in. ' + e.message);
      return;
    }
    state.me = me;
    state.role = me.role;
    if (!isHospitalRole(state.role) && !(me.groups || []).some(isHospitalGroup)) {
      showFatal('This page is for hospital staff. Your role: ' + (state.role || 'none') + '.');
      return;
    }
    $('#opdWho').innerHTML = `Signed in as <strong>${esc(me.name || me.email || 'staff')}</strong> · <span>${esc(state.role)}</span>`;
    try {
      await Promise.all([loadDoctors(), loadDepartments(), loadSymptomData(), loadMedicineData()]);
    } catch (e) {
      showFatal('Could not load hospital reference data. ' + e.message);
      return;
    }
    wireEvents();
  }

  function isHospitalRole(r) { return typeof r === 'string' && r.startsWith('hospital_'); }
  function isHospitalGroup(g) { return typeof g === 'string' && g.startsWith('hospital-'); }

  function showFatal(msg) {
    document.querySelector('.opd-app').innerHTML =
      `<div class="opd-step"><div class="opd-step__body"><div class="opd-toast opd-toast--error" style="position:static;max-width:none">${esc(msg)}</div></div></div>`;
  }

  async function loadDoctors() {
    const all = await api('GET', '/hospital/doctors?active=true&pageSize=200');
    state.doctors = all.items || all || [];
    const sel = $('#opdDoctor');
    sel.innerHTML = '<option value="">Select doctor…</option>' + state.doctors.map((d) =>
      `<option value="${esc(d.id)}">${esc(d.name)}${d.specialization ? ' — ' + esc(d.specialization) : ''}</option>`,
    ).join('');
  }
  async function loadDepartments() {
    const all = await api('GET', '/hospital/departments?active=true&pageSize=200');
    state.departments = all.items || all || [];
    const sel = $('#opdDepartment');
    sel.innerHTML = '<option value="">Select department…</option>' + state.departments.map((d) =>
      `<option value="${esc(d.id)}">${esc(d.name)}</option>`,
    ).join('');
  }
  async function loadSymptomData() {
    // Try DB-backed department symptoms first; fall back to the static JSON.
    state.deptData = (state.departments || []).map((d) => ({
      dept: d.name,
      deptId: d.id,
      symptoms: d.defaultSymptoms || [],
    }));
    try {
      const r = await fetch('data/dept.json', { cache: 'force-cache' });
      if (r.ok) {
        const json = await r.json();
        const extras = (json.department || []).map((d) => ({ dept: d.dept, symptoms: d.symptoms || [] }));
        state.deptData = state.deptData.concat(extras);
      }
    } catch (_) { /* static data is optional */ }
  }
  async function loadMedicineData() {
    try {
      const r = await fetch('data/medlist.json', { cache: 'force-cache' });
      if (r.ok) state.medicineData = await r.json();
    } catch (_) { state.medicineData = []; }
  }

  // -----------------------------------------------------------------
  // Patient search
  // -----------------------------------------------------------------
  async function searchPatients(q) {
    if (!q || q.length < 2) return [];
    try {
      const r = await api('GET', '/hospital/patients/search?q=' + encodeURIComponent(q));
      return Array.isArray(r) ? r : (r.items || []);
    } catch (e) {
      console.warn('patient search failed', e);
      return [];
    }
  }

  function renderSearchResults(results) {
    const host = $('#opdSearchResults');
    if (!results.length) {
      host.innerHTML = '<div class="opd-search__empty">No matches. Click <strong>New patient</strong> to register one.</div>';
      return;
    }
    host.innerHTML = results.slice(0, 8).map((p) => `
      <button type="button" class="opd-search__hit" data-id="${esc(p.id)}" role="option">
        <span><strong>${esc(p.uhid)}</strong>${esc(p.fullName)} <small>· ${esc(p.gender || '—')}${p.age ? ' · ' + p.age + 'y' : ''}</small></span>
        <small>${esc(p.mobile || '')}</small>
      </button>
    `).join('');
    host.querySelectorAll('.opd-search__hit').forEach((btn) => {
      btn.addEventListener('click', () => {
        const p = results.find((x) => x.id === btn.dataset.id);
        if (p) selectPatient(p);
      });
    });
  }

  function selectPatient(p) {
    state.patient = p;
    $('#opdSearchResults').innerHTML = '';
    $('#opdPatientSearch').value = '';
    renderPatientCard();
    $('#opdStepVisit').hidden = false;
    setTimeout(() => $('#opdDoctor').focus(), 50);
  }

  function renderPatientCard() {
    const p = state.patient;
    const host = $('#opdPatientCard');
    if (!p) { host.hidden = true; host.innerHTML = ''; return; }
    host.hidden = false;
    host.innerHTML = `
      <div class="opd-patient-card__head">
        <h3>${esc(p.fullName)}</h3>
        <span class="opd-patient-card__uhid">${esc(p.uhid)}</span>
        <small style="color:var(--text-muted);margin-left:auto">${esc(p.gender || '—')}${p.age ? ' · ' + p.age + 'y' : ''}</small>
      </div>
      <dl>
        <dt>Mobile</dt><dd>${esc(p.mobile || '—')}</dd>
        <dt>DOB</dt><dd>${esc(p.dob || '—')}</dd>
        <dt>Blood</dt><dd>${esc(p.bloodGroup || '—')}</dd>
        <dt>Allergies</dt><dd>${esc((p.allergies || []).join(', ') || '—')}</dd>
        <dt>Chronic</dt><dd>${esc((p.chronicDiseases || []).join(', ') || '—')}</dd>
      </dl>
      <div class="opd-patient-card__actions">
        <button type="button" class="btn btn--ghost btn--sm" id="opdChangePatient"><i class="fas fa-arrow-left"></i> Change</button>
      </div>
    `;
    $('#opdChangePatient').addEventListener('click', () => {
      state.patient = null;
      renderPatientCard();
      $('#opdStepVisit').hidden = true;
      $('#opdPatientSearch').focus();
    });
  }

  // -----------------------------------------------------------------
  // New patient modal
  // -----------------------------------------------------------------
  function openNewPatient() {
    const overlay = document.createElement('div');
    overlay.className = 'opd-modal-host';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:100;display:flex;align-items:flex-start;justify-content:center;padding:40px 20px;overflow-y:auto';
    overlay.innerHTML = `
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;width:100%;max-width:560px;box-shadow:0 8px 24px rgba(0,0,0,0.2)">
        <header style="display:flex;align-items:center;justify-content:space-between;padding:14px 18px;border-bottom:1px solid var(--border)">
          <h2 style="margin:0;font-size:1.05rem">New patient</h2>
          <button type="button" class="opd-modal-close" aria-label="Close" style="background:transparent;border:0;color:var(--text-muted);cursor:pointer;font-size:1rem"><i class="fas fa-times"></i></button>
        </header>
        <form id="opdNewPatientForm" style="padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:12px 14px">
          <div class="opd-field" style="grid-column:span 2"><label>Full name *</label><input name="fullName" required></div>
          <div class="opd-field"><label>Gender *</label><select name="gender" required><option value="">Select…</option><option>Male</option><option>Female</option><option>Other</option></select></div>
          <div class="opd-field"><label>Age (years)</label><input type="number" min="0" name="age"></div>
          <div class="opd-field"><label>Mobile</label><input type="tel" name="mobile"></div>
          <div class="opd-field"><label>DOB</label><input type="date" name="dob"></div>
          <div class="opd-field"><label>Blood group</label><input name="bloodGroup" placeholder="A+, O-, …"></div>
          <div class="opd-field" style="grid-column:span 2"><label>Address</label><textarea name="address" rows="2"></textarea></div>
          <div class="opd-field" style="grid-column:span 2"><label>Allergies <small>comma-separated</small></label><input name="allergies" placeholder="Penicillin, peanuts"></div>
          <div class="opd-field" style="grid-column:span 2"><label>Chronic diseases</label><input name="chronicDiseases" placeholder="Diabetes, hypertension"></div>
          <div style="grid-column:span 2;display:flex;gap:8px;justify-content:flex-end;border-top:1px solid var(--border);padding-top:12px">
            <button type="button" class="btn btn--ghost" data-act="cancel">Cancel</button>
            <button type="submit" class="btn btn--primary"><i class="fas fa-user-plus"></i> Create patient</button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(overlay);
    overlay.querySelector('.opd-modal-close').addEventListener('click', () => overlay.remove());
    overlay.querySelector('[data-act="cancel"]').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget);
      const body = {
        fullName: fd.get('fullName').trim(),
        gender: fd.get('gender'),
        age: fd.get('age') ? Number(fd.get('age')) : null,
        mobile: fd.get('mobile') || null,
        dob: fd.get('dob') || null,
        bloodGroup: fd.get('bloodGroup') || null,
        address: fd.get('address') || null,
        allergies: splitCsv(fd.get('allergies')),
        chronicDiseases: splitCsv(fd.get('chronicDiseases')),
      };
      if (!body.fullName || !body.gender) { toast('Name and gender are required', 'error'); return; }
      try {
        const created = await api('POST', '/hospital/patients', body);
        toast('Patient ' + created.uhid + ' created', 'success');
        overlay.remove();
        selectPatient(created);
      } catch (err) { toast(err.message, 'error'); }
    });
  }
  function splitCsv(s) { return (s || '').split(',').map((x) => x.trim()).filter(Boolean); }

  // -----------------------------------------------------------------
  // Symptoms autocomplete
  // -----------------------------------------------------------------
  function wireSymptomSuggest() {
    const input = $('#opdChiefComplaints');
    const suggest = $('#opdSymptomSuggest');
    const hint = $('#opdSymptomHint');
    const deptSel = $('#opdDepartment');
    function updateHint() {
      const d = state.deptData.find((x) => x.deptId === deptSel.value) || state.deptData.find((x) => x.dept === deptSel.options[deptSel.selectedIndex]?.text);
      if (d && d.symptoms.length) hint.textContent = 'Common: ' + d.symptoms.slice(0, 10).join(', ');
      else hint.textContent = '';
    }
    deptSel.addEventListener('change', updateHint);
    updateHint();
    input.addEventListener('input', () => {
      const lines = input.value.split('\n');
      const query = (lines[lines.length - 1] || '').trim().toLowerCase();
      if (query.length < 2) { suggest.classList.remove('is-open'); suggest.innerHTML = ''; return; }
      const matches = [];
      state.deptData.forEach((d) => {
        (d.symptoms || []).forEach((s) => {
          if (s.toLowerCase().includes(query) && !matches.some((m) => m.name === s)) {
            matches.push({ name: s, cat: d.dept });
          }
        });
      });
      if (!matches.length) { suggest.classList.remove('is-open'); suggest.innerHTML = ''; return; }
      suggest.innerHTML = matches.slice(0, 8).map((m) =>
        `<div class="opd-suggest__hit" role="option" data-name="${esc(m.name)}">
           <span>${esc(m.name)}</span><span class="cat">${esc(m.cat)}</span>
         </div>`,
      ).join('');
      suggest.classList.add('is-open');
      suggest.querySelectorAll('.opd-suggest__hit').forEach((el) => {
        el.addEventListener('mousedown', (ev) => {
          ev.preventDefault();
          const lines = input.value.split('\n');
          lines[lines.length - 1] = el.dataset.name;
          input.value = lines.join('\n') + (lines.length > 1 || input.value.endsWith('\n') ? '' : '\n');
          suggest.classList.remove('is-open');
          suggest.innerHTML = '';
        });
      });
    });
    document.addEventListener('click', (e) => {
      if (!suggest.contains(e.target) && e.target !== input) {
        suggest.classList.remove('is-open');
      }
    });
  }

  // -----------------------------------------------------------------
  // Prescriptions
  // -----------------------------------------------------------------
  function addRxRow() {
    const idx = state.prescriptions.length;
    state.prescriptions.push({ medicineName: '', genericName: '', brandName: '', strength: '', dosage: '', frequency: '', duration: '', instructions: '' });
    renderRxList();
  }
  function removeRxRow(idx) {
    state.prescriptions.splice(idx, 1);
    renderRxList();
  }
  function renderRxList() {
    const host = $('#opdRxList');
    if (!state.prescriptions.length) { host.innerHTML = ''; return; }
    host.innerHTML = state.prescriptions.map((rx, i) => `
      <div class="opd-rx-row" data-i="${i}">
        <div class="opd-field">
          <label>Medicine *</label>
          <input name="medicineName" value="${esc(rx.medicineName)}" required autocomplete="off">
        </div>
        <div class="opd-field">
          <label>Generic</label>
          <input name="genericName" value="${esc(rx.genericName)}">
        </div>
        <div class="opd-field"><label>Strength</label><input name="strength" value="${esc(rx.strength)}" placeholder="500 mg"></div>
        <div class="opd-field"><label>Dosage</label><input name="dosage" value="${esc(rx.dosage)}" placeholder="1 tab"></div>
        <div class="opd-field"><label>Frequency</label>
          <select name="frequency">
            <option value="">—</option>
            ${['OD','BD','TID','QID','HS','SOS'].map((f) => `<option ${rx.frequency === f ? 'selected' : ''}>${f}</option>`).join('')}
          </select>
        </div>
        <div class="opd-field"><label>Duration</label><input name="duration" value="${esc(rx.duration)}" placeholder="5 days"></div>
        <div class="opd-field"><label>Notes</label><input name="instructions" value="${esc(rx.instructions)}"></div>
        <button type="button" class="opd-rx-del" data-i="${i}" aria-label="Remove"><i class="fas fa-trash"></i></button>
      </div>
    `).join('');
    host.querySelectorAll('.opd-rx-row').forEach((row) => {
      const i = Number(row.dataset.i);
      row.querySelectorAll('input, select').forEach((el) => {
        el.addEventListener('input', () => { state.prescriptions[i][el.name] = el.value; });
      });
      row.querySelector('.opd-rx-del').addEventListener('click', () => removeRxRow(i));
      // Medicine autocomplete
      const medInput = row.querySelector('input[name="medicineName"]');
      const genInput = row.querySelector('input[name="genericName"]');
      medInput.addEventListener('input', () => {
        const q = medInput.value.trim().toLowerCase();
        if (q.length < 2) return;
        const matches = state.medicineData.filter((item) => {
          const cat = (item['Main Category'] || '').toLowerCase();
          const gen = (item['Generic ']?.[' API (Single or Combination)'] || '').toLowerCase();
          const brand = (item['Common Brand Names (India)'] || '').toLowerCase();
          return cat.includes(q) || gen.includes(q) || brand.includes(q);
        }).slice(0, 6);
        let box = row.querySelector('.opd-suggest');
        if (!box) {
          box = document.createElement('div');
          box.className = 'opd-suggest';
          row.querySelector('.opd-field').appendChild(box);
        }
        if (!matches.length) { box.classList.remove('is-open'); box.innerHTML = ''; return; }
        box.innerHTML = matches.map((m) => {
          const gen = m['Generic ']?.[' API (Single or Combination)'] || '';
          const brand = m['Common Brand Names (India)'] || '';
          return `<div class="opd-suggest__hit" data-gen="${esc(gen)}" data-brand="${esc(brand)}"><span>${esc(gen)}</span><span class="cat">${esc(brand || m['Main Category'] || '')}</span></div>`;
        }).join('');
        box.classList.add('is-open');
        box.querySelectorAll('.opd-suggest__hit').forEach((el) => {
          el.addEventListener('mousedown', (ev) => {
            ev.preventDefault();
            medInput.value = el.dataset.gen;
            genInput.value = el.dataset.gen;
            state.prescriptions[i].medicineName = el.dataset.gen;
            state.prescriptions[i].genericName = el.dataset.gen;
            state.prescriptions[i].brandName = el.dataset.brand || null;
            box.classList.remove('is-open');
          });
        });
      });
    });
  }

  // -----------------------------------------------------------------
  // Visit save
  // -----------------------------------------------------------------
  async function saveVisit(e) {
    e.preventDefault();
    if (!state.patient) { toast('Pick or create a patient first', 'error'); return; }
    const f = e.currentTarget;
    const fd = new FormData(f);
    const chief = (fd.get('chiefComplaints') || '').split('\n').map((s) => s.trim()).filter(Boolean);
    const body = {
      patientId: state.patient.id,
      doctorId: fd.get('doctorId') || null,
      departmentId: fd.get('departmentId') || null,
      visitDate: new Date().toISOString().slice(0, 10),
      weightKg: numOrNull(fd.get('weightKg')),
      bp: fd.get('bp') || null,
      pulse: numOrNullInt(fd.get('pulse')),
      respiratoryRate: numOrNullInt(fd.get('respiratoryRate')),
      spo2: numOrNullInt(fd.get('spo2')),
      tempF: numOrNull(fd.get('tempF')),
      sugarMgDl: numOrNullInt(fd.get('sugarMgDl')),
      chiefComplaints: chief.map((c) => ({ name: c })),
      provisionalDiagnosis: fd.get('provisionalDiagnosis') || null,
      investigationsAdvised: fd.get('investigationsAdvised') || null,
      investigationReports: fd.get('investigationReports') || null,
      finalDiagnosis: fd.get('finalDiagnosis') || null,
      advice: fd.get('advice') || null,
      effectAfterTreatment: fd.get('effectAfterTreatment') || null,
      doctorFee: numOrNull(fd.get('doctorFee')),
      doctorRemarks: fd.get('doctorRemarks') || null,
    };
    if (!body.doctorId || !body.departmentId) { toast('Doctor and department are required', 'error'); return; }
    try {
      const visit = await api('POST', '/hospital/visits', body);
      // Save prescriptions one by one (in a real app, add a batch endpoint)
      for (let i = 0; i < state.prescriptions.length; i++) {
        const rx = state.prescriptions[i];
        if (!rx.medicineName) continue;
        try {
          await api('POST', `/hospital/visits/${visit.id}/prescriptions`, {
            medicineName: rx.medicineName,
            genericName: rx.genericName || null,
            brandName: rx.brandName || null,
            strength: rx.strength || null,
            dosage: rx.dosage || null,
            frequency: rx.frequency || null,
            duration: rx.duration || null,
            instructions: rx.instructions || null,
            sortOrder: i,
          });
        } catch (err) {
          console.warn('rx failed', err);
          toast('Visit saved, but one prescription failed: ' + err.message, 'warn');
        }
      }
      // Re-fetch the visit to get the saved prescriptions for the summary
      const full = await api('GET', `/hospital/visits/${visit.id}`);
      state.visit = full;
      renderDone(full);
      toast('Visit ' + visit.opdNo + ' saved', 'success');
    } catch (err) { toast(err.message, 'error'); }
  }

  function numOrNull(v) { if (v == null || v === '') return null; const n = Number(v); return Number.isFinite(n) ? n : null; }
  function numOrNullInt(v) { const n = numOrNull(v); return n == null ? null : Math.round(n); }

  function renderDone(visit) {
    $('#opdStepVisit').hidden = true;
    $('#opdStepPatient').hidden = true;
    $('#opdStepDone').hidden = false;
    const doc = state.doctors.find((d) => d.id === visit.doctorId);
    const dept = state.departments.find((d) => d.id === visit.departmentId);
    $('#opdDone').innerHTML = `
      <span class="badge-ok"><i class="fas fa-check-circle"></i> Saved</span>
      <div class="opd-no">OPD No: ${esc(visit.opdNo)}</div>
      <dl>
        <dt>Patient</dt><dd>${esc(state.patient.fullName)} <small>(${esc(state.patient.uhid)})</small></dd>
        <dt>Doctor</dt><dd>${esc(doc ? doc.name : '—')}</dd>
        <dt>Department</dt><dd>${esc(dept ? dept.name : '—')}</dd>
        <dt>Date</dt><dd>${esc(visit.visitDate)}</dd>
        <dt>Status</dt><dd>${esc(visit.effectAfterTreatment || 'NA')}</dd>
      </dl>
      ${(visit.chiefComplaints || []).length ? `<h4>Chief complaints</h4><ul>${visit.chiefComplaints.map((c) => `<li>${esc(c.name)}${c.duration ? ' — ' + esc(c.duration) : ''}</li>`).join('')}</ul>` : ''}
      ${visit.provisionalDiagnosis ? `<h4>Provisional diagnosis</h4><p>${esc(visit.provisionalDiagnosis)}</p>` : ''}
      ${visit.finalDiagnosis ? `<h4>Final diagnosis</h4><p>${esc(visit.finalDiagnosis)}</p>` : ''}
      ${visit.advice ? `<h4>Advice</h4><p>${esc(visit.advice)}</p>` : ''}
      ${(visit.prescriptions || []).length ? `
        <h4>Prescriptions</h4>
        <table style="width:100%;border-collapse:collapse;font-size:0.92rem">
          <thead><tr style="text-align:left;color:var(--text-muted)">
            <th style="padding:6px 8px">Medicine</th><th>Strength</th><th>Dosage</th><th>Frequency</th><th>Duration</th>
          </tr></thead>
          <tbody>
            ${visit.prescriptions.map((rx) => `<tr>
              <td style="padding:6px 8px;border-top:1px solid var(--border)"><strong>${esc(rx.medicineName)}</strong>${rx.brandName ? ' <small>(' + esc(rx.brandName) + ')</small>' : ''}</td>
              <td style="padding:6px 8px;border-top:1px solid var(--border)">${esc(rx.strength || '—')}</td>
              <td style="padding:6px 8px;border-top:1px solid var(--border)">${esc(rx.dosage || '—')}</td>
              <td style="padding:6px 8px;border-top:1px solid var(--border)">${esc(rx.frequency || '—')}</td>
              <td style="padding:6px 8px;border-top:1px solid var(--border)">${esc(rx.duration || '—')}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      ` : ''}
    `;
    $('#opdPrintHeader').hidden = false;
    $('#opdPrintHeaderMeta').innerHTML = `OPD No <strong>${esc(visit.opdNo)}</strong><br>${esc(new Date().toLocaleString())}`;
  }

  // -----------------------------------------------------------------
  // Wiring
  // -----------------------------------------------------------------
  function wireEvents() {
    $('#opdPatientSearchBtn').addEventListener('click', async () => {
      const q = $('#opdPatientSearch').value.trim();
      const results = await searchPatients(q);
      renderSearchResults(results);
    });
    $('#opdPatientSearch').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); $('#opdPatientSearchBtn').click(); }
    });
    $('#opdPatientNewBtn').addEventListener('click', openNewPatient);
    $('#opdRxAddBtn').addEventListener('click', addRxRow);
    $('#opdVisitForm').addEventListener('submit', saveVisit);
    $('#opdResetBtn').addEventListener('click', resetAll);
    $('#opdNewBtn').addEventListener('click', resetAll);
    $('#opdPrintBtn').addEventListener('click', () => window.print());
    wireSymptomSuggest();
  }

  function resetAll() {
    state.patient = null;
    state.visit = null;
    state.prescriptions = [];
    $('#opdVisitForm').reset();
    $('#opdSearchResults').innerHTML = '';
    $('#opdPatientCard').hidden = true;
    $('#opdStepVisit').hidden = true;
    $('#opdStepDone').hidden = true;
    $('#opdStepPatient').hidden = false;
    $('#opdPrintHeader').hidden = true;
    $('#opdPatientSearch').focus();
  }

  // -----------------------------------------------------------------
  // Go
  // -----------------------------------------------------------------
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
