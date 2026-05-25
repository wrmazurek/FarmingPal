import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AppHeader from '@/components/AppHeader';
import SuccessToast from '@/components/SuccessToast';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/context/UserContext';
import { REGIONS, getDistrictsByRegion } from '@/constants/regions';

type ListingType = 'equipment' | 'land';

const EQUIPMENT_CATEGORIES = [
  'Tractor', 'Combine / Harvester', 'Header / Attachment',
  'Seeder / Air Drill', 'Sprayer', 'Tillage / Cultivator',
  'Grain Truck', 'Grain Handling', 'Hay & Forage',
  'Loader / Skid Steer', 'ATV / UTV', 'Other',
];

const CONDITIONS = [
  { id: 'excellent', label: 'Excellent' },
  { id: 'good',      label: 'Good' },
  { id: 'fair',      label: 'Fair' },
  { id: 'parts',     label: 'Parts Only' },
];

const LAND_TYPES = [
  'Cultivated / Cropland', 'Pasture / Grazing', 'Mixed Farm',
  'Hay / Forage Land', 'Recreational', 'Other',
];

export default function BuySellPostScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile } = useUser();

  const isUS     = profile?.country === 'US';
  const currency = isUS ? 'USD' : 'CAD';
  const districts = profile?.regionCode ? getDistrictsByRegion(profile.regionCode) : [];
  const regionName = REGIONS.find(r => r.code === profile?.regionCode)?.name;

  const sellerName = profile?.contactName ?? profile?.farmName ?? user?.email ?? '';

  const [tab, setTab] = useState<ListingType>('equipment');

  // Equipment fields
  const [eCategory,    setECategory]    = useState('');
  const [eYear,        setEYear]        = useState('');
  const [eMake,        setEMake]        = useState('');
  const [eModel,       setEModel]       = useState('');
  const [eHours,       setEHours]       = useState('');
  const [eCondition,   setECondition]   = useState('good');
  const [ePrice,       setEPrice]       = useState('');
  const [eDesc,        setEDesc]        = useState('');
  const [eDistrict,    setEDistrict]    = useState(profile?.districtCode ?? '');
  const [eDistrictOpen, setEDistrictOpen] = useState(false);

  // Land fields
  const [lAcres,       setLAcres]       = useState('');
  const [lType,        setLType]        = useState('');
  const [lSoilClass,   setLSoilClass]   = useState('');
  const [lPrice,       setLPrice]       = useState('');
  const [lPriceType,   setLPriceType]   = useState<'per_acre' | 'total'>('total');
  const [lDesc,        setLDesc]        = useState('');
  const [lDistrict,    setLDistrict]    = useState(profile?.districtCode ?? '');
  const [lDistrictOpen, setLDistrictOpen] = useState(false);

  // Photo state (local URIs before upload)
  const [ePhotos, setEPhotos] = useState<string[]>([]);
  const [lPhotos, setLPhotos] = useState<string[]>([]);

  const [submitting,   setSubmitting]   = useState(false);
  const [toastMsg,     setToastMsg]     = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [formError,    setFormError]    = useState('');

  const pickImage = async (current: string[], setter: (p: string[]) => void) => {
    if (current.length >= 2) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setter([...current, result.assets[0].uri]);
    }
  };

  const removePhoto = (index: number, current: string[], setter: (p: string[]) => void) => {
    setter(current.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (uris: string[], userId: string): Promise<string[]> => {
    const urls: string[] = [];
    for (let i = 0; i < uris.length; i++) {
      try {
        const uri = uris[i];
        const ext = uri.split('.').pop()?.toLowerCase()?.split('?')[0] ?? 'jpg';
        const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
        const path = `${userId}/${Date.now()}-${i}.${ext === 'png' || ext === 'webp' ? ext : 'jpg'}`;
        const response = await fetch(uri);
        const blob = await response.blob();
        const { error } = await supabase.storage.from('listing-photos').upload(path, blob, { contentType: mime });
        if (!error) {
          const { data } = supabase.storage.from('listing-photos').getPublicUrl(path);
          urls.push(data.publicUrl);
        }
      } catch {
        // skip failed photo — listing still posts without it
      }
    }
    return urls;
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <AppHeader />
        <View style={styles.gate}>
          <Text style={styles.gateTitle}>Sign in to post a listing</Text>
          <TouchableOpacity style={styles.gateBtn} onPress={() => router.replace('/(auth)/login' as any)}>
            <Text style={styles.gateBtnText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleSubmitEquipment = async () => {
    setFormError('');
    if (!eCategory || !ePrice || !eDistrict) {
      setFormError('Category, price, and district are required.');
      return;
    }
    setSubmitting(true);
    const photos = await uploadPhotos(ePhotos, user.id);
    const { error } = await supabase.from('equipment_listings').insert({
      seller_id:    user.id,
      seller_name:  sellerName,
      category:     eCategory,
      year:         eYear,
      make:         eMake,
      model:        eModel,
      hours:        eHours,
      condition:    eCondition,
      price:        parseFloat(ePrice),
      currency,
      description:  eDesc,
      district_code: eDistrict,
      region_code:  profile?.regionCode ?? '',
      country:      profile?.country ?? 'CA',
      photos,
    });
    setSubmitting(false);
    if (error) { setFormError(error.message); return; }
    setToastMsg('Equipment listing is now live!');
    setToastVisible(true);
    setTimeout(() => router.replace('/(tabs)/buysell' as any), 1500);
  };

  const handleSubmitLand = async () => {
    setFormError('');
    if (!lAcres || !lType || !lPrice || !lDistrict) {
      setFormError('Acres, land type, price, and district are required.');
      return;
    }
    setSubmitting(true);
    const photos = await uploadPhotos(lPhotos, user.id);
    const { error } = await supabase.from('land_listings').insert({
      seller_id:    user.id,
      seller_name:  sellerName,
      acres:        lAcres,
      land_type:    lType,
      soil_class:   lSoilClass,
      price:        parseFloat(lPrice),
      price_type:   lPriceType,
      currency,
      description:  lDesc,
      district_code: lDistrict,
      region_code:  profile?.regionCode ?? '',
      country:      profile?.country ?? 'CA',
      photos,
    });
    setSubmitting(false);
    if (error) { setFormError(error.message); return; }
    setToastMsg('Land listing is now live!');
    setToastVisible(true);
    setTimeout(() => router.replace('/(tabs)/buysell' as any), 1500);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <AppHeader />
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>

        <Text style={styles.pageTitle}>Post a Listing</Text>

        {/* Location banner */}
        <View style={styles.locationBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.locationText}>
            📍 {isUS ? 'United States' : 'Canada'}{regionName ? ` · ${regionName}` : ''}
          </Text>
        </View>

        {/* Equipment / Land toggle */}
        <View style={styles.typeToggle}>
          <TouchableOpacity
            style={[styles.typeBtn, tab === 'equipment' && styles.typeBtnActive]}
            onPress={() => { setTab('equipment'); setFormError(''); }}
          >
            <Text style={[styles.typeBtnText, tab === 'equipment' && styles.typeBtnTextActive]}>Equipment</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeBtn, tab === 'land' && styles.typeBtnActive]}
            onPress={() => { setTab('land'); setFormError(''); }}
          >
            <Text style={[styles.typeBtnText, tab === 'land' && styles.typeBtnTextActive]}>Land</Text>
          </TouchableOpacity>
        </View>

        {tab === 'equipment' ? (
          <>
            {/* Category */}
            <Text style={styles.label}>Category *</Text>
            <View style={styles.chipGrid}>
              {EQUIPMENT_CATEGORIES.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, eCategory === cat && styles.chipActive]}
                  onPress={() => setECategory(cat)}
                >
                  <Text style={[styles.chipText, eCategory === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Year / Make / Model / Hours */}
            <View style={styles.row4}>
              <View style={styles.col2}>
                <Text style={styles.label}>Year</Text>
                <TextInput style={styles.input} value={eYear} onChangeText={setEYear} placeholder="2019" keyboardType="numeric" />
              </View>
              <View style={styles.col2}>
                <Text style={styles.label}>Hours</Text>
                <TextInput style={styles.input} value={eHours} onChangeText={setEHours} placeholder="3200" keyboardType="numeric" />
              </View>
            </View>
            <Text style={styles.label}>Make</Text>
            <TextInput style={styles.input} value={eMake} onChangeText={setEMake} placeholder="John Deere" />
            <Text style={styles.label}>Model</Text>
            <TextInput style={styles.input} value={eModel} onChangeText={setEModel} placeholder="S780" />

            {/* Condition */}
            <Text style={styles.label}>Condition *</Text>
            <View style={styles.chipRow}>
              {CONDITIONS.map(c => (
                <TouchableOpacity
                  key={c.id}
                  style={[styles.chip, eCondition === c.id && styles.chipActive]}
                  onPress={() => setECondition(c.id)}
                >
                  <Text style={[styles.chipText, eCondition === c.id && styles.chipTextActive]}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Price */}
            <Text style={styles.label}>Asking Price ({currency}) *</Text>
            <TextInput style={styles.input} value={ePrice} onChangeText={setEPrice} placeholder="185000" keyboardType="decimal-pad" />

            {/* District */}
            <Text style={styles.label}>District *</Text>
            <View style={styles.dropWrapper}>
              <TouchableOpacity
                style={[styles.drop, eDistrictOpen && styles.dropOpen]}
                onPress={() => setEDistrictOpen(!eDistrictOpen)}
                activeOpacity={0.75}
              >
                <Text style={[styles.dropText, !eDistrict && styles.dropPlaceholder]}>
                  {districts.find(d => d.code === eDistrict)?.name ?? 'Select district'}
                </Text>
                <Text style={styles.dropArrow}>{eDistrictOpen ? '▲' : '▾'}</Text>
              </TouchableOpacity>
              {eDistrictOpen && (
                <ScrollView nestedScrollEnabled style={styles.ddList}>
                  {districts.map(d => (
                    <TouchableOpacity
                      key={d.code}
                      style={[styles.ddItem, eDistrict === d.code && styles.ddItemActive]}
                      onPress={() => { setEDistrict(d.code); setEDistrictOpen(false); }}
                    >
                      <Text style={[styles.ddText, eDistrict === d.code && styles.ddTextActive]}>{d.name}</Text>
                      {eDistrict === d.code && <Text style={styles.ddCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Photos */}
            <Text style={styles.label}>Photos (up to 2)</Text>
            <View style={styles.photoRow}>
              {[0, 1].map(i => {
                const uri = ePhotos[i];
                return uri ? (
                  <View key={i} style={styles.photoSlot}>
                    <Image source={{ uri }} style={styles.photoPreview} resizeMode="cover" />
                    <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removePhoto(i, ePhotos, setEPhotos)}>
                      <Text style={styles.photoRemoveText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    key={i}
                    style={[styles.photoSlot, styles.photoSlotEmpty]}
                    onPress={() => pickImage(ePhotos, setEPhotos)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.photoAddIcon}>📷</Text>
                    <Text style={styles.photoAddLabel}>Add Photo</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={eDesc}
              onChangeText={setEDesc}
              placeholder="Condition details, attachments included, reason for selling..."
              multiline
              numberOfLines={4}
            />

            {formError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmitEquipment}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Posting...' : 'Post Equipment Listing'}</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            {/* Acres */}
            <Text style={styles.label}>Acres *</Text>
            <TextInput style={styles.input} value={lAcres} onChangeText={setLAcres} placeholder="320" keyboardType="decimal-pad" />

            {/* Land type */}
            <Text style={styles.label}>Land Type *</Text>
            <View style={styles.chipGrid}>
              {LAND_TYPES.map(type => (
                <TouchableOpacity
                  key={type}
                  style={[styles.chip, lType === type && styles.chipActive]}
                  onPress={() => setLType(type)}
                >
                  <Text style={[styles.chipText, lType === type && styles.chipTextActive]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Soil class */}
            <Text style={styles.label}>Soil Class (optional)</Text>
            <TextInput style={styles.input} value={lSoilClass} onChangeText={setLSoilClass} placeholder="Class 2, Class 3..." />

            {/* Price */}
            <Text style={styles.label}>Price ({currency}) *</Text>
            <TextInput style={styles.input} value={lPrice} onChangeText={setLPrice} placeholder="850000" keyboardType="decimal-pad" />

            {/* Price type */}
            <Text style={styles.label}>Price Type</Text>
            <View style={styles.chipRow}>
              <TouchableOpacity
                style={[styles.chip, lPriceType === 'total' && styles.chipActive]}
                onPress={() => setLPriceType('total')}
              >
                <Text style={[styles.chipText, lPriceType === 'total' && styles.chipTextActive]}>Total Price</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, lPriceType === 'per_acre' && styles.chipActive]}
                onPress={() => setLPriceType('per_acre')}
              >
                <Text style={[styles.chipText, lPriceType === 'per_acre' && styles.chipTextActive]}>Per Acre</Text>
              </TouchableOpacity>
            </View>

            {/* District */}
            <Text style={styles.label}>District *</Text>
            <View style={styles.dropWrapper}>
              <TouchableOpacity
                style={[styles.drop, lDistrictOpen && styles.dropOpen]}
                onPress={() => setLDistrictOpen(!lDistrictOpen)}
                activeOpacity={0.75}
              >
                <Text style={[styles.dropText, !lDistrict && styles.dropPlaceholder]}>
                  {districts.find(d => d.code === lDistrict)?.name ?? 'Select district'}
                </Text>
                <Text style={styles.dropArrow}>{lDistrictOpen ? '▲' : '▾'}</Text>
              </TouchableOpacity>
              {lDistrictOpen && (
                <ScrollView nestedScrollEnabled style={styles.ddList}>
                  {districts.map(d => (
                    <TouchableOpacity
                      key={d.code}
                      style={[styles.ddItem, lDistrict === d.code && styles.ddItemActive]}
                      onPress={() => { setLDistrict(d.code); setLDistrictOpen(false); }}
                    >
                      <Text style={[styles.ddText, lDistrict === d.code && styles.ddTextActive]}>{d.name}</Text>
                      {lDistrict === d.code && <Text style={styles.ddCheck}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Photos */}
            <Text style={styles.label}>Photos (up to 2)</Text>
            <View style={styles.photoRow}>
              {[0, 1].map(i => {
                const uri = lPhotos[i];
                return uri ? (
                  <View key={i} style={styles.photoSlot}>
                    <Image source={{ uri }} style={styles.photoPreview} resizeMode="cover" />
                    <TouchableOpacity style={styles.photoRemoveBtn} onPress={() => removePhoto(i, lPhotos, setLPhotos)}>
                      <Text style={styles.photoRemoveText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    key={i}
                    style={[styles.photoSlot, styles.photoSlotEmpty]}
                    onPress={() => pickImage(lPhotos, setLPhotos)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.photoAddIcon}>📷</Text>
                    <Text style={styles.photoAddLabel}>Add Photo</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={lDesc}
              onChangeText={setLDesc}
              placeholder="Tile drainage, water source, access road, lease details..."
              multiline
              numberOfLines={4}
            />

            {formError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmitLand}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? 'Posting...' : 'Post Land Listing'}</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      <SuccessToast visible={toastVisible} message={toastMsg} onHide={() => setToastVisible(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: '#fff' },
  content:            { paddingBottom: 40 },
  pageTitle:          { fontSize: 26, fontWeight: '800', color: '#1a3c1a', paddingHorizontal: 16, paddingTop: 16, marginBottom: 4 },

  locationBar:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#f0f8f0', borderBottomWidth: 1, borderBottomColor: '#d0e8d0', gap: 12, marginBottom: 16 },
  backBtn:            { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8, backgroundColor: '#e0f0e0' },
  backBtnText:        { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },
  locationText:       { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },

  typeToggle:         { flexDirection: 'row', marginHorizontal: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#d0e8d0', overflow: 'hidden', marginBottom: 24 },
  typeBtn:            { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff' },
  typeBtnActive:      { backgroundColor: '#2d6a2d' },
  typeBtnText:        { fontSize: 15, fontWeight: '700', color: '#2d6a2d' },
  typeBtnTextActive:  { color: '#fff' },

  label:              { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16 },
  input:              { backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14, fontSize: 16, marginBottom: 18, marginHorizontal: 16 },
  multiline:          { height: 100, textAlignVertical: 'top' },

  row4:               { flexDirection: 'row', gap: 12, marginHorizontal: 16, marginBottom: 0 },
  col2:               { flex: 1 },

  chipGrid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 18 },
  chipRow:            { flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 18 },
  chip:               { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1.5, borderColor: '#d0e8d0', backgroundColor: '#fff' },
  chipActive:         { backgroundColor: '#2d6a2d', borderColor: '#2d6a2d' },
  chipText:           { fontSize: 13, color: '#2d6a2d', fontWeight: '600' },
  chipTextActive:     { color: '#fff' },

  dropWrapper:        { marginHorizontal: 16, marginBottom: 18, zIndex: 10 },
  drop:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f6fbf6', borderRadius: 10, borderWidth: 1.5, borderColor: '#d0e8d0', padding: 14 },
  dropOpen:           { borderColor: '#2d6a2d', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 },
  dropText:           { fontSize: 16, color: '#1a3c1a', flex: 1 },
  dropPlaceholder:    { color: '#aaa' },
  dropArrow:          { fontSize: 12, color: '#2d6a2d', fontWeight: '700' },
  ddList:             { backgroundColor: '#fff', borderWidth: 1.5, borderTopWidth: 0, borderColor: '#2d6a2d', borderBottomLeftRadius: 10, borderBottomRightRadius: 10, maxHeight: 200 },
  ddItem:             { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: '#f0f0f0' },
  ddItemActive:       { backgroundColor: '#f0f8f0' },
  ddText:             { fontSize: 14, color: '#444' },
  ddTextActive:       { color: '#2d6a2d', fontWeight: '700' },
  ddCheck:            { color: '#2d6a2d', fontWeight: '700' },

  // Photo picker
  photoRow:          { flexDirection: 'row', gap: 10, marginHorizontal: 16, marginBottom: 18 },
  photoSlot:         { width: 90, height: 68, borderRadius: 10, overflow: 'hidden' },
  photoSlotEmpty:    { borderWidth: 2, borderColor: '#d0e8d0', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f6fbf6' },
  photoPreview:      { width: '100%', height: '100%' },
  photoRemoveBtn:    { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  photoRemoveText:   { color: '#fff', fontSize: 12, fontWeight: '800', lineHeight: 14 },
  photoAddIcon:      { fontSize: 26, marginBottom: 5 },
  photoAddLabel:     { fontSize: 12, color: '#aaa', fontWeight: '600' },

  submitBtn:          { backgroundColor: '#2d6a2d', borderRadius: 12, padding: 18, alignItems: 'center', marginHorizontal: 16, marginTop: 8 },
  submitBtnDisabled:  { opacity: 0.6 },
  submitBtnText:      { color: '#fff', fontSize: 17, fontWeight: '700' },

  errorBox:           { backgroundColor: '#fff2f2', borderRadius: 10, borderWidth: 1.5, borderColor: '#f5c2c2', padding: 14, marginHorizontal: 16, marginBottom: 8 },
  errorText:          { fontSize: 14, color: '#c0392b', fontWeight: '600', lineHeight: 20 },

  gate:               { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  gateTitle:          { fontSize: 18, fontWeight: '700', color: '#1a3c1a', marginBottom: 24 },
  gateBtn:            { backgroundColor: '#2d6a2d', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 48 },
  gateBtnText:        { color: '#fff', fontSize: 16, fontWeight: '700' },
});
