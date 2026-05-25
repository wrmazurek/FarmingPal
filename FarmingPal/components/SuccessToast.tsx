import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export default function SuccessToast({ message, visible, onHide }: Props) {
  const opacity  = useRef(new Animated.Value(0)).current;
  const mounted  = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    if (!visible) return;
    opacity.setValue(0);
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(2100),
      Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(() => { if (mounted.current) onHide(); });
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity }]}>
      <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position:        'absolute',
    bottom:          36,
    left:            16,
    right:           16,
    zIndex:          999,
    backgroundColor: '#2d6a2d',
    borderRadius:    12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection:   'row',
    alignItems:      'center',
    gap:             10,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: 3 },
    shadowOpacity:   0.2,
    shadowRadius:    6,
    elevation:       8,
  },
  text: {
    color:      '#fff',
    fontSize:   15,
    fontWeight: '600',
    flex:       1,
  },
});
