import os
import PyPDF2
from PIL import Image
from typing import List, Optional
import tempfile
from config import config

# Optional OCR imports - will work without them for digital PDFs
try:
    import pytesseract
    from pdf2image import convert_from_path
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False
    print("OCR not available - only digital PDFs will be processed")

class DocumentProcessor:
    """Handles PDF and Image text extraction"""
    
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF using PyPDF2 and OCR fallback"""
        text = ""
        
        try:
            # First try direct text extraction
            with open(file_path, 'rb') as file:
                pdf_reader = PyPDF2.PdfReader(file)
                for page in pdf_reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n\n"
            
            # If no text extracted and OCR is available, use OCR
            if not text.strip() and OCR_AVAILABLE:
                text = DocumentProcessor._ocr_pdf(file_path)
            elif not text.strip():
                text = "[Scanned PDF - OCR not available. Please install tesseract-ocr and poppler-utils for OCR support.]"
                
        except Exception as e:
            print(f"Error extracting PDF text: {e}")
            if OCR_AVAILABLE:
                text = DocumentProcessor._ocr_pdf(file_path)
            else:
                text = f"[Error processing PDF: {str(e)}]"
        
        return text.strip()
    
    @staticmethod
    def _ocr_pdf(file_path: str) -> str:
        """Convert PDF to images and perform OCR"""
        if not OCR_AVAILABLE:
            return "[OCR not available]"
        
        text = ""
        try:
            # Convert PDF pages to images
            images = convert_from_path(file_path, dpi=300)
            
            for i, image in enumerate(images):
                page_text = pytesseract.image_to_string(image)
                text += f"\n--- Page {i+1} ---\n{page_text}\n"
                
        except Exception as e:
            print(f"OCR error: {e}")
            
        return text
    
    @staticmethod
    def extract_text_from_image(file_path: str) -> str:
        """Extract text from image using OCR"""
        if not OCR_AVAILABLE:
            return "[OCR not available - image text extraction requires tesseract-ocr]"
        
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image)
            return text.strip()
        except Exception as e:
            print(f"Image OCR error: {e}")
            return ""
    
    @staticmethod
    def process_document(file_path: str) -> str:
        """Process any supported document type"""
        ext = os.path.splitext(file_path)[1].lower()
        
        if ext == '.pdf':
            return DocumentProcessor.extract_text_from_pdf(file_path)
        elif ext in {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff'}:
            return DocumentProcessor.extract_text_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file type: {ext}")

class TextCleaner:
    """Clean and preprocess extracted text"""
    
    @staticmethod
    def clean_text(text: str) -> str:
        """Clean extracted text for better analysis"""
        import re
        
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Remove page markers
        text = re.sub(r'--- Page \d+ ---', '', text)
        
        # Remove common OCR artifacts
        text = re.sub(r'[|]{2,}', '', text)
        text = re.sub(r'[-]{5,}', '', text)
        
        # Fix common OCR mistakes
        text = text.replace('0rder', 'Order')
        text = text.replace('|', 'I')
        
        return text.strip()
    
    @staticmethod
    def extract_questions(text: str) -> List[dict]:
        """Attempt to identify individual questions from text"""
        import re
        
        questions = []
        
        # Common question patterns
        patterns = [
            r'(?:Q\.?\s*)?(\d+)\s*[.)\]]\s*(.*?)(?=(?:Q\.?\s*)?\d+\s*[.)\]]|$)',
            r'Question\s*(\d+)[.:\s]*(.*?)(?=Question\s*\d+|$)',
            r'\(([a-z])\)\s*(.*?)(?=\([a-z]\)|$)',
        ]
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE | re.DOTALL)
            if matches:
                for match in matches:
                    q_num, q_text = match[0], match[1] if len(match) > 1 else match[0]
                    if len(q_text.strip()) > 10:  # Minimum question length
                        questions.append({
                            'number': str(q_num),
                            'text': q_text.strip()[:2000]  # Limit length
                        })
                break
        
        return questions
