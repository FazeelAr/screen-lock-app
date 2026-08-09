import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Modal, Pressable } from 'react-native';
import { useColorScheme } from '@/hooks/use-color-scheme';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string) => void;
};

export function AddProfileModal({ visible, onClose, onSubmit }: Props) {
  const [name, setName] = useState('');
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const handleCreate = () => {
    if (!name.trim()) return;
    onSubmit(name.trim());
    setName('');
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.dialog, { backgroundColor: isDark ? '#121A24' : '#FFFFFF' }]}>
          <Text style={[styles.title, { color: isDark ? '#FFFFFF' : '#0F172A' }]}>
            Add New Voice Profile
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                color: isDark ? '#FFFFFF' : '#0F172A',
                borderColor: isDark ? '#202D3D' : '#E2E8F0',
                backgroundColor: isDark ? '#182230' : '#F8FAFC',
              },
            ]}
            placeholder="Profile Name (e.g., Office Voice)"
            placeholderTextColor={isDark ? '#6B7A8A' : '#94A3B8'}
            value={name}
            onChangeText={setName}
            autoFocus
          />

          <View style={styles.btnRow}>
            <Pressable style={styles.cancelBtn} onPress={onClose}>
              <Text style={[styles.btnText, { color: isDark ? '#8F9EB2' : '#64748B' }]}>
                Cancel
              </Text>
            </Pressable>
            <Pressable style={styles.submitBtn} onPress={handleCreate}>
              <Text style={styles.submitBtnText}>Create Profile</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    borderRadius: 20,
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  cancelBtn: {
    paddingHorizontal: 16,
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
  },
  submitBtn: {
    backgroundColor: '#2F7CF6',
    paddingHorizontal: 18,
    height: 40,
    justifyContent: 'center',
    borderRadius: 10,
  },
  btnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});