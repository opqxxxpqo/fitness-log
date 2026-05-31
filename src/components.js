import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { C, F, FS, SP } from './theme';

// Section header like "// 计划"
export function SectionLabel({ children, right, style }) {
  return (
    <View style={[styles.row, { justifyContent: 'space-between', alignItems: 'center' }, style]}>
      <Text style={styles.sectionLabel}>// {children}</Text>
      {right ? (typeof right === 'string' ? <Text style={styles.sectionRight}>{right}</Text> : right) : null}
    </View>
  );
}

// A bordered, square block — used for cards, list items
export function Block({ children, style, ...rest }) {
  return (
    <View style={[styles.block, style]} {...rest}>
      {children}
    </View>
  );
}

// Mono label
export function Mono({ children, style, size }) {
  return <Text style={[styles.mono, size != null && { fontSize: size }, style]}>{children}</Text>;
}

// Big pixel number (Doto)
export function Doto({ children, style, size = FS.hero }) {
  return <Text style={[styles.doto, { fontSize: size }, style]}>{children}</Text>;
}

// Primary CTA — full-width bordered button with arrow
export function CTA({ label, onPress, style, accent }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cta,
        accent && styles.ctaAccent,
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Text style={[styles.ctaText, accent && { color: C.bg }]}>{label}</Text>
    </Pressable>
  );
}

// Small bordered chip
export function Chip({ label, active, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && { backgroundColor: C.ink, borderColor: C.ink },
        pressed && { opacity: 0.7 },
        style,
      ]}
    >
      <Text style={[styles.chipText, active && { color: C.bg }]}>{label}</Text>
    </Pressable>
  );
}

// Divider used between sections
export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// HStack / VStack tiny helpers
export function Row({ children, style, gap = 0, ...rest }) {
  return <View style={[{ flexDirection: 'row', gap }, style]} {...rest}>{children}</View>;
}
export function Col({ children, style, gap = 0, ...rest }) {
  return <View style={[{ flexDirection: 'column', gap }, style]} {...rest}>{children}</View>;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  sectionLabel: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    letterSpacing: 0.5,
  },
  sectionRight: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink55,
    letterSpacing: 0.5,
  },
  block: {
    backgroundColor: C.bg,
    borderColor: C.ink,
    borderWidth: 1,
  },
  mono: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink,
    letterSpacing: 0.3,
  },
  doto: {
    fontFamily: F.doto,
    color: C.ink,
    includeFontPadding: false,
    fontWeight: '700',
    letterSpacing: -1,
  },
  cta: {
    paddingVertical: SP(4),
    paddingHorizontal: SP(4),
    backgroundColor: C.bg,
    borderColor: C.ink,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaAccent: {
    backgroundColor: C.ink,
    borderColor: C.ink,
  },
  ctaText: {
    color: C.ink,
    fontFamily: F.mono,
    fontSize: FS.sm,
    letterSpacing: 1,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: C.ink,
    backgroundColor: C.bg,
  },
  chipText: {
    fontFamily: F.mono,
    fontSize: FS.xs,
    color: C.ink,
    letterSpacing: 0.5,
  },
  divider: {
    height: 1,
    backgroundColor: C.ink12,
  },
});

export const T = StyleSheet.create({
  body: { color: C.ink, fontSize: FS.sm },
  bodyDim: { color: C.ink55, fontSize: FS.sm },
  small: { color: C.ink55, fontSize: FS.xs, fontFamily: F.mono, letterSpacing: 0.5 },
  h: { color: C.ink, fontSize: FS.md, fontWeight: '700' },
});
