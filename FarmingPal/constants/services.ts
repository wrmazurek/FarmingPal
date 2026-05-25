import { ImageSourcePropType } from 'react-native';

export const SERVICE_TYPES: { icon: ImageSourcePropType; label: string; iconSize?: number }[] = [
  { icon: require('@/assets/images/Tilling.png'),         label: 'Tilling',        iconSize: 60 },
  { icon: require('@/assets/images/Sprayer.png'),          label: 'Spraying', iconSize: 83 },
  { icon: require('@/assets/images/Swather.png'),         label: 'Swathing', iconSize: 62 },
  { icon: require('@/assets/images/Combine.png'),         label: 'Combining', iconSize: 68 },
  { icon: require('@/assets/images/Tractor.png'),         label: 'Trucking' },
  { icon: require('@/assets/images/Seeder.png'),          label: 'Seeding',        iconSize: 60 },
  { icon: require('@/assets/images/Baler.png'),           label: 'Baling',         iconSize: 60 },
  { icon: require('@/assets/images/Grain Handling.png'),  label: 'Grain Handling', iconSize: 60 },
];
