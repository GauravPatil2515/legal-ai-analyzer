import torch
import spacy
import re
from transformers import (
    AutoTokenizer, AutoModel,
    AutoModelForQuestionAnswering,
    T5Tokenizer, T5ForConditionalGeneration,
    pipeline
)
from typing import List, Dict, Any
import pandas as pd
from datetime import datetime
import logging
import warnings
warnings.filterwarnings('ignore')

class LegalDocumentProcessor:
    """Advanced AI system for legal document analysis and summarization"""
    
    def __init__(self):
        self.setup_logging()
        self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        print(f"🔧 Using device: {self.device}")
        
        self.load_models()
        self.setup_nlp_pipeline()
        
    def setup_logging(self):
        logging.basicConfig(level=logging.INFO)
        self.logger = logging.getLogger(__name__)
    
    def load_models(self):
        """Load all required models"""
        print("📥 Loading Legal-BERT model...")
        try:
            self.legal_tokenizer = AutoTokenizer.from_pretrained(
                'nlpaueb/legal-bert-base-uncased'
            )
            self.legal_model = AutoModel.from_pretrained(
                'nlpaueb/legal-bert-base-uncased'
            )
            print("✅ Legal-BERT loaded successfully!")
        except Exception as e:
            print(f"⚠️ Legal-BERT failed, using BERT-base: {e}")
            self.legal_tokenizer = AutoTokenizer.from_pretrained('bert-base-uncased')
            self.legal_model = AutoModel.from_pretrained('bert-base-uncased')
        
        print("📥 Loading T5 summarization model...")
        self.t5_tokenizer = T5Tokenizer.from_pretrained('t5-small')
        self.t5_model = T5ForConditionalGeneration.from_pretrained('t5-small')
        
        print("📥 Loading QA pipeline...")
        try:
            self.qa_pipeline = pipeline(
                "question-answering",
                model="distilbert/distilbert-base-cased-distilled-squad"
            )
        except Exception as e:
            print(f"ℹ️ Using direct QA model fallback ({e})")
            self.qa_tokenizer = AutoTokenizer.from_pretrained("distilbert/distilbert-base-cased-distilled-squad")
            self.qa_model = AutoModelForQuestionAnswering.from_pretrained("distilbert/distilbert-base-cased-distilled-squad")
            if self.device == 'cuda':
                self.qa_model = self.qa_model.cuda()

            def custom_qa(question: str, context: str):
                inputs = self.qa_tokenizer(question, context, return_tensors="pt", truncation=True, max_length=512)
                if self.device == 'cuda':
                    inputs = {k: v.cuda() for k, v in inputs.items()}
                with torch.no_grad():
                    outputs = self.qa_model(**inputs)
                start_idx = torch.argmax(outputs.start_logits, dim=-1).item()
                end_idx = torch.argmax(outputs.end_logits, dim=-1).item() + 1
                if start_idx >= end_idx:
                    return {'answer': '', 'score': 0.0}
                answer_tokens = inputs["input_ids"][0][start_idx:end_idx]
                answer = self.qa_tokenizer.decode(answer_tokens, skip_special_tokens=True).strip()
                start_score = torch.softmax(outputs.start_logits, dim=-1).max().item()
                end_score = torch.softmax(outputs.end_logits, dim=-1).max().item()
                score = (start_score * end_score) ** 0.5
                return {'answer': answer, 'score': score}

            self.qa_pipeline = custom_qa

        print("✅ All models loaded successfully!")
    
    def setup_nlp_pipeline(self):
        """Setup SpaCy NLP pipeline"""
        print("📥 Loading SpaCy model...")
        try:
            self.nlp = spacy.load("en_core_web_sm")
            print("✅ SpaCy loaded successfully!")
        except OSError:
            print("❌ SpaCy model not found. Run: python -m spacy download en_core_web_sm")
            raise
    
    def preprocess_text(self, text: str) -> str:
        """Preprocess legal text"""
        text = re.sub(r'\s+', ' ', text.strip())
        text = re.sub(r'\n+', ' ', text)
        text = re.sub(r'\t+', ' ', text)
        return text
    
    def classify_document_type(self, text: str) -> Dict[str, Any]:
        """Classify the type of legal document"""
        doc_indicators = {
            'contract': ['agreement', 'party', 'whereas', 'covenant'],
            'license': ['license', 'licensor', 'licensee', 'grant'],
            'lease': ['lease', 'lessor', 'lessee', 'rent', 'premises'],
            'employment': ['employee', 'employer', 'employment', 'salary'],
            'nda': ['confidential', 'non-disclosure', 'proprietary']
        }
        
        text_lower = text.lower()
        scores = {}
        
        for doc_type, indicators in doc_indicators.items():
            score = sum(1 for indicator in indicators if indicator in text_lower)
            scores[doc_type] = score / len(indicators)
        
        predicted_type = max(scores, key=scores.get)
        confidence = scores[predicted_type]
        
        return {
            'document_type': predicted_type,
            'confidence': confidence,
            'all_scores': scores
        }
    
    def extract_legal_entities(self, text: str) -> Dict[str, List[str]]:
        """Extract legal entities using NER"""
        doc = self.nlp(text)
        
        entities = {
            'PERSON': [],
            'ORG': [],
            'DATE': [],
            'MONEY': [],
            'GPE': []
        }
        
        for ent in doc.ents:
            if ent.label_ in entities:
                entities[ent.label_].append(ent.text)
        
        # Custom patterns
        monetary_amounts = re.findall(r'\$[\d,]+(?:\.\d{2})?', text)
        entities['monetary_amounts'] = monetary_amounts
        
        return entities
    
    def extract_key_clauses(self, text: str, document_type: str = None) -> Dict[str, str]:
        """Extract key clauses using Question-Answering"""
        
        if document_type == 'contract':
            questions = [
                "What is the effective date?",
                "Who are the parties?",
                "What are the payment terms?",
                "What is the governing law?"
            ]
        elif document_type == 'employment':
            questions = [
                "What is the salary?",
                "What is the job title?",
                "When does employment start?",
                "What are the benefits?"
            ]
        else:
            questions = [
                "What are the main terms?",
                "Who are the parties involved?",
                "What are the key obligations?"
            ]
        
        extracted_clauses = {}
        
        for question in questions:
            try:
                result = self.qa_pipeline(question=question, context=text)
                if result['score'] > 0.1:
                    clause_key = question.replace("What is ", "").replace("What are ", "").replace("?", "")
                    extracted_clauses[clause_key] = {
                        'text': result['answer'],
                        'confidence': result['score']
                    }
            except Exception as e:
                self.logger.warning(f"Error extracting clause: {e}")
        
        return extracted_clauses
    
    def generate_summary(self, text: str, max_length: int = 150) -> str:
        """Generate abstractive summary using T5"""
        
        input_text = f"summarize: {text}"
        
        inputs = self.t5_tokenizer.encode(
            input_text,
            return_tensors="pt",
            max_length=512,
            truncation=True
        )
        
        with torch.no_grad():
            summary_ids = self.t5_model.generate(
                inputs,
                max_length=max_length,
                min_length=30,
                length_penalty=2.0,
                num_beams=4,
                early_stopping=True
            )
        
        summary = self.t5_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return summary
    
    def analyze_document(self, text: str) -> Dict[str, Any]:
        """Complete document analysis pipeline"""
        
        print("🔍 Starting document analysis...")
        
        # Preprocess
        processed_text = self.preprocess_text(text)
        
        # Classification
        doc_classification = self.classify_document_type(processed_text)
        print(f"📋 Document type: {doc_classification['document_type']}")
        
        # Entity extraction
        entities = self.extract_legal_entities(processed_text)
        print("🏷️ Entities extracted")
        
        # Clause extraction
        clauses = self.extract_key_clauses(
            processed_text, 
            doc_classification['document_type']
        )
        print("📄 Key clauses extracted")
        
        # Summary generation
        summary = self.generate_summary(processed_text)
        print("📝 Summary generated")
        
        results = {
            'document_info': {
                'type': doc_classification['document_type'],
                'confidence': doc_classification['confidence'],
                'length': len(text.split()),
                'processed_at': datetime.now().isoformat()
            },
            'entities': entities,
            'key_clauses': clauses,
            'summary': summary,
            'classification_scores': doc_classification['all_scores']
        }
        
        print("✅ Document analysis completed!")
        return results

# Test function
if __name__ == "__main__":
    sample_contract = """
    EMPLOYMENT AGREEMENT
    
    This Employment Agreement is entered into effective as of January 1, 2024,
    between Tech Innovations Inc., a Delaware corporation ("Company"), and John Smith ("Employee").
    
    1. EMPLOYMENT TERM: Employee's employment shall commence on January 1, 2024.
    
    2. COMPENSATION: Company shall pay Employee an annual salary of $120,000.
    
    3. TERMINATION: Either party may terminate this Agreement with thirty (30) days written notice.
    
    4. GOVERNING LAW: This Agreement shall be governed by the laws of Delaware.
    """
    
    print("🚀 Testing Legal Document Processor...")
    processor = LegalDocumentProcessor()
    results = processor.analyze_document(sample_contract)
    
    print("\n" + "="*60)
    print("ANALYSIS RESULTS")
    print("="*60)
    print(f"Document Type: {results['document_info']['type']}")
    print(f"Confidence: {results['document_info']['confidence']:.2f}")
    print(f"Summary: {results['summary']}")
