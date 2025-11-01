#!/usr/bin/env python3
"""
Remove PDF processing metadata lines from extracted text.
"""

import re
from pathlib import Path

def remove_metadata_lines(input_file, output_file):
    """
    Remove lines containing PDF processing metadata.
    
    Args:
        input_file: Path to the input text file
        output_file: Path to the output cleaned text file
    """
    print(f"Reading: {input_file}")
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Pattern 1: Match metadata lines that can span two lines:
    # [gajendra][7x10 Tight][D:/informa_Publishing/...]
    # z_3B2_3D_files/...] [date] [page numbers]
    pattern1 = r'\[gajendra\]\[.*?\]\[D:/informa_Publishing/.*?\n.*?\.3d\].*?\n'
    
    # Pattern 2: Match metadata lines like:
    # [ram][D:/informa_Publishing/...] or [Shaji][D:/informa_Publishing/...]
    # Generalized to match ANY name in brackets followed by D:/informa_Publishing
    pattern2 = r'\[.*?\]\[D:/informa_Publishing/.*?\n.*?\n'
    
    # Pattern 3: Match file processing lines like:
    # 54_Baumann_54.indd   173
    # (optional blank line)
    # 6/21/14   11:58 AM
    pattern3 = r'\n\d+_\w+[\w._]+\.indd\s+\d+\n+\d+/\d+/\d+\s+\d+:\d+\s+[AP]M\n'
    
    # Count original lines
    original_lines = content.count('\n')
    
    # Remove both types of metadata lines
    cleaned_content = re.sub(pattern1, '', content, flags=re.MULTILINE)
    cleaned_content = re.sub(pattern2, '', cleaned_content, flags=re.MULTILINE)
    cleaned_content = re.sub(pattern3, '', cleaned_content, flags=re.MULTILINE)
    
    # Count cleaned lines
    cleaned_lines = cleaned_content.count('\n')
    removed_count = original_lines - cleaned_lines
    
    # Write cleaned content
    print(f"Writing to: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(cleaned_content)
    
    print(f"✓ Removed {removed_count} metadata lines")
    print(f"✓ Cleaned content saved to: {output_file}")

if __name__ == "__main__":
    input_file = "extracted_content_pdfminer.txt"
    output_file = "extracted_content_pdfminer.txt"
    
    if not Path(input_file).exists():
        print(f"Error: File not found: {input_file}")
        exit(1)
    
    remove_metadata_lines(input_file, output_file)
