import re
import pandas as pd
from bs4 import BeautifulSoup
import emoji

def clean_review_text(text: str) -> str:
    """
    Cleans review text by removing HTML tags, emojis, URLs, emails, and non-alphabetic characters.
    """
    if pd.isna(text) or not isinstance(text, str):
        return ''
    
    # 1. Strip HTML tags
    text = BeautifulSoup(text, 'html.parser').get_text()
    
    # 2. Remove Emojis
    text = emoji.replace_emoji(text, replace='')
    
    # 3. Lowercase
    text = text.lower()
    
    # 4. Remove URLs & Emails
    text = re.sub(r'http\S+|www\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    
    # 5. Keep only alphabetic characters and spaces
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    
    # 6. Normalize whitespace
    return re.sub(r'\s+', ' ', text).strip()

def preprocess_dataframe(df: pd.DataFrame, text_column: str = 'Review Text', min_word_count: int = 8) -> pd.DataFrame:
    """
    Filters, cleans, and deduplicates the review dataframe.
    """
    df = df.copy()
    
    # Drop rows with null ratings or text
    df = df.dropna(subset=[text_column, 'Restaurant Name']).reset_index(drop=True)
    
    # Parse dates if present
    if 'Review Date' in df.columns:
        df['Parsed_Date'] = pd.to_datetime(df['Review Date'], errors='coerce')
        df['Year'] = df['Parsed_Date'].dt.year
        df['Month'] = df['Parsed_Date'].dt.month_name()
        df['Quarter'] = df['Parsed_Date'].dt.quarter
    
    # Add cleaning columns
    df['Clean_Review'] = df[text_column].apply(clean_review_text)
    
    # Feature engineering
    df['Word_Count'] = df['Clean_Review'].str.split().str.len()
    df['Character_Count'] = df['Clean_Review'].str.len()
    df['Sentence_Count'] = df[text_column].astype(str).str.count(r'[.!?]') + 1
    
    # Filter by word length
    df = df[df['Word_Count'] >= min_word_count].copy()
    
    # Drop duplicates
    df = df.drop_duplicates(subset=['Restaurant Name', text_column])
    
    return df
