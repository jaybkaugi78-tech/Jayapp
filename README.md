# Jay & Millie — Full Frontend Demo

This is the complete **frontend-only** version of the Jay & Millie app.

No Firebase, no API keys, and no backend are needed yet.

## Included features

- Jay / Millie login selection
- Real-time-style chat UI using local demo data
- Text messages
- Image sharing
- Video sharing
- Voice note recording with microphone permission
- Voice note playback with waveform-style UI
- Shared planner/calendar
- Reminder list with complete/delete actions
- Memories/media gallery
- Tic-Tac-Toe
- Game score tracking
- Game chat
- Notifications drawer
- Profile/settings panel
- Dark/light theme
- Responsive mobile and desktop layout
- Installable PWA manifest + service worker
- Local persistence using:
  - localStorage for app data
  - IndexedDB for images, videos, and voice recordings

## Run it

```bash
npm install
npm run dev
```

Open the local URL Vite prints in your terminal.

## Important

Because this is the frontend-only phase:

- Data stays on the current browser/device.
- Jay and Millie are not synchronized across two separate phones yet.
- Notifications are in-app demo notifications.
- Media and voice notes are stored locally in IndexedDB.
- Login is only a demo identity selector and has no password.

The next phase is connecting Firebase:

- Firebase Authentication
- Firestore real-time messages
- Firebase Storage for photos/videos/voice notes
- Shared planner/reminders
- Synced game state
- Real notifications

## Palette

- Background: `#0D0B10`
- Surface: `#17131C`
- Raised Surface: `#211A28`
- Jay: `#7656A8`
- Millie: `#B85F7C`
- Text: `#F3EFF4`
- Muted: `#A49AA9`
- Border: `#302737`
