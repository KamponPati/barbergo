# BarberGo Mobile

Expo React Native app for Phase 8.

## Setup

```bash
cd /home/yee/app
corepack pnpm install
cp apps/mobile/.env.example apps/mobile/.env
```

## Run

```bash
corepack pnpm --filter @barbergo/mobile start
```

Then use:
- `a` for Android emulator/device
- `i` for iOS simulator (macOS)

## Deep Links

Use:
- `barbergo://customer`
- `barbergo://partner`
- `barbergo://admin`

## Push Notifications

The app includes `expo-notifications` registration scaffold and will request permissions on launch.
