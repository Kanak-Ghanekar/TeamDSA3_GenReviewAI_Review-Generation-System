import os
import torch
import pandas as pd
import numpy as np
from typing import List
from sklearn.model_selection import train_test_split
from datasets import Dataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    DataCollatorWithPadding,
    Trainer,
    TrainingArguments
)

ASPECTS = [
    "Food", "Service", "Price", "Ambience", "Staff",
    "Cleanliness", "Drinks", "Quantity", "Delivery", "Location_Aspect", "Parking_Aspect"
]

def train_aspect_classifier(
    data_path: str,
    output_dir: str = "models/genreview_aspect_extraction_model",
    base_model: str = "roberta-base",
    epochs: int = 5,
    batch_size: int = 16,
    learning_rate: float = 2e-5
):
    """
    Fine-tunes a multi-label Sequence Classification model (RoBERTa) on labeled review data.
    """
    print(f"Loading dataset from: {data_path}")
    df = pd.read_csv(data_path)
    
    # Ensure text and aspect columns exist
    assert 'Clean_Review' in df.columns, "Clean_Review column must exist in training data."
    assert all(c in df.columns for c in ASPECTS), "Aspect columns are missing."
    
    df['labels'] = df[ASPECTS].values.tolist()
    
    # Split
    train_df, val_df = train_test_split(df, test_size=0.15, random_state=42)
    
    # Convert to HuggingFace Dataset
    train_dataset = Dataset.from_pandas(train_df[['Clean_Review', 'labels']])
    val_dataset = Dataset.from_pandas(val_df[['Clean_Review', 'labels']])
    
    # Tokenizer
    print(f"Loading Tokenizer: {base_model}")
    tokenizer = AutoTokenizer.from_pretrained(base_model)
    
    def tokenize_func(examples):
        return tokenizer(examples['Clean_Review'], truncation=True, max_length=256)
    
    train_tokenized = train_dataset.map(tokenize_func, batched=True)
    val_tokenized = val_dataset.map(tokenize_func, batched=True)
    
    # Model
    print(f"Loading Model: {base_model}")
    id2label = {i: a for i, a in enumerate(ASPECTS)}
    label2id = {a: i for i, a in enumerate(ASPECTS)}
    
    model = AutoModelForSequenceClassification.from_pretrained(
        base_model,
        num_labels=len(ASPECTS),
        problem_type="multi_label_classification",
        id2label=id2label,
        label2id=label2id
    )
    
    # Training Arguments
    training_args = TrainingArguments(
        output_dir=output_dir,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=learning_rate,
        per_device_train_batch_size=batch_size,
        per_device_eval_batch_size=batch_size,
        num_train_epochs=epochs,
        weight_decay=0.01,
        load_best_model_at_end=True,
        metric_for_best_model="eval_loss",
        logging_steps=10,
        fp16=torch.cuda.is_available()
    )
    
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_tokenized,
        eval_dataset=val_tokenized,
        tokenizer=tokenizer,
        data_collator=DataCollatorWithPadding(tokenizer=tokenizer)
    )
    
    print("Starting training...")
    trainer.train()
    
    print(f"Saving fine-tuned model to: {output_dir}")
    trainer.save_model(output_dir)
    tokenizer.save_pretrained(output_dir)
    print("Aspect classification model training complete.")

if __name__ == "__main__":
    # Example execution
    train_aspect_classifier(
        data_path="d:/Madhav_Gagneja/GRAPHURA DATA SCIENCE_AI/Projects/Generative_AI_Review/ML ALL FILE/aspect_labeled_reviews.csv"
    )
