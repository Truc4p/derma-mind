When the user uploads an image (e.g., a photo of an ingredient list), the image file is stored in this.selectedFile.
The method extractTextFromImage is called when the user clicks the "Extract Text" button.
This method uses Tesseract.js (a JavaScript OCR library) to process the image:
Dynamically imports Tesseract.js and creates a worker for English ('eng').
The worker recognizes text from this.selectedFile (the uploaded image).
The extracted text is cleaned up using cleanExtractedText, which replaces newlines with commas, removes extra spaces, and trims the result.
The cleaned text is set to this.ingredientsList for further analysis.
A notification is shown to the user about the extraction result.
If extraction fails or no text is found, an error or warning notification is displayed.