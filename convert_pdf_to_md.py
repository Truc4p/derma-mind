import PyPDF2
import os

def convert_pdf_to_markdown(pdf_path, output_path):
    """
    Convert PDF to Markdown format
    """
    try:
        # Open the PDF file
        with open(pdf_path, 'rb') as pdf_file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            # Get total number of pages
            num_pages = len(pdf_reader.pages)
            
            # Initialize markdown content
            markdown_content = f"# Skin Care Beyond the Basics (4th Edition)\n\n"
            markdown_content += f"*Converted from PDF - {num_pages} pages*\n\n"
            markdown_content += "---\n\n"
            
            # Extract text from each page
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                if text.strip():  # Only add if there's content
                    markdown_content += f"## Page {page_num + 1}\n\n"
                    markdown_content += text + "\n\n"
                    markdown_content += "---\n\n"
                
                # Progress indicator
                if (page_num + 1) % 10 == 0:
                    print(f"Processed {page_num + 1}/{num_pages} pages...")
            
            # Write to markdown file
            with open(output_path, 'w', encoding='utf-8') as md_file:
                md_file.write(markdown_content)
            
            print(f"\n✓ Successfully converted PDF to Markdown!")
            print(f"  - Total pages: {num_pages}")
            print(f"  - Output file: {output_path}")
            
            return True
            
    except Exception as e:
        print(f"✗ Error converting PDF: {str(e)}")
        return False

if __name__ == "__main__":
    # Define paths
    pdf_path = "/Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend/knowledge-sources/pdfs/skin-care-beyond-the-basics-4th.pdf"
    output_path = "/Users/phamthanhtruc/Downloads/uni/FYP-c1682/skin-study/backend/knowledge-sources/md files/skin-care-beyond-the-basics-4th.md"
    
    # Convert PDF to Markdown
    convert_pdf_to_markdown(pdf_path, output_path)
