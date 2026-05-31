import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Pressable, SafeAreaView, Platform } from 'react-native';
import * as Font from 'expo-font';
import { C, F, FS, SP } from './src/theme';
import { loadState, saveState } from './src/storage';
import TodayScreen from './src/screens/Today';
import WorkScreen from './src/screens/Work';
import StatsScreen from './src/screens/Stats';
import MeScreen from './src/screens/Me';
import WorkoutScreen from './src/screens/Workout';

const TABS = [
  { key: 'today', label: 'TODAY' },
  { key: 'work', label: 'WORK' },
  { key: 'stats', label: 'STATS' },
  { key: 'me', label: 'ME' },
];

export default function App() {
  const [tab, setTab] = useState('today');
  const [state, setState] = useState(null);
  const [fontsReady, setFontsReady] = useState(false);
  // Modal-ish overlay for the active workout flow
  const [workoutFor, setWorkoutFor] = useState(null); // exerciseId

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          JetBrainsMono: require('./assets/fonts/JetBrainsMono-Regular.ttf'),
          Doto: require('./assets/fonts/Doto-Bold.ttf'),
          VT323: require('./assets/fonts/VT323-Regular.ttf'),
        });
      } catch (e) {
        // If a font file is missing we still proceed — system fonts will substitute
      }
      setFontsReady(true);
      const s = await loadState();
      setState(s);
    })();
  }, []);

  const mutateState = useCallback(async (mutator) => {
    setState((prev) => {
      const next = mutator({ ...prev });
      // fire and forget persist
      saveState(next);
      return next;
    });
  }, []);

  if (!fontsReady || !state) {
    return (
      <View style={[styles.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={styles.boot}>// loading</Text>
      </View>
    );
  }

  if (workoutFor) {
    return (
      <WorkoutScreen
        state={state}
        mutateState={mutateState}
        exerciseId={workoutFor}
        onExit={() => setWorkoutFor(null)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <View style={styles.content}>
        {tab === 'today' && (
          <TodayScreen
            state={state}
            mutateState={mutateState}
            onStart={(id) => setWorkoutFor(id)}
          />
        )}
        {tab === 'work' && <WorkScreen state={state} mutateState={mutateState} />}
        {tab === 'stats' && <StatsScreen state={state} />}
        {tab === 'me' && <MeScreen state={state} mutateState={mutateState} />}
      </View>
      <View style={styles.tabbar}>
        {TABS.map((t) => {
          const active = t.key === tab;
          return (
            <Pressable
              key={t.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={t.label}
              style={({ pressed }) => [
                styles.tab,
                pressed && { backgroundColor: C.ink06 },
              ]}
              onPress={() => setTab(t.key)}
            >
              <View style={[styles.tabMark, active && styles.tabMarkActive]} />
              <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  content: { flex: 1 },
  boot: { color: C.ink55, fontFamily: F.mono, fontSize: FS.sm },
  tabbar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: C.ink,
    backgroundColor: C.bg,
    paddingHorizontal: SP(1),
    paddingTop: 0,
    paddingBottom: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    paddingBottom: 6,
    gap: 3,
  },
  // The active accent stripe — sits flush with the tab-bar top border
  tabMark: {
    width: 32,
    height: 2,
    backgroundColor: 'transparent',
    marginTop: 0,
  },
  tabMarkActive: {
    backgroundColor: C.accent,
  },
  tabLabel: {
    fontFamily: F.mono,
    color: C.ink55,
    fontSize: FS.xs,
    letterSpacing: 1.6,
  },
  tabLabelActive: {
    color: C.ink,
    fontWeight: '700',
  },
});
