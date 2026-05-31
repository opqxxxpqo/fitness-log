import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { C, F, FS, SP } from '../theme';
import { Doto, Mono, SectionLabel } from '../components';
import ScreenHeader from '../components/ScreenHeader';
import { todayKey, dayStats, weekStats, streakDays, weekOfYear, monthCN } from '../storage';

export default function StatsScreen({ state }) {
  const today = new Date();
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });

  const weekly = weekStats(state, today);
  const streak = streakDays(state, today);

  // Build week-volume bar chart for the last 7 ISO weeks
  const weeks = useMemo(() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const ref = new Date(today);
      ref.setDate(ref.getDate() - i * 7);
      const w = weekStats(state, ref);
      arr.push({ label: `W${weekOfYear(ref)}`, value: w.kg });
    }
    return arr;
  }, [state, today]);

  const maxKg = Math.max(1, ...weeks.map((w) => w.value));
  const lastWeek = weeks[weeks.length - 1]?.value || 0;
  const prevWeek = weeks[weeks.length - 2]?.value || 0;
  const delta = prevWeek === 0 ? null : Math.round(((lastWeek - prevWeek) / prevWeek) * 100);

  // Build month calendar
  const cal = useMemo(() => buildMonth(cursor.year, cursor.month, state), [cursor, state]);

  // Recent training sessions
  const recent = useMemo(() => buildRecent(state, 6), [state]);

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader leftKicker="数据" leftMain={`${monthCN(today)} · ${pad2(today.getDate())}`} />
      <ScrollView contentContainerStyle={{ paddingHorizontal: SP(5), paddingBottom: SP(8) }}>
        {/* Three big stats */}
        <View style={s.statsRow}>
          <StatCell value={pad2(weekly.reps)} label="次数" />
          <View style={s.sep} />
          <StatCell value={(weekly.tons || 0).toFixed(1)} label="容量(t)" />
          <View style={s.sep} />
          <StatCell value={pad2(streak)} label="连续(天)" />
        </View>

        {/* Training calendar */}
        <View style={{ marginTop: SP(6) }}>
          <SectionLabel
            right={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Pressable onPress={() => shiftMonth(cursor, setCursor, -1)} hitSlop={8}>
                  <Mono>←</Mono>
                </Pressable>
                <Mono>
                  {cursor.month}月 · {cursor.month + 1}月 · {cursor.month + 2 > 11 ? 1 : cursor.month + 2}月
                </Mono>
                <Pressable onPress={() => shiftMonth(cursor, setCursor, 1)} hitSlop={8}>
                  <Mono>→</Mono>
                </Pressable>
              </View>
            }
          >
            训练日历
          </SectionLabel>

          <View style={s.calWrap}>
            <View style={s.calHead}>
              <View style={{ width: 28 }} />
              {['一', '二', '三', '四', '五', '六', '日'].map((d) => (
                <Text key={d} style={s.calHeadCell}>
                  {d}
                </Text>
              ))}
            </View>
            {cal.weeks.map((w) => (
              <View key={w.weekNum} style={s.calRow}>
                <View style={{ width: 28 }}>
                  <Mono style={{ color: C.ink55, fontSize: FS.micro }}>W{w.weekNum}</Mono>
                </View>
                {w.days.map((d, i) => (
                  <View key={i} style={s.calCellWrap}>
                    {d ? (
                      <View
                        style={[
                          s.calCell,
                          d.intensity === 3 && { backgroundColor: C.ink },
                          d.intensity === 2 && { backgroundColor: C.ink, opacity: 0.6 },
                          d.intensity === 1 && { backgroundColor: C.ink, opacity: 0.25 },
                          d.isToday && { borderColor: C.accent, borderWidth: 2 },
                        ]}
                      >
                        <Text style={[s.calDay, d.intensity >= 2 && { color: C.bg }]}>{d.day}</Text>
                      </View>
                    ) : (
                      <View style={s.calCellEmpty} />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>

        {/* Weekly volume bar chart */}
        <View style={{ marginTop: SP(6) }}>
          <SectionLabel right={delta == null ? '—' : `Δ ${delta > 0 ? '+' : ''}${delta}%`}>
            周容量 (kg)
          </SectionLabel>
          <View style={s.chart}>
            {weeks.map((w, idx) => {
              const h = (w.value / maxKg) * 80;
              return (
                <View key={idx} style={s.chartCol}>
                  <View style={s.chartBarWrap}>
                    <View style={[s.chartBar, { height: Math.max(2, h) }]} />
                  </View>
                  <Mono style={{ color: C.ink55, marginTop: 6 }}>{w.label}</Mono>
                </View>
              );
            })}
          </View>
        </View>

        {/* Recent */}
        <View style={{ marginTop: SP(6) }}>
          <SectionLabel>最近</SectionLabel>
          <View style={{ marginTop: SP(2) }}>
            {recent.length === 0 ? (
              <Mono style={{ color: C.ink35, paddingVertical: SP(4) }}>// 暂无记录</Mono>
            ) : (
              recent.map((r) => (
                <View key={r.key} style={s.recentRow}>
                  <Text style={s.recentDate}>
                    {r.weekday} {pad2(r.day)}
                  </Text>
                  <Text style={s.recentDesc}>
                    {r.group || '训练'} · {r.minutes} 分
                  </Text>
                  <Mono>{r.tons}t</Mono>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function shiftMonth(cursor, setCursor, delta) {
  let m = cursor.month + delta;
  let y = cursor.year;
  if (m < 0) { m = 11; y--; }
  if (m > 11) { m = 0; y++; }
  setCursor({ year: y, month: m });
}

function StatCell({ value, label }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Doto size={FS.hero}>{value}</Doto>
      <Text style={{ fontFamily: F.mono, fontSize: FS.xs, color: C.ink55, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function pad2(n) { return n < 10 ? `0${n}` : `${n}`; }

function buildMonth(year, month, state) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  const startOffset = (first.getDay() + 6) % 7; // Monday-based
  const total = last.getDate();
  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) {
    const date = new Date(year, month, d);
    const key = todayKey(date);
    const ds = dayStats(state, key);
    const intensity =
      ds.sets === 0 ? 0 : ds.sets <= 8 ? 1 : ds.sets <= 16 ? 2 : 3;
    cells.push({
      day: d,
      key,
      intensity,
      isToday: key === todayKey(),
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    const ref = new Date(year, month, Math.max(1, i + 1 - startOffset));
    weeks.push({ weekNum: weekOfYear(ref), days: cells.slice(i, i + 7) });
  }
  return { weeks };
}

function buildRecent(state, limit) {
  const keys = Object.keys(state.history || {}).sort().reverse();
  const out = [];
  for (const key of keys) {
    const entries = state.history[key];
    if (!entries || entries.length === 0) continue;
    const ds = dayStats(state, key);
    const [y, m, d] = key.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const groups = [...new Set(entries.map((e) => e.group).filter(Boolean))].join('/');
    out.push({
      key,
      weekday: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()],
      day: d,
      group: groups,
      minutes: ds.minutes,
      tons: +(ds.kg / 1000).toFixed(1),
    });
    if (out.length >= limit) break;
  }
  return out;
}

const s = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingVertical: SP(3),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.ink12,
  },
  sep: { width: 1, backgroundColor: C.ink12, height: 36 },
  calWrap: {
    marginTop: SP(3),
    borderWidth: 1,
    borderColor: C.ink,
    padding: SP(2),
  },
  calHead: { flexDirection: 'row', marginBottom: 4 },
  calHeadCell: {
    flex: 1,
    textAlign: 'center',
    fontFamily: F.mono,
    fontSize: FS.tiny,
    color: C.ink55,
  },
  calRow: { flexDirection: 'row', marginTop: 4, alignItems: 'center' },
  calCellWrap: { flex: 1, alignItems: 'center' },
  calCell: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: C.ink12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  calCellEmpty: { width: 28, height: 28 },
  calDay: { fontFamily: F.mono, fontSize: FS.tiny, color: C.ink },
  chart: {
    marginTop: SP(3),
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 110,
    borderBottomWidth: 1,
    borderBottomColor: C.ink,
    paddingHorizontal: 2,
  },
  chartCol: { flex: 1, alignItems: 'center' },
  chartBarWrap: { height: 90, justifyContent: 'flex-end' },
  chartBar: {
    width: 14,
    backgroundColor: C.ink,
  },
  recentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SP(3),
    borderBottomWidth: 1,
    borderBottomColor: C.ink12,
    gap: SP(3),
  },
  recentDate: { color: C.ink, fontSize: FS.sm, fontWeight: '700', width: 70 },
  recentDesc: { color: C.ink55, fontSize: FS.sm, flex: 1 },
});
