import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { C, F, FS, SP } from '../theme';
import { dateLabel, weekdayCN, weekOfYear } from '../storage';

// Header used at the top of each tab: e.g. "// 05.18 / 周一" and right-side "第 21 周 / 2026·05"
export default function ScreenHeader({ leftKicker, leftMain, rightTop, rightBottom }) {
  const now = new Date();
  const week = weekOfYear(now);
  return (
    <View style={s.wrap}>
      <View>
        <Text style={s.kicker}>// {leftKicker || dateLabel(now)}</Text>
        <Text style={s.main}>{leftMain || weekdayCN(now)}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={s.right}>{rightTop || `第 ${week} 周`}</Text>
        <Text style={s.right}>{rightBottom || `${now.getFullYear()}·${String(now.getMonth() + 1).padStart(2, '0')}`}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: SP(5),
    paddingTop: SP(4),
    paddingBottom: SP(3),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  kicker: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  main: {
    color: C.ink,
    fontSize: FS.xl,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  right: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    textAlign: 'right',
    letterSpacing: 0.5,
  },
});
