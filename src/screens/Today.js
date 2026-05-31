import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { C, F, FS, SP } from '../theme';
import { Doto, Mono, SectionLabel, CTA } from '../components';
import ScreenHeader from '../components/ScreenHeader';
import { dayStats, todayKey } from '../storage';

export default function TodayScreen({ state, onStart }) {
  const library = state.library || [];
  const stats = dayStats(state, todayKey());
  const todayEntries = state.history[todayKey()] || [];
  const completedIds = useMemo(
    () => new Set(todayEntries.map((e) => e.exerciseId)),
    [todayEntries]
  );
  const nextIdx = library.findIndex((l) => !completedIds.has(l.id));

  // Groups deduped from library
  const groups = useMemo(
    () => [...new Set(library.map((l) => l.group).filter(Boolean))],
    [library]
  );

  // Totals
  const totalSets = useMemo(
    () => library.reduce((a, l) => a + parseSets(l.target), 0),
    [library]
  );
  const minutes = stats.minutes || estimatedMinutes(library);

  const hasLibrary = library.length > 0;
  const hasSession = library[nextIdx] != null;

  const doneCount = library.filter((l) => completedIds.has(l.id)).length;

  return (
    <View style={s.root}>
      <ScreenHeader />

      {/* === Fixed title card === */}
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardKicker}>今日训练</Text>
            <Text style={s.cardTitle}>推 训练日</Text>
          </View>
          <View style={s.tagBox}>
            <Text style={s.tagBoxTop}>推</Text>
            <Text style={s.tagBoxBot}>训练日</Text>
          </View>
        </View>

        <View style={s.groupRow}>
          {groups.length === 0 ? (
            <Text style={s.emptyTag}>未指定部位</Text>
          ) : (
            groups.map((g) => (
              <View key={g} style={s.groupChip}>
                <Text style={s.groupChipText}>{g}</Text>
              </View>
            ))
          )}
        </View>

        <View style={s.bigStats}>
          <StatCell value={hasLibrary ? pad2(library.length) : '——'} label="项目" />
          <View style={s.statSep} />
          <StatCell value={hasLibrary ? pad2(totalSets) : '——'} label="组数" />
          <View style={s.statSep} />
          <StatCell value={hasLibrary ? pad2(minutes) : '——'} label="分钟" />
        </View>
      </View>

      {/* === Scrollable plan list (only when overflow) === */}
      <View style={s.planWrap}>
        <SectionLabel right={hasLibrary ? `${pad2(doneCount)} / ${pad2(library.length)}` : null}>
          计划
        </SectionLabel>

        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingTop: SP(2), paddingBottom: SP(2) }}
          showsVerticalScrollIndicator={false}
        >
          {library.map((ex, idx) => {
            const isNext = idx === nextIdx;
            const isDone = completedIds.has(ex.id);
            return (
              <ExerciseRow
                key={ex.id}
                index={idx + 1}
                name={ex.name}
                target={ex.target}
                done={isDone}
                isNext={isNext}
                onPress={() => onStart(ex.id)}
              />
            );
          })}
          {!hasLibrary && <EmptyState />}
        </ScrollView>
      </View>

      {/* === Pinned CTA === */}
      {hasSession && (
        <View style={s.ctaBar}>
          <CTA
            accent
            label="开始训练  ▸"
            onPress={() => onStart(library[Math.max(0, nextIdx)].id)}
            style={s.ctaButton}
          />
        </View>
      )}
    </View>
  );
}

function ExerciseRow({ index, name, target, done, isNext, onPress }) {
  const a11y = `${pad2(index)} ${name}，${target}${done ? '，已完成' : isNext ? '，下一组' : ''}`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      style={({ pressed }) => [s.exRow, pressed && { backgroundColor: C.ink06 }]}
    >
      <Text style={s.exIdx}>{pad2(index)}</Text>
      <View style={{ flex: 1, marginRight: SP(2) }}>
        <Text
          numberOfLines={1}
          style={[s.exName, done && s.exNameDone]}
        >
          {name}
        </Text>
        <Text style={s.exTarget}>{target}</Text>
      </View>
      <View
        style={[
          s.exAction,
          isNext && s.exActionActive,
          done && s.exActionDone,
        ]}
      >
        <Text
          style={[
            s.exActionText,
            isNext && { color: C.bg },
            done && { color: C.ink35 },
          ]}
        >
          {done ? '✓' : isNext ? '开始' : '—'}
        </Text>
      </View>
    </Pressable>
  );
}

function StatCell({ value, label }) {
  return (
    <View style={s.statCell}>
      <Doto size={FS.hero}>{value}</Doto>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

function EmptyState() {
  return (
    <View style={s.emptyState}>
      <Text style={s.emptyKicker}>// 训练库为空</Text>
      <Text style={s.emptyHint}>在 WORK 标签页加入第一个项目</Text>
    </View>
  );
}

// ---------- helpers ----------
function pad2(n) {
  const v = Number(n) || 0;
  return v < 10 ? `0${v}` : `${v}`;
}
function parseSets(target) {
  if (!target) return 0;
  const m = String(target).match(/(\d+)\s*[×xX*]/);
  return m ? Number(m[1]) : 0;
}
function estimatedMinutes(library) {
  return library.reduce((a, l) => a + parseSets(l.target), 0) * 2;
}

// ---------- styles ----------
const s = StyleSheet.create({
  root: { flex: 1 },

  // Title card
  card: {
    marginHorizontal: SP(5),
    backgroundColor: C.bg,
    borderColor: C.ink,
    borderWidth: 1,
    padding: SP(4),
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: SP(3),
  },
  cardKicker: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  cardTitle: {
    color: C.ink,
    fontSize: FS.xxl,
    fontWeight: '800',
    letterSpacing: -0.6,
    lineHeight: FS.xxl + 4,
  },
  tagBox: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingVertical: 5,
    paddingHorizontal: 9,
    alignItems: 'center',
    minWidth: 48,
  },
  tagBoxTop: {
    fontFamily: F.mono,
    fontSize: FS.sm,
    color: C.ink,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagBoxBot: {
    fontFamily: F.mono,
    fontSize: FS.micro,
    color: C.ink55,
    letterSpacing: 1.2,
    marginTop: 1,
  },

  // Groups
  groupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: SP(3),
  },
  groupChip: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  groupChipText: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink,
    letterSpacing: 0.4,
  },
  emptyTag: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink35,
    letterSpacing: 0.4,
  },

  // KPI row
  bigStats: {
    marginTop: SP(4),
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: C.ink18,
    paddingTop: SP(3),
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statSep: {
    width: 1,
    height: 52,
    backgroundColor: C.ink18,
  },
  statLabel: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    marginTop: 4,
    letterSpacing: 0.6,
  },

  // Plan list — fills remaining space; inner ScrollView only scrolls when overflow
  planWrap: {
    flex: 1,
    paddingHorizontal: SP(5),
    paddingTop: SP(5),
  },
  exRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SP(3) + 2,
    borderBottomWidth: 1,
    borderBottomColor: C.ink18,
    gap: SP(2),
  },
  exIdx: {
    width: 30,
    fontFamily: F.mono,
    fontSize: FS.sm,
    color: C.ink55,
    letterSpacing: 0.4,
  },
  exName: {
    color: C.ink,
    fontSize: FS.md,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  exNameDone: {
    color: C.ink35,
    textDecorationLine: 'line-through',
  },
  exTarget: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    marginTop: 3,
    letterSpacing: 0.4,
  },
  exAction: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: SP(3),
    paddingVertical: 6,
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exActionActive: { backgroundColor: C.accent, borderColor: C.accent },
  exActionDone: { borderColor: C.ink12, backgroundColor: 'transparent' },
  exActionText: {
    fontFamily: F.mono,
    fontSize: FS.sm,
    color: C.ink,
    letterSpacing: 0.5,
  },

  // Empty state
  emptyState: {
    paddingVertical: SP(8),
    alignItems: 'center',
    gap: 6,
  },
  emptyKicker: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    letterSpacing: 0.6,
  },
  emptyHint: {
    color: C.ink,
    fontSize: FS.sm,
  },

  // CTA — pinned above the tab bar, never scrolls
  ctaBar: {
    paddingHorizontal: SP(5),
    paddingTop: SP(2),
    paddingBottom: SP(2),
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.ink18,
  },
  ctaButton: {
    paddingVertical: SP(4),
  },
});
