#!/usr/bin/env python3
"""
Extract text from PDF using pdfminer.six for better layout preservation.
"""

from pdfminer.high_level import extract_text
from pdfminer.layout import LAParams
import sys
import logging
from pathlib import Path

# Suppress PDFMiner warnings about non-standard color spaces
logging.getLogger('pdfminer').setLevel(logging.ERROR)

def extract_text_pdfminer(pdf_path, output_path):
    """
    Extract text from PDF using pdfminer.six with layout analysis.
    
    Args:
        pdf_path: Path to the input PDF file
        output_path: Path to the output text file
    """
    print(f"Opening PDF: {pdf_path}")
    
    # Configure layout analysis parameters
    laparams = LAParams(
        line_margin=0.5,
        word_margin=0.1,
        char_margin=2.0,
        boxes_flow=0.5,
        detect_vertical=False,
        all_texts=False
    )
    
    print("Extracting text with layout preservation...")
    
    # Extract all text at once
    text = extract_text(
        pdf_path,
        laparams=laparams,
        page_numbers=None,  # Extract all pages
        maxpages=0,  # No limit on pages
        password='',
        caching=True,
        codec='utf-8'
    )
    
    # Replace form feed characters with nothing
    text = text.replace('\f', '')
    
    # Write to output file
    print(f"Writing to: {output_path}")
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(text)
    
    # Count pages (approximate)
    page_count = text.count('\f') + 1  # Form feed character indicates page breaks
    
    print(f"✓ Successfully extracted text from approximately {page_count} pages")
    print(f"✓ Output saved to: {output_path}")

if __name__ == "__main__":
    # Input PDF file
    pdf_file = "Fitzpatrick's Dermatology in General Medicine (8th Edition).pdf"
    
    # Output text file
    output_file = "extracted_content_pdfminer.txt"
    
    pdf_path = Path(pdf_file)
    
    if not pdf_path.exists():
        print(f"Error: PDF file not found: {pdf_file}")
        sys.exit(1)
    
    extract_text_pdfminer(pdf_path, output_file)
