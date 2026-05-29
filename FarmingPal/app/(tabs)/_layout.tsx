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
      <Tabs.Screen name="marketplace"       />
      <Tabs.Screen name="pricing"           />
      <Tabs.Screen name="services"          />
      <Tabs.Screen name="service-booking"   />
      <Tabs.Screen name="service-register"  />
      <Tabs.Screen name="buysell"           />
      <Tabs.Screen name="submit"            />
      <Tabs.Screen name="submit-commodity"  />
      <Tabs.Screen name="submit-fuel"       />
      <Tabs.Screen name="submit-fert"       />
      <Tabs.Screen name="submit-chem"       />
      <Tabs.Screen name="submit-livestock"  />
      <Tabs.Screen name="search"            />
      <Tabs.Screen name="search-livestock"  />
      <Tabs.Screen name="profile"           />
      <Tabs.Screen name="job-board"         />
      <Tabs.Screen name="job-detail"        />
      <Tabs.Screen name="my-jobs"           />
      <Tabs.Screen name="job-applicants"    />
      <Tabs.Screen name="job-thread"        />
      <Tabs.Screen name="buysell-post"      />
      <Tabs.Screen name="farmhands"         />
      <Tabs.Screen name="farmhand-post"     />
      <Tabs.Screen name="farmhand-detail"   />
      <Tabs.Screen name="farmhand-apply"    />
    </Tabs>
  );
}
