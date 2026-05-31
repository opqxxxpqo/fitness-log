// Mock data for the demo — mirrors the shape of state in src/storage.js
export const library = [
  { id: 'l1', name: '杠铃卧推', target: '4 × 8', group: '胸', rest: 90, pr: 85 },
  { id: 'l2', name: '坐姿推举', target: '4 × 10', group: '肩', rest: 90, pr: 45 },
  { id: 'l3', name: '上斜哑铃', target: '3 × 12', group: '胸', rest: 75, pr: 22 },
  { id: 'l4', name: '侧平举', target: '3 × 15', group: '肩', rest: 60, pr: 12 },
  { id: 'l5', name: '三头下压', target: '3 × 12', group: '三头', rest: 60, pr: 35 },
];

export const todayDoneIds = []; // none completed yet

export const recent = [
  { dow: '周六', day: 17, group: '拉', minutes: 52, tons: 5.4 },
  { dow: '周四', day: 15, group: '腿', minutes: 61, tons: 7.1 },
  { dow: '周二', day: 13, group: '推', minutes: 48, tons: 4.8 },
  { dow: '周日', day: 11, group: '拉', minutes: 55, tons: 5.9 },
];

export const weeklyVolume = [
  { label: 'W15', value: 18 },
  { label: 'W16', value: 22 },
  { label: 'W17', value: 19 },
  { label: 'W18', value: 24 },
  { label: 'W19', value: 26 },
  { label: 'W20', value: 23 },
  { label: 'W21', value: 28.5 },
];

export const calendar = {
  year: 2026,
  month: 4, // May (0-indexed)
  weeks: buildCalendarMock(),
};

function buildCalendarMock() {
  // 5 rows ~ May 2026. intensity in 0..3
  // randomized but deterministic
  const pattern = [
    [0, 1, 0, 2, 0, 3, 0],
    [1, 2, 0, 3, 0, 2, 1],
    [0, 2, 0, 3, 0, 0, 2],
    [1, 3, 0, 2, 0, 2, 0],
    [0, 2, 0, 0, 0, 0, 0],
  ];
  let day = 1;
  return pattern.map((row, ri) => ({
    weekNum: 18 + ri,
    days: row.map((intensity) => {
      const cell = day <= 31 ? { day, intensity, isToday: day === 18 } : null;
      day++;
      return cell;
    }),
  }));
}

export const profile = {
  name: '刘 恺',
  level: 12,
  goal: '增肌',
  joinedDays: 162,
  totals: {
    sessions: 142,
    hours: 384,
    kg: 1.42e6,
    prs: 8,
  },
  goals: [
    { id: 'g1', label: '卧推 · 100kg', pct: 85 },
    { id: 'g2', label: '深蹲 · 140kg', pct: 62 },
    { id: 'g3', label: '每周 4 练', pct: 75 },
  ],
};

export const workoutSession = {
  exerciseIndex: 0,
  totalExercises: 5,
  setIndex: 2, // working on set 3 of 5
  totalSets: 5,
  elapsed: '00:24:11',
  rest: { preset: 90, remaining: 90, active: false },
  completed: [
    { weight: 80, reps: 8, isPR: false },
    { weight: 80, reps: 8, isPR: false },
  ],
};
