# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Start dev server (defaults to localhost:8081)
npx expo start

# If port is in use, specify an alternate port
npx expo start --port 8082

# Clear Metro cache when seeing stale/cached builds
npx expo start --clear

# Web only
npx expo start --web

# Lint
npx expo lint
```

There are no automated tests in this project.

## Architecture

### Route structure

Expo Router (file-based). All routes live in `app/`:

| Group | Purpose |
|---|---|
| `onboarding/` | country → region → district, first-run only |
| `(auth)/` | login, register, farm-profile |
| `(tabs)/` | all main screens; tab bar is hidden, nav is via `AppHeader` |
| `getstarted.tsx` | marketing/how-it-works page |

**`RouteGuard`** in `app/_layout.tsx` enforces onboarding: if `UserContext.onboardingComplete` is false and the user isn't in `onboarding/`, `(auth)/`, or `getstarted`, they are redirected to `/onboarding/country`. After completing onboarding or sign-in, the app lands on `/(tabs)/search`.

### Context providers

`UserProvider` wraps `AuthProvider` in `app/_layout.tsx`.

**`AuthContext`** — session state only. Real Supabase auth (`signInWithPassword`, `signUp`, `onAuthStateChange`). Session is persisted via the custom storage adapter in `lib/supabase.ts`. Exposes `user`, `isAuthenticated`, `signIn`, `signUp`, `signOut`.

**`UserContext`** — all farm profile data, persisted to `@farmingpal:user_profile`. Key methods:
- `saveFarmDetails(partial)` — merges and persists a partial profile update
- `updateRegion(country, regionCode, districtCode)` — sets location
- `setCountry(country)` — switches country and clears regionCode/districtCode
- `addServiceBooking` / `updateServiceBooking` — manages `profile.serviceBookings[]`
- `addOperatorEquipment` / `updateOperatorEquipment` — manages `profile.operatorEquipment[]`
- `pendingProfileTab` — signals the Profile screen to open a specific tab after a booking/registration flow completes

### Static reference data

- `constants/crops.ts` — `CROPS[]`, `WHEAT_CROPS`, `NON_WHEAT_CROPS` (wheat IDs use `wheat-` prefix), `getCropById()`. All units are `'bu'`.
- `constants/regions.ts` — `REGIONS[]`, `DISTRICTS[]`, `getRegionsByCountry()`, `getDistrictsByRegion()`

### Backend

Supabase project (`lib/supabase.ts`). All screens read from and write to real tables. A separate isolated client (`lib/supabaseAdmin.ts`, storage key `farmingpal-admin-auth`) is used by the admin portal so admin sessions never bleed into `AuthContext`.

Key tables: `profiles`, `price_submissions`, `fuel_submissions`, `fertilizer_submissions`, `chemical_submissions`, `service_bookings`, `operator_registrations`, `job_postings`, `job_quotes`, `job_threads`, `job_messages`, `equipment_listings`, `land_listings`, `admin_users`.

### Key patterns

**AppHeader** (`components/AppHeader.tsx`) — shared navbar on every screen. Renders different items based on `isAuthenticated`:
- Guest: Report Pricing, Search Prices, Custom Services, Sign In
- Authenticated: Profile icon, Sign Out

Sign Out must call `await signOut(); router.replace('/(auth)/login')` directly. **Do not use `Alert.alert()`** for sign-out or any button callback on web — alert callbacks silently fail in `react-native-web`.

**Inline dropdowns** — custom pattern used throughout instead of a native Picker: a `TouchableOpacity` trigger + conditional `ScrollView` list with `nestedScrollEnabled`, `maxHeight: 220`, ✓ checkmarks. See `submit.tsx` for the canonical example.

**Location banner** — `submit-fuel`, `submit-fert`, `submit-chem` each show a green banner that reads country/province from `UserContext` and links back to `/(tabs)/pricing` to change it.

**Price reporting is anonymous** — the four submit screens (`submit`, `submit-fuel`, `submit-fert`, `submit-chem`) have no auth gate. `/(tabs)/search` has an `AuthGate` that renders inside a `View` with `AppHeader` so the navbar still appears for guests.

### Adding a new tab screen

1. Create `app/(tabs)/your-screen.tsx`
2. Add `<Tabs.Screen name="your-screen" />` to `app/(tabs)/_layout.tsx`
3. Link with `router.push('/(tabs)/your-screen' as any)` — the `as any` cast is required due to typed-routes strictness with string hrefs

### Path alias

`@/` resolves to the project root. Use `@/context/...`, `@/constants/...`, `@/components/...`, `@/types`, etc.
