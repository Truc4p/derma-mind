# Multi-Day PDF Extraction Strategy

## 🚨 Quota Reality Check

**We discovered the actual free tier limits:**
- `gemini-2.0-flash-exp`: **50 requests/day** (hit limit at chunk 54)
- `gemini-2.5-flash`: **250 requests/day** (5x better!)
- Per-minute limit: **10 requests/minute**

**Total chunks to process:** 624 chunks

**New extraction plan:** 3 days with `gemini-2.5-flash`

---

## 📅 3-Day Extraction Schedule

### Day 1 (Today - if quota resets)
```bash
cd backend
node knowledge-sources/processors/pdfProcessor.js
```
- Process: Chunks 1-240
- Expected entries: ~800-1,000
- Output: `extracted-knowledge-progress-chunk240.json`
- Time: ~28 minutes (7s delay × 240)

### Day 2 (Tomorrow)
Edit `pdfProcessor.js` line 307:
```javascript
startFromChunk: 240,  // Resume from where we left off
maxChunks: 240        // Process next 240 chunks
```
- Process: Chunks 241-480
- Expected entries: ~800-1,000
- Output: `extracted-knowledge-progress-chunk480.json`

### Day 3 (Day After)
Edit `pdfProcessor.js` line 307:
```javascript
startFromChunk: 480,  // Resume from where we left off
maxChunks: null       // Process all remaining chunks (144)
```
- Process: Chunks 481-624
- Expected entries: ~500-600
- Output: `extracted-knowledge.json` (final)

---

## 🔄 What Changed

### 1. Switched to gemini-2.5-flash
- **250 requests/day** (vs 50)
- Better for batch processing
- Still high quality extraction

### 2. Added Resume Support
```javascript
processPDF(pdfPath, {
    startFromChunk: 0,  // Resume from this chunk
    maxChunks: 240      // Limit chunks per session
})
```

### 3. Increased Delay
- **7 seconds** between requests (was 1.5s)
- Respects 10 req/min limit with buffer
- Prevents rate limit errors

### 4. Auto-Save Progress
- If quota hit mid-run, saves progress automatically
- Creates file: `extracted-knowledge-progress-chunk{N}.json`
- Shows resume instruction: "Resume with: startFromChunk: {N+1}"

### 5. Retry Logic
- Automatically retries rate-limited requests
- Waits for retry delay + 2 second buffer
- Gracefully handles transient errors

---

## 📊 Expected Results

**Total extraction stats (all 624 chunks):**
- **Estimated entries:** 2,100-2,600 knowledge entries
- **Categories:** skin-conditions, ingredients, treatments, routines, cosmetics, procedures, general-advice
- **Source attribution:** Chapter numbers, titles, page references
- **Quality:** Sidebar definitions merged with main text explanations

**Already extracted (chunks 1-53):**
- ✅ ~185 entries from your first run
- ✅ These are saved in the progress file

---

## 🛠️ How to Use

### Check Your Current Progress
```bash
ls -lh backend/knowledge-sources/pdfs/*.json
```

### See What You Already Extracted
```bash
cat backend/knowledge-sources/pdfs/extracted-knowledge-progress-chunk*.json | grep -c '"title"'
```

### Resume from Last Checkpoint
1. Find the last chunk number from error or progress file
2. Edit `pdfProcessor.js` line 307-308:
   ```javascript
   startFromChunk: {last_chunk + 1},
   maxChunks: 240
   ```
3. Run again: `node knowledge-sources/processors/pdfProcessor.js`

---

## 💡 Pro Tips

### Test with Small Batch First
```javascript
startFromChunk: 0,
maxChunks: 5  // Just 5 chunks to verify everything works
```

### Monitor Quota Usage
Check console output for:
- ✓ Extracted X knowledge entries (success)
- ⚠️ Rate limit hit (need to wait)
- ❌ Fatal error (check logs)

### Merge Progress Files (After All Days Complete)
```javascript
// Run this after all 3 days
const day1 = require('./pdfs/extracted-knowledge-progress-chunk240.json');
const day2 = require('./pdfs/extracted-knowledge-progress-chunk480.json');
const day3 = require('./pdfs/extracted-knowledge.json');

const merged = [...day1, ...day2, ...day3];
fs.writeFileSync('./pdfs/extracted-knowledge-final.json', JSON.stringify(merged, null, 2));
```

---

## ⚠️ Important Notes

1. **Don't change `saveToDatabase: false`** until all chunks are processed and merged
2. **Quota resets at midnight Pacific Time** (Google's timezone)
3. **The 7-second delay is critical** - don't reduce it or you'll hit rate limits
4. **Progress is automatically saved** if the script crashes
5. **Each day's run is independent** - you can stop/start safely

---

## 📈 Timeline

- **Day 1:** Extract chapters 1-10 (chunks 1-240)
- **Day 2:** Extract chapters 11-20 (chunks 241-480)
- **Day 3:** Extract chapters 21-31 + appendices (chunks 481-624)

**Total processing time across 3 days:** ~84 minutes of actual processing
**Total entries by end:** ~2,100-2,600 comprehensive dermatology knowledge entries

---

## 🎯 Next Steps After Extraction Complete

1. Review merged JSON file for quality
2. Set `saveToDatabase: true` 
3. Run one final time to populate MongoDB
4. Test AI Dermatologist with new knowledge base
5. Verify source citations appear correctly in responses

---

**Status:** Ready to start Day 1 (with gemini-2.5-flash, 240 chunks/day plan)
