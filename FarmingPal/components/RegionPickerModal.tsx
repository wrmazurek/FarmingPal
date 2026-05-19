import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { useUser } from '@/context/UserContext';
import { getRegionsByCountry, getDistrictsByRegion } from '@/constants/regions';
import { Region } from '@/types';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function RegionPickerModal({ visible, onClose }: Props) {
  const { profile, updateRegion } = useUser();
  const country = profile?.country ?? 'CA';
  const regions = getRegionsByCountry(country);

  const handleSelect = async (region: Region) => {
    const districts = getDistrictsByRegion(region.code);
    const defaultDistrict = districts[0]?.code ?? '';
    await updateRegion(country, region.code, defaultDistrict);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>
          Select {country === 'CA' ? 'Province' : 'State'}
        </Text>
        <FlatList
          data={regions}
          keyExtractor={(r) => r.code}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.row,
                profile?.regionCode === item.code && styles.rowSelected,
              ]}
              onPress={() => handleSelect(item)}
            >
              <Text style={styles.code}>{item.code}</Text>
              <Text style={[
                styles.name,
                profile?.regionCode === item.code && styles.nameSelected,
              ]}>
                {item.name}
              </Text>
              {profile?.regionCode === item.code && (
                <Text style={styles.check}>✓</Text>
              )}
            </TouchableOpacity>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet:        { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, paddingBottom: 40, maxHeight: '75%' },
  handle:       { width: 40, height: 4, backgroundColor: '#ddd', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 8 },
  title:        { fontSize: 17, fontWeight: '700', color: '#1a3c1a', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  row:          { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#f8f8f8' },
  rowSelected:  { backgroundColor: '#f0f8f0' },
  code:         { fontSize: 13, fontWeight: '700', color: '#4a7c4a', width: 44 },
  name:         { flex: 1, fontSize: 16, color: '#333' },
  nameSelected: { color: '#2d6a2d', fontWeight: '600' },
  check:        { fontSize: 16, color: '#2d6a2d', fontWeight: '700' },
});
