// ── State ──────────────────────────────────────────────────────────────────
const STATE = {
  weight: 120,
  weightLog: [{ date: '2026-06-01', kg: 120 }],
  calories: { eaten: 1420, target: 2050 },
  macros: { protein: { eaten: 112, target: 180 }, carbs: { eaten: 145, target: 190 }, fats: { eaten: 38, target: 64 } },
  steps: 2340,
  streak: 0,
  supplements: { morningWhey: false, postWhey: false, creatine: true },
  prs: { bench: 40, deadlift: null, latPulldown: null },
  restTimer: { active: false, total: 90, remaining: 90, interval: null },
  activeDay: 'MON',
  activePlanTab: 'workout',
  chatMessages: [
    { role: 'coach', text: "Ayo Rishit! 💪 Today's rest day — stay on nutrition. Hit your 2050 kcal target and don't skip creatine. Tomorrow is Chest + Triceps — bench press day bhai. Ready to start strong?", time: '10:32 AM' },
    { role: 'user', text: 'Bhai hungry hoon bahut, kya khau?', time: '10:45 AM' },
    { role: 'coach', text: "Eat smart yaar — high volume low cal:\n🥦 Broccoli/spinach — unlimited\n🍗 Dal + chicken — fills you up, high protein\n🥚 Boiled egg whites — 17 kcal each\n\nJust hold off on rotis if you've already hit carbs. Dal is your best friend on hungry days.", time: '10:45 AM' },
    { role: 'user', text: 'Weight check kiya — 119.5 kg! 🎉', time: '11:02 AM' },
    { role: 'coach', text: "LESSGO! 🔥 −0.5 kg in week 1 already! That's the deficit working + water weight dropping. Keep it clean, hit your steps, and we're on track for 116 by end of month. You're doing it bhai.", time: '11:02 AM' },
  ],
};

const PLAN = {
  MON: { name: 'Chest + Triceps', type: 'Push Day', exercises: [
    { name: 'Flat Barbell Bench Press', sets: 4, reps: 10, rest: '90s' },
    { name: 'Incline Dumbbell Press', sets: 3, reps: 12, rest: '75s' },
    { name: 'Cable Chest Fly', sets: 3, reps: 15, rest: '60s' },
    { name: 'Tricep Rope Pushdown', sets: 3, reps: 15, rest: '60s' },
    { name: 'Overhead Tricep Extension', sets: 3, reps: 12, rest: '60s' },
  ]},
  TUE: { name: 'Back + Biceps', type: 'Pull Day', exercises: [
    { name: 'Lat Pulldown', sets: 4, reps: 12, rest: '90s' },
    { name: 'Seated Cable Row', sets: 3, reps: 12, rest: '75s' },
    { name: 'Single Arm Dumbbell Row', sets: 3, reps: 12, rest: '60s' },
    { name: 'Barbell/Dumbbell Curl', sets: 3, reps: 12, rest: '60s' },
    { name: 'Hammer Curl', sets: 3, reps: 15, rest: '60s' },
  ]},
  WED: { name: 'Legs + Core', type: 'Legs Day', exercises: [
    { name: 'Leg Press', sets: 4, reps: 12, rest: '90s' },
    { name: 'Romanian Deadlift', sets: 3, reps: 12, rest: '90s' },
    { name: 'Leg Extension', sets: 3, reps: 15, rest: '60s' },
    { name: 'Leg Curl', sets: 3, reps: 15, rest: '60s' },
    { name: 'Plank', sets: 3, reps: '40s', rest: '45s' },
  ]},
  THU: { name: 'Shoulders + Traps', type: 'Push Day', exercises: [
    { name: 'Dumbbell Shoulder Press', sets: 4, reps: 12, rest: '90s' },
    { name: 'Lateral Raises', sets: 3, reps: 15, rest: '60s' },
    { name: 'Front Raises', sets: 3, reps: 12, rest: '60s' },
    { name: 'Face Pulls (cable)', sets: 3, reps: 15, rest: '60s' },
    { name: 'Barbell Shrugs', sets: 3, reps: 15, rest: '60s' },
  ]},
  FRI: { name: 'Back + Arms', type: 'Pull Day', exercises: [
    { name: 'Deadlift', sets: 4, reps: 8, rest: '2min' },
    { name: 'Cable Row Wide Grip', sets: 3, reps: 12, rest: '75s' },
    { name: 'Preacher Curl', sets: 3, reps: 12, rest: '60s' },
    { name: 'Tricep Dips (assisted)', sets: 3, reps: 12, rest: '60s' },
    { name: 'Cable Curl', sets: 3, reps: 15, rest: '60s' },
  ]},
  SAT: { name: 'Legs + Core + HIIT', type: 'Legs + Cardio', exercises: [
    { name: 'Goblet Squat', sets: 4, reps: 12, rest: '90s' },
    { name: 'Walking Lunges', sets: 3, reps: '10/leg', rest: '75s' },
    { name: 'Calf Raises', sets: 4, reps: 20, rest: '45s' },
    { name: 'Ab Crunch', sets: 3, reps: 20, rest: '45s' },
    { name: 'Leg Raises', sets: 3, reps: 15, rest: '45s' },
  ]},
  SUN: { name: 'Rest Day', type: 'Full Recovery', exercises: [] },
};

// ── Helpers ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const pct = (a, b) => Math.min(100, Math.round((a / b) * 100));
const fmt = n => n ? `${n}kg` : '—';

function showScreen(name) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  $(`screen-${name}`).classList.add('active');
  document.querySelector(`[data-screen="${name}"]`)?.classList.add('active');
  renders[name]?.();
}

// ── Render: Dashboard ────────────────────────────────────────────────────────
function renderDashboard() {
  const el = $('screen-dashboard');
  const remaining = STATE.calories.target - STATE.calories.eaten;
  el.innerHTML = `
    <div class="dash-header">
      <div>
        <div class="dash-greeting">Hey Rishit 👋</div>
        <div class="dash-date">Sunday, June 1 — Rest Day</div>
      </div>
      <div class="dash-streak">🔥 ${STATE.streak} day streak</div>
    </div>

    <div class="stat-row">
      <div class="stat-card stat-cyan">
        <div class="stat-val">${remaining}</div>
        <div class="stat-label">kcal left</div>
      </div>
      <div class="stat-card">
        <div class="stat-val">${STATE.weight}</div>
        <div class="stat-label">kg</div>
      </div>
      <div class="stat-card stat-lime">
        <div class="stat-val">${(STATE.steps/1000).toFixed(1)}k</div>
        <div class="stat-label">/ 10k steps</div>
      </div>
    </div>

    <div class="rest-card">
      <div class="rest-icon">🛌</div>
      <div>
        <div class="rest-title">Rest & Recover</div>
        <div class="rest-sub">Full rest day. Focus on nutrition, hydration, and sleep.</div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Today's Supps</div>
      ${[
        { key: 'morningWhey', label: 'Morning Whey (1 scoop in water)', time: '8 AM' },
        { key: 'postWhey', label: 'Post-Workout Whey (1 scoop)', time: '8:30 PM' },
        { key: 'creatine', label: 'Creatine 5g — in shake', time: 'Daily' },
      ].map(s => `
        <div class="checklist-item" onclick="toggleSupp('${s.key}')">
          <div class="check-box ${STATE.supplements[s.key] ? 'checked' : ''}">
            ${STATE.supplements[s.key] ? `<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="2,6 5,9 10,3"/></svg>` : ''}
          </div>
          <div class="checklist-label" style="${STATE.supplements[s.key] ? 'text-decoration:line-through;color:var(--text3)' : ''}">${s.label}</div>
          <div class="checklist-time">${s.time}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-title">Meal Timeline</div>
      ${[
        { time: '8 AM', meal: 'Breakfast + Whey', status: 'done', label: '✓' },
        { time: '1 PM', meal: 'Lunch', status: 'current', label: 'Now' },
        { time: '5 PM', meal: 'Pre-workout snack', status: '', label: '' },
        { time: '9 PM', meal: 'Dinner', status: '', label: '' },
        { time: '11 PM', meal: 'Optional snack', status: '', label: '' },
      ].map(t => `
        <div class="timeline-item">
          <div class="timeline-line"></div>
          <div class="timeline-dot ${t.status}"></div>
          <div class="timeline-time">${t.time}</div>
          <div class="timeline-meal">${t.meal}</div>
          <div class="timeline-status" style="color:${t.status === 'done' ? 'var(--success)' : t.status === 'current' ? 'var(--orange)' : 'var(--text3)'}">${t.label}</div>
        </div>`).join('')}
    </div>

    <div class="quick-actions">
      <div class="qa-btn" onclick="showScreen('meals')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10H12V2z"/><path d="M12 2a10 10 0 0 1 10 10"/></svg>
        <span>Log Meal</span>
      </div>
      <div class="qa-btn" onclick="showScreen('workout')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 4v6a6 6 0 0 0 12 0V4"/><path d="M6 20h12"/><path d="M12 10v10"/></svg>
        <span>Log Workout</span>
      </div>
      <div class="qa-btn" onclick="showScreen('chat')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <span>Chat Trainer</span>
      </div>
    </div>`;
}

function toggleSupp(key) {
  STATE.supplements[key] = !STATE.supplements[key];
  renderDashboard();
}

// ── Render: Workout ──────────────────────────────────────────────────────────
let workoutState = { activeEx: 0, sets: {}, elapsed: 0, elapsedInterval: null };

function renderWorkout() {
  const day = PLAN.MON;
  const el = $('screen-workout');
  const ex = day.exercises[workoutState.activeEx];
  const setsLogged = workoutState.sets[workoutState.activeEx] || [];

  el.innerHTML = `
    <div class="workout-day-header">
      <div class="workout-day-title">Monday — ${day.name}</div>
      <div class="workout-day-meta">${day.type} · ${day.exercises.length} exercises · ${workoutState.elapsed > 0 ? formatElapsed(workoutState.elapsed) + ' elapsed' : 'Not started'}</div>
    </div>

    <div class="active-exercise-card">
      <div class="aex-name">${ex.name}</div>
      <div class="aex-meta">Set ${setsLogged.length + 1} of ${ex.sets} · ${ex.reps} reps · ${ex.rest} rest</div>
      <div class="aex-prev">📊 Previous: ${workoutState.activeEx === 0 ? '40kg × 10 (baseline)' : '— First time'}</div>
      <div class="set-inputs">
        <div class="input-group">
          <label>Weight (kg)</label>
          <input type="number" id="inp-weight" value="${workoutState.activeEx === 0 ? '40' : '0'}" min="0" step="2.5">
        </div>
        <div class="input-group">
          <label>Reps</label>
          <input type="number" id="inp-reps" value="${ex.reps}" min="1">
        </div>
        <div class="input-group">
          <label>RIR</label>
          <input type="number" id="inp-rir" value="2" min="0" max="5">
        </div>
      </div>
      <div class="set-track">
        ${Array.from({length: ex.sets}, (_,i) => `<div class="set-pip ${i < setsLogged.length ? 'done' : i === setsLogged.length ? 'active' : ''}"></div>`).join('')}
      </div>
      <button class="btn btn-primary btn-full" onclick="logSet()">✓ Log Set</button>
    </div>

    <div id="rest-timer-container" style="display:${STATE.restTimer.active ? 'block' : 'none'}">
      <div class="rest-timer-card">
        <div class="timer-ring-wrap">
          <svg><circle class="timer-ring-bg" cx="35" cy="35" r="30"/><circle class="timer-ring-fg" id="timer-ring" cx="35" cy="35" r="30" stroke-dasharray="${2*Math.PI*30}" stroke-dashoffset="${getTimerOffset()}"/></svg>
          <div class="timer-text" id="timer-display">${formatTimer(STATE.restTimer.remaining)}</div>
        </div>
        <div class="timer-info">
          <div class="timer-label">Rest Timer</div>
          <div class="timer-sublabel">${ex.rest} recommended · <span style="color:var(--orange);cursor:pointer" onclick="skipTimer()">Skip →</span></div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Exercise List</div>
      ${day.exercises.map((e, i) => `
        <div class="exercise-list-item" onclick="selectExercise(${i})" style="cursor:pointer">
          <div class="ex-num ${i === workoutState.activeEx ? 'active-num' : ''}">${i+1}</div>
          <div class="ex-info">
            <div class="ex-name">${e.name}</div>
            <div class="ex-sets">${e.sets}×${e.reps} · ${e.rest} rest</div>
          </div>
          <div class="ex-status">
            ${(workoutState.sets[i]?.length || 0) >= e.sets
              ? `<span style="color:var(--success)">✓ Done</span>`
              : i === workoutState.activeEx
              ? `<span style="color:var(--orange)">${workoutState.sets[i]?.length || 0}/${e.sets}</span>`
              : `<span style="color:var(--text3)">${workoutState.sets[i]?.length || 0}/${e.sets}</span>`}
          </div>
        </div>`).join('')}
    </div>

    <div style="padding:0 16px 16px">
      <button class="btn btn-primary btn-full" onclick="alert('Workout complete! Great session 💪')">Finish Workout</button>
    </div>`;

  if (!workoutState.elapsedInterval && workoutState.elapsed >= 0) {
    workoutState.elapsedInterval = setInterval(() => {
      workoutState.elapsed++;
      const meta = document.querySelector('.workout-day-meta');
      if (meta) meta.textContent = `${day.type} · ${day.exercises.length} exercises · ${formatElapsed(workoutState.elapsed)} elapsed`;
    }, 1000);
  }
}

function formatElapsed(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${m}:${sec.toString().padStart(2,'0')}`;
}
function formatTimer(s) {
  return `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
}
function getTimerOffset() {
  const circ = 2 * Math.PI * 30;
  return circ * (1 - STATE.restTimer.remaining / STATE.restTimer.total);
}

function logSet() {
  const w = parseFloat($('inp-weight')?.value || 0);
  const r = parseInt($('inp-reps')?.value || 0);
  if (!workoutState.sets[workoutState.activeEx]) workoutState.sets[workoutState.activeEx] = [];
  workoutState.sets[workoutState.activeEx].push({ weight: w, reps: r });

  const ex = PLAN.MON.exercises[workoutState.activeEx];
  if (workoutState.sets[workoutState.activeEx].length >= ex.sets) {
    if (workoutState.activeEx < PLAN.MON.exercises.length - 1) {
      setTimeout(() => { workoutState.activeEx++; renderWorkout(); }, 500);
    }
  }
  startRestTimer(parseInt(ex.rest) || 90);
  renderWorkout();
}

function startRestTimer(seconds) {
  if (STATE.restTimer.interval) clearInterval(STATE.restTimer.interval);
  STATE.restTimer = { active: true, total: seconds, remaining: seconds, interval: null };
  STATE.restTimer.interval = setInterval(() => {
    STATE.restTimer.remaining--;
    const display = $('timer-display');
    const ring = $('timer-ring');
    if (display) display.textContent = formatTimer(STATE.restTimer.remaining);
    if (ring) ring.style.strokeDashoffset = getTimerOffset();
    if (STATE.restTimer.remaining <= 0) {
      clearInterval(STATE.restTimer.interval);
      STATE.restTimer.active = false;
      const container = $('rest-timer-container');
      if (container) container.style.display = 'none';
    }
  }, 1000);
}

function skipTimer() {
  if (STATE.restTimer.interval) clearInterval(STATE.restTimer.interval);
  STATE.restTimer.active = false;
  renderWorkout();
}

function selectExercise(i) {
  workoutState.activeEx = i;
  renderWorkout();
}

// ── Render: Meals ────────────────────────────────────────────────────────────
function renderMeals() {
  const el = $('screen-meals');
  const { calories, macros } = STATE;
  const remaining = calories.target - calories.eaten;

  const meals = [
    { time: '8 AM', name: 'Breakfast', kcal: 480, logged: true, foods: [
      { name: '4 egg whites + 2 whole eggs', kcal: 240, macro: '30g P' },
      { name: 'Whey protein shake (water)', kcal: 120, macro: '25g P' },
      { name: '2 rotis', kcal: 120, macro: '6g C' },
    ]},
    { time: '1 PM', name: 'Lunch', kcal: 520, logged: true, foods: [
      { name: 'Dal (1 cup)', kcal: 180, macro: '12g P' },
      { name: 'Chicken breast 150g', kcal: 250, macro: '35g P' },
      { name: 'Rice ½ cup', kcal: 90, macro: '20g C' },
    ]},
    { time: '5 PM', name: 'Pre-workout Snack', kcal: null, logged: false, foods: [] },
    { time: '9 PM', name: 'Dinner', kcal: null, logged: false, foods: [] },
  ];

  el.innerHTML = `
    <div class="screen-header">
      <div class="screen-title">Meal Tracker</div>
      <div class="screen-subtitle">Sunday, June 1</div>
    </div>

    <div class="macro-summary-card">
      <div class="macro-top">
        <div>
          <div class="macro-cal-big">${calories.eaten} <span style="font-size:16px;color:var(--text2)">/ ${calories.target}</span></div>
          <div class="macro-cal-label">kcal consumed</div>
        </div>
        <div class="macro-remaining">
          <div class="macro-rem-val">${remaining}</div>
          <div class="macro-rem-label">kcal remaining</div>
        </div>
      </div>
      <div class="macro-bars">
        ${[
          { name: 'Protein', eaten: macros.protein.eaten, target: macros.protein.target, color: 'var(--cyan)' },
          { name: 'Carbs', eaten: macros.carbs.eaten, target: macros.carbs.target, color: 'var(--orange)' },
          { name: 'Fats', eaten: macros.fats.eaten, target: macros.fats.target, color: 'var(--purple)' },
        ].map(m => `
          <div class="macro-bar-row">
            <div class="macro-bar-label">${m.name}</div>
            <div class="macro-bar-wrap">
              <div class="progress-bar-wrap"><div class="progress-bar-fill" style="width:${pct(m.eaten,m.target)}%;background:${m.color}"></div></div>
            </div>
            <div class="macro-bar-val">${m.eaten}g / ${m.target}g</div>
          </div>`).join('')}
      </div>
    </div>

    ${meals.map(meal => `
      <div class="meal-section">
        <div class="meal-section-header">
          <div>
            <span class="meal-section-title">${meal.name}</span>
            <span style="font-size:12px;color:var(--text3);margin-left:6px">${meal.time}</span>
          </div>
          <div style="display:flex;align-items:center;gap:6px">
            ${meal.kcal ? `<span style="font-size:12px;color:var(--text2)">${meal.kcal} kcal</span>` : ''}
            ${meal.logged ? `<span class="badge badge-green">✓ Logged</span>` : `<span class="badge badge-orange">Not logged</span>`}
          </div>
        </div>
        ${meal.logged ? `
          <div class="meal-item-card">
            ${meal.foods.map(f => `
              <div class="meal-food-item">
                <div class="meal-food-name">${f.name}</div>
                <div class="meal-food-macros">${f.kcal} kcal · ${f.macro}</div>
              </div>`).join('')}
          </div>` : `
          <button class="add-meal-btn" onclick="alert('Meal logging coming soon!')">+ Log ${meal.name}</button>`}
      </div>`).join('')}
    <div style="height:20px"></div>`;
}

// ── Render: Progress ─────────────────────────────────────────────────────────
function renderProgress() {
  const el = $('screen-progress');
  const milestones = [
    { label: 'Month 1', target: 116, loss: 4 },
    { label: 'Month 2', target: 112, loss: 8 },
    { label: 'Month 3', target: 108, loss: 12 },
    { label: 'Month 5', target: 100, loss: 20 },
    { label: 'Month 8–9', target: 90, loss: 30 },
  ];

  el.innerHTML = `
    <div class="screen-header">
      <div class="screen-title">Progress</div>
      <div class="screen-subtitle">Week 1 · Started at 120 kg</div>
    </div>

    <div class="weight-card">
      <div class="weight-header">
        <div>
          <div class="weight-title">Weight Loss Journey</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">Goal: 90 kg · −30 kg total</div>
        </div>
        <div class="weight-current">
          <div class="weight-val">${STATE.weight} kg</div>
          <div class="weight-sub">current</div>
        </div>
      </div>
      <div class="chart-area">
        <svg class="chart-svg" viewBox="0 0 340 150" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#FF6B2B" stop-opacity="0.3"/>
              <stop offset="100%" stop-color="#FF6B2B" stop-opacity="0"/>
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="0" y1="30" x2="340" y2="30" stroke="#2A2A2A" stroke-width="1"/>
          <line x1="0" y1="75" x2="340" y2="75" stroke="#2A2A2A" stroke-width="1"/>
          <line x1="0" y1="120" x2="340" y2="120" stroke="#2A2A2A" stroke-width="1"/>
          <text x="2" y="28" fill="#606060" font-size="9">120</text>
          <text x="2" y="73" fill="#606060" font-size="9">105</text>
          <text x="2" y="118" fill="#606060" font-size="9">90</text>
          <!-- Projected path (dashed) -->
          <path d="M20,30 L80,48 L140,64 L200,82 L280,110 L320,120" stroke="#FF6B2B" stroke-width="1.5" stroke-dasharray="5,4" fill="none" opacity="0.5"/>
          <!-- Actual (solid dot at start) -->
          <circle cx="20" cy="30" r="5" fill="#FF6B2B"/>
          <!-- Milestone diamonds -->
          <polygon points="80,48 85,53 80,58 75,53" fill="none" stroke="#22D3EE" stroke-width="1.5"/>
          <polygon points="140,64 145,69 140,74 135,69" fill="none" stroke="#22D3EE" stroke-width="1.5"/>
          <polygon points="200,82 205,87 200,92 195,87" fill="none" stroke="#22D3EE" stroke-width="1.5"/>
          <polygon points="280,110 285,115 280,120 275,115" fill="none" stroke="#22D3EE" stroke-width="1.5"/>
        </svg>
      </div>
      <div class="chart-labels" style="padding:0 4px">
        <span>Now</span><span>M1</span><span>M2</span><span>M3</span><span>M5</span><span>M9</span>
      </div>
    </div>

    <div class="card">
      <div class="card-title">Milestones</div>
      <div class="milestones">
        ${milestones.map(m => {
          const reached = STATE.weight <= m.target;
          return `<div class="milestone-item">
            <div class="milestone-dot ${reached ? 'reached' : ''}"></div>
            <div class="milestone-info">
              <div class="milestone-name">${m.label} — ${m.target} kg</div>
              <div class="milestone-sub">−${m.loss} kg from start</div>
            </div>
            <div class="milestone-prog">${reached ? '✓' : '🔒'}</div>
          </div>`;
        }).join('')}
      </div>
    </div>

    <div class="card">
      <div class="card-title">Strength PRs</div>
      ${[
        { name: 'Bench Press', val: STATE.prs.bench, sub: 'Week 1 baseline' },
        { name: 'Deadlift', val: STATE.prs.deadlift, sub: 'Friday — not started yet' },
        { name: 'Lat Pulldown', val: STATE.prs.latPulldown, sub: 'Tuesday — not started yet' },
      ].map(pr => `
        <div class="pr-item">
          <div>
            <div class="pr-name">${pr.name}</div>
            <div class="pr-sub">${pr.sub}</div>
          </div>
          <div class="pr-val">${pr.val ? pr.val + ' kg' : '—'}</div>
        </div>`).join('')}
    </div>

    <div style="padding:0 16px 20px">
      <button class="btn btn-primary btn-full" onclick="logWeight()">+ Log Today's Weight</button>
    </div>`;
}

function logWeight() {
  const input = prompt('Enter your current weight (kg):');
  if (input && !isNaN(parseFloat(input))) {
    STATE.weight = parseFloat(input);
    STATE.weightLog.push({ date: new Date().toISOString().split('T')[0], kg: STATE.weight });
    renderProgress();
  }
}

// ── Render: Chat ─────────────────────────────────────────────────────────────
const SYSTEM_PROMPT = `You are Rishit's personal AI fitness trainer. He is 22-24 years old, 120 kg, 6ft, based in Hyderabad. His goal is aggressive fat loss + muscle building. He trains 6 days/week at 7 PM. Daily targets: 2050 kcal, 180g protein, 190g carbs, 64g fat. He takes whey protein (2 scoops/day) and creatine (5g/day). His workout split: Mon Chest+Triceps, Tue Back+Biceps, Wed Legs+Core, Thu Shoulders+Traps, Fri Back+Arms, Sat Legs+HIIT, Sun Rest. Weight milestones: 116kg month 1, 112kg month 2, 108kg month 3, 100kg month 5, 90kg month 8-9. Speak casually, directly, slightly Hinglish-friendly. Keep responses short and punchy. Never be preachy. Reference his specific plan when relevant.`;

function renderChat() {
  const el = $('screen-chat');
  el.innerHTML = `
    <div class="chat-header">
      <div class="coach-avatar">🏋️</div>
      <div>
        <div class="coach-name">Coach AI</div>
        <div class="coach-status"><div class="coach-status-dot"></div>Online</div>
      </div>
    </div>
    <div class="chat-messages" id="chat-messages">
      ${STATE.chatMessages.map(m => renderMessage(m)).join('')}
    </div>
    <div class="chat-input-area">
      <textarea class="chat-input" id="chat-input" placeholder="Ask your trainer..." rows="1" onkeydown="handleChatKey(event)" oninput="autoResize(this)"></textarea>
      <button class="chat-send-btn" onclick="sendMessage()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>`;
  scrollChatToBottom();
}

function renderMessage(m) {
  return `<div class="msg msg-${m.role}">
    <div class="msg-bubble">${m.text.replace(/\n/g, '<br>')}</div>
    <div class="msg-time">${m.time}</div>
  </div>`;
}

function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 100) + 'px';
}

function handleChatKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function scrollChatToBottom() {
  setTimeout(() => {
    const msgs = $('chat-messages');
    if (msgs) msgs.scrollTop = msgs.scrollHeight;
  }, 50);
}

async function sendMessage() {
  const input = $('chat-input');
  const text = input?.value.trim();
  if (!text) return;

  const now = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  STATE.chatMessages.push({ role: 'user', text, time: now });
  input.value = '';
  input.style.height = 'auto';

  const msgs = $('chat-messages');
  if (msgs) {
    msgs.insertAdjacentHTML('beforeend', renderMessage({ role: 'user', text, time: now }));
    // Typing indicator
    msgs.insertAdjacentHTML('beforeend', `<div class="msg msg-coach" id="typing-msg">
      <div class="msg-bubble"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>
    </div>`);
    scrollChatToBottom();
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': window.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: STATE.chatMessages
          .filter(m => m.role !== 'coach' || STATE.chatMessages.indexOf(m) > 0)
          .map(m => ({ role: m.role === 'coach' ? 'assistant' : 'user', content: m.text }))
          .slice(-10),
      }),
    });

    const data = await response.json();
    const replyText = data.content?.[0]?.text || "Sorry yaar, something went wrong. Try again.";
    const replyTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    $('typing-msg')?.remove();
    STATE.chatMessages.push({ role: 'coach', text: replyText, time: replyTime });
    if (msgs) {
      msgs.insertAdjacentHTML('beforeend', renderMessage({ role: 'coach', text: replyText, time: replyTime }));
      scrollChatToBottom();
    }
  } catch (err) {
    $('typing-msg')?.remove();
    const errTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const errMsg = { role: 'coach', text: "Couldn't connect bhai. Add your Anthropic API key in the settings to enable live AI chat.", time: errTime };
    STATE.chatMessages.push(errMsg);
    if (msgs) { msgs.insertAdjacentHTML('beforeend', renderMessage(errMsg)); scrollChatToBottom(); }
  }
}

// ── Render: Plan ─────────────────────────────────────────────────────────────
function renderPlan() {
  const el = $('screen-plan');
  const dayKeys = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const dayLabels = { MON:'Mon',TUE:'Tue',WED:'Wed',THU:'Thu',FRI:'Fri',SAT:'Sat',SUN:'Sun' };
  const dayShort = { MON:'Chest',TUE:'Back',WED:'Legs',THU:'Shldrs',FRI:'Arms',SAT:'HIIT',SUN:'Rest' };

  const tabs = { workout: renderPlanWorkout, nutrition: renderPlanNutrition, supplements: renderPlanSupplements };

  el.innerHTML = `
    <div class="screen-header">
      <div class="screen-title">My Plan</div>
      <div class="screen-subtitle">6 days/week · 2050 kcal/day · 180g protein</div>
    </div>
    <div class="plan-tabs">
      ${['workout','nutrition','supplements'].map(t => `
        <div class="plan-tab ${STATE.activePlanTab === t ? 'active' : ''}" onclick="switchPlanTab('${t}')">${t.charAt(0).toUpperCase()+t.slice(1)}</div>`).join('')}
    </div>
    <div id="plan-content"></div>`;

  renderPlanContent();
}

function switchPlanTab(tab) {
  STATE.activePlanTab = tab;
  document.querySelectorAll('.plan-tab').forEach(t => t.classList.toggle('active', t.textContent.toLowerCase() === tab));
  renderPlanContent();
}

function renderPlanContent() {
  const content = $('plan-content');
  if (!content) return;
  if (STATE.activePlanTab === 'workout') content.innerHTML = renderPlanWorkout();
  else if (STATE.activePlanTab === 'nutrition') content.innerHTML = renderPlanNutrition();
  else content.innerHTML = renderPlanSupplements();
}

function renderPlanWorkout() {
  const dayKeys = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const dayShort = { MON:'Chest',TUE:'Back',WED:'Legs',THU:'Shldrs',FRI:'Arms',SAT:'HIIT',SUN:'Rest' };
  const day = PLAN[STATE.activeDay] || PLAN.MON;

  return `
    <div class="day-pills">
      ${dayKeys.map(k => `
        <div class="day-pill ${STATE.activeDay === k ? 'active-day' : ''} ${k === 'SUN' ? 'rest-day' : ''}" onclick="selectDay('${k}')">
          <div class="day-pill-name">${k}</div>
          <div class="day-pill-focus">${dayShort[k]}</div>
        </div>`).join('')}
    </div>

    <div class="card">
      <div class="card-title">Session Structure</div>
      ${[
        'Warm-up — 5 min treadmill + dynamic stretches',
        'Lifting — 50–60 mins',
        'Cardio finisher — 10 min treadmill (6–7 km/h) + 10 min cycle',
        'Saturday: HIIT instead of steady cardio',
      ].map((s,i) => `<div class="session-structure-item"><div class="ss-num">${i+1}</div><div class="ss-text">${s}</div></div>`).join('')}
    </div>

    <div class="card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px">
        <div>
          <div style="font-family:var(--font-head);font-size:15px;font-weight:700">${day.name}</div>
          <div style="font-size:12px;color:var(--text2);margin-top:2px">${day.type}</div>
        </div>
        ${STATE.activeDay !== 'SUN' ? `<span class="badge badge-orange">${day.exercises.length} exercises</span>` : ''}
      </div>
      ${STATE.activeDay === 'SUN'
        ? `<div style="text-align:center;padding:20px;color:var(--text2)">🛌 Full rest day — sleep, walk, recover</div>`
        : day.exercises.map(e => `
          <div class="plan-exercise-item">
            <div>
              <div class="plan-ex-name">${e.name}</div>
              <div class="plan-ex-detail">${e.sets} sets × ${e.reps} reps</div>
            </div>
            <div class="plan-ex-rest">${e.rest} rest</div>
          </div>`).join('')}
    </div>`;
}

function selectDay(day) {
  STATE.activeDay = day;
  renderPlanContent();
}

function renderPlanNutrition() {
  return `
    <div style="padding:0 16px">
      <div class="card" style="margin:0 0 12px">
        <div class="card-title">Daily Targets</div>
        ${[
          { label: 'Calories', val: '2050 kcal', color: 'var(--orange)' },
          { label: 'Protein', val: '180g', color: 'var(--cyan)' },
          { label: 'Carbs', val: '190g', color: 'var(--orange)' },
          { label: 'Fats', val: '64g', color: 'var(--purple)' },
        ].map(t => `
          <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border)">
            <span style="font-size:13px">${t.label}</span>
            <span style="font-family:var(--font-head);font-size:14px;font-weight:700;color:${t.color}">${t.val}</span>
          </div>`).join('')}
      </div>
    </div>

    <div class="card" style="margin:0 16px 12px">
      <div class="card-title">Meal Schedule</div>
      ${[
        { time: '8 AM', meal: 'Breakfast + 1 scoop whey (water)' },
        { time: '1 PM', meal: 'Lunch — high protein, cooked meal' },
        { time: '5 PM', meal: 'Pre-workout snack — light, carb focus' },
        { time: '7 PM', meal: 'Gym session 🏋️' },
        { time: '8:30 PM', meal: 'Post-workout shake + 5g creatine' },
        { time: '9 PM', meal: 'Dinner — max 2 rotis, no rice' },
        { time: '11 PM', meal: 'Optional snack if hungry' },
      ].map(t => `
        <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border)">
          <span style="font-size:12px;color:var(--orange);width:52px;flex-shrink:0;font-weight:600">${t.time}</span>
          <span style="font-size:13px">${t.meal}</span>
        </div>`).join('')}
    </div>

    <div class="card" style="margin:0 16px 20px">
      <div class="card-title">Rules</div>
      ${[
        { icon: '🚫', rule: 'No rice at night — max 2 rotis at dinner' },
        { icon: '🫒', rule: 'Cook uses max 1 tsp oil per dish' },
        { icon: '🥦', rule: 'Unlimited green vegetables and dal' },
        { icon: '💧', rule: 'Whey always in water, not milk (saves ~100 kcal)' },
        { icon: '👟', rule: '10,000 steps daily outside of gym' },
        { icon: '📉', rule: 'Hungry? Reduce rotis/rice — never reduce protein' },
      ].map(r => `
        <div class="nutrition-rule-item">
          <div class="nutrition-rule-icon">${r.icon}</div>
          <div>${r.rule}</div>
        </div>`).join('')}
    </div>`;
}

function renderPlanSupplements() {
  return `
    <div class="card" style="margin:0 16px 20px">
      <div class="card-title">Supplement Protocol</div>
      ${[
        { icon: '🥛', name: 'Whey Protein', detail: '1 scoop at 8 AM + 1 scoop post-workout', dose: '50g protein/day' },
        { icon: '⚡', name: 'Creatine Monohydrate', detail: 'Mixed into post-workout shake — every single day', dose: '5g/day' },
      ].map(s => `
        <div class="supp-item">
          <div class="supp-icon">${s.icon}</div>
          <div class="supp-info">
            <div class="supp-name">${s.name}</div>
            <div class="supp-detail">${s.detail}</div>
          </div>
          <div class="supp-dose">${s.dose}</div>
        </div>`).join('')}
      <div style="margin-top:14px;padding:12px;background:var(--bg2);border-radius:var(--r-sm);font-size:12px;color:var(--text2);line-height:1.6">
        💡 <strong style="color:var(--text)">Creatine tip:</strong> Take it every day — rest days too. Timing doesn't matter much; consistency is what matters. Mixed into post-workout shake is fine.
      </div>
    </div>`;
}

// ── Render: Settings ─────────────────────────────────────────────────────────
function renderSettings() {
  const el = $('screen-settings');
  const hasKey = !!window.ANTHROPIC_API_KEY;

  el.innerHTML = `
    <div class="screen-header">
      <div class="screen-title">Settings</div>
      <div class="screen-subtitle">Configure your trainer app</div>
    </div>

    <div class="settings-section">
      <div class="settings-label">AI Coach</div>
      <div class="settings-card">
        <div class="settings-row">
          <div class="settings-row-icon" style="background:var(--orange-dim)">🤖</div>
          <div class="settings-row-info">
            <div class="settings-row-title">Anthropic API Key</div>
            <div class="settings-row-sub">Powers the live AI chat with Claude</div>
          </div>
          <div class="key-status ${hasKey ? 'set' : 'unset'}">
            ${hasKey ? '✓ Set' : '! Missing'}
          </div>
        </div>
        <div style="padding:14px;border-top:1px solid var(--border)">
          <div style="font-size:12px;color:var(--text2);margin-bottom:8px">Paste your key below — stored only on this device (localStorage)</div>
          <div class="api-key-input-wrap">
            <input class="api-key-input" type="password" id="api-key-field"
              placeholder="sk-ant-api03-..."
              value="${window.ANTHROPIC_API_KEY || ''}">
            <button class="api-key-toggle" onclick="toggleKeyVisibility()" id="key-toggle-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="eye-icon"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
          </div>
          <button class="settings-save-btn" onclick="saveApiKey()">Save & Activate</button>
        </div>
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-label">Your Profile</div>
      <div class="settings-card">
        ${[
          { icon: '👤', title: 'Rishit', sub: '22–24 · Hyderabad, India' },
          { icon: '⚖️', title: 'Starting Weight', sub: '120 kg → Goal: 90 kg' },
          { icon: '📅', title: 'Training Days', sub: '6 days/week · 7 PM sessions' },
          { icon: '🎯', title: 'Daily Targets', sub: '2050 kcal · 180g protein · 190g carbs · 64g fat' },
        ].map(r => `
          <div class="settings-row">
            <div class="settings-row-icon" style="background:var(--bg2)">${r.icon}</div>
            <div class="settings-row-info">
              <div class="settings-row-title">${r.title}</div>
              <div class="settings-row-sub">${r.sub}</div>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="settings-section">
      <div class="settings-label">App</div>
      <div class="settings-card">
        <div class="settings-row" style="cursor:pointer" onclick="if(confirm('Reset all logged data?')){localStorage.clear();window.ANTHROPIC_API_KEY='';renderSettings();}">
          <div class="settings-row-icon" style="background:rgba(239,68,68,0.15)">🗑️</div>
          <div class="settings-row-info">
            <div class="settings-row-title" style="color:#ef4444">Reset App Data</div>
            <div class="settings-row-sub">Clears all local data including API key</div>
          </div>
        </div>
      </div>
    </div>

    <div style="padding:0 16px 20px;text-align:center;font-size:11px;color:var(--text3)">
      FitTracker · Built for Rishit · Powered by Claude
    </div>

    <div class="settings-toast" id="settings-toast">✓ API key saved — chat is ready!</div>`;
}

function toggleKeyVisibility() {
  const field = $('api-key-field');
  if (!field) return;
  field.type = field.type === 'password' ? 'text' : 'password';
}

function saveApiKey() {
  const field = $('api-key-field');
  const key = field?.value.trim();
  if (!key) return;
  localStorage.setItem('anthropic_key', key);
  window.ANTHROPIC_API_KEY = key;
  // Show toast
  const toast = $('settings-toast');
  if (toast) {
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
  }
  // Re-render to update status badge
  setTimeout(renderSettings, 300);
}

// ── Init ─────────────────────────────────────────────────────────────────────
const renders = {
  dashboard: renderDashboard,
  workout: renderWorkout,
  meals: renderMeals,
  progress: renderProgress,
  chat: renderChat,
  plan: renderPlan,
  settings: renderSettings,
};

document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', () => showScreen(btn.dataset.screen));
});

// API key input (optional)
window.ANTHROPIC_API_KEY = localStorage.getItem('anthropic_key') || '';

showScreen('dashboard');
