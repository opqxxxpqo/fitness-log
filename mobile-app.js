import React, { useEffect, useMemo, useState } from "react";
import { Alert, Image, Modal, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Svg, { Line, Path } from "react-native-svg";

const STORAGE_KEY = "fitness-log-mobile-state";
const weekdays = ["一", "二", "三", "四", "五", "六", "日"];
const monoFont = Platform.select({ ios: "Courier", android: "monospace", default: "monospace" });
const theme = { bg: "#ebe8df", panel: "#f7f4eb", panelAlt: "#efe9de", text: "#151311", muted: "#67615c", accent: "#d9d4ca", danger: "#c9c3b8", line: "#1f1c19", shadow: "#2f2b28", green: "#76c043", red: "#d65d4d" };
const emptyDraft = { name: "", category: "", defaultSets: "4", defaultReps: "12", defaultWeight: "20", image: "" };

function createId() { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`; }
function createDefaultState() {
  return {
    workouts: [
      { id: createId(), name: "哑铃卧推", category: "胸", defaultSets: "4", defaultReps: "12", defaultWeight: "20", image: "" },
      { id: createId(), name: "深蹲", category: "腿", defaultSets: "5", defaultReps: "8", defaultWeight: "40", image: "" }
    ],
    checkins: [],
    calendarMarks: {},
    sessionHistory: [],
    activeSession: { startedAt: null, activeWorkoutId: null, entries: [] }
  };
}
function migrateState(rawState) {
  const base = createDefaultState();
  const merged = { ...base, ...rawState, workouts: rawState?.workouts?.length ? rawState.workouts : base.workouts, sessionHistory: rawState?.sessionHistory || [], activeSession: rawState?.activeSession || base.activeSession };
  const legacyCheckins = Array.isArray(rawState?.checkins) ? rawState.checkins : [];
  const calendarMarks = { ...(rawState?.calendarMarks || {}) };
  legacyCheckins.forEach((dateKey) => { if (!calendarMarks[dateKey]) calendarMarks[dateKey] = { intensity: "green" }; });
  return { ...merged, checkins: legacyCheckins, calendarMarks };
}
function toDateKey(date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function formatDate(dateKey) { const [y, m, d] = dateKey.split("-"); return `${y}/${m}/${d}`; }
function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return hours > 0 ? `${String(hours).padStart(2, "0")}:${minutes}:${seconds}` : `${minutes}:${seconds}`;
}
function countCurrentWeekCheckins(calendarMarks) {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  return Object.entries(calendarMarks).filter(([dateKey]) => new Date(dateKey) >= monday).length;
}
function buildCalendarDays(cursor, calendarMarks) {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const firstDay = (first.getDay() + 6) % 7;
  const total = Math.ceil((firstDay + last.getDate()) / 7) * 7;
  const todayKey = toDateKey(new Date());
  return Array.from({ length: total }, (_, index) => {
    const dayNumber = index - firstDay + 1;
    if (dayNumber <= 0 || dayNumber > last.getDate()) return { key: `empty-${index}`, empty: true };
    const dateKey = toDateKey(new Date(year, month, dayNumber));
    return { key: dateKey, dateKey, dayNumber, intensity: calendarMarks[dateKey]?.intensity || null, today: dateKey === todayKey };
  });
}
function getIntensityColor(intensity) { return intensity === "green" ? theme.green : intensity === "red" ? theme.red : null; }
function buildWorkoutProgress(sessionHistory, workoutId) {
  return sessionHistory.map((session) => {
    const entries = session.entries.filter((entry) => entry.workoutId === workoutId);
    if (entries.length === 0) return null;
    return { date: session.date, weight: Math.max(...entries.map((entry) => entry.weight)), sets: entries.length };
  }).filter(Boolean).slice(-6);
}
function createLinePath(data, accessor, width, height, padding) {
  if (!data.length) return "";
  const values = data.map(accessor);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return data.map((item, index) => {
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - ((accessor(item) - min) / range) * (height - padding * 2);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  }).join(" ");
}

function PixelButton({ title, onPress, variant = "default", style, disabled }) {
  return <Pressable disabled={disabled} onPress={onPress} style={({ pressed }) => [styles.pixelButton, variant === "primary" && styles.pixelButtonPrimary, variant === "danger" && styles.pixelButtonDanger, pressed && !disabled && styles.pixelButtonPressed, disabled && styles.disabled, style]}><Text style={styles.pixelButtonText}>{title}</Text></Pressable>;
}
function Panel({ children, style }) { return <View style={[styles.panel, style]}>{children}</View>; }
function Field({ label, compact = false, ...props }) { return <View style={compact ? styles.compactField : styles.field}><Text style={styles.fieldLabel}>{label}</Text><TextInput placeholderTextColor={theme.muted} style={[styles.input, compact && styles.compactInput]} {...props} /></View>; }

function SessionPanel({ activeWorkout, entries, nextSetNumber, restRemaining, onSave, onStartRest, onSkipRest }) {
  const [setNumber, setSetNumber] = useState(nextSetNumber);
  const [reps, setReps] = useState(activeWorkout?.defaultReps || "12");
  const [weight, setWeight] = useState(activeWorkout?.defaultWeight || "20");
  const [restSeconds, setRestSeconds] = useState("90");
  useEffect(() => { setSetNumber(nextSetNumber); setReps(activeWorkout?.defaultReps || "12"); setWeight(activeWorkout?.defaultWeight || "20"); }, [activeWorkout, nextSetNumber]);
  return <Panel><View style={styles.sectionRow}><Text style={styles.sectionTitle}>当前记录</Text><Text style={styles.muted}>{activeWorkout ? activeWorkout.name : "请选择一个项目开始记录"}</Text></View><View style={styles.formStack}><Field label="组数" value={setNumber} onChangeText={setSetNumber} keyboardType="number-pad" /><Field label="次数" value={reps} onChangeText={setReps} keyboardType="number-pad" /><Field label="重量(kg)" value={weight} onChangeText={setWeight} keyboardType="number-pad" /></View><PixelButton title="记录这一组" variant="primary" onPress={() => { onSave({ setNumber, reps, weight }); setSetNumber(String(Number(setNumber || "0") + 1)); }} /><View style={styles.restWrap}><PixelButton title="组间休息" onPress={() => onStartRest(Number(restSeconds || "90"))} style={styles.restButton} /><Field label="自定义秒数" value={restSeconds} onChangeText={setRestSeconds} keyboardType="number-pad" compact /><PixelButton title="自由跳过" onPress={onSkipRest} style={styles.restButton} /></View><View style={styles.restCard}><Text style={styles.muted}>{restRemaining == null ? "休息计时未开始" : `组间休息中：${formatDuration(restRemaining)}`}</Text></View><View style={styles.historyStack}>{[...entries].reverse().map((entry, index) => <View key={`${entry.workoutId}-${entry.loggedAt}-${index}`} style={styles.historyRow}><Text style={styles.historyText}>{entry.workoutName} | 第{entry.setNumber}组 | {entry.reps}次 | {entry.weight}kg | {entry.loggedAt}</Text></View>)}</View></Panel>;
}

function WorkoutModal({ visible, draft, onChange, onPickImage, onCancel, onSubmit }) {
  return <Modal visible={visible} transparent animationType="slide"><View style={styles.modalBackdrop}><Panel style={styles.modalPanel}><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScrollContent}><Text style={styles.sectionTitle}>新增训练项目</Text><View style={styles.formStack}><Field label="项目名称" value={draft.name} onChangeText={(value) => onChange((current) => ({ ...current, name: value }))} /><Field label="分类" value={draft.category} onChangeText={(value) => onChange((current) => ({ ...current, category: value }))} /><Field label="默认组数" value={draft.defaultSets} onChangeText={(value) => onChange((current) => ({ ...current, defaultSets: value }))} keyboardType="number-pad" /><Field label="默认次数" value={draft.defaultReps} onChangeText={(value) => onChange((current) => ({ ...current, defaultReps: value }))} keyboardType="number-pad" /><Field label="默认重量(kg)" value={draft.defaultWeight} onChangeText={(value) => onChange((current) => ({ ...current, defaultWeight: value }))} keyboardType="number-pad" /></View><View style={styles.imagePickerBlock}><Text style={styles.fieldLabel}>项目图片</Text><View style={styles.imagePickerRow}><PixelButton title="选择图片" onPress={onPickImage} /><Text style={styles.muted}>{draft.image ? "已选择图片" : "未选择任何图片"}</Text></View>{draft.image ? <Image source={{ uri: draft.image }} style={styles.modalPreview} /> : null}</View><View style={styles.modalActions}><PixelButton title="保存项目" variant="primary" onPress={onSubmit} style={styles.flexButton} /><PixelButton title="取消" onPress={onCancel} style={styles.flexButton} /></View></ScrollView></Panel></View></Modal>;
}

function DayHistoryModal({ visible, dateKey, sessions, onClose }) {
  return <Modal visible={visible} transparent animationType="fade"><View style={styles.modalBackdrop}><Panel style={styles.historyModalPanel}><Text style={styles.sectionTitle}>当日历史</Text><Text style={styles.muted}>{dateKey ? formatDate(dateKey) : ""}</Text><ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.historyModalScroll}>{sessions.length === 0 ? <Text style={styles.muted}>这一天还没有训练详情。</Text> : sessions.map((session, sessionIndex) => <View key={`${session.date}-${sessionIndex}`} style={styles.daySessionBlock}><Text style={styles.daySessionTitle}>第 {sessionIndex + 1} 次训练 · {formatDuration(session.durationSeconds || 0)}</Text>{session.entries.map((entry, entryIndex) => <View key={`${entry.workoutId}-${entryIndex}`} style={styles.historyRow}><Text style={styles.historyText}>{entry.workoutName} | 第{entry.setNumber}组 | {entry.reps}次 | {entry.weight}kg | {entry.loggedAt}</Text></View>)}</View>)}</ScrollView><PixelButton title="关闭" onPress={onClose} style={styles.historyCloseButton} /></Panel></View></Modal>;
}
function ProgressChart({ progress }) {
  if (progress.length === 0) return <Text style={styles.chartEmptyText}>还没有足够记录，开始训练后这里会显示成长曲线。</Text>;
  const width = 280;
  const height = 116;
  const padding = 12;
  const weightPath = createLinePath(progress, (item) => item.weight, width, height, padding);
  const setPath = createLinePath(progress, (item) => item.sets, width, height, padding);
  return <View style={styles.chartWrap}><View style={styles.chartLegend}><View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: theme.green }]} /><Text style={styles.legendText}>重量</Text></View><View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: theme.red }]} /><Text style={styles.legendText}>组数</Text></View></View><Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none"><Line x1="12" y1={height - 12} x2={width - 12} y2={height - 12} stroke="#a6a096" strokeWidth="2" /><Line x1="12" y1="12" x2="12" y2={height - 12} stroke="#a6a096" strokeWidth="2" /><Path d={weightPath} stroke={theme.green} strokeWidth="4" fill="none" /><Path d={setPath} stroke={theme.red} strokeWidth="4" fill="none" /></Svg><View style={styles.chartFooter}>{progress.map((item) => <Text key={`${item.date}-label`} style={styles.chartLabel}>{item.date.slice(5)}</Text>)}</View></View>;
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState("home");
  const [state, setState] = useState(createDefaultState);
  const [calendarCursor, setCalendarCursor] = useState(new Date());
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [restRemaining, setRestRemaining] = useState(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [selectedHistoryDate, setSelectedHistoryDate] = useState(null);
  useEffect(() => {
    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setState(migrateState(JSON.parse(raw)));
      } catch {
        Alert.alert("读取失败", "本地数据读取失败，已使用默认数据。");
      } finally {
        setReady(true);
      }
    }
    hydrate();
  }, []);
  useEffect(() => {
    if (!ready) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => Alert.alert("保存失败", "本地数据保存失败，请稍后再试。"));
  }, [ready, state]);
  useEffect(() => {
    if (!state.activeSession.startedAt) { setSessionElapsed(0); return undefined; }
    const update = () => setSessionElapsed(Math.floor((Date.now() - state.activeSession.startedAt) / 1000));
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [state.activeSession.startedAt]);
  useEffect(() => {
    if (restRemaining == null) return undefined;
    if (restRemaining <= 0) { setRestRemaining(null); Alert.alert("休息结束", "可以继续下一组了。"); return undefined; }
    const timer = setInterval(() => setRestRemaining((current) => (current == null ? null : current - 1)), 1000);
    return () => clearInterval(timer);
  }, [restRemaining]);
  const latestSession = state.sessionHistory[state.sessionHistory.length - 1];
  const activeWorkout = useMemo(() => state.workouts.find((item) => item.id === state.activeSession.activeWorkoutId) || null, [state.workouts, state.activeSession.activeWorkoutId]);
  const calendarDays = useMemo(() => buildCalendarDays(calendarCursor, state.calendarMarks), [calendarCursor, state.calendarMarks]);
  const selectedDateSessions = useMemo(() => state.sessionHistory.filter((session) => session.date === selectedHistoryDate), [state.sessionHistory, selectedHistoryDate]);
  function updateState(updater) { setState((current) => updater(current)); }
  function setDayIntensity(dateKey, intensity) {
    updateState((current) => {
      const nextMarks = { ...current.calendarMarks };
      if (!intensity) delete nextMarks[dateKey];
      else nextMarks[dateKey] = { intensity };
      return { ...current, calendarMarks: nextMarks, checkins: Object.keys(nextMarks).sort() };
    });
  }
  function addTodayCheckin() {
    const today = toDateKey(new Date());
    updateState((current) => {
      const nextMarks = { ...current.calendarMarks, [today]: current.calendarMarks[today] || { intensity: "green" } };
      return { ...current, calendarMarks: nextMarks, checkins: Object.keys(nextMarks).sort() };
    });
  }
  function toggleCalendarIntensity(dateKey) {
    const currentIntensity = state.calendarMarks[dateKey]?.intensity || null;
    const nextIntensity = currentIntensity === null ? "green" : currentIntensity === "green" ? "red" : null;
    setDayIntensity(dateKey, nextIntensity);
  }
  function beginSession() {
    const now = Date.now();
    const today = toDateKey(new Date());
    updateState((current) => {
      const nextMarks = { ...current.calendarMarks, [today]: current.calendarMarks[today] || { intensity: "green" } };
      if (current.activeSession.startedAt) return { ...current, calendarMarks: nextMarks, checkins: Object.keys(nextMarks).sort() };
      return { ...current, calendarMarks: nextMarks, checkins: Object.keys(nextMarks).sort(), activeSession: { ...current.activeSession, startedAt: now } };
    });
    setTab("session");
  }
  function finishSession() {
    updateState((current) => {
      if (!current.activeSession.startedAt || current.activeSession.entries.length === 0) return { ...current, activeSession: { startedAt: null, activeWorkoutId: null, entries: [] } };
      const today = toDateKey(new Date());
      const nextMarks = { ...current.calendarMarks, [today]: current.calendarMarks[today] || { intensity: "green" } };
      return { ...current, calendarMarks: nextMarks, checkins: Object.keys(nextMarks).sort(), sessionHistory: [...current.sessionHistory, { date: today, startedAt: current.activeSession.startedAt, durationSeconds: Math.floor((Date.now() - current.activeSession.startedAt) / 1000), entries: current.activeSession.entries }], activeSession: { startedAt: null, activeWorkoutId: null, entries: [] } };
    });
    setRestRemaining(null);
    setTab("home");
  }
  function selectWorkout(workoutId) { if (!state.activeSession.startedAt) beginSession(); updateState((current) => ({ ...current, activeSession: { ...current.activeSession, activeWorkoutId: workoutId } })); }
  function nextSetNumber(workoutId) { return String(state.activeSession.entries.filter((entry) => entry.workoutId === workoutId).length + 1); }
  function saveSetEntry({ setNumber, reps, weight }) {
    if (!activeWorkout) { Alert.alert("还没选项目", "请先选择一个训练项目。"); return; }
    const entry = { workoutId: activeWorkout.id, workoutName: activeWorkout.name, setNumber: Number(setNumber), reps: Number(reps), weight: Number(weight), loggedAt: new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) };
    updateState((current) => ({ ...current, activeSession: { ...current.activeSession, entries: [...current.activeSession.entries, entry] } }));
  }
  async function pickWorkoutImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) { Alert.alert("需要权限", "请允许访问相册后再选择图片。"); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, quality: 0.8 });
    if (!result.canceled && result.assets?.[0]?.uri) setDraft((current) => ({ ...current, image: result.assets[0].uri }));
  }
  function submitWorkout() {
    if (!draft.name.trim()) { Alert.alert("缺少名称", "请填写训练项目名称。"); return; }
    const workout = { id: createId(), name: draft.name.trim(), category: draft.category.trim(), defaultSets: draft.defaultSets || "4", defaultReps: draft.defaultReps || "12", defaultWeight: draft.defaultWeight || "20", image: draft.image };
    updateState((current) => ({ ...current, workouts: [...current.workouts, workout] }));
    setDraft(emptyDraft);
    setShowWorkoutModal(false);
  }
  function removeWorkout(workoutId) {
    updateState((current) => ({ ...current, workouts: current.workouts.filter((item) => item.id !== workoutId), activeSession: current.activeSession.activeWorkoutId === workoutId ? { ...current.activeSession, activeWorkoutId: null } : current.activeSession }));
  }
  if (!ready) return <SafeAreaView style={styles.root}><StatusBar barStyle="dark-content" /><View style={styles.loadingWrap}><Text style={styles.appTitle}>健身记录</Text><Text style={styles.muted}>正在读取本地数据...</Text></View></SafeAreaView>;
  return <SafeAreaView style={styles.root}><StatusBar barStyle="dark-content" /><ScrollView contentContainerStyle={styles.scrollContent}><Panel style={styles.headerPanel}><View style={styles.headerCopy}><Text style={styles.eyebrow}>FITNESS LOG</Text><Text style={styles.appTitle}>健身记录</Text></View><PixelButton title="今日打卡" variant="primary" onPress={addTodayCheckin} /></Panel>{tab === "home" && <View style={styles.screen}><Panel style={styles.heroPanel}><View style={styles.flexOne}><Text style={styles.label}>本周进度</Text><Text style={styles.bigValue}>{countCurrentWeekCheckins(state.calendarMarks)} / 7</Text><Text style={styles.muted}>{latestSession ? `${formatDate(latestSession.date)} 完成 ${latestSession.entries.length} 条记录` : "今天还没有训练记录"}</Text></View><View style={styles.pixelAvatar}><View style={styles.pixelAvatarFace} /></View></Panel><Panel><View style={styles.calendarHeader}><Text style={styles.sectionTitle}>打卡日历</Text><Text style={styles.calendarHint}>短按切换强度，长按查看当天训练</Text><View style={styles.calendarLegend}><View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: theme.green }]} /><Text style={styles.legendText}>绿色</Text></View><View style={styles.legendItem}><View style={[styles.legendSwatch, { backgroundColor: theme.red }]} /><Text style={styles.legendText}>红色</Text></View></View><View style={styles.calendarNav}><PixelButton title="<" onPress={() => setCalendarCursor(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() - 1, 1))} style={styles.iconButton} /><Text style={styles.calendarTitle}>{calendarCursor.getFullYear()}年 {calendarCursor.getMonth() + 1}月</Text><PixelButton title=">" onPress={() => setCalendarCursor(new Date(calendarCursor.getFullYear(), calendarCursor.getMonth() + 1, 1))} style={styles.iconButton} /></View></View><View style={styles.calendarGrid}>{weekdays.map((day) => <Text key={day} style={styles.weekday}>{day}</Text>)}{calendarDays.map((item) => item.empty ? <View key={item.key} style={[styles.calendarCell, styles.calendarCellEmpty]} /> : <Pressable key={item.key} onPress={() => toggleCalendarIntensity(item.dateKey)} onLongPress={() => setSelectedHistoryDate(item.dateKey)} style={({ pressed }) => [styles.calendarCell, item.today && styles.calendarCellToday, item.intensity && { backgroundColor: getIntensityColor(item.intensity), borderColor: theme.line }, pressed && styles.calendarCellPressed]}><Text style={[styles.calendarCellText, item.intensity && styles.calendarCellTextActive]}>{item.dayNumber}</Text></Pressable>)}</View></Panel><Panel><View style={styles.sectionRow}><Text style={styles.sectionTitle}>最近一次训练</Text><PixelButton title="开始健身" onPress={beginSession} /></View><Text style={styles.muted}>{latestSession ? latestSession.entries.slice(-3).map((entry) => `${entry.workoutName} 第${entry.setNumber}组 ${entry.reps}次 ${entry.weight}kg`).join(" / ") : "还没有训练内容，先去创建一个项目吧。"}</Text></Panel></View>}{tab === "workouts" && <View style={styles.screen}><View style={styles.sectionRow}><Text style={styles.sectionTitle}>训练库</Text><PixelButton title="新增项目" variant="primary" onPress={() => setShowWorkoutModal(true)} /></View>{state.workouts.map((workout) => { const progress = buildWorkoutProgress(state.sessionHistory, workout.id); return <Panel key={workout.id} style={styles.workoutCard}><View style={styles.workoutMain}><View style={styles.workoutThumb}>{workout.image ? <Image source={{ uri: workout.image }} style={styles.workoutThumbImage} /> : <View style={styles.workoutThumbFallback} />}</View><View style={styles.flexOne}><Text style={styles.workoutTitle}>{workout.name}</Text><Text style={styles.muted}>{workout.category || "未分类"} | {workout.defaultSets}组 x {workout.defaultReps}次 | {workout.defaultWeight}kg</Text></View></View><ProgressChart progress={progress} /><View style={styles.cardActions}><PixelButton title="开始" onPress={() => selectWorkout(workout.id)} style={styles.cardButton} /><PixelButton title="删除" onPress={() => removeWorkout(workout.id)} style={styles.cardButton} /></View></Panel>; })}</View>}{tab === "session" && <View style={styles.screen}><Panel style={styles.timerPanel}><View><Text style={styles.label}>训练计时</Text><Text style={styles.bigValue}>{formatDuration(sessionElapsed)}</Text></View><PixelButton title="结束训练" variant="danger" onPress={finishSession} /></Panel><Panel><View style={styles.sectionRow}><Text style={styles.sectionTitle}>选择训练项目</Text><Text style={styles.muted}>{state.activeSession.startedAt ? `开始于 ${new Date(state.activeSession.startedAt).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}` : "尚未开始训练"}</Text></View><View style={styles.workoutPickerWrap}>{state.workouts.map((workout) => <PixelButton key={workout.id} title={workout.name} onPress={() => selectWorkout(workout.id)} variant={state.activeSession.activeWorkoutId === workout.id ? "primary" : "default"} style={styles.fullWidthButton} />)}</View></Panel><SessionPanel activeWorkout={activeWorkout} entries={state.activeSession.entries} nextSetNumber={activeWorkout ? nextSetNumber(activeWorkout.id) : "1"} restRemaining={restRemaining} onSave={saveSetEntry} onStartRest={(seconds) => setRestRemaining(seconds)} onSkipRest={() => setRestRemaining(null)} /></View>}</ScrollView><Panel style={styles.bottomNav}><PixelButton title="主页" onPress={() => setTab("home")} variant={tab === "home" ? "primary" : "default"} style={styles.navButton} /><PixelButton title="训练库" onPress={() => setTab("workouts")} variant={tab === "workouts" ? "primary" : "default"} style={styles.navButton} /><PixelButton title="训练中" onPress={() => setTab("session")} variant={tab === "session" ? "primary" : "default"} style={styles.navButton} /></Panel><WorkoutModal visible={showWorkoutModal} draft={draft} onChange={setDraft} onPickImage={pickWorkoutImage} onCancel={() => setShowWorkoutModal(false)} onSubmit={submitWorkout} /><DayHistoryModal visible={Boolean(selectedHistoryDate)} dateKey={selectedHistoryDate} sessions={selectedDateSessions} onClose={() => setSelectedHistoryDate(null)} /></SafeAreaView>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg, paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0 },
  scrollContent: { padding: 14, paddingBottom: 112, gap: 14 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  panel: { backgroundColor: theme.panel, borderWidth: 3, borderColor: theme.line, shadowColor: theme.shadow, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, padding: 16 },
  headerPanel: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 14 },
  headerCopy: { flex: 1, gap: 8 },
  eyebrow: { color: theme.muted, fontSize: 12, letterSpacing: 2 },
  appTitle: { color: theme.text, fontSize: 28, lineHeight: 36, fontFamily: monoFont, fontWeight: "700" },
  screen: { gap: 14 },
  heroPanel: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16 },
  flexOne: { flex: 1 },
  label: { color: theme.muted, fontSize: 12, marginBottom: 8 },
  bigValue: { fontSize: 28, lineHeight: 36, color: theme.text, marginBottom: 6, fontFamily: monoFont },
  muted: { color: theme.muted, fontSize: 13, lineHeight: 21 },
  pixelAvatar: { width: 82, height: 82, borderWidth: 3, borderColor: theme.line, backgroundColor: "#dbd4ca", justifyContent: "center", alignItems: "center" },
  pixelAvatarFace: { width: 50, height: 50, backgroundColor: "#8f897f", borderWidth: 3, borderColor: theme.line },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 },
  sectionTitle: { color: theme.text, fontSize: 20, lineHeight: 28 },
  calendarHeader: { gap: 12 },
  calendarHint: { color: theme.muted, fontSize: 12 },
  calendarLegend: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 8 },
  legendSwatch: { width: 14, height: 14, borderWidth: 2, borderColor: theme.line },
  legendText: { color: theme.text, fontSize: 12 },
  calendarNav: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  calendarTitle: { flex: 1, textAlign: "center", color: theme.text, fontSize: 16, fontFamily: monoFont },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 14 },
  weekday: { width: "12.3%", textAlign: "center", color: theme.muted, fontSize: 12 },
  calendarCell: { width: "12.3%", minHeight: 42, backgroundColor: theme.panelAlt, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "transparent" },
  calendarCellPressed: { opacity: 0.85 },
  calendarCellToday: { borderColor: theme.line },
  calendarCellEmpty: { backgroundColor: "transparent" },
  calendarCellText: { color: theme.text, fontSize: 12 },
  calendarCellTextActive: { color: "#ffffff", fontWeight: "700" },
  timerPanel: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  workoutCard: { gap: 14 },
  workoutMain: { flexDirection: "row", gap: 12, alignItems: "center" },
  workoutThumb: { width: 58, height: 58, borderWidth: 3, borderColor: theme.line, backgroundColor: "#d7d1c7", overflow: "hidden" },
  workoutThumbImage: { width: "100%", height: "100%" },
  workoutThumbFallback: { flex: 1, backgroundColor: "#bfb8ad" },
  workoutTitle: { color: theme.text, fontSize: 16, marginBottom: 6 },
  chartWrap: { marginTop: 2, marginBottom: 2, gap: 8 },
  chartLegend: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  chartFooter: { flexDirection: "row", justifyContent: "space-between", gap: 4 },
  chartLabel: { color: theme.muted, fontSize: 10, flex: 1, textAlign: "center" },
  chartEmptyText: { color: theme.muted, fontSize: 12, lineHeight: 18 },
  cardActions: { flexDirection: "row", gap: 8 },
  cardButton: { flex: 1 },
  workoutPickerWrap: { gap: 10 },
  formStack: { gap: 12, marginBottom: 14 },
  field: { gap: 8 },
  compactField: { minWidth: 120, gap: 8, flex: 1 },
  fieldLabel: { color: theme.text, fontSize: 13 },
  input: { backgroundColor: "#ffffff", borderWidth: 3, borderColor: theme.line, color: theme.text, paddingHorizontal: 12, paddingVertical: 12, fontSize: 15, shadowColor: theme.shadow, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0 },
  compactInput: { minWidth: 0 },
  restWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, alignItems: "flex-end", marginTop: 4 },
  restButton: { minWidth: 108 },
  restCard: { marginTop: 14, padding: 12, borderWidth: 3, borderColor: theme.line, borderStyle: "dashed", backgroundColor: theme.panelAlt },
  historyStack: { gap: 10, marginTop: 14 },
  historyRow: { backgroundColor: "#f1ece2", borderWidth: 2, borderColor: theme.line, padding: 10 },
  historyText: { color: theme.text, fontSize: 13, lineHeight: 20 },
  bottomNav: { position: "absolute", left: 14, right: 14, bottom: 14, flexDirection: "row", gap: 8, padding: 8 },
  navButton: { flex: 1 },
  pixelButton: { backgroundColor: "#fffdfa", borderWidth: 3, borderColor: theme.line, paddingHorizontal: 14, paddingVertical: 12, shadowColor: theme.shadow, shadowOffset: { width: 6, height: 6 }, shadowOpacity: 1, shadowRadius: 0, alignItems: "center", justifyContent: "center" },
  pixelButtonPrimary: { backgroundColor: theme.accent },
  pixelButtonDanger: { backgroundColor: theme.danger },
  pixelButtonPressed: { transform: [{ translateX: 2 }, { translateY: 2 }], shadowOffset: { width: 4, height: 4 } },
  pixelButtonText: { color: theme.text, fontSize: 13, fontFamily: monoFont },
  iconButton: { minWidth: 52 },
  fullWidthButton: { width: "100%" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(15, 13, 11, 0.4)", justifyContent: "center", padding: 16 },
  modalPanel: { maxHeight: "88%", width: "100%", padding: 0 },
  modalScrollContent: { padding: 16, paddingBottom: 24 },
  imagePickerBlock: { gap: 10, marginBottom: 16 },
  imagePickerRow: { flexDirection: "row", alignItems: "center", gap: 10, flexWrap: "wrap" },
  modalPreview: { width: 84, height: 84, borderWidth: 3, borderColor: theme.line },
  modalActions: { flexDirection: "row", gap: 10, paddingTop: 6, marginTop: 4 },
  flexButton: { flex: 1 },
  historyModalPanel: { maxHeight: "82%", width: "100%", gap: 12 },
  historyModalScroll: { gap: 10, paddingTop: 12 },
  daySessionBlock: { gap: 8, marginBottom: 6 },
  daySessionTitle: { color: theme.text, fontSize: 14, fontWeight: "700" },
  historyCloseButton: { marginTop: 8 },
  disabled: { opacity: 0.6 }
});
