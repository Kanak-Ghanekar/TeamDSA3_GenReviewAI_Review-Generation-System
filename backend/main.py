# FastAPI NLP & ML Analytics Service
# Run with: uvicorn main:app --reload

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, Optional, List
import uvicorn
from ml import ReviewAnalyticsPipeline

app = FastAPI(
    title="GenReview AI NLP Analytics Engine",
    description="Microservice for aspect classification and neural complaint severity prediction.",
    version="1.0.0"
)

# Initialize the NLP pipeline on startup
# It attempts to load custom models, with clean HuggingFace hub fallbacks if local files are missing.
analytics = ReviewAnalyticsPipeline()

class ReviewInput(BaseModel):
    text: str
    metadata: Optional[Dict] = None

class AnalysisOutput(BaseModel):
    overall_sentiment: str
    aspect_sentiments: Dict[str, str]
    predicted_emotion: str
    complaint_severity: str
    intent: str

@app.get("/")
def health_check():
    return {"status": "healthy", "service": "GenReview AI NLP Analytics"}

@app.post("/analyze", response_model=AnalysisOutput)
def analyze_review_text(payload: ReviewInput):
    text = payload.text
    
    if not text.strip():
        raise HTTPException(status_code=400, detail="Review text cannot be empty.")
    
    # Run the real machine learning pipeline
    result = analytics.predict_review(text)
    overall_sentiment = result["sentiment"].lower()
    
    # Split text by clause boundaries to isolate local aspect sentiments
    import re
    clauses = re.split(r'\.|\bbut\b|\bhowever\b|\balthough\b|\byet\b|\bwhereas\b|;|,', text, flags=re.IGNORECASE)
    clauses = [c.strip().lower() for c in clauses if c.strip()]
    
    negatives = [
        "not", "no", "never", "bad", "poor", "slow", "rude", "dirty", "overpriced", "disappointing",
        "worst", "insufficient", "late", "cold", "expensive", "hidden", "broken", "unfriendly", "unprofessional"
    ]
    
    from ml.tag_lexicon import ASPECT_KEYWORDS
    
    aspects = {}
    for aspect_name, was_mentioned in result["aspects"].items():
        if not was_mentioned:
            continue
            
        aspect_lower = aspect_name.lower()
        keywords = ASPECT_KEYWORDS.get(aspect_name, [aspect_lower])
        
        # Isolate target clause mentioning this aspect
        target_clause = None
        for clause in clauses:
            if any(re.search(rf"\b{kw.lower()}\b", clause) for kw in keywords):
                target_clause = clause
                break
                
        if target_clause:
            has_negation = any(re.search(rf"\b{neg}\b", target_clause) for neg in negatives)
            if has_negation:
                aspects[aspect_lower] = "negative"
            else:
                positives = ["good", "great", "excellent", "nice", "perfect", "delicious", "amazing", "love", "friendly", "clean", "proper"]
                pos_score = sum(1 for w in positives if re.search(rf"\b{w}\b", target_clause))
                neg_score = sum(1 for w in negatives if re.search(rf"\b{w}\b", target_clause))
                if neg_score > pos_score:
                    aspects[aspect_lower] = "negative"
                else:
                    aspects[aspect_lower] = "positive"
        else:
            aspects[aspect_lower] = overall_sentiment

    # Emotion detection based on sentiment and keyword indicators
    emotion = "Satisfied" if overall_sentiment == "positive" else "Frustrated"
    if any(w in text.lower() for w in ["refund", "sue", "cheated", "worst", "scam"]):
        emotion = "Angry"

    # Intent detection
    intent = "complaint" if overall_sentiment == "negative" else "appreciation"
    if "suggest" in text.lower() or "should" in text.lower() or "recommend" in text.lower():
        intent = "suggestion"

    # Severity analysis
    severity = "low"
    if any(w in text.lower() for w in ["worst", "sue", "police", "poisoning", "legal", "scam"]):
        severity = "critical"
    elif "cold" in text.lower() or "slow" in text.lower() or "delay" in text.lower() or "not proper" in text.lower():
        severity = "medium"

    return AnalysisOutput(
        overall_sentiment=overall_sentiment,
        aspect_sentiments=aspects,
        predicted_emotion=emotion,
        complaint_severity=severity,
        intent=intent
    )

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

