const STORAGE_KEY = "pixel-gym-data";
const weekdays = ["一", "二", "三", "四", "五", "六", "日"];

const defaultState = {
  workouts: [
    {
      id: crypto.randomUUID(),
      name: "哑铃卧推",
      category: "胸",
      defaultSets: 4,
      defaultReps: 12,
      defaultWeight: 20,
      image: ""
    },
    {
      id: crypto.randomUUID(),
      name: "深蹲",
      category: "腿",
      defaultSets: 5,
      defaultReps: 8,
      defaultWeight: 40,
      image: ""
    }
  ],
  checkins: [],
  sessionHistory: [],
  activeSession: {
    startedAt: null,
    activeWorkoutId: null,
    entries: []
  }
};

const state = loadState();
let calendarCursor = new Date();
let sessionTimerInterval = null;
let restTimerInterval = null;

const screenIds = ["screen-home", "screen-workouts", "screen-session"];
const screenMap = Object.fromEntries(screenIds.map((id) => [id, document.getElementById(id)]));

const els = {
  weeklyProgress: document.getElementById("weeklyProgress"),
  heroSummary: document.getElementById("heroSummary"),
  recentWorkout: document.getElementById("recentWorkout"),
  calendarTitle: document.getElementById("calendarTitle"),
  calendarWeekdays: document.getElementById("calendarWeekdays"),
  calendarGrid: document.getElementById("calendarGrid"),
  todayCheckinBtn: document.getElementById("todayCheckinBtn"),
  startWorkoutBtn: document.getElementById("startWorkoutBtn"),
  prevMonthBtn: document.getElementById("prevMonthBtn"),
  nextMonthBtn: document.getElementById("nextMonthBtn"),
  workoutList: document.getElementById("workoutList"),
  workoutForm: document.getElementById("workoutForm"),
  toggleWorkoutFormBtn: document.getElementById("toggleWorkoutFormBtn"),
  cancelWorkoutFormBtn: document.getElementById("cancelWorkoutFormBtn"),
  sessionTimer: document.getElementById("sessionTimer"),
  finishSessionBtn: document.getElementById("finishSessionBtn"),
  sessionWorkoutPicker: document.getElementById("sessionWorkoutPicker"),
  activeWorkoutName: document.getElementById("activeWorkoutName"),
  setEntryForm: document.getElementById("setEntryForm"),
  setHistory: document.getElementById("setHistory"),
  startRestBtn: document.getElementById("startRestBtn"),
  skipRestBtn: document.getElementById("skipRestBtn"),
  restSeconds: document.getElementById("restSeconds"),
  restTimerCard: document.getElementById("restTimerCard"),
  sessionDateLabel: document.getElementById("sessionDateLabel")
};

document.querySelectorAll(".nav-btn").forEach((button) => {
  button.addEventListener("click", () => {
    switchScreen(button.dataset.screen);
  });
});

els.todayCheckinBtn.addEventListener("click", addTodayCheckin);
els.startWorkoutBtn.addEventListener("click", beginSession);
els.prevMonthBtn.addEventListener("click", () => changeCalendarMonth(-1));
els.nextMonthBtn.addEventListener("click", () => changeCalendarMonth(1));
els.toggleWorkoutFormBtn.addEventListener("click", () => els.workoutForm.classList.toggle("hidden"));
els.cancelWorkoutFormBtn.addEventListener("click", () => els.workoutForm.classList.add("hidden"));
els.workoutForm.addEventListener("submit", handleWorkoutCreate);
els.finishSessionBtn.addEventListener("click", finishSession);
els.setEntryForm.addEventListener("submit", saveSetEntry);
els.startRestBtn.addEventListener("click", startRestTimer);
els.skipRestBtn.addEventListener("click", stopRestTimer);

render();
resumeSessionTimer();

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(raw) };
  } catch {
    return structuredClone(defaultState);
  }
}

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function render() {
  renderHome();
  renderCalendar();
  renderWorkouts();
  renderSession();
}

function renderHome() {
  const weekCount = countCurrentWeekCheckins();
  els.weeklyProgress.textContent = `${weekCount} / 7`;
  const lastHistory = state.sessionHistory.at(-1);
  els.heroSummary.textContent = lastHistory
    ? `${formatDate(lastHistory.date)} 完成 ${lastHistory.entries.length} 条记录`
    : "今天还没有训练记录";
  els.recentWorkout.textContent = lastHistory
    ? lastHistory.entries
        .slice(-3)
        .map((entry) => `${entry.workoutName} 第${entry.setNumber}组 ${entry.reps}次 ${entry.weight}kg`)
        .join(" / ")
    : "还没有训练内容，先去创建一个项目吧。";
}

function renderCalendar() {
  els.calendarWeekdays.innerHTML = "";
  weekdays.forEach((day) => {
    const node = document.createElement("div");
    node.className = "weekday";
    node.textContent = day;
    els.calendarWeekdays.appendChild(node);
  });

  const year = calendarCursor.getFullYear();
  const month = calendarCursor.getMonth();
  els.calendarTitle.textContent = `${year}年 ${month + 1}月`;

  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDay = (first.getDay() + 6) % 7;
  const totalCells = Math.ceil((firstDay + last.getDate()) / 7) * 7;
  const today = new Date();

  els.calendarGrid.innerHTML = "";
  for (let index = 0; index < totalCells; index += 1) {
    const dayNumber = index - firstDay + 1;
    const cell = document.createElement("div");
    cell.className = "calendar-day";

    if (dayNumber > 0 && dayNumber <= last.getDate()) {
      const cellDate = new Date(year, month, dayNumber);
      const dateKey = toDateKey(cellDate);
      cell.textContent = String(dayNumber);

      if (state.checkins.includes(dateKey)) {
        cell.classList.add("checked");
      }
      if (toDateKey(today) === dateKey) {
        cell.classList.add("today");
      }
    }

    els.calendarGrid.appendChild(cell);
  }
}

function renderWorkouts() {
  els.workoutList.innerHTML = "";
  const template = document.getElementById("workoutCardTemplate");

  state.workouts.forEach((workout) => {
    const fragment = template.content.cloneNode(true);
    const card = fragment.querySelector(".workout-card");
    const thumb = fragment.querySelector(".workout-thumb");
    const title = fragment.querySelector(".workout-title");
    const meta = fragment.querySelector(".workout-meta");
    const deleteBtn = fragment.querySelector(".workout-delete-btn");

    title.textContent = workout.name;
    meta.textContent = `${workout.category || "未分类"} | ${workout.defaultSets}组 x ${workout.defaultReps}次 | ${workout.defaultWeight}kg`;
    if (workout.image) {
      thumb.style.backgroundImage = `url(${workout.image})`;
    }

    deleteBtn.addEventListener("click", () => {
      state.workouts = state.workouts.filter((item) => item.id !== workout.id);
      if (state.activeSession.activeWorkoutId === workout.id) {
        state.activeSession.activeWorkoutId = null;
      }
      persist();
      render();
    });

    card.addEventListener("click", () => {
      if (screenMap["screen-session"].classList.contains("active")) {
        selectWorkout(workout.id);
      }
    });

    els.workoutList.appendChild(fragment);
  });
}

function renderSession() {
  const activeSession = state.activeSession;
  const activeWorkout = state.workouts.find((workout) => workout.id === activeSession.activeWorkoutId);

  els.sessionDateLabel.textContent = activeSession.startedAt
    ? `开始于 ${new Date(activeSession.startedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}`
    : "尚未开始训练";
  els.activeWorkoutName.textContent = activeWorkout ? activeWorkout.name : "请选择一个项目开始记录";
  els.sessionWorkoutPicker.innerHTML = "";
  els.setHistory.innerHTML = "";

  state.workouts.forEach((workout) => {
    const option = document.createElement("button");
    option.className = `pixel-button session-option ${workout.id === activeSession.activeWorkoutId ? "active" : ""}`;
    option.textContent = workout.name;
    option.addEventListener("click", () => selectWorkout(workout.id));
    els.sessionWorkoutPicker.appendChild(option);
  });

  activeSession.entries
    .slice()
    .reverse()
    .forEach((entry) => {
      const row = document.createElement("div");
      row.className = "set-row";
      row.textContent = `${entry.workoutName} | 第${entry.setNumber}组 | ${entry.reps}次 | ${entry.weight}kg | ${entry.loggedAt}`;
      els.setHistory.appendChild(row);
    });
}

function addTodayCheckin() {
  const todayKey = toDateKey(new Date());
  if (!state.checkins.includes(todayKey)) {
    state.checkins.push(todayKey);
    persist();
    render();
  }
}

function changeCalendarMonth(offset) {
  calendarCursor = new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + offset, 1);
  renderCalendar();
}

function handleWorkoutCreate(event) {
  event.preventDefault();
  const file = document.getElementById("workoutImage").files[0];

  const workout = {
    id: crypto.randomUUID(),
    name: document.getElementById("workoutName").value.trim(),
    category: document.getElementById("workoutCategory").value.trim(),
    defaultSets: Number(document.getElementById("workoutSets").value),
    defaultReps: Number(document.getElementById("workoutReps").value),
    defaultWeight: Number(document.getElementById("workoutWeight").value),
    image: ""
  };

  const finalize = () => {
    state.workouts.push(workout);
    persist();
    els.workoutForm.reset();
    document.getElementById("workoutSets").value = 4;
    document.getElementById("workoutReps").value = 12;
    document.getElementById("workoutWeight").value = 20;
    els.workoutForm.classList.add("hidden");
    render();
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      workout.image = reader.result;
      finalize();
    };
    reader.readAsDataURL(file);
  } else {
    finalize();
  }
}

function beginSession() {
  if (!state.activeSession.startedAt) {
    state.activeSession.startedAt = Date.now();
    addTodayCheckin();
    persist();
  }
  resumeSessionTimer();
  switchScreen("screen-session");
  renderSession();
}

function resumeSessionTimer() {
  clearInterval(sessionTimerInterval);
  updateSessionTimer();
  sessionTimerInterval = setInterval(updateSessionTimer, 1000);
}

function updateSessionTimer() {
  if (!state.activeSession.startedAt) {
    els.sessionTimer.textContent = "00:00";
    return;
  }
  const seconds = Math.floor((Date.now() - state.activeSession.startedAt) / 1000);
  els.sessionTimer.textContent = formatDuration(seconds);
}

function selectWorkout(workoutId) {
  const workout = state.workouts.find((item) => item.id === workoutId);
  if (!state.activeSession.startedAt) {
    beginSession();
  }
  state.activeSession.activeWorkoutId = workoutId;
  if (workout) {
    document.getElementById("setNumber").value = nextSetNumberForWorkout(workoutId);
    document.getElementById("setReps").value = workout.defaultReps;
    document.getElementById("setWeight").value = workout.defaultWeight;
  }
  persist();
  renderSession();
}

function nextSetNumberForWorkout(workoutId) {
  const entries = state.activeSession.entries.filter((entry) => entry.workoutId === workoutId);
  return entries.length + 1;
}

function saveSetEntry(event) {
  event.preventDefault();
  const workout = state.workouts.find((item) => item.id === state.activeSession.activeWorkoutId);
  if (!workout) {
    alert("请先选择一个训练项目。");
    return;
  }

  const entry = {
    workoutId: workout.id,
    workoutName: workout.name,
    setNumber: Number(document.getElementById("setNumber").value),
    reps: Number(document.getElementById("setReps").value),
    weight: Number(document.getElementById("setWeight").value),
    loggedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  };

  state.activeSession.entries.push(entry);
  document.getElementById("setNumber").value = nextSetNumberForWorkout(workout.id);
  persist();
  renderSession();
}

function startRestTimer() {
  const seconds = Number(els.restSeconds.value) || 90;
  clearInterval(restTimerInterval);
  let remaining = seconds;
  updateRestCard(remaining);

  restTimerInterval = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(restTimerInterval);
      els.restTimerCard.textContent = "休息结束，继续下一组。";
      return;
    }
    updateRestCard(remaining);
  }, 1000);
}

function updateRestCard(seconds) {
  els.restTimerCard.textContent = `组间休息中：${formatDuration(seconds)}`;
}

function stopRestTimer() {
  clearInterval(restTimerInterval);
  els.restTimerCard.textContent = "已跳过休息，自由继续训练。";
}

function finishSession() {
  if (!state.activeSession.startedAt || state.activeSession.entries.length === 0) {
    state.activeSession = {
      startedAt: null,
      activeWorkoutId: null,
      entries: []
    };
    persist();
    render();
    return;
  }

  state.sessionHistory.push({
    date: toDateKey(new Date()),
    startedAt: state.activeSession.startedAt,
    durationSeconds: Math.floor((Date.now() - state.activeSession.startedAt) / 1000),
    entries: [...state.activeSession.entries]
  });
  state.activeSession = {
    startedAt: null,
    activeWorkoutId: null,
    entries: []
  };
  stopRestTimer();
  persist();
  render();
  switchScreen("screen-home");
}

function switchScreen(screenId) {
  Object.entries(screenMap).forEach(([id, node]) => {
    node.classList.toggle("active", id === screenId);
  });
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.screen === screenId);
  });
}

function countCurrentWeekCheckins() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  return state.checkins.filter((value) => new Date(value) >= monday).length;
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(dateKey) {
  const [year, month, day] = dateKey.split("-");
  return `${year}/${month}/${day}`;
}

function formatDuration(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  const hours = Math.floor(totalSeconds / 3600);
  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${minutes}:${seconds}`;
  }
  return `${minutes}:${seconds}`;
}
