import os
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Dict, List, Any

# Dynamic imports with graceful fallback for environments without PyTorch/Transformers (e.g. Python 3.14)
try:
    import torch
    from transformers import pipeline
    HAS_TRANSFORMERS = True
except ImportError:
    HAS_TRANSFORMERS = False

ASPECTS = [
    "Food", "Service", "Price", "Ambience", "Staff",
    "Cleanliness", "Drinks", "Quantity", "Delivery", "Location_Aspect", "Parking_Aspect"
]

class ReviewAnalyticsPipeline:
    def __init__(self, sentiment_model_path: str = None, aspect_model_path: str = None):
        if HAS_TRANSFORMERS:
            device = 0 if torch.cuda.is_available() else -1
            
            # Fallbacks to standard models if custom paths are not provided or don't exist
            if not sentiment_model_path or not os.path.exists(sentiment_model_path):
                sentiment_model_path = "distilbert-base-uncased-finetuned-sst-2-english"
                
            if not aspect_model_path or not os.path.exists(aspect_model_path):
                self.aspect_pipeline = None  # Fallback to lexicon matching if RoBERTa model not trained
                print("Aspect model path not found. Falling back to keyword-based regex matching.")
            else:
                self.aspect_pipeline = pipeline(
                    "text-classification",
                    model=aspect_model_path,
                    tokenizer=aspect_model_path,
                    device=device,
                    top_k=None
                )
                
            self.sentiment_pipeline = pipeline(
                "text-classification",
                model=sentiment_model_path,
                device=device
            )
        else:
            self.sentiment_pipeline = None
            self.aspect_pipeline = None
            print("Warning: PyTorch or Transformers not installed. Running in rule-based Sentiment and Lexicon matching fallback mode.")

    def predict_review(self, text: str) -> Dict[str, Any]:
        """
        Runs inference on a single review text.
        """
        # Sentiment prediction
        if self.sentiment_pipeline:
            sent_result = self.sentiment_pipeline(text)[0]
            sentiment = sent_result['label'].upper()
            sentiment_score = sent_result['score']
        else:
            # Robust keyword-based fallback if ML libraries are missing
            text_lower = text.lower()
            positive_words = ["good", "great", "excellent", "awesome", "nice", "perfect", "delicious", "amazing", "love", "friendly", "clean"]
            negative_words = ["bad", "worst", "slow", "cold", "rude", "overpriced", "disappointed", "terrible", "dirty", "scam", "wrong"]
            pos_score = sum(1 for w in positive_words if w in text_lower)
            neg_score = sum(1 for w in negative_words if w in text_lower)
            sentiment = "NEGATIVE" if neg_score > pos_score else "POSITIVE"
            sentiment_score = 1.0

        
        # Aspect prediction (Fallback to lexicon if model is unavailable)
        aspects_pred = {}
        if self.aspect_pipeline:
            aspect_out = self.aspect_pipeline(text)[0]
            for label_score in aspect_out:
                aspect_name = label_score['label']
                score = label_score['score']
                aspects_pred[aspect_name] = 1 if score >= 0.5 else 0
        else:
            from .tag_lexicon import tag_aspects
            aspects_pred = tag_aspects(text)
            
        return {
            "sentiment": sentiment,
            "sentiment_score": sentiment_score,
            "aspects": aspects_pred
        }

    def generate_dashboard_metrics(self, df: pd.DataFrame, output_dir: str):
        """
        Calculates and exports all dashboard tables to output_dir.
        """
        out = Path(output_dir)
        out.mkdir(parents=True, exist_ok=True)
        
        # 1. Restaurant Health Scores
        health_scores = []
        for rest, group in df.groupby("Restaurant Name"):
            total_reviews = len(group)
            avg_rating = group["Rating"].mean()
            
            # Predict counts
            pos_count = (group["Predicted_Sentiment"] == "POSITIVE").sum()
            neg_count = (group["Predicted_Sentiment"] == "NEGATIVE").sum()
            neutral_count = total_reviews - pos_count - neg_count
            
            pos_pct = (pos_count / total_reviews) * 100
            neg_pct = (neg_count / total_reviews) * 100
            
            # Health Score formula
            health_score = max(0.0, min(100.0, pos_pct * 1.2 - neg_pct * 1.5))
            
            health_scores.append({
                "Restaurant Name": rest,
                "Total_Reviews": total_reviews,
                "Avg_Rating": round(avg_rating, 2),
                "Positive_Reviews": pos_count,
                "Neutral_Reviews": neutral_count,
                "Negative_Reviews": neg_count,
                "Positive_Pct": round(pos_pct, 1),
                "Negative_Pct": round(neg_pct, 1),
                "Health_Score": round(health_score, 1)
            })
        
        health_df = pd.DataFrame(health_scores)
        health_df.to_csv(out / "restaurant_health_scores.csv", index=False)
        
        # 2. Aspect Scores
        aspect_scores = []
        for rest, group in df.groupby("Restaurant Name"):
            row = {"Restaurant Name": rest}
            for aspect in ASPECTS:
                mentions = group[f"Pred_{aspect}"].sum()
                row[f"{aspect}_Mentions"] = mentions
                
                # Sentiment split
                aspect_pos = ((group[f"Pred_{aspect}"] == 1) & (group["Predicted_Sentiment"] == "POSITIVE")).sum()
                aspect_neg = ((group[f"Pred_{aspect}"] == 1) & (group["Predicted_Sentiment"] == "NEGATIVE")).sum()
                
                row[f"{aspect}_Positive_Pct"] = round((aspect_pos / mentions * 100), 1) if mentions > 0 else np.nan
                row[f"{aspect}_Negative_Pct"] = round((aspect_neg / mentions * 100), 1) if mentions > 0 else np.nan
                
            aspect_scores.append(row)
        pd.DataFrame(aspect_scores).to_csv(out / "restaurant_aspect_scores.csv", index=False)
        
        # 3. Complaint Analysis
        complaint_records = []
        for rest, group in df.groupby("Restaurant Name"):
            neg_group = group[group["Predicted_Sentiment"] == "NEGATIVE"]
            row = {
                "Restaurant Name": rest,
                "Total_Negative_Reviews": len(neg_group)
            }
            
            top_aspect = "None"
            top_count = 0
            
            for aspect in ASPECTS:
                count = neg_group[f"Pred_{aspect}"].sum()
                row[f"Complaints_{aspect}"] = count
                if count > top_count:
                    top_count = count
                    top_aspect = aspect
            
            row["Top_Complaint_Aspect"] = top_aspect
            row["Top_Complaint_Count"] = top_count
            complaint_records.append(row)
        
        complaint_df = pd.DataFrame(complaint_records)
        complaint_df.to_csv(out / "complaint_analysis.csv", index=False)
        
        # 4. Improvement Recommendations
        recommendations = []
        rec_templates = {
            "Food": "Review kitchen QC and recipe consistency - food quality is the top driver of complaints.",
            "Service": "Conduct training for wait staff and optimize scheduling to improve speed of service.",
            "Price": "Evaluate pricing strategy or introduce bundle packages to improve value perception.",
            "Ambience": "Inspect lighting, background music volume, and seating arrangement.",
            "Staff": "Address complaints regarding staff behavior; run hospitality refresher workshops.",
            "Cleanliness": "Schedule immediate sanitization reviews and hourly checks for restrooms/tables.",
            "Drinks": "Audit beverage preparation times and check mixology consistency.",
            "Quantity": "Assess portion sizing compared to menu pricing.",
            "Delivery": "Partner with external logistics/carriers or review delivery packaging quality.",
            "Location_Aspect": "Add better physical signage or update digital location links on Google Maps.",
            "Parking_Aspect": "Explore valet options, parking fee discounts, or better parking directions."
        }
        
        for _, row in complaint_df.iterrows():
            rest = row["Restaurant Name"]
            top_aspect = row["Top_Complaint_Aspect"]
            
            health_row = health_df[health_df["Restaurant Name"] == rest]
            h_score = health_row["Health_Score"].values[0] if len(health_row) > 0 else 50.0
            
            priority = "Low"
            if h_score < 40:
                priority = "High"
            elif h_score < 75:
                priority = "Medium"
                
            rec = rec_templates.get(top_aspect, "Keep monitoring sentiment logs regularly.")
            
            recommendations.append({
                "Restaurant Name": rest,
                "Health_Score": h_score,
                "Priority": priority,
                "Top_Complaint_Aspect": top_aspect,
                "Recommendation": rec
            })
        pd.DataFrame(recommendations).to_csv(out / "improvement_recommendations.csv", index=False)
        
        # 5. Monthly Trends
        monthly_records = []
        if 'Review_Month' in df.columns:
            for (rest, month), group in df.groupby(["Restaurant Name", "Review_Month"]):
                avg_rating = group["Rating"].mean()
                total = len(group)
                pos = (group["Predicted_Sentiment"] == "POSITIVE").sum()
                neg = (group["Predicted_Sentiment"] == "NEGATIVE").sum()
                
                avg_score = (pos - neg) / total
                
                monthly_records.append({
                    "Restaurant Name": rest,
                    "Review_Month": month,
                    "Review_Count": total,
                    "Avg_Sentiment_Score": round(avg_score, 2),
                    "Avg_Rating": round(avg_rating, 2),
                    "Positive_Pct": round(pos / total * 100, 1),
                    "Negative_Pct": round(neg / total * 100, 1)
                })
            pd.DataFrame(monthly_records).to_csv(out / "monthly_trends.csv", index=False)
