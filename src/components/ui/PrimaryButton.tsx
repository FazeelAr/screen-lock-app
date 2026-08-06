import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary';
};

export function PrimaryButton({ label, onPress, disabled, loading, variant = 'primary' }: Props) {
  const isSecondary = variant === 'secondary';
  const isInactive = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isInactive }}
      onPress={onPress}
      disabled={isInactive}
      style={({ pressed }) => [
        styles.base,
        isSecondary ? styles.secondary : styles.primary,
        isInactive && styles.disabled,
        pressed && !isInactive && styles.pressed,
      ]}>
      {loading ? (
        <ActivityIndicator color={isSecondary ? '#2F7CF6' : '#FFFFFF'} />
      ) : (
        <Text style={[styles.label, isSecondary && styles.secondaryLabel]}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: 16, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#2F7CF6' },
  secondary: { backgroundColor: 'transparent', borderWidth: 1, borderColor: 'rgba(120,140,160,0.3)' },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85 },
  label: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  secondaryLabel: { color: '#2F7CF6' },
});