# Fixed: gTTS Audio Not Stopping in LiveChatAI

## Problem

When clicking the pause/stop button in LiveChatAI, the gTTS audio kept playing. It only stopped when quitting the iOS simulator.

## Root Cause

The app was using two different audio systems:
1. **Device TTS** - `Speech.speak()` from Expo Speech
2. **gTTS Audio** - `Audio.Sound` from Expo Audio (MP3 playback)

The pause button only called `Speech.stop()`, which only stops device TTS. The gTTS audio (MP3) was playing through `Audio.Sound`, which requires different stop methods.

## Solution

### Changes Made

1. **Added Sound Tracking**
   ```javascript
   const [currentSound, setCurrentSound] = useState(null);
   ```
   Track the currently playing audio object.

2. **Updated `speakAIResponse()`**
   - Stop any previous audio before playing new audio
   - Save the sound reference: `setCurrentSound(sound)`
   - Clear the reference when done

3. **Updated Pause Button**
   ```javascript
   if (currentSound) {
     await currentSound.stopAsync();
     await currentSound.unloadAsync();
     setCurrentSound(null);
   }
   ```

4. **Updated All Stop Points**
   - Mic press handler
   - Start recording
   - End session
   - Component unmount cleanup

## How It Works Now

### When Audio Plays
```javascript
const { sound } = await Audio.Sound.createAsync(/* ... */);
setCurrentSound(sound); // Save reference
```

### When Stop Button Pressed
```javascript
// Stop device TTS
Speech.stop();

// Stop gTTS audio
if (currentSound) {
  await currentSound.stopAsync();     // Stop playback
  await currentSound.unloadAsync();   // Free memory
  setCurrentSound(null);              // Clear reference
}
```

## Testing

1. **Start backend**: `npm start` in `backend/`
2. **Start mobile app**: `npm start` in `mobile-chat-app/`
3. **Test in LiveChatAI**:
   - Speak a question
   - While AI is speaking, press pause button ⏸️
   - Audio should stop immediately
   - Also test tapping mic button while speaking
   - Test ending session while speaking

## Files Modified

- `mobile-chat-app/components/LiveChatAI.js`
  - Added `currentSound` state
  - Updated `speakAIResponse()` to track audio
  - Updated pause button to stop gTTS audio
  - Updated `handleMicPress()` to stop gTTS audio
  - Updated `startRecording()` to stop gTTS audio
  - Updated `handleEndSession()` to stop gTTS audio
  - Updated cleanup in `useEffect()` to stop gTTS audio

## Key Methods

| Audio System | Start | Stop |
|--------------|-------|------|
| Device TTS | `Speech.speak()` | `Speech.stop()` |
| gTTS Audio | `Audio.Sound.createAsync()` | `sound.stopAsync()` + `sound.unloadAsync()` |

## Benefits

✅ Pause button now works immediately
✅ Mic button stops audio when pressed
✅ End session stops audio cleanly
✅ No memory leaks (proper audio cleanup)
✅ Works consistently across all stop scenarios
