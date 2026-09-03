import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import NumberField from './NumberField';
import { formatAge } from './profile';
import { defaultThresholdsForAge, Thresholds } from './thresholds';

interface Props {
  dateOfBirth: number | null;
  ageWeeks: number | null;
  thresholds: Thresholds;
  overrides: Partial<Thresholds>;
  onSetDateOfBirth: (dateOfBirth: number | null) => void;
  onSetThresholdOverride: (key: keyof Thresholds, value: number | undefined) => void;
}

export default function ProfileScreen({
  dateOfBirth,
  ageWeeks,
  thresholds,
  overrides,
  onSetDateOfBirth,
  onSetThresholdOverride,
}: Props) {
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

  const applyDate = (nextDay: number, nextMonth: number, nextYear: number) => {
    const date = new Date(nextYear, nextMonth - 1, nextDay, 0, 0, 0, 0);
    onSetDateOfBirth(date.getTime());
  };

  const ageDefaults = defaultThresholdsForAge(ageWeeks);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
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
        <Pressable onPress={() => onSetDateOfBirth(null)}>
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
    marginTop: 6,
    fontSize: 13,
    color: '#79747E',
    textDecorationLine: 'underline',
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
});
