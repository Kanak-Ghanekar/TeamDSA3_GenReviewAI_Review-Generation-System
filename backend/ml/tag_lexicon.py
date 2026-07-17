import re
import pandas as pd
from typing import Dict, List

# Standard aspects used across GenReview AI
ASPECTS = [
    "Food", "Service", "Price", "Ambience", "Staff",
    "Cleanliness", "Drinks", "Quantity", "Delivery", "Location_Aspect", "Parking_Aspect"
]

ASPECT_KEYWORDS = {
    "Food": ["food", "taste", "flavour", "flavor", "dish", "meal", "menu", "cuisine",
              "spicy", "delicious", "cook", "cooked", "cooking", "recipe", "portion"],
    "Service": ["service", "staff behaviour", "wait time", "waiting time", "serve", "served",
                 "attend", "attended", "response", "slow service", "quick service"],
    "Price": ["price", "cost", "expensive", "cheap", "value for money",
               "affordable", "overpriced", "budget", "bill", "worth"],
    "Ambience": ["ambience", "ambiance", "atmosphere", "decor", "music",
                  "seating", "vibe", "interior", "lighting", "view"],
    "Staff": ["staff", "waiter", "waitress", "manager", "chef", "employee",
               "rude", "polite", "friendly staff", "helpful"],
    "Cleanliness": ["clean", "hygiene", "hygienic", "dirty", "stain", "smell",
                      "washroom", "restroom", "tidy", "sanitary"],
    "Drinks": ["drink", "beverage", "cocktail", "juice", "coffee", "tea",
                "beer", "wine", "soda", "mocktail"],
    "Quantity": ["quantity", "portion size", "small portion", "large portion",
                  "amount", "serving size", "generous", "insufficient"],
    "Delivery": ["deliver", "delivery", "delivery boy", "delivery time", "packaging",
                  "order arrived", "late delivery", "cold food delivered"],
    "Location_Aspect": ["location", "located", "area", "neighbourhood", "neighborhood",
                  "easy to find", "nearby", "accessible", "accessibility"],
    "Parking_Aspect": ["parking", "parked", "parking space", "valet", "parking lot"]
}

# Compile patterns for fast lookup
ASPECT_PATTERNS = {
    aspect: re.compile(r"|".join(rf"\b{kw}\b" for kw in keywords), re.IGNORECASE)
    for aspect, keywords in ASPECT_KEYWORDS.items()
}

def tag_aspects(text: str) -> Dict[str, int]:
    """
    Checks the cleaned text against the aspect patterns and returns binary flags.
    """
    flags = {}
    for aspect, pattern in ASPECT_PATTERNS.items():
        flags[aspect] = 1 if pattern.search(text) else 0
    return flags

def apply_lexicon_labeling(df: pd.DataFrame, text_column: str = 'Clean_Review') -> pd.DataFrame:
    """
    Applies aspect tags to the entire dataframe.
    """
    df = df.copy()
    for aspect in ASPECTS:
        df[aspect] = df[text_column].apply(lambda x: tag_aspects(str(x))[aspect])
    return df
