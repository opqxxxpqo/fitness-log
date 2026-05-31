import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, SafeAreaView, Alert } from 'react-native';
import { C, F, FS, SP } from '../theme';
import { Doto, Mono, CTA, SectionLabel } from '../components';
import { todayKey } from '../storage';

const REST_PRESETS = [60, 90, 120, 180, 300];

export default function WorkoutScreen({ state, mutateState, exerciseId, onExit }) {
  const library = state.library || [];
  const startIdx = Math.max(0, library.findIndex((l) => l.id === exerciseId));
  const [idx, setIdx] = useState(startIdx);
  const current = library[idx];

  const [sessionStart] = useState(Date.now());
  const [paused, setPaused] = useState(false);
  const [pausedAcc, setPausedAcc] = useState(0);
  const [pauseAt, setPauseAt] = useState(null);
  const [now, setNow] = useState(Date.now());

  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [setIndex, setSetIndex] = useState(0);
  // completed sets per exercise id, in-memory until persisted on exit
  const [done, setDone] = useState({}); // { exerciseId: [{weight, reps, isPR}] }

  // Rest timer
  const [restPreset, setRestPreset] = useState(current?.rest || 90);
  const [restRemaining, setRestRemaining] = useState(0);
  const [restActive, setRestActive] = useState(false);
  const [customMin, setCustomMin] = useState('2');
  const [customSec, setCustomSec] = useState('30');

  useEffect(() => {
    if (!current) return;
    setRestPreset(current.rest || 90);
  }, [idx]);

  // Master tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Rest tick
  useEffect(() => {
    if (!restActive) return;
    if (restRemaining <= 0) {
      setRestActive(false);
      return;
    }
    const id = setInterval(() => setRestRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(id);
  }, [restActive, restRemaining]);

  if (!current) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
        <View style={{ padding: SP(5) }}>
          <Mono>// 未找到训练项目</Mono>
          <View style={{ marginTop: SP(4) }}>
            <CTA accent label="返回" onPress={onExit} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalSets = parseSetCount(current.target);
  const elapsedSec = Math.floor(((paused ? pauseAt : now) - sessionStart - pausedAcc) / 1000);

  const completed = done[current.id] || [];
  const pr = computePR(state, current.id);

  const togglePause = () => {
    if (paused) {
      const delta = Date.now() - pauseAt;
      setPausedAcc((a) => a + delta);
      setPauseAt(null);
      setPaused(false);
    } else {
      setPauseAt(Date.now());
      setPaused(true);
    }
  };

  const recordSet = () => {
    const w = Number(weight);
    const r = Number(reps);
    if (!r) {
      Alert.alert('记录失败', '至少填写次数');
      return;
    }
    const isPR = pr != null ? w > pr : w > 0;
    setDone((prev) => {
      const list = [...(prev[current.id] || []), { weight: w, reps: r, isPR }];
      return { ...prev, [current.id]: list };
    });
    setSetIndex((i) => i + 1);
    // start rest
    setRestRemaining(restPreset);
    setRestActive(true);
  };

  const goPrev = () => setIdx((i) => Math.max(0, i - 1));
  const goNext = () => setIdx((i) => Math.min(library.length - 1, i + 1));

  const finish = () => {
    // persist everything from `done` into state.history under today
    const key = todayKey();
    mutateState((next) => {
      const hist = { ...(next.history || {}) };
      const todays = [...(hist[key] || [])];
      Object.entries(done).forEach(([exId, sets]) => {
        if (!sets || sets.length === 0) return;
        const exMeta = library.find((l) => l.id === exId);
        const existingIdx = todays.findIndex((t) => t.exerciseId === exId);
        const record = {
          exerciseId: exId,
          name: exMeta?.name || '',
          group: exMeta?.group || '',
          sets,
          durationSec: elapsedSec,
        };
        if (existingIdx >= 0) todays[existingIdx] = record;
        else todays.push(record);
      });
      hist[key] = todays;
      next.history = hist;
      return next;
    });
    onExit();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }}>
      {/* Top bar */}
      <View style={s.topBar}>
        <Pressable onPress={onExit} hitSlop={8}>
          <Mono style={{ fontSize: FS.sm }}>✕</Mono>
        </Pressable>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <View style={[s.statusDot, paused ? { backgroundColor: C.ink55 } : { backgroundColor: C.accent }]} />
          <Mono>{paused ? '已暂停' : '进行中'} · {fmtTime(elapsedSec)}</Mono>
        </View>
        <Pressable onPress={togglePause} style={s.pauseBtn}>
          <Mono>{paused ? '继续' : '暂停'}</Mono>
        </Pressable>
      </View>

      <View style={{ height: 1, backgroundColor: C.ink12 }} />

      <ScrollView contentContainerStyle={{ paddingBottom: SP(8) }}>
        {/* Exercise nav */}
        <View style={s.exNav}>
          <Pressable onPress={goPrev} style={s.navBtn} disabled={idx === 0}>
            <Text style={{ color: idx === 0 ? C.ink35 : C.ink, fontSize: FS.xl }}>◀</Text>
          </Pressable>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Mono style={{ color: C.ink55, marginBottom: 2 }}>项目 {pad2(idx + 1)} / {pad2(library.length)}</Mono>
            <Text style={s.exName}>{current.name}</Text>
          </View>
          <Pressable onPress={goNext} style={s.navBtn} disabled={idx === library.length - 1}>
            <Text style={{ color: idx === library.length - 1 ? C.ink35 : C.ink, fontSize: FS.xl }}>▶</Text>
          </Pressable>
        </View>

        {/* Set progress dots */}
        <View style={s.setDots}>
          {Array.from({ length: totalSets }).map((_, i) => (
            <View
              key={i}
              style={[
                s.setDot,
                i < completed.length && { backgroundColor: C.ink, borderColor: C.ink },
                i === completed.length && { borderColor: C.accent, borderWidth: 2 },
              ]}
            />
          ))}
        </View>

        <View style={{ height: 1, backgroundColor: C.ink12, marginTop: SP(4) }} />

        {/* Big inputs: weight & reps */}
        <View style={s.bigInputs}>
          <BigInput
            label="重量"
            value={weight}
            unit="kg"
            onChangeText={setWeight}
          />
          <View style={s.bigSep} />
          <BigInput
            label="次数"
            value={reps}
            unit=""
            onChangeText={setReps}
          />
        </View>

        {/* PR & set indicator */}
        <View style={s.setIndicator}>
          <Mono>第 {pad2(completed.length + 1)} / {pad2(totalSets)} 组</Mono>
          <Mono style={{ color: C.ink55 }}>{pr != null ? `PR · ${pr}kg` : '尚无 PR'}</Mono>
        </View>

        {/* Set quick row */}
        <View style={s.quickRow}>
          {Array.from({ length: totalSets }).map((_, i) => {
            const isDone = i < completed.length;
            const isCurrent = i === completed.length;
            return (
              <View
                key={i}
                style={[
                  s.quickCell,
                  isDone && { backgroundColor: C.ink, borderColor: C.ink },
                  isCurrent && { borderColor: C.accent },
                ]}
              >
                {isDone ? (
                  <Text style={{ color: C.bg, fontFamily: F.mono }}>✓</Text>
                ) : isCurrent ? (
                  <Mono style={{ color: C.accent }}>本组</Mono>
                ) : (
                  <Mono style={{ color: C.ink55 }}>{pad2(i + 1)}</Mono>
                )}
              </View>
            );
          })}
        </View>

        <View style={{ height: 1, backgroundColor: C.ink12, marginTop: SP(4) }} />

        {/* Rest timer */}
        <View style={s.restBlock}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Mono>// 组间休息</Mono>
            <Mono style={{ color: C.ink55 }}>PRESET · {fmtClock(restPreset)}</Mono>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: SP(2) }}>
            <Doto size={FS.hero} style={{ flex: 1 }}>{fmtClock(restActive ? restRemaining : restPreset)}</Doto>
            <Pressable
              style={s.restBtn}
              onPress={() => {
                if (restActive) setRestActive(false);
                else {
                  setRestRemaining(restPreset);
                  setRestActive(true);
                }
              }}
            >
              <Mono>{restActive ? '跳过' : '开始'}</Mono>
            </Pressable>
          </View>

          {/* Preset chips */}
          <View style={s.chipRow}>
            {REST_PRESETS.map((sec) => (
              <Pressable
                key={sec}
                onPress={() => {
                  setRestPreset(sec);
                  setRestRemaining(sec);
                }}
                style={[s.chip, restPreset === sec && { backgroundColor: C.ink, borderColor: C.ink }]}
              >
                <Mono style={[restPreset === sec && { color: C.bg }]}>{fmtClock(sec)}</Mono>
              </Pressable>
            ))}
          </View>

          {/* Custom */}
          <View style={s.customRow}>
            <Mono>自定义</Mono>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginLeft: 'auto' }}>
              <Mono style={{ color: C.ink55 }}>分</Mono>
              <TextInput
                value={customMin}
                onChangeText={setCustomMin}
                keyboardType="number-pad"
                style={s.timeInput}
                maxLength={2}
              />
              <Mono style={{ color: C.ink55 }}>秒</Mono>
              <TextInput
                value={customSec}
                onChangeText={setCustomSec}
                keyboardType="number-pad"
                style={s.timeInput}
                maxLength={2}
              />
              <Pressable
                style={s.applyBtn}
                onPress={() => {
                  const sec = (Number(customMin) || 0) * 60 + (Number(customSec) || 0);
                  if (sec > 0) {
                    setRestPreset(sec);
                    setRestRemaining(sec);
                  }
                }}
              >
                <Mono>应用 ▸</Mono>
              </Pressable>
            </View>
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: C.ink12, marginTop: SP(4) }} />

        {/* Completed sets log */}
        <View style={{ paddingHorizontal: SP(5), paddingTop: SP(4) }}>
          <SectionLabel>已完成</SectionLabel>
          <View style={{ marginTop: SP(2) }}>
            {completed.length === 0 ? (
              <Mono style={{ color: C.ink35, paddingVertical: SP(3) }}>// 尚未记录</Mono>
            ) : (
              completed.map((set, i) => (
                <View key={i} style={s.doneRow}>
                  <Mono style={{ width: 28 }}>{pad2(i + 1)}</Mono>
                  <Mono style={{ width: 70 }}>{set.weight} kg</Mono>
                  <Mono style={{ width: 60 }}>{set.reps} 次</Mono>
                  {set.isPR ? <Mono style={{ color: C.accent }}>PR</Mono> : null}
                  <Text style={{ marginLeft: 'auto', color: C.ink, fontSize: FS.md }}>✓</Text>
                </View>
              ))
            )}
          </View>
        </View>

        {/* Action buttons */}
        <View style={s.bottomActions}>
          <Pressable style={s.secondaryBtn} onPress={() => {}}>
            <Mono>+ 备注</Mono>
          </Pressable>
          <Pressable
            style={[s.primaryBtn, completed.length >= totalSets && idx === library.length - 1 && { backgroundColor: C.accent, borderColor: C.accent }]}
            onPress={
              completed.length >= totalSets && idx === library.length - 1
                ? finish
                : completed.length >= totalSets
                ? goNext
                : recordSet
            }
          >
            <Text style={s.primaryBtnText}>
              {completed.length >= totalSets && idx === library.length - 1
                ? '完成训练  ▸'
                : completed.length >= totalSets
                ? '下一项目  ▸'
                : '记录本组  ▸'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function BigInput({ label, value, unit, onChangeText }) {
  return (
    <View style={{ flex: 1, paddingHorizontal: SP(4), paddingVertical: SP(3) }}>
      <Mono style={{ color: C.ink55 }}>// {label}</Mono>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={C.ink18}
          style={{
            fontFamily: F.doto,
            fontSize: FS.hero,
            color: C.ink,
            includeFontPadding: false,
            padding: 0,
            minWidth: 60,
          }}
        />
        {unit ? <Mono style={{ marginLeft: 4, marginBottom: 8, color: C.ink55 }}>{unit}</Mono> : null}
      </View>
    </View>
  );
}

function fmtTime(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(s)}`;
}
function fmtClock(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${pad2(m)}:${pad2(s)}`;
}
function pad2(n) { const v = Number(n) || 0; return v < 10 ? `0${v}` : `${v}`; }

function parseSetCount(target) {
  if (!target) return 4;
  const m = String(target).match(/(\d+)\s*[×xX*]/);
  return m ? Math.max(1, Number(m[1])) : 4;
}

function computePR(state, exerciseId) {
  let best = null;
  Object.values(state.history || {}).forEach((day) => {
    day.forEach((e) => {
      if (e.exerciseId !== exerciseId) return;
      (e.sets || []).forEach((s) => {
        const w = Number(s.weight) || 0;
        if (w > 0 && (best == null || w > best)) best = w;
      });
    });
  });
  return best;
}

const s = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SP(5),
    paddingTop: SP(3),
    paddingBottom: SP(3),
  },
  statusDot: { width: 8, height: 8, borderRadius: 0 },
  pauseBtn: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: SP(3),
    paddingVertical: 4,
  },
  exNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SP(3),
    paddingVertical: SP(4),
  },
  navBtn: { padding: SP(3) },
  exName: { color: C.ink, fontSize: FS.xl, fontWeight: '700', letterSpacing: 0.5 },
  setDots: {
    flexDirection: 'row',
    gap: 6,
    alignSelf: 'center',
    marginTop: 0,
    marginBottom: SP(2),
  },
  setDot: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: C.ink,
  },
  bigInputs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: C.ink12,
  },
  bigSep: { width: 1, backgroundColor: C.ink12 },
  setIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SP(5),
    paddingTop: SP(3),
  },
  quickRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: SP(5),
    paddingTop: SP(2),
  },
  quickCell: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: C.ink12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  restBlock: {
    paddingHorizontal: SP(5),
    paddingTop: SP(4),
  },
  restBtn: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: SP(4),
    paddingVertical: SP(2),
  },
  chipRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
    marginTop: SP(3),
  },
  chip: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  customRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SP(3),
    borderTopWidth: 1,
    borderTopColor: C.ink12,
    paddingTop: SP(3),
  },
  timeInput: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: 6,
    paddingVertical: 2,
    fontFamily: F.mono,
    width: 36,
    textAlign: 'center',
    color: C.ink,
  },
  applyBtn: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 4,
  },
  doneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: C.ink12,
    gap: 8,
  },
  bottomActions: {
    flexDirection: 'row',
    paddingHorizontal: SP(5),
    paddingTop: SP(5),
    gap: SP(3),
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: SP(4),
    paddingVertical: SP(3),
  },
  primaryBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.ink,
    backgroundColor: C.ink,
    paddingHorizontal: SP(4),
    paddingVertical: SP(3),
    alignItems: 'center',
  },
  primaryBtnText: { color: C.bg, fontFamily: F.mono, fontSize: FS.sm, letterSpacing: 0.5 },
});
