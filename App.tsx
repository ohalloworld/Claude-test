import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import HistoryScreen from './src/HistoryScreen';
import HomeScreen from './src/HomeScreen';
import ProfileScreen from './src/ProfileScreen';
import { useEvents } from './src/useEvents';
import { useProfile } from './src/useProfile';

type Tab = 'home' | 'history' | 'profile';

export default function App() {
  const [tab, setTab] = useState<Tab>('home');
  const { events, loaded: eventsLoaded, homeStats, logEvent, deleteEvent, updateEventTime } = useEvents();
  const {
    profile,
    loaded: profileLoaded,
    ageWeeks,
    thresholds,
    setDateOfBirth,
    setThresholdOverride,
  } = useProfile();

  const loaded = eventsLoaded && profileLoaded;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        {!loaded ? (
          <View style={styles.loading}>
            <Text>Loading…</Text>
          </View>
        ) : tab === 'home' ? (
          <HomeScreen
            stats={homeStats}
            thresholds={thresholds}
            dateOfBirth={profile.dateOfBirth}
            logEvent={logEvent}
            deleteEvent={deleteEvent}
            onOpenProfile={() => setTab('profile')}
          />
        ) : tab === 'history' ? (
          <HistoryScreen events={events} deleteEvent={deleteEvent} updateEventTime={updateEventTime} />
        ) : (
          <ProfileScreen
            dateOfBirth={profile.dateOfBirth}
            ageWeeks={ageWeeks}
            thresholds={thresholds}
            overrides={profile.thresholdOverrides}
            onSetDateOfBirth={setDateOfBirth}
            onSetThresholdOverride={setThresholdOverride}
          />
        )}
      </View>

      <View style={styles.tabBar}>
        <TabButton label="🏠 Home" active={tab === 'home'} onPress={() => setTab('home')} />
        <TabButton label="📋 History" active={tab === 'history'} onPress={() => setTab('history')} />
        <TabButton label="👶 Profile" active={tab === 'profile'} onPress={() => setTab('profile')} />
      </View>

      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2FA',
  },
  screen: {
    flex: 1,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#CAC4D0',
    backgroundColor: '#FFFFFF',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 14,
    color: '#79747E',
  },
  tabLabelActive: {
    color: '#6650A4',
    fontWeight: '700',
  },
});
