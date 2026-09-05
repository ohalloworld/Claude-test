import React, { useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { exportBackup, pickAndRestoreFileWeb } from './backup';
import { isFirebaseConfigured } from './firebase';
import { HouseholdResult } from './household';
import NumberField from './NumberField';
import { formatAge } from './profile';
import { defaultThresholdsForAge, Thresholds } from './thresholds';

interface Props {
  dateOfBirth: number | null;
  ageWeeks: number | null;
  thresholds: Thresholds;
  overrides: Partial<Thresholds>;
  painMedsPresets: string[];
  householdId: string | null;
  displayName: string;
  onSetDateOfBirth: (dateOfBirth: number | null) => void;
  onSetThresholdOverride: (key: keyof Thresholds, value: number | undefined) => void;
  onAddPainMedsPreset: (preset: string) => void;
  onRemovePainMedsPreset: (preset: string) => void;
  onSetDisplayName: (name: string) => void;
  onCreateHousehold: () => Promise<HouseholdResult>;
  onJoinHousehold: (code: string) => Promise<HouseholdResult>;
  onLeaveHousehold: () => void;
  onResetEverything: () => Promise<void>;
  onDataRestored: () => void;
}

export default function ProfileScreen({
  dateOfBirth,
  ageWeeks,
  thresholds,
  overrides,
  painMedsPresets,
  householdId,
  displayName,
  onSetDateOfBirth,
  onSetThresholdOverride,
  onAddPainMedsPreset,
  onRemovePainMedsPreset,
  onSetDisplayName,
  onCreateHousehold,
  onJoinHousehold,
  onLeaveHousehold,
  onResetEverything,
  onDataRestored,
}: Props) {
  const [newPreset, setNewPreset] = useState('');
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [nameInput, setNameInput] = useState(displayName);
  const [householdMessage, setHouseholdMessage] = useState<string | null>(null);
  const [householdBusy, setHouseholdBusy] = useState(false);
  const initial = useMemo(() => {
    const d = dateOfBirth ? new Date(dateOfBirth) : null;
    return {
      day: d ? d.getDate() : new Date().getDate(),
      month: d ? d.getMonth() + 1 : new Date().getMonth() + 1,
      year: d ? d.getFullYear() : new Date().getFullYear(),
    };
  }, [dateOfBirth]);

  const [day, setDay] = useState(initial.day);
  const [month, setMonth] = useState(initial.month);
  const [year, setYear] = useState(initial.year);

  // Re-sync if dateOfBirth changes from outside this screen's own edits
  // (e.g. a reset while this tab is open) — useState's initial value is
  // otherwise only applied once, on mount.
  React.useEffect(() => {
    setDay(initial.day);
    setMonth(initial.month);
    setYear(initial.year);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateOfBirth]);

  // Same staleness fix as the DOB fields above, applied to the name field.
  React.useEffect(() => {
    setNameInput(displayName);
  }, [displayName]);

  const applyDate = (nextDay: number, nextMonth: number, nextYear: number) => {
    const date = new Date(nextYear, nextMonth - 1, nextDay, 0, 0, 0, 0);
    onSetDateOfBirth(date.getTime());
  };

  const ageDefaults = defaultThresholdsForAge(ageWeeks);
  const firebaseReady = isFirebaseConfigured();

  const handleCreate = async () => {
    setHouseholdBusy(true);
    const result = await onCreateHousehold();
    setHouseholdMessage(result.message);
    setHouseholdBusy(false);
  };

  const handleJoin = async () => {
    if (!joinCodeInput.trim()) return;
    setHouseholdBusy(true);
    const result = await onJoinHousehold(joinCodeInput);
    setHouseholdMessage(result.message);
    setHouseholdBusy(false);
    if (result.ok) setJoinCodeInput('');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.heading}>Share with a Partner</Text>
      {!firebaseReady ? (
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>
            Sharing needs a one-time setup step (a free Firebase project) before it can be turned on.
            See the project README for exact steps.
          </Text>
        </View>
      ) : householdId ? (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linked</Text>
          <Text style={styles.sectionSubtitle}>Your invite code — share it with your partner too:</Text>
          <Text style={styles.inviteCode}>{householdId}</Text>

          <Text style={[styles.sectionSubtitle, { marginTop: 16 }]}>Your name (shown on entries you log)</Text>
          <View style={styles.addPresetRow}>
            <TextInput
              style={styles.addPresetInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Mum"
              onBlur={() => onSetDisplayName(nameInput)}
              onSubmitEditing={() => onSetDisplayName(nameInput)}
            />
          </View>

          <Pressable style={styles.unlinkButton} onPress={onLeaveHousehold}>
            <Text style={styles.link}>Unlink this device</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.section}>
          <Text style={styles.sectionSubtitle}>
            Link two devices to the same baby so entries logged on either one show up on both, in real
            time.
          </Text>

          <Text style={[styles.sectionSubtitle, { marginTop: 16 }]}>Your name (shown on entries you log)</Text>
          <View style={styles.addPresetRow}>
            <TextInput
              style={styles.addPresetInput}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="e.g. Mum"
              onBlur={() => onSetDisplayName(nameInput)}
              onSubmitEditing={() => onSetDisplayName(nameInput)}
            />
          </View>

          <Pressable style={[styles.backupButton, { marginTop: 16 }]} onPress={handleCreate} disabled={householdBusy}>
            <Text style={styles.backupButtonText}>Create a household</Text>
          </Pressable>

          <Text style={[styles.sectionSubtitle, { marginTop: 16 }]}>Or join with a code your partner gave you:</Text>
          <View style={styles.addPresetRow}>
            <TextInput
              style={styles.addPresetInput}
              value={joinCodeInput}
              onChangeText={setJoinCodeInput}
              placeholder="e.g. amber-otter-4721"
              autoCapitalize="none"
            />
            <Pressable style={styles.addPresetButton} onPress={handleJoin} disabled={householdBusy}>
              <Text style={styles.addPresetButtonText}>Join</Text>
            </Pressable>
          </View>
        </View>
      )}
      {householdMessage && <Text style={styles.backupMessage}>{householdMessage}</Text>}

      <Text style={styles.heading}>Baby's Age</Text>
      <View style={styles.dateRow}>
        <NumberField
          label="Day"
          value={day}
          min={1}
          max={31}
          onChange={(v) => {
            setDay(v);
            applyDate(v, month, year);
          }}
        />
        <NumberField
          label="Month"
          value={month}
          min={1}
          max={12}
          onChange={(v) => {
            setMonth(v);
            applyDate(day, v, year);
          }}
        />
        <NumberField
          label="Year"
          value={year}
          min={2000}
          max={2100}
          width={80}
          onChange={(v) => {
            setYear(v);
            applyDate(day, month, v);
          }}
        />
      </View>
      <Text style={styles.ageText}>{formatAge(dateOfBirth)}</Text>
      {dateOfBirth !== null && (
        <Pressable style={styles.unlinkButton} onPress={() => onSetDateOfBirth(null)}>
          <Text style={styles.link}>Clear date of birth</Text>
        </Pressable>
      )}

      <Text style={styles.disclaimer}>
        The status colors below use general, approximate guidance to help you spot patterns — they
        are not medical advice. Every number is editable, so feel free to match them to your own
        pediatrician's guidance.
      </Text>

      <ThresholdSection title="Pain Meds reminder">
        <ThresholdRow
          label="Caution after (hours)"
          value={thresholds.painMedsCautionHours}
          isCustom={overrides.painMedsCautionHours !== undefined}
          min={1}
          max={24}
          onChange={(v) => onSetThresholdOverride('painMedsCautionHours', v)}
          onReset={() => onSetThresholdOverride('painMedsCautionHours', undefined)}
        />
        <ThresholdRow
          label="Concern after (hours)"
          value={thresholds.painMedsConcernHours}
          isCustom={overrides.painMedsConcernHours !== undefined}
          min={1}
          max={24}
          onChange={(v) => onSetThresholdOverride('painMedsConcernHours', v)}
          onReset={() => onSetThresholdOverride('painMedsConcernHours', undefined)}
        />
      </ThresholdSection>

      <ThresholdSection title="Feeding" ageBased>
        <ThresholdRow
          label="Caution after (hours)"
          value={thresholds.feedingCautionHours}
          isCustom={overrides.feedingCautionHours !== undefined}
          min={0.5}
          max={12}
          step={0.5}
          onChange={(v) => onSetThresholdOverride('feedingCautionHours', v)}
          onReset={() => onSetThresholdOverride('feedingCautionHours', undefined)}
          defaultValue={ageDefaults.feedingCautionHours}
        />
        <ThresholdRow
          label="Concern after (hours)"
          value={thresholds.feedingConcernHours}
          isCustom={overrides.feedingConcernHours !== undefined}
          min={0.5}
          max={12}
          step={0.5}
          onChange={(v) => onSetThresholdOverride('feedingConcernHours', v)}
          onReset={() => onSetThresholdOverride('feedingConcernHours', undefined)}
          defaultValue={ageDefaults.feedingConcernHours}
        />
      </ThresholdSection>

      <ThresholdSection title="Wet Nappy (today's count)" ageBased>
        <ThresholdRow
          label="Concerning below"
          value={thresholds.wetYellowMin}
          isCustom={overrides.wetYellowMin !== undefined}
          min={0}
          max={20}
          onChange={(v) => onSetThresholdOverride('wetYellowMin', v)}
          onReset={() => onSetThresholdOverride('wetYellowMin', undefined)}
          defaultValue={ageDefaults.wetYellowMin}
        />
        <ThresholdRow
          label="Good at or above"
          value={thresholds.wetGreenMin}
          isCustom={overrides.wetGreenMin !== undefined}
          min={0}
          max={20}
          onChange={(v) => onSetThresholdOverride('wetGreenMin', v)}
          onReset={() => onSetThresholdOverride('wetGreenMin', undefined)}
          defaultValue={ageDefaults.wetGreenMin}
        />
      </ThresholdSection>

      <ThresholdSection title="Poo Nappy (today's count)" ageBased>
        <ThresholdRow
          label="Concerning below"
          value={thresholds.pooYellowMin}
          isCustom={overrides.pooYellowMin !== undefined}
          min={0}
          max={20}
          onChange={(v) => onSetThresholdOverride('pooYellowMin', v)}
          onReset={() => onSetThresholdOverride('pooYellowMin', undefined)}
          defaultValue={ageDefaults.pooYellowMin}
        />
        <ThresholdRow
          label="Good range: from"
          value={thresholds.pooGreenMin}
          isCustom={overrides.pooGreenMin !== undefined}
          min={0}
          max={20}
          onChange={(v) => onSetThresholdOverride('pooGreenMin', v)}
          onReset={() => onSetThresholdOverride('pooGreenMin', undefined)}
          defaultValue={ageDefaults.pooGreenMin}
        />
        <ThresholdRow
          label="Good range: to"
          value={thresholds.pooGreenMax}
          isCustom={overrides.pooGreenMax !== undefined}
          min={0}
          max={20}
          onChange={(v) => onSetThresholdOverride('pooGreenMax', v)}
          onReset={() => onSetThresholdOverride('pooGreenMax', undefined)}
          defaultValue={ageDefaults.pooGreenMax}
        />
        <ThresholdRow
          label="Concerning above"
          value={thresholds.pooRedAbove}
          isCustom={overrides.pooRedAbove !== undefined}
          min={0}
          max={20}
          onChange={(v) => onSetThresholdOverride('pooRedAbove', v)}
          onReset={() => onSetThresholdOverride('pooRedAbove', undefined)}
          defaultValue={ageDefaults.pooRedAbove}
        />
      </ThresholdSection>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pain Meds Dose Presets</Text>
        <Text style={styles.sectionSubtitle}>Shown as quick-tap chips after logging Pain Meds</Text>
        <View style={styles.presetList}>
          {painMedsPresets.map((preset) => (
            <View key={preset} style={styles.presetChip}>
              <Text style={styles.presetChipText}>{preset}</Text>
              <Pressable onPress={() => onRemovePainMedsPreset(preset)} hitSlop={8}>
                <Text style={styles.presetChipRemove}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
        <View style={styles.addPresetRow}>
          <TextInput
            style={styles.addPresetInput}
            value={newPreset}
            onChangeText={setNewPreset}
            placeholder="e.g. Calpol 2.5ml"
            onSubmitEditing={() => {
              onAddPainMedsPreset(newPreset);
              setNewPreset('');
            }}
          />
          <Pressable
            style={styles.addPresetButton}
            onPress={() => {
              onAddPainMedsPreset(newPreset);
              setNewPreset('');
            }}
          >
            <Text style={styles.addPresetButtonText}>Add</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Backup</Text>
        <Text style={styles.sectionSubtitle}>
          {Platform.OS === 'web'
            ? 'Download a copy of all your data, or restore from a previous backup.'
            : 'Share a copy of all your data. Restore is available in the web app.'}
        </Text>
        <View style={styles.backupRow}>
          <Pressable
            style={styles.backupButton}
            onPress={async () => {
              const result = await exportBackup();
              setBackupMessage(result.message);
            }}
          >
            <Text style={styles.backupButtonText}>Export data</Text>
          </Pressable>
          {Platform.OS === 'web' && (
            <Pressable
              style={[styles.backupButton, styles.backupButtonSecondary]}
              onPress={() => {
                pickAndRestoreFileWeb((result) => {
                  setBackupMessage(result.message);
                  if (result.ok) onDataRestored();
                });
              }}
            >
              <Text style={styles.backupButtonSecondaryText}>Restore from file</Text>
            </Pressable>
          )}
        </View>
        {backupMessage && <Text style={styles.backupMessage}>{backupMessage}</Text>}
      </View>

      <View style={[styles.section, styles.dangerSection]}>
        <Text style={styles.dangerTitle}>Danger Zone</Text>
        <Text style={styles.sectionSubtitle}>Deletes every logged entry and profile setting on this device.</Text>
        {!confirmingReset ? (
          <Pressable style={styles.dangerButton} onPress={() => setConfirmingReset(true)}>
            <Text style={styles.dangerButtonText}>Reset everything</Text>
          </Pressable>
        ) : (
          <View style={styles.confirmBlock}>
            <Text style={styles.confirmText}>
              This permanently deletes all logged entries and your profile (age, presets, custom
              thresholds). This cannot be undone. Consider exporting a backup first.
            </Text>
            <View style={styles.confirmButtons}>
              <Pressable
                style={styles.dangerButton}
                onPress={async () => {
                  await onResetEverything();
                  setConfirmingReset(false);
                }}
              >
                <Text style={styles.dangerButtonText}>Yes, delete everything</Text>
              </Pressable>
              <Pressable style={styles.cancelResetButton} onPress={() => setConfirmingReset(false)}>
                <Text style={styles.cancelResetText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function ThresholdSection({
  title,
  ageBased,
  children,
}: {
  title: string;
  ageBased?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {ageBased && <Text style={styles.sectionSubtitle}>Defaults scale with baby's age</Text>}
      <View style={styles.sectionRows}>{children}</View>
    </View>
  );
}

function ThresholdRow({
  label,
  value,
  isCustom,
  min,
  max,
  step = 1,
  onChange,
  onReset,
  defaultValue,
}: {
  label: string;
  value: number;
  isCustom: boolean;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  onReset: () => void;
  defaultValue?: number;
}) {
  const [text, setText] = useState(String(value));

  React.useEffect(() => {
    setText(String(value));
  }, [value]);

  const commit = () => {
    const parsed = parseFloat(text);
    if (Number.isNaN(parsed)) {
      setText(String(value));
      return;
    }
    const rounded = step < 1 ? Math.round(parsed * 2) / 2 : Math.round(parsed);
    const clamped = Math.min(max, Math.max(min, rounded));
    setText(String(clamped));
    onChange(clamped);
  };

  return (
    <View style={styles.thresholdRow}>
      <View style={styles.thresholdLabelBlock}>
        <Text style={styles.thresholdLabel}>{label}</Text>
        {isCustom ? (
          <Pressable onPress={onReset}>
            <Text style={styles.resetLink}>Custom — reset to default ({defaultValue ?? '—'})</Text>
          </Pressable>
        ) : (
          <Text style={styles.autoLabel}>Auto for age</Text>
        )}
      </View>
      <View style={styles.thresholdInputWrap}>
        <TextInput
          style={styles.thresholdInput}
          value={text}
          onChangeText={setText}
          onBlur={commit}
          onSubmitEditing={commit}
          keyboardType="numbers-and-punctuation"
          maxLength={5}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F2FA',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1B1F',
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  ageText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
    color: '#6650A4',
  },
  link: {
    fontSize: 13,
    color: '#79747E',
    textDecorationLine: 'underline',
  },
  unlinkButton: {
    marginTop: 16,
  },
  inviteCode: {
    marginTop: 8,
    fontSize: 20,
    fontWeight: '700',
    color: '#6650A4',
    letterSpacing: 0.5,
  },
  disclaimer: {
    marginTop: 20,
    marginBottom: 8,
    fontSize: 13,
    lineHeight: 18,
    color: '#49454F',
    fontStyle: 'italic',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1B1F',
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#79747E',
    marginTop: 2,
  },
  sectionRows: {
    marginTop: 12,
    gap: 12,
  },
  thresholdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  thresholdLabelBlock: {
    flex: 1,
    paddingRight: 12,
  },
  thresholdLabel: {
    fontSize: 14,
    color: '#1C1B1F',
  },
  autoLabel: {
    fontSize: 11,
    color: '#79747E',
    marginTop: 2,
  },
  resetLink: {
    fontSize: 11,
    color: '#6650A4',
    marginTop: 2,
    textDecorationLine: 'underline',
  },
  thresholdInputWrap: {
    width: 64,
  },
  thresholdInput: {
    borderWidth: 1,
    borderColor: '#CAC4D0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: '#1C1B1F',
  },
  presetList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  presetChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EBFA',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  presetChipText: {
    color: '#6650A4',
    fontWeight: '600',
    fontSize: 13,
  },
  presetChipRemove: {
    color: '#6650A4',
    fontSize: 13,
  },
  addPresetRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  addPresetInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CAC4D0',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    color: '#1C1B1F',
  },
  addPresetButton: {
    backgroundColor: '#6650A4',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addPresetButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  backupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  backupButton: {
    backgroundColor: '#6650A4',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  backupButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  backupButtonSecondary: {
    backgroundColor: '#F0EBFA',
  },
  backupButtonSecondaryText: {
    color: '#6650A4',
    fontWeight: '700',
    fontSize: 14,
  },
  backupMessage: {
    marginTop: 10,
    fontSize: 13,
    color: '#49454F',
  },
  dangerSection: {
    borderWidth: 1,
    borderColor: '#F2B8B5',
    marginBottom: 12,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#B3261E',
  },
  dangerButton: {
    backgroundColor: '#B3261E',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  dangerButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  confirmBlock: {
    marginTop: 12,
  },
  confirmText: {
    fontSize: 13,
    lineHeight: 18,
    color: '#B3261E',
  },
  confirmButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  cancelResetButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  cancelResetText: {
    color: '#79747E',
    fontSize: 14,
  },
});
