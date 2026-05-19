import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="index"             />
      <Tabs.Screen name="pricing"           />
      <Tabs.Screen name="services"          />
      <Tabs.Screen name="service-booking"   />
      <Tabs.Screen name="service-register"  />
      <Tabs.Screen name="buysell"           />
      <Tabs.Screen name="submit"            />
      <Tabs.Screen name="search"            />
      <Tabs.Screen name="profile"           />
    </Tabs>
  );
}
