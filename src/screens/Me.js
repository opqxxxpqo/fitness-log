import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { C, F, FS, SP } from '../theme';
import { Doto, Mono, SectionLabel } from '../components';
import ScreenHeader from '../components/ScreenHeader';
import { totals } from '../storage';

export default function MeScreen({ state, mutateState }) {
  const t = totals(state);
  const profile = state.profile || {};
  const goals = state.goals || [];

  return (
    <View style={{ flex: 1 }}>
      <ScreenHeader leftKicker="个人" leftMain="我" />
      <ScrollView contentContainerStyle={{ paddingHorizontal: SP(5), paddingBottom: SP(8) }}>
        {/* User card */}
        <View style={s.userCard}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{(profile.name || '我').slice(0, 1)}</Text>
            <View style={s.lvBadge}>
              <Mono style={{ fontSize: FS.micro, color: C.bg }}>LV.{profile.level || 1}</Mono>
            </View>
          </View>
          <View style={{ flex: 1, marginLeft: SP(4) }}>
            <Text style={s.name}>{profile.name || '未命名'}</Text>
            <Mono style={{ color: C.ink55, marginTop: 4 }}>
              会员 · {daysSinceJoin(profile.joinedAt)} 天
            </Mono>
            <Mono style={{ color: C.ink55, marginTop: 2 }}>目标 · {profile.goal || '增肌'}</Mono>
          </View>
        </View>

        {/* Cumulative */}
        <View style={{ marginTop: SP(5) }}>
          <SectionLabel>累计</SectionLabel>
          <View style={s.totalsGrid}>
            <TotalCell value={pad3(t.sessions)} label="总训练次数" />
            <TotalCell value={pad3(t.hours)} label="总时长 (h)" />
            <TotalCell value={(t.kg / 1e6).toFixed(2)} label="百万 kg" />
            <TotalCell value={pad2(t.prs)} label="历史 PR" />
          </View>
        </View>

        {/* Goals */}
        <View style={{ marginTop: SP(5) }}>
          <SectionLabel>目标</SectionLabel>
          <View style={{ marginTop: SP(2) }}>
            {goals.map((g) => {
              const pct = g.target ? Math.min(100, Math.round((g.current / g.target) * 100)) : 0;
              return (
                <View key={g.id} style={{ marginTop: SP(3) }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={s.goalLabel}>{g.label} · {g.target}{g.unit || ''}</Text>
                    <Mono>{pct}%</Mono>
                  </View>
                  <ProgressBar pct={pct} />
                </View>
              );
            })}
            <View style={{ marginTop: SP(3) }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={s.goalLabel}>每周 {profile.weeklyTarget || 4} 练</Text>
                <Mono>{computeWeekProgress(state, profile.weeklyTarget || 4)}%</Mono>
              </View>
              <ProgressBar pct={computeWeekProgress(state, profile.weeklyTarget || 4)} />
            </View>
          </View>
        </View>

        {/* Settings */}
        <View style={{ marginTop: SP(5) }}>
          <SettingsRow label="器械" value={`已存 ${(state.library || []).length}`} />
          <SettingsRow label="单位" value="kg · cm" />
          <SettingsRow label="同步" value="Healthkit" />
          <SettingsRow
            label="清空数据"
            value=""
            danger
            onPress={() => {
              Alert.alert('清空所有训练历史？', '此操作不可撤销', [
                { text: '取消', style: 'cancel' },
                {
                  text: '清空',
                  style: 'destructive',
                  onPress: () => mutateState((next) => ({ ...next, history: {} })),
                },
              ]);
            }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

function TotalCell({ value, label }) {
  return (
    <View style={s.totalCell}>
      <Doto size={FS.xxl}>{value}</Doto>
      <Mono style={{ color: C.ink55, marginTop: 4 }}>{label}</Mono>
    </View>
  );
}

function ProgressBar({ pct }) {
  const cells = 26;
  const filled = Math.round((pct / 100) * cells);
  return (
    <View style={s.bar}>
      {Array.from({ length: cells }).map((_, i) => (
        <View key={i} style={[s.barCell, i < filled && { backgroundColor: C.ink }]} />
      ))}
    </View>
  );
}

function SettingsRow({ label, value, danger, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        s.settingsRow,
        pressed && { backgroundColor: C.ink06 },
      ]}
    >
      <Text style={[s.settingsLabel, danger && { color: C.accent }]}>{label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value ? <Mono style={{ color: C.ink55 }}>{value}</Mono> : null}
        <Text style={{ color: C.ink55, fontSize: FS.lg }}>›</Text>
      </View>
    </Pressable>
  );
}

function daysSinceJoin(t) {
  if (!t) return 1;
  const days = Math.max(1, Math.round((Date.now() - t) / 86400000));
  return days;
}

function pad2(n) { return Number(n) < 10 ? `0${Number(n)}` : `${Number(n)}`; }
function pad3(n) {
  const v = Number(n) || 0;
  return v < 10 ? `00${v}` : v < 100 ? `0${v}` : `${v}`;
}

function computeWeekProgress(state, target) {
  const ref = new Date();
  const start = new Date(ref);
  start.setDate(ref.getDate() - ((ref.getDay() + 6) % 7));
  start.setHours(0, 0, 0, 0);
  let count = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if ((state.history[key] || []).length) count++;
  }
  return Math.min(100, Math.round((count / target) * 100));
}

const s = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SP(4),
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.ink12,
  },
  avatar: {
    width: 64,
    height: 64,
    backgroundColor: C.ink,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: { color: C.bg, fontSize: FS.xxl, fontWeight: '700' },
  lvBadge: {
    position: 'absolute',
    bottom: -6,
    right: -6,
    backgroundColor: C.accent,
    paddingHorizontal: 4,
    paddingVertical: 1,
  },
  name: { color: C.ink, fontSize: FS.xl, fontWeight: '700', letterSpacing: 1 },
  totalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: SP(3),
    borderTopWidth: 1,
    borderColor: C.ink12,
  },
  totalCell: {
    width: '50%',
    paddingVertical: SP(3),
    paddingHorizontal: SP(2),
    borderBottomWidth: 1,
    borderColor: C.ink12,
  },
  goalLabel: { color: C.ink, fontSize: FS.sm, fontWeight: '600' },
  bar: { flexDirection: 'row', gap: 2, marginTop: 6 },
  barCell: { flex: 1, height: 8, borderWidth: 1, borderColor: C.ink12 },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SP(3),
    borderBottomWidth: 1,
    borderBottomColor: C.ink12,
  },
  settingsLabel: { color: C.ink, fontSize: FS.md, fontWeight: '500' },
});
