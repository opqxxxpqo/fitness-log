import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { C, F, FS, SP } from '../theme';
import { Doto, CTA, SectionLabel } from '../components';
import ScreenHeader from '../components/ScreenHeader';

export default function WorkScreen({ state, mutateState }) {
  const library = state.library || [];
  const [editing, setEditing] = useState(null);

  // Stats for the title card
  const totalSets = useMemo(
    () => library.reduce((a, l) => a + parseSets(l.target), 0),
    [library]
  );
  const groups = useMemo(
    () => [...new Set(library.map((l) => l.group).filter(Boolean))],
    [library]
  );

  // Bucket by body part (preserving original order within each group)
  const grouped = useMemo(() => {
    const buckets = new Map();
    library.forEach((ex) => {
      const k = ex.group || '其它';
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k).push(ex);
    });
    return [...buckets.entries()];
  }, [library]);

  const onSave = (data) => {
    mutateState((next) => {
      const lib = [...(next.library || [])];
      if (data.id) {
        const i = lib.findIndex((x) => x.id === data.id);
        if (i >= 0) lib[i] = data;
      } else {
        lib.push({ ...data, id: `lib-${Date.now()}` });
      }
      next.library = lib;
      return next;
    });
    setEditing(null);
  };

  const onDelete = (id) => {
    mutateState((next) => {
      next.library = (next.library || []).filter((x) => x.id !== id);
      return next;
    });
    setEditing(null);
  };

  return (
    <View style={s.root}>
      <ScreenHeader leftKicker="训练库" leftMain="WORK" />

      {/* === Title card with KPIs === */}
      <View style={s.card}>
        <View style={s.cardTop}>
          <View style={{ flex: 1 }}>
            <Text style={s.cardKicker}>训练库</Text>
            <Text style={s.cardTitle}>{library.length > 0 ? '我的项目' : '空库'}</Text>
          </View>
          <View style={s.tagBox}>
            <Text style={s.tagBoxTop}>LIB</Text>
            <Text style={s.tagBoxBot}>{padN(library.length, 2)}</Text>
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
          <StatCell value={library.length ? padN(library.length, 2) : '——'} label="项目" />
          <View style={s.statSep} />
          <StatCell value={library.length ? padN(totalSets, 2) : '——'} label="总组数" />
          <View style={s.statSep} />
          <StatCell value={library.length ? padN(groups.length, 2) : '——'} label="部位" />
        </View>
      </View>

      {/* === Grouped list === */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={s.listScroll}
        showsVerticalScrollIndicator={false}
      >
        {library.length === 0 ? (
          <EmptyState />
        ) : (
          grouped.map(([gname, items], gi) => (
            <View key={gname} style={{ marginTop: gi === 0 ? SP(4) : SP(5) }}>
              <SectionLabel right={padN(items.length, 2)}>{gname}</SectionLabel>
              <View style={{ marginTop: SP(2) }}>
                {items.map((ex, i) => (
                  <Pressable
                    key={ex.id}
                    accessibilityRole="button"
                    accessibilityLabel={`编辑 ${ex.name}`}
                    onPress={() => setEditing(ex)}
                    style={({ pressed }) => [s.row, pressed && { backgroundColor: C.ink06 }]}
                  >
                    <Text style={s.idx}>{padN(i + 1, 2)}</Text>
                    <View style={{ flex: 1, marginRight: SP(2) }}>
                      <Text numberOfLines={1} style={s.name}>{ex.name}</Text>
                      <Text style={s.meta}>
                        {ex.target}
                        {ex.rest ? `  ·  休 ${ex.rest}s` : ''}
                      </Text>
                    </View>
                    <View style={s.editChip}>
                      <Text style={s.editChipText}>编辑</Text>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          ))
        )}
        {/* spacer so CTA never overlaps */}
        <View style={{ height: SP(4) }} />
      </ScrollView>

      {/* === Pinned add button === */}
      <View style={s.ctaBar}>
        <CTA accent label="+  新增项目  ▸" onPress={() => setEditing({})} style={s.ctaButton} />
      </View>

      {editing != null && (
        <ExerciseEditor
          initial={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
          onDelete={editing.id ? () => onDelete(editing.id) : null}
        />
      )}
    </View>
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
      <Text style={s.emptyHint}>点击下方"新增项目"加入第一个训练动作</Text>
    </View>
  );
}

function ExerciseEditor({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial.name || '');
  const [target, setTarget] = useState(initial.target || '4 × 8');
  const [group, setGroup] = useState(initial.group || '');
  const [rest, setRest] = useState(String(initial.rest || 90));

  const submit = () => {
    if (!name.trim()) return;
    onSave({
      id: initial.id,
      name: name.trim(),
      target: target.trim() || '4 × 8',
      group: group.trim(),
      rest: Number(rest) || 90,
    });
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onClose}>
      <Pressable style={s.scrim} onPress={onClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ width: '100%' }}
        >
          {/* Stop propagation: tapping the sheet shouldn't close */}
          <Pressable onPress={() => {}} style={s.sheet}>
            <View style={s.sheetGrabber} />
            <View style={s.sheetHeader}>
              <Text style={s.sheetTitle}>
                {initial.id ? '// 编辑项目' : '// 新增项目'}
              </Text>
              <Pressable onPress={onClose} hitSlop={8}>
                <Text style={s.closeBtn}>关闭 ✕</Text>
              </Pressable>
            </View>

            <View style={{ paddingHorizontal: SP(5), paddingTop: SP(3) }}>
              <Field label="项目名" value={name} onChangeText={setName} placeholder="如 杠铃卧推" autoFocus />
              <View style={{ flexDirection: 'row', gap: SP(3) }}>
                <View style={{ flex: 1 }}>
                  <Field label="组 × 次" value={target} onChangeText={setTarget} placeholder="如 4 × 8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="休息 (秒)" value={rest} onChangeText={setRest} keyboardType="number-pad" />
                </View>
              </View>
              <Field label="部位" value={group} onChangeText={setGroup} placeholder="胸 / 肩 / 背 …" />

              <View style={{ marginTop: SP(4) }}>
                <CTA accent label={initial.id ? '保存修改  ▸' : '加入训练库  ▸'} onPress={submit} />
              </View>
              {onDelete && (
                <Pressable
                  onPress={onDelete}
                  style={({ pressed }) => [s.deleteBtn, pressed && { opacity: 0.6 }]}
                  accessibilityRole="button"
                  accessibilityLabel="删除该项目"
                >
                  <Text style={s.deleteText}>删除该项目</Text>
                </Pressable>
              )}
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

function Field({ label, value, onChangeText, ...rest }) {
  return (
    <View style={{ marginBottom: SP(3) }}>
      <Text style={s.fieldLabel}>// {label}</Text>
      <TextInput
        value={String(value)}
        onChangeText={onChangeText}
        style={s.input}
        placeholderTextColor={C.ink35}
        {...rest}
      />
    </View>
  );
}

function padN(n, w) {
  const v = Number(n) || 0;
  return String(v).padStart(w, '0');
}
function parseSets(target) {
  if (!target) return 0;
  const m = String(target).match(/(\d+)\s*[×xX*]/);
  return m ? Number(m[1]) : 0;
}

const s = StyleSheet.create({
  root: { flex: 1 },

  // Title card (mirrors Today.js card)
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
    letterSpacing: 1,
  },
  tagBoxBot: {
    fontFamily: F.mono,
    fontSize: FS.micro,
    color: C.ink55,
    letterSpacing: 1.2,
    marginTop: 1,
  },

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
  },

  bigStats: {
    marginTop: SP(4),
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: C.ink18,
    paddingTop: SP(3),
  },
  statCell: { flex: 1, alignItems: 'center' },
  statSep: { width: 1, height: 52, backgroundColor: C.ink18 },
  statLabel: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    marginTop: 4,
    letterSpacing: 0.6,
  },

  // List
  listScroll: {
    paddingHorizontal: SP(5),
    paddingBottom: SP(4),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SP(3) + 2,
    borderBottomWidth: 1,
    borderBottomColor: C.ink18,
    gap: SP(2),
  },
  idx: {
    width: 30,
    fontFamily: F.mono,
    fontSize: FS.sm,
    color: C.ink55,
    letterSpacing: 0.4,
  },
  name: {
    color: C.ink,
    fontSize: FS.md,
    fontWeight: '600',
    letterSpacing: -0.1,
  },
  meta: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    marginTop: 3,
    letterSpacing: 0.4,
  },
  editChip: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: SP(3),
    paddingVertical: 6,
    minWidth: 64,
    alignItems: 'center',
  },
  editChipText: {
    fontFamily: F.mono,
    fontSize: FS.sm,
    color: C.ink,
    letterSpacing: 0.5,
  },

  emptyState: {
    paddingTop: SP(10),
    alignItems: 'center',
    gap: 8,
  },
  emptyKicker: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    letterSpacing: 0.6,
  },
  emptyHint: { color: C.ink, fontSize: FS.sm, textAlign: 'center', paddingHorizontal: SP(5) },

  ctaBar: {
    paddingHorizontal: SP(5),
    paddingTop: SP(2),
    paddingBottom: SP(2),
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.ink18,
  },
  ctaButton: { paddingVertical: SP(4) },

  // Bottom-sheet editor
  scrim: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.35)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: C.bg,
    borderTopWidth: 1,
    borderTopColor: C.ink,
    paddingTop: SP(2),
    paddingBottom: SP(5),
  },
  sheetGrabber: {
    width: 36,
    height: 3,
    backgroundColor: C.ink18,
    alignSelf: 'center',
    marginBottom: SP(2),
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SP(5),
    paddingVertical: SP(2),
    borderBottomWidth: 1,
    borderBottomColor: C.ink18,
  },
  sheetTitle: {
    fontFamily: F.mono,
    fontSize: FS.sm,
    color: C.ink,
    letterSpacing: 0.5,
    fontWeight: '700',
  },
  closeBtn: {
    fontFamily: F.mono,
    color: C.ink55,
    fontSize: FS.sm,
    letterSpacing: 0.5,
  },
  fieldLabel: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    marginBottom: 6,
    letterSpacing: 0.6,
  },
  input: {
    borderWidth: 1,
    borderColor: C.ink,
    paddingHorizontal: SP(3),
    paddingVertical: SP(3),
    color: C.ink,
    fontSize: FS.md,
    fontFamily: F.mono,
  },
  deleteBtn: {
    marginTop: SP(4),
    alignSelf: 'center',
    paddingVertical: SP(2),
    paddingHorizontal: SP(3),
  },
  deleteText: {
    color: C.accent,
    fontFamily: F.mono,
    fontSize: FS.sm,
    letterSpacing: 0.5,
  },
});
