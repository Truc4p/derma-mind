# Figure Extraction Troubleshooting Guide

## 🔍 Common Issues and Solutions

Based on your feedback, here are the issues you encountered and how they're now fixed:

---

## Issue 1: Partial Figure Captured ❌

### Example: FIGURE 1-2 (DNA Double Helix)

**Problem:**
- Only captured a small portion of the DNA helix image
- Missing the full decorative/artistic rendering
- Screenshot shows: `/Users/phamthanhtruc/Downloads/figure_screenshots (1)/images/figure_1_2.png`
- Should look like: `/Users/phamthanhtruc/Desktop/Screenshot 2025-10-21 at 17.21.08.png`

**Root Cause:**
- FIGURE 1-2 is a **full-page decorative image** that spans across margins
- Original code only detected small embedded images
- Missed the complete image block

**Solution Applied:** ✅
```python
# Now detects BOTH:
# 1. Embedded images (get_images)
# 2. Image blocks (block["type"] == 1) for full-page images

for block in blocks:
    if block["type"] == 1:  # Image block
        image_bboxes.append(block["bbox"])
```

---

## Issue 2: Too Much Content Captured ❌

**Problem:**
- Some figures include extra text/content from other parts of the page
- Captures content that's not related to the figure

**Root Cause:**
- System was grouping ALL images above a caption
- No distance limit or relevance checking
- No distinction between figure types

**Solution Applied:** ✅

### A. Distance Filtering
```python
# Only include images within 500 points (~7 inches) of caption
vertical_gap = caption_start_y - img_bbox[3]
if vertical_gap > 500:
    continue  # Skip images too far from caption
```

### B. Better Alignment Detection
```python
# Three criteria for including an image:
1. Horizontally aligned with caption (within 150 points)
2. Both centered on page (within 100 points of page center)  
3. Full-width image (spans >60% of page width)
```

### C. Adaptive Padding
```python
# Large figures (like FIGURE 1-2): Minimal padding
if total_height > 300 or total_width > page.rect.width * 0.6:
    padding = minimal  # Avoid capturing other content
    
# Normal figures (like FIGURE 1-3): More padding
else:
    padding = generous  # Include phase labels and descriptions
```

---

## Issue 3: FIGURE 1-3 Working Correctly ✅

**What's Working:**
- Captures all 6 phases (First through Sixth)
- Includes "One cell has divided to create two cells" text
- Complete caption with all phase descriptions
- Proper spacing and layout

**Why It Works:**
- System detects all 6 separate image components
- Groups them as one figure based on proximity to caption
- Uses generous padding for multi-panel figures

---

## 📊 Figure Type Detection

The system now automatically detects and handles different figure types:

### Type 1: Multi-Panel Figures (FIGURE 1-3)
- **Characteristics**: Multiple small images in a grid
- **Detection**: 6 images, total width < 60% of page
- **Padding**: Generous (30-90 points)
- **Result**: Captures all panels + labels + caption

### Type 2: Full-Page Decorative (FIGURE 1-2)
- **Characteristics**: Single large image spanning page
- **Detection**: Height > 300 or width > 60% of page  
- **Padding**: Minimal (10-30 points)
- **Result**: Captures complete image without extra content

### Type 3: Standard Diagrams
- **Characteristics**: Single centered image
- **Detection**: 1 image, moderate size
- **Padding**: Standard (30 points)
- **Result**: Image + caption with proper spacing

---

## 🎯 Verification Checklist

After extraction, verify your figures:

### ✅ Complete Figures
- [ ] All panels/phases are visible
- [ ] No parts cut off at edges
- [ ] Labels and text within figure are clear
- [ ] Caption is complete

### ✅ No Extra Content
- [ ] No unrelated text from page
- [ ] No other figures included
- [ ] No page headers/footers
- [ ] Clean boundaries

### ✅ Quality
- [ ] Text is readable (check DPI setting)
- [ ] Images are sharp
- [ ] Colors are accurate
- [ ] Proper resolution for intended use

---

## 🔧 Adjustments You Can Make

### If Figure is Still Cut Off:

1. **Increase PADDING**
   ```python
   PADDING = 50  # Try higher values: 40, 50, 60
   ```

2. **Check Console Output**
   ```
   Found X image(s) in figure  # Should match expected number
   Type: Large/Full-page       # Confirms detection type
   Region: 520x480 points      # Size of captured area
   ```

3. **Verify Image Count**
   - FIGURE 1-3 should show: `Found 6 image(s)`
   - FIGURE 1-2 should show: `Found 1 image(s)` with `Type: Large/Full-page`

### If Too Much Content Captured:

1. **Decrease PADDING**
   ```python
   PADDING = 20  # Try lower values: 15, 20, 25
   ```

2. **Check Figure Type Detection**
   - Console shows `Type: Large/Full-page` or `Type: Standard`
   - Large figures use minimal padding automatically

---

## 📝 Debugging Output Explained

When you run the extraction, you'll see:

```
📖 Processing page 3/300...
  📍 Found 2 figure(s) on page 3
  
  ✅ Captured FIGURE 1-2: figure_1_2.png
     Found 1 image(s) in figure
     Type: Large/Full-page              ← Detected as full-page image
     Region: 380x520 points             ← Size of captured region
     Caption: FIGURE 1-2 The DNA double helix...
  
  ✅ Captured FIGURE 1-3: figure_1_3.png
     Found 6 image(s) in figure         ← All 6 phases detected
     Type: Standard                     ← Multi-panel figure
     Region: 520x480 points
     Caption: FIGURE 1-3 Indirect division...
```

### What to Look For:

1. **Image Count** (`Found X image(s)`)
   - Should match the number of panels/components you expect
   - FIGURE 1-3: 6 images ✅
   - FIGURE 1-2: 1 image ✅

2. **Type Detection** (`Type: ...`)
   - `Large/Full-page`: Minimal padding, avoids extra content
   - `Standard`: Normal padding for complete capture

3. **Region Size** (`Region: WxH points`)
   - Large regions = capturing more content
   - Small regions = might be missing content
   - Compare across similar figures

---

## 🚨 Still Having Issues?

### Issue: Specific figure still incomplete

**Check:**
1. Is the caption correctly formatted? (Must start with "FIGURE" or "Fig")
2. Are images within 500 points of caption?
3. Run with different PADDING values

**Try:**
```python
# For problematic figures, try:
PADDING = 60  # More generous padding
DPI = 300     # Ensure high quality
```

### Issue: Wrong content captured

**Check:**
1. Are there multiple figures on the same page?
2. Is there decorative content above the caption?
3. Console output shows `Type: Large/Full-page`?

**Try:**
```python
PADDING = 15  # Tighter cropping for large figures
```

### Issue: No figures detected

**Check:**
1. Caption format (must match: FIGURE 1-1, Fig. 1-1, etc.)
2. PDF is text-based (not scanned)
3. Images exist above caption

---

## 📊 Expected Results by Figure Type

### FIGURE 1-2 (DNA Double Helix)
```
✅ Expected Output:
- Single large decorative image
- Full DNA helix visible
- Artistic rendering complete
- Caption: "The DNA double helix"
- No extra page content
- Type: Large/Full-page
```

### FIGURE 1-3 (Cell Division)
```
✅ Expected Output:
- All 6 phases visible (First through Sixth)
- Each phase with its diagram
- "One cell has divided..." text included
- Complete caption with all descriptions
- Type: Standard (multi-panel)
```

---

## 💡 Best Practices

1. **Always check console output** - It tells you what was detected
2. **Preview first few figures** - Adjust settings before processing full PDF
3. **Use appropriate DPI** - 300 for medical/anatomy textbooks
4. **Verify image counts** - Should match visual inspection
5. **Check both types** - Test with both multi-panel and full-page figures

---

## 📞 Quick Reference

| Issue | Solution | Setting |
|-------|----------|---------|
| Figure cut off | Increase padding | `PADDING = 50` |
| Too much content | Decrease padding | `PADDING = 20` |
| Blurry text | Increase DPI | `DPI = 600` |
| Large files | Decrease DPI | `DPI = 150` |
| Missing panels | Check image count | Console output |
| Wrong type detected | Adjust thresholds | Code modification |

---

**Last Updated**: October 21, 2025  
**Version**: 2.1 (Improved Type Detection & Filtering)
