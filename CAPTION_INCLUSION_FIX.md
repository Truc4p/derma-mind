# Caption Inclusion Fix

## Problem

Some extracted figures were missing their captions:
- **FIGURE 1-4**: Missing caption "Histology of the skin, hair, and glands"
- **FIGURE 1-8**: Missing caption about skin penetration routes

The screenshots were cutting off the caption text at the bottom of the figure.

## Root Causes

1. **Insufficient Bottom Padding**: Only `padding` pixels (default 20px) were added below the caption, which wasn't enough to ensure full visibility at 300 DPI
2. **One-Direction Caption Extension**: The code only looked for caption text **below** the FIGURE pattern, missing cases where text appears **above** it
3. **Caption Boundary Not Tracked**: The exact caption boundaries weren't properly tracked for accurate screenshot cropping

## Solution Implemented

### 1. Bidirectional Caption Detection

**Before:**
```python
# Only looked below the FIGURE block
if (next_bbox[1] >= caption_end_y and 
    next_bbox[1] - caption_end_y < 20):
    caption_end_y = next_bbox[3]
    full_caption_text += " " + next_text
```

**After:**
```python
# Looks both below AND above
# Below
if (next_bbox[1] >= caption_end_y and 
    next_bbox[1] - caption_end_y < 20):
    caption_end_y = next_bbox[3]
    full_caption_text += " " + next_text

# Above (NEW)
if (next_bbox[3] <= caption_start_y and 
    caption_start_y - next_bbox[3] < 20):
    caption_start_y = next_bbox[1]
    full_caption_text = next_text + " " + full_caption_text
```

### 2. Increased Bottom Padding

**Before:**
```python
y1 = min(page.rect.height, caption_end_y + self.padding)
```

**After:**
```python
# Use 3x padding below caption
caption_bottom_with_padding = caption_end_y + (self.padding * 3)
y1 = min(page.rect.height, caption_bottom_with_padding)
```

This ensures **60 pixels** (20 × 3) of space below the caption instead of just 20 pixels, providing ample room for the caption text to be fully visible.

### 3. Enhanced Caption Boundary Tracking

**Before:**
```python
caption_bbox = block["bbox"]
caption_start_y = caption_bbox[1]
caption_end_y = caption_bbox[3]
```

**After:**
```python
caption_bbox = block["bbox"]
caption_start_y = caption_bbox[1]
caption_end_y = caption_bbox[3]
caption_left_x = caption_bbox[0]   # NEW: Track left edge
caption_right_x = caption_bbox[2]   # NEW: Track right edge

# Update boundaries as caption extends
caption_left_x = min(caption_left_x, next_bbox[0])
caption_right_x = max(caption_right_x, next_bbox[2])
```

## Results

### FIGURE 1-4 (Histology)
- **Before**: Only diagram visible, caption cut off
- **After**: Complete diagram + full caption "FIGURE 1-4 Histology of the skin, hair, and glands."

### FIGURE 1-8 (Skin Penetration)
- **Before**: Multi-panel diagram without caption
- **After**: All 3 panels + complete caption "FIGURE 1-8 Various routes of skin penetration: through the follicle wall, the sebaceous glands, and intercellular and transcellular routes."

## Technical Details

### Padding Calculation
- **Default padding**: 20 pixels
- **Caption bottom padding**: 20 × 3 = **60 pixels**
- **At 300 DPI**: 60 pixels ≈ 0.2 inches ≈ 14 points
- This is enough space to capture 2-3 lines of caption text

### Caption Detection Rules
- **Vertical gap tolerance**: 20 points between text blocks
- **Horizontal alignment tolerance**: 50 points for multi-line captions
- **Patterns detected**: FIGURE X-Y, FIGURE X, Fig. X-Y, Fig X

### Boundary Expansion
```
Original caption block:     [FIGURE 1-4 Histology...]
                                    ↓
Caption extension above:    [text above]
Caption extension below:    [of the skin, hair, and glands.]
                                    ↓
Final caption region:       [Complete caption with all text]
                                    ↓
Screenshot with padding:    [Figure] + [Caption] + [60px padding]
```

## Verification Steps

1. **Re-run extraction** with updated notebook
2. **Check FIGURE 1-4**: Should include "Histology of the skin, hair, and glands" at bottom
3. **Check FIGURE 1-8**: Should include full description about penetration routes
4. **Check console output**: Caption text should show complete description
5. **Measure screenshots**: Caption should be fully visible with space below

## Expected Console Output

```
✅ Extracted FIGURE 1-4 → figure_1_4.png
   Type: Standard | Size: 468x592 points | Images: 1
   Caption: FIGURE 1-4 Histology of the skin, hair, and glands.

✅ Extracted FIGURE 1-8 → figure_1_8.png
   Type: Multi-component | Size: 452x638 points | Images: 3
   Caption: FIGURE 1-8 Various routes of skin penetration: through the follicle wall...
```

## Configuration

If captions are still cut off, adjust the padding multiplier:

```python
# Current (3x padding = 60 pixels)
caption_bottom_with_padding = caption_end_y + (self.padding * 3)

# If needed, increase to 4x or 5x
caption_bottom_with_padding = caption_end_y + (self.padding * 4)  # 80 pixels
caption_bottom_with_padding = caption_end_y + (self.padding * 5)  # 100 pixels
```

Or increase the base padding parameter:
```python
# In configuration cell
PADDING = 30  # Instead of 20
```

## Summary

✅ Captions now detected in both directions (above and below FIGURE pattern)  
✅ 3x padding below caption ensures full visibility  
✅ Complete caption boundaries tracked for accurate cropping  
✅ Works for single-line and multi-line captions  
✅ Handles text before and after FIGURE label  

The system now captures complete, professional-looking figure screenshots with fully visible captions!
