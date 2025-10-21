# Figure Extraction Guide

## 📚 Overview

This guide explains the improved PDF figure screenshot extraction system that captures **complete figures** including all panels, labels, and captions.

## 🎯 The Problem

Your original extracted figure (`figure_1_3.png`) was **incomplete** - it only captured 4 phases instead of all 6 phases shown in the complete figure.

### What Was Missing:
- ❌ Third Phase panel (top right)
- ❌ Sixth Phase panel (bottom right with "One cell has divided to create two cells")
- ❌ Some phase descriptions were cut off

## ✅ The Solution

The new system uses **intelligent image detection** instead of fixed search distances:

### How It Works:

1. **Find FIGURE Caption**
   - Scans the page for text matching "FIGURE 1-3", "FIGURE 2-1", etc.
   - Identifies the caption and its complete description

2. **Locate All Related Images**
   - Finds ALL images positioned above the caption
   - Checks horizontal alignment (centered or near the caption)
   - Groups images that belong to the same figure

3. **Calculate Bounding Box**
   - Creates a bounding box that encompasses ALL detected images
   - Includes the complete caption below
   - Adds padding for proper spacing

4. **Screenshot the Region**
   - Renders the page at high resolution (300 DPI)
   - Crops to the calculated bounding box
   - Saves as PNG with meaningful filename

## 📊 Key Improvements

### Old Method (Fixed Distance):
```
❌ Searched fixed 250 points above caption
❌ Could miss images outside that range
❌ Captured partial figures
❌ Manual distance adjustment needed
```

### New Method (Automatic Detection):
```
✅ Finds ALL images above caption automatically
✅ Adapts to any figure size/layout
✅ Captures complete figures with all panels
✅ No manual adjustment needed
✅ Shows how many images were detected
```

## 🖼️ Example: FIGURE 1-3

### Complete Figure Should Include:
- **First Phase** (top left): Chromosomes begin to line up
- **Second Phase** (top center): Chromosomes duplicate themselves
- **Third Phase** (top right): New structures begin migrating ✅ NOW INCLUDED
- **Fourth Phase** (bottom left): Nucleus begins dividing
- **Fifth Phase** (bottom center): Nucleus breaks into two nuclei
- **Sixth Phase** (bottom right): Cell forms two cells ✅ NOW INCLUDED
- **Complete Caption**: All six phase descriptions

## 🚀 Usage

### In Google Colab:

```python
# Configure settings
output_directory = "figure_screenshots"
DPI = 300          # High quality
PADDING = 30       # Extra space around figure

# Run extraction
extractor = FigureScreenshotExtractor(
    pdf_path, 
    output_dir=output_directory,
    dpi=DPI,
    padding=PADDING
)

markdown_file = extractor.convert_to_markdown()
```

### Output Information:

The system now shows detailed info for each figure:
```
📖 Processing page 3/300...
  📍 Found 1 figure(s) on page 3
  ✅ Captured FIGURE 1-3: figure_1_3.png
     Found 6 image(s) in figure
     Region: 520x480 pixels
     Caption: FIGURE 1-3 Indirect division of the human cell...
```

## 📝 Configuration Options

### DPI (Resolution):
- **150 DPI**: Good for web, smaller files
- **300 DPI**: ⭐ Recommended - High quality, readable text
- **600 DPI**: Very high quality, large files

### PADDING:
- **20 pixels**: Tight cropping
- **30 pixels**: ⭐ Recommended - Good spacing
- **50 pixels**: Lots of margin

## 🔍 Verification

### Check Your Results:

1. **Count Images**: Console shows "Found X image(s) in figure"
   - FIGURE 1-3 should show: "Found 6 image(s)"

2. **Check Dimensions**: Larger figures = more content captured
   - Complete FIGURE 1-3 should be ~520x480 pixels or larger

3. **Preview Images**: Use Step 8 in the notebook to display extracted figures

4. **Review Captions**: Complete captions should include all phase descriptions

## 🎓 Best Practices

### For Medical/Anatomy Textbooks:
- ✅ Use 300+ DPI for clear text labels
- ✅ Use PADDING of 30-40 pixels
- ✅ Check that multi-panel figures are complete

### For Diagrams with Many Labels:
- ✅ Higher DPI preserves small text
- ✅ Verify all labels are readable in preview

### For Large Composite Figures:
- ✅ System automatically adapts to size
- ✅ Check bbox dimensions in output

## 🐛 Troubleshooting

### Still Missing Panels?

**Possible Causes:**
1. **Images too far from caption**: The system looks for images above the caption with reasonable horizontal alignment
2. **Images on different page**: System processes one page at a time
3. **Vector graphics instead of images**: Increase PADDING or use fallback area

**Solutions:**
- Check console output: "Found X image(s) in figure"
- If X is too low, the system might not be detecting all panels
- Try increasing PADDING to 50-60 pixels
- Verify the PDF structure (some PDFs use vector graphics)

### Figure Too Large?

- Decrease PADDING
- The system includes all detected images - this is intentional for completeness

### Wrong Content Captured?

- Check if there are multiple figures on the same page
- System groups images by horizontal alignment with caption

## 📦 Output Files

### Generated Files:
```
figure_screenshots/
├── images/
│   ├── figure_1_1.png      # Complete figure with all panels
│   ├── figure_1_3.png      # All 6 phases + caption
│   ├── figure_2_1.png      # Next figure
│   └── ...
├── [bookname]_figures.md   # Markdown with embedded figures
└── extraction_summary.json # Statistics
```

### Markdown Format:
```markdown
#### FIGURE 1-3

![Figure 1-3](images/figure_1_3.png)

**Caption:** *FIGURE 1-3 Indirect division of the human cell. 
First phase—Chromosomes begin to line up in the center of cell. 
Second phase—Chromosomes duplicate themselves. 
...*
```

## 🎉 Success Criteria

Your extraction is successful when:

- ✅ All panels/phases are visible in the screenshot
- ✅ All text labels are readable
- ✅ Complete caption is included
- ✅ Proper spacing around the figure
- ✅ High resolution (text is sharp)
- ✅ Console shows correct number of images detected

## 🔗 Files

- **Notebook**: `pdf_figure_screenshot_extractor.ipynb`
- **Method**: Automatic image detection + screenshot
- **Format**: High-resolution PNG files
- **Quality**: Preserves all text, labels, and annotations

---

**Updated**: October 21, 2025
**Version**: 2.0 (Automatic Image Detection)
