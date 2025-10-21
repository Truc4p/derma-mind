# Quick Run Guide - Figure Screenshot Extractor

## 🚀 How to Run in Google Colab

### Step-by-Step Execution

1. **Upload to Colab**
   - Go to [Google Colab](https://colab.research.google.com/)
   - Upload `pdf_figure_screenshot_extractor2.ipynb`

2. **Run Cells in Order**
   - Click "Runtime" → "Run all" OR
   - Run each cell manually with Shift+Enter

### Cell Execution Order

```
✅ Step 1: Install Required Libraries
   - Installs PyMuPDF, Pillow

✅ Step 2: Import Libraries
   - Imports fitz, PIL, json, etc.

✅ Step 3: Mount Google Drive (Optional)
   - Only if PDF is in Google Drive

✅ Step 4: Upload PDF File
   - Upload your PDF or specify Drive path

✅ Step 5: Figure Screenshot Extractor Class
   - Defines the main extraction class
   - No output, just defines the class

✅ Step 6: Configure Extraction Settings
   - Set DPI (300 recommended)
   - Set PADDING (30 recommended)
   - Set output directory

✅ Step 7: Run the Screenshot Extraction
   - Creates extractor instance
   - Calls: extractor.extract_all_figures()
   - Calls: extractor.create_markdown_output(summary)
   - Displays extraction summary

✅ Step 8: Preview Extracted Figure Screenshots
   - Shows grid of extracted figures

✅ Step 9: Compare Screenshot vs Embedded Image
   - Shows quality comparison
```

## 📋 Correct Method Calls

### FigureScreenshotExtractor Class Methods

```python
# Initialize extractor
extractor = FigureScreenshotExtractor(
    pdf_path="your_file.pdf",
    output_dir="output",
    dpi=300,
    padding=20
)

# Method 1: Extract all figures
summary = extractor.extract_all_figures()
# Returns: Dictionary with extraction summary

# Method 2: Extract from specific page range
summary = extractor.extract_all_figures(start_page=1, end_page=50)
# Returns: Dictionary with extraction summary

# Method 3: Create markdown file
markdown_file = extractor.create_markdown_output(summary)
# Returns: Path to created markdown file

# Method 4: Extract from single page
page = extractor.doc[0]  # First page
figures = extractor.extract_figures_from_page(page, page_num=1)
# Returns: List of figure dictionaries
```

## ⚙️ Configuration Options

### DPI Settings
```python
DPI = 150  # Good for web/screen viewing
DPI = 300  # High quality (recommended)
DPI = 600  # Very high quality (large files)
```

### Padding Settings
```python
PADDING = 20  # Minimal padding, tight crop
PADDING = 30  # Recommended, balanced
PADDING = 40  # Extra space around figures
PADDING = 50  # Maximum padding, includes context
```

### Output Directory
```python
output_directory = "figure_screenshots"  # Default
output_directory = "/content/drive/MyDrive/output"  # Google Drive
output_directory = "my_figures"  # Custom name
```

## 🎯 Expected Output

After running Step 7, you should see:

```
📚 Processing PDF: your_file.pdf
📊 DPI: 300 | Padding: 30px
📁 Output directory: figure_screenshots

📖 Scanning pages 1 to 50 of 300...

📄 Page 3:
  ✅ Extracted FIGURE 1-1 → figure_1_1.png
     Type: Standard | Size: 468x592 points | Images: 1
     Caption: FIGURE 1-1 Description here...

📄 Page 5:
  ✅ Extracted FIGURE 1-2 → figure_1_2.png
     Type: Large figure | Size: 540x720 points | Images: 1
     Caption: FIGURE 1-2 DNA helix structure...

============================================================
✅ Extraction Complete!
============================================================
📊 Figures extracted: 15
⚠️  Figures skipped: 0
📁 Output directory: figure_screenshots
📄 Summary saved to: figure_screenshots/extraction_summary.json
============================================================

📝 Markdown file created: figure_screenshots/extracted_figures.md

============================================================
📊 EXTRACTION SUMMARY
============================================================
  📄 PDF: your_file.pdf
  📖 Pages scanned: 50
  ✅ Figures extracted: 15
  ⚠️  Figures skipped: 0
  📁 Output directory: figure_screenshots
  🖼️  Resolution: 300 DPI
  📏 Padding: 30 pixels
  📝 Markdown file: figure_screenshots/extracted_figures.md
============================================================
```

## 📁 Output Files Structure

```
figure_screenshots/
├── images/
│   ├── figure_1_1.png
│   ├── figure_1_2.png
│   ├── figure_1_3.png
│   └── ...
├── extracted_figures.md    ← Markdown with embedded figures
└── extraction_summary.json ← Detailed extraction data
```

## 🐛 Common Errors & Fixes

### Error: `AttributeError: 'FigureScreenshotExtractor' object has no attribute 'convert_to_markdown'`

**Cause**: Using wrong method name

**Fix**: Use correct methods:
```python
# ❌ WRONG
markdown_file = extractor.convert_to_markdown()

# ✅ CORRECT
summary = extractor.extract_all_figures()
markdown_file = extractor.create_markdown_output(summary)
```

### Error: `No figures found`

**Causes & Fixes**:
1. PDF doesn't have "FIGURE" captions
   - Check if PDF uses "Fig.", "Fig", or other patterns
   
2. PDF is scanned (image-based)
   - Requires OCR preprocessing
   
3. Wrong page range
   - Check start_page and end_page parameters

### Error: `File not found`

**Fix**:
```python
# Check PDF path
import os
print(f"PDF exists: {os.path.exists(pdf_path)}")
print(f"PDF path: {pdf_path}")
```

## 💡 Tips for Best Results

### 1. Test on Small Range First
```python
# Test on first 10 pages
summary = extractor.extract_all_figures(start_page=1, end_page=10)
```

### 2. Check Console Output
- Shows what figures are detected
- Reports figure types and sizes
- Displays caption text

### 3. Adjust Settings If Needed
- **Captions cut off?** → Increase PADDING to 40-50
- **Too much content?** → Decrease PADDING to 20-25
- **Low quality?** → Increase DPI to 450-600
- **Files too large?** → Decrease DPI to 200-250

### 4. Monitor Memory Usage
```python
# For large PDFs, process in batches
for start in range(1, 300, 50):
    end = min(start + 49, 300)
    summary = extractor.extract_all_figures(start_page=start, end_page=end)
```

## 📊 Understanding the Summary

### extraction_summary.json
```json
{
  "pdf_path": "your_file.pdf",
  "total_pages_scanned": 50,
  "figures_extracted": 15,
  "figures_skipped": 0,
  "output_directory": "figure_screenshots",
  "dpi": 300,
  "padding": 30,
  "extraction_date": "2025-10-21T18:00:00",
  "figures": [
    {
      "figure_num": "1-1",
      "page": 3,
      "caption": "FIGURE 1-1 Description...",
      "image_filename": "figure_1_1.png",
      "bbox": [50, 100, 550, 700],
      "width_points": 500,
      "height_points": 600,
      "num_images": 1,
      "type": "Standard"
    }
  ]
}
```

## 🎉 Success Checklist

After extraction, verify:

- ✅ Console shows "Extraction Complete!"
- ✅ Number of extracted figures matches expectations
- ✅ Output directory contains `images/` folder
- ✅ PNG files are present in `images/` folder
- ✅ `extracted_figures.md` file exists
- ✅ `extraction_summary.json` file exists
- ✅ Step 8 displays figure previews
- ✅ Captions are fully visible in screenshots
- ✅ Text labels/diagrams are preserved

## 📞 Need Help?

If you encounter issues:

1. **Check console output** for error messages
2. **Verify PDF is text-based** (not scanned)
3. **Test with smaller page range** first
4. **Adjust PADDING/DPI settings**
5. **Review troubleshooting section** in notebook

Happy extracting! 🎯
