import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'fitness-log:v2';

const DEFAULT_LIBRARY = [
  { id: 'lib-1', name: '杠铃卧推', target: '4 × 8', group: '胸', rest: 90 },
  { id: 'lib-2', name: '坐姿推举', target: '4 × 10', group: '肩', rest: 90 },
  { id: 'lib-3', name: '上斜哑铃', target: '3 × 12', group: '胸', rest: 75 },
  { id: 'lib-4', name: '侧平举', target: '3 × 15', group: '肩', rest: 60 },
  { id: 'lib-5', name: '三头下压', target: '3 × 12', group: '三头', rest: 60 },
];

const DEFAULT_STATE = {
  library: DEFAULT_LIBRARY,
  // history: { [yyyy-mm-dd]: [ { exerciseId, name, sets: [{weight, reps}], durationSec } ] }
  history: {},
  // profile: { name, level, goal, weeklyTarget }
  profile: { name: '刘 恺', level: 12, goal: '增肌', weeklyTarget: 4 },
  // goals: [ { id, label, target, unit, current } ]
  goals: [
    { id: 'g-bench', label: '卧推', target: 100, unit: 'kg', current: 85 },
    { id: 'g-squat', label: '深蹲', target: 140, unit: 'kg', current: 87 },
  ],
};

let memCache = null;

export async function loadState() {
  if (memCache) return memCache;
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      memCache = { ...DEFAULT_STATE, ...parsed };
    } else {
      memCache = { ...DEFAULT_STATE };
    }
  } catch (e) {
    memCache = { ...DEFAULT_STATE };
  }
  return memCache;
}

export async function saveState(next) {
  memCache = next;
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  } catch (e) {
    // swallow — local app
  }
}

export async function update(mutator) {
  const cur = await loadState();
  const next = mutator({ ...cur });
  await saveState(next);
  return next;
}

export function todayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

export function dateLabel(d = new Date()) {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${m}.${dd}`;
}

export function weekOfYear(d = new Date()) {
  const target = new Date(d.valueOf());
  const dayNr = (d.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = new Date(target.getFullYear(), 0, 4);
  const diff = target - firstThursday;
  return 1 + Math.round(diff / 604800000);
}

const WEEKDAYS_CN = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
export function weekdayCN(d = new Date()) {
  return WEEKDAYS_CN[d.getDay()];
}

export function monthCN(d = new Date()) {
  const M = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'];
  return `${M[d.getMonth()]}月`;
}

// Aggregate helpers ---------------------------------------------------------

export function dayStats(state, dateKey) {
  const entries = state.history[dateKey] || [];
  let sets = 0;
  let reps = 0;
  let kg = 0;
  let durationSec = 0;
  entries.forEach((e) => {
    sets += (e.sets || []).length;
    (e.sets || []).forEach((s) => {
      reps += Number(s.reps) || 0;
      kg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
    });
    durationSec += Number(e.durationSec) || 0;
  });
  return {
    items: entries.length,
    sets,
    reps,
    kg,
    durationSec,
    minutes: Math.round(durationSec / 60),
  };
}

export function weekStats(state, ref = new Date()) {
  const start = new Date(ref);
  const monday = (start.getDay() + 6) % 7;
  start.setDate(start.getDate() - monday);
  start.setHours(0, 0, 0, 0);
  let sets = 0;
  let reps = 0;
  let kg = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const s = dayStats(state, todayKey(d));
    sets += s.sets;
    reps += s.reps;
    kg += s.kg;
  }
  return { sets, reps, kg, tons: +(kg / 1000).toFixed(1) };
}

export function streakDays(state, ref = new Date()) {
  let count = 0;
  let d = new Date(ref);
  while (true) {
    const key = todayKey(d);
    if ((state.history[key] || []).length === 0) break;
    count++;
    d.setDate(d.getDate() - 1);
    if (count > 365) break;
  }
  return count;
}

export function totals(state) {
  let totalSessions = 0;
  let totalSec = 0;
  let totalKg = 0;
  let prs = 0;
  Object.values(state.history).forEach((day) => {
    totalSessions += day.length > 0 ? 1 : 0;
    day.forEach((e) => {
      totalSec += Number(e.durationSec) || 0;
      (e.sets || []).forEach((s) => {
        totalKg += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        if (s.isPR) prs++;
      });
    });
  });
  return {
    sessions: totalSessions,
    hours: Math.round(totalSec / 3600),
    kg: totalKg,
    prs,
  };
}
