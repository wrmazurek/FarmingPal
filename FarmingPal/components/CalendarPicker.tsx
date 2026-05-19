import { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DAY_LABELS  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

interface Props {
  selected: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
}

export default function CalendarPicker({ selected, onSelect, minDate }: Props) {
  const today = new Date();

  const [viewYear,  setViewYear]  = useState(selected?.getFullYear() ?? today.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected?.getMonth()    ?? today.getMonth());

  const cells = useMemo<(number | null)[]>(() => {
    const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const result: (number | null)[] = Array(firstDow).fill(null);
    for (let d = 1; d <= daysInMonth; d++) result.push(d);
    return result;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const isSelected = (d: number) =>
    !!selected &&
    selected.getFullYear() === viewYear &&
    selected.getMonth()    === viewMonth &&
    selected.getDate()     === d;

  const isToday = (d: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth()    === viewMonth &&
    today.getDate()     === d;

  const isDisabled = (d: number) =>
    !!minDate && new Date(viewYear, viewMonth, d) < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

  return (
    <View style={styles.calendar}>

      {/* Month / year navigation */}
      <View style={styles.header}>
        <TouchableOpacity onPress={prevMonth} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
          <Text style={styles.navArrow}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthYear}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <TouchableOpacity onPress={nextMonth} hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}>
          <Text style={styles.navArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Weekday labels */}
      <View style={styles.weekRow}>
        {DAY_LABELS.map(l => (
          <Text key={l} style={styles.weekLabel}>{l}</Text>
        ))}
      </View>

      {/* Day grid */}
      <View style={styles.grid}>
        {cells.map((day, i) => (
          <View key={i} style={styles.cell}>
            {day !== null && (
              <TouchableOpacity
                style={[
                  styles.dayBtn,
                  isSelected(day)                     && styles.dayBtnSelected,
                  isToday(day) && !isSelected(day)    && styles.dayBtnToday,
                  isDisabled(day)                     && styles.dayBtnDisabled,
                ]}
                onPress={() => !isDisabled(day) && onSelect(new Date(viewYear, viewMonth, day))}
                disabled={isDisabled(day)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.dayText,
                  isSelected(day)                     && styles.dayTextSelected,
                  isToday(day) && !isSelected(day)    && styles.dayTextToday,
                  isDisabled(day)                     && styles.dayTextDisabled,
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

    </View>
  );
}

const CELL_SIZE = 40;

const styles = StyleSheet.create({
  calendar:       { backgroundColor: '#fff', borderRadius: 14, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 12, marginBottom: 16 },

  header:         { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  navArrow:       { fontSize: 26, color: '#2d6a2d', fontWeight: '300', paddingHorizontal: 4 },
  monthYear:      { fontSize: 15, fontWeight: '700', color: '#1a3c1a' },

  weekRow:        { flexDirection: 'row', marginBottom: 4 },
  weekLabel:      { width: CELL_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '600', color: '#999' },

  grid:           { flexDirection: 'row', flexWrap: 'wrap' },
  cell:           { width: CELL_SIZE, height: CELL_SIZE, justifyContent: 'center', alignItems: 'center' },

  dayBtn:         { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center' },
  dayBtnSelected: { backgroundColor: '#2d6a2d' },
  dayBtnToday:    { borderWidth: 1.5, borderColor: '#2d6a2d' },
  dayBtnDisabled: { opacity: 0.3 },

  dayText:        { fontSize: 14, color: '#1a3c1a', fontWeight: '500' },
  dayTextSelected:{ color: '#fff', fontWeight: '700' },
  dayTextToday:   { color: '#2d6a2d', fontWeight: '700' },
  dayTextDisabled:{ color: '#bbb' },
});
