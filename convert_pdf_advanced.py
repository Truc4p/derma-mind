"""
Advanced PDF to Markdown converter that preserves structure and extracts images
"""
import fitz  # PyMuPDF
import os
from pathlib import Path
import re

def create_output_directories(base_path):
    """Create directories for images and markdown output"""
    images_dir = os.path.join(base_path, 'images')
    os.makedirs(images_dir, exist_ok=True)
    return images_dir

def extract_images_from_page(page, page_num, images_dir):
    """Extract all images from a PDF page"""
    image_list = page.get_images(full=True)
    images_info = []
    
    for img_index, img in enumerate(image_list):
        xref = img[0]
        try:
            base_image = page.parent.extract_image(xref)
            image_bytes = base_image["image"]
            image_ext = base_image["ext"]
            
            # Create image filename
            image_filename = f"page_{page_num + 1}_img_{img_index + 1}.{image_ext}"
            image_path = os.path.join(images_dir, image_filename)
            
            # Save image
            with open(image_path, "wb") as image_file:
                image_file.write(image_bytes)
            
            # Store relative path for markdown
            images_info.append(f"images/{image_filename}")
            
        except Exception as e:
            print(f"  ⚠ Could not extract image {img_index + 1} from page {page_num + 1}: {e}")
    
    return images_info

def detect_heading_level(text_block):
    """Detect if text is a heading based on font size and formatting"""
    # This is a simplified heuristic - adjust based on your PDF
    text = text_block.get("text", "").strip()
    size = text_block.get("size", 0)
    
    if not text:
        return None, None
    
    # Check for chapter patterns
    if re.match(r'^CHAPTER\s+\d+', text, re.IGNORECASE):
        return 1, text
    
    # Detect headings by font size (adjust thresholds based on your PDF)
    if size > 16:
        return 1, text
    elif size > 14:
        return 2, text
    elif size > 12:
        return 3, text
    
    return None, text

def extract_structured_text(page):
    """Extract text with structure information"""
    blocks = page.get_text("dict")["blocks"]
    structured_content = []
    
    for block in blocks:
        if "lines" in block:  # Text block
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span.get("text", "").strip()
                    if text:
                        structured_content.append({
                            "text": text,
                            "size": span.get("size", 0),
                            "flags": span.get("flags", 0),
                            "font": span.get("font", ""),
                            "type": "text"
                        })
    
    return structured_content

def convert_pdf_to_markdown_advanced(pdf_path, output_dir):
    """
    Convert PDF to Markdown with structure and images preserved
    """
    print(f"🔄 Starting advanced PDF conversion...")
    print(f"   PDF: {pdf_path}")
    
    # Create output directories
    images_dir = create_output_directories(output_dir)
    
    # Open PDF
    doc = fitz.open(pdf_path)
    total_pages = len(doc)
    
    print(f"   Total pages: {total_pages}")
    print(f"   Images will be saved to: {images_dir}")
    
    # Initialize markdown content
    markdown_lines = []
    markdown_lines.append("# Skin Care Beyond the Basics (4th Edition)\n")
    markdown_lines.append(f"*Converted from PDF - {total_pages} pages with images*\n")
    markdown_lines.append("---\n")
    
    current_chapter = None
    image_count = 0
    
    # Process each page
    for page_num in range(total_pages):
        page = doc[page_num]
        
        # Extract images from page
        images = extract_images_from_page(page, page_num, images_dir)
        image_count += len(images)
        
        # Extract structured text
        text_blocks = extract_structured_text(page)
        
        # Add page marker
        markdown_lines.append(f"\n<!-- Page {page_num + 1} -->\n")
        
        # Process text blocks
        previous_text = ""
        for block in text_blocks:
            text = block["text"]
            
            # Avoid duplicates
            if text == previous_text:
                continue
            previous_text = text
            
            # Detect headings
            heading_level, heading_text = detect_heading_level(block)
            
            if heading_level:
                # Check for new chapter
                if re.match(r'^CHAPTER\s+\d+', text, re.IGNORECASE):
                    current_chapter = text
                    markdown_lines.append(f"\n{'#' * heading_level} {heading_text}\n")
                else:
                    markdown_lines.append(f"\n{'#' * heading_level} {heading_text}\n")
            else:
                # Regular text
                if text.strip():
                    markdown_lines.append(f"{text}\n")
        
        # Add images at end of page
        if images:
            markdown_lines.append("\n### Figures\n")
            for img_path in images:
                markdown_lines.append(f"![Figure from page {page_num + 1}]({img_path})\n")
        
        markdown_lines.append("\n")
        
        # Progress indicator
        if (page_num + 1) % 10 == 0:
            print(f"   Processed {page_num + 1}/{total_pages} pages ({image_count} images so far)...")
    
    # Write markdown file
    output_path = os.path.join(output_dir, "skin-care-beyond-the-basics-4th-structured.md")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.writelines(markdown_lines)
    
    doc.close()
    
    print(f"\n✅ Conversion complete!")
    print(f"   📄 Markdown file: {output_path}")
    print(f"   🖼️  Total images extracted: {image_count}")
    print(f"   📁 Images directory: {images_dir}")
    
    return output_path, image_count

def main():
    # Paths
    pdf_path = "/Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend/knowledge-sources/pdfs/skin-care-beyond-the-basics-4th.pdf"
    output_dir = "/Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend/knowledge-sources/md files"
    
    # Convert
    convert_pdf_to_markdown_advanced(pdf_path, output_dir)

if __name__ == "__main__":
    main()
