 import { useColorScheme } from '@/hooks/use-color-scheme';
import { LOCK_DURATION_OPTIONS } from '@/src/constants/admin';
import type { LockDurationId } from '@/src/types/admin';
import { Pressable, StyleSheet, Text, View } from 'react-native';

 type Props = {
   selected: LockDurationId;
   onSelect: (id: LockDurationId) => void;
 };

 //const LOCK_DURATION_OPTIONS: Array<{ id: LockDurationId; label: string }> = [];

 export function LockDurationSelector({ selected, onSelect }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

   return (
     <View style={styles.row}>
       {LOCK_DURATION_OPTIONS.map((option) => {
         const isSelected = option.id === selected;

        return (
           <Pressable
             key={option.id}
             accessibilityRole="button"
            accessibilityState={{ selected: isSelected }}
             onPress={() => onSelect(option.id)}
             style={[
               styles.pill,
               {
                 backgroundColor: isSelected ? '#2F7CF6' : isDark ? '#11171D' : '#F3F6FA',
                 borderColor: isSelected ? '#2F7CF6' : isDark ? '#22303A' : '#D7DFE8',
               },
             ]}>
             <Text style={[styles.pillText, { color: isSelected ? '#FFFFFF' : isDark ? '#ECEDEE' : '#11181C' }]}>
               {option.label}
             </Text>
           </Pressable>
         );
       })}
     </View>
   );
 
 }

 const styles = StyleSheet.create({
   row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
   pill: { borderRadius: 12, borderWidth: 1, paddingVertical: 10, paddingHorizontal: 16 },
   pillText: { fontSize: 13, fontWeight: '700' },
 });