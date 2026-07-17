export interface KeywordGroup {
  aspect: string;
  tags: string[];
}

export interface BusinessTemplate {
  templateKey: string;
  displayName: string;
  toneDescriptor: string;
  paletteName: string;
  defaultTags: string[];
  positiveAspectGroups: KeywordGroup[];
  negativeAspectGroups: KeywordGroup[];
  icon: string;
}

export const TEMPLATES: Record<string, BusinessTemplate> = {
  restaurant: {
    templateKey: 'restaurant',
    displayName: 'Restaurant & Dining',
    toneDescriptor: 'food-forward, warm, appreciative of hospitality',
    paletteName: 'Terracotta & Cream',
    defaultTags: ['Delicious Food', 'Friendly Staff', 'Fast Service', 'Nice Atmosphere', 'Great Value'],
    positiveAspectGroups: [
      { aspect: 'Food & Drinks', tags: ['Delicious Food', 'Generous Portions', 'Tasty Drinks', 'Fresh Ingredients'] },
      { aspect: 'Service & Staff', tags: ['Friendly Staff', 'Fast Service', 'Attentive Waiters', 'Helpful Manager'] },
      { aspect: 'Ambience & Comfort', tags: ['Nice Atmosphere', 'Clean Tables', 'Cozy Seating', 'Great Music'] },
      { aspect: 'Pricing & Value', tags: ['Value for Money', 'Reasonable Prices', 'Good Offers'] }
    ],
    negativeAspectGroups: [
      { aspect: 'Food & Drinks', tags: ['Cold Food', 'Bland Taste', 'Small Portions', 'Stale Meal'] },
      { aspect: 'Service & Staff', tags: ['Slow Service', 'Rude Waiter', 'Ignored Table', 'Long Wait Time'] },
      { aspect: 'Ambience & Comfort', tags: ['Dirty Tables', 'Noisy Space', 'Smelly Area', 'Cramped Seating'] },
      { aspect: 'Pricing & Value', tags: ['Overpriced', 'Hidden Charges', 'Poor Value'] }
    ],
    icon: 'Utensils',
  },
  tyre_shop: {
    templateKey: 'tyre_shop',
    displayName: 'Tyre Shop & Auto',
    toneDescriptor: 'direct, honest, trust-focused, emphasizing safety/speed',
    paletteName: 'Charcoal & Orange',
    defaultTags: ['Quick Service', 'Upfront Pricing', 'Professional Crew', 'Honest Advice', 'Quality Tyres'],
    positiveAspectGroups: [
      { aspect: 'Repairs & Quality', tags: ['Quality Tyres', 'Precise Alignment', 'Durable Repairs'] },
      { aspect: 'Service Speed', tags: ['Quick Service', 'Professional Crew', 'Honest Advice', 'Helpful Staff'] },
      { aspect: 'Billing & Rates', tags: ['Upfront Pricing', 'Fair Rates', 'No Hidden Fees'] }
    ],
    negativeAspectGroups: [
      { aspect: 'Repairs & Quality', tags: ['Poor Alignment', 'Defective Parts', 'Bad Workmanship'] },
      { aspect: 'Service Speed', tags: ['Slow Repairs', 'Unprofessional Crew', 'Bad Advice', 'Unfriendly Staff'] },
      { aspect: 'Billing & Rates', tags: ['Overpriced Work', 'Hidden Fees', 'Unexpected Charges'] }
    ],
    icon: 'Wrench',
  },
  salon_retail: {
    templateKey: 'salon_retail',
    displayName: 'Salon & Retail',
    toneDescriptor: 'stylish, confident, detailed, aesthetics-focused',
    paletteName: 'Blush Rose',
    defaultTags: ['Talented Stylists', 'Clean Salon', 'Trendy Selection', 'Personal Attention', 'Relaxing Vibe'],
    positiveAspectGroups: [
      { aspect: 'Styling & Care', tags: ['Talented Stylists', 'Personal Attention', 'Friendly Welcome', 'Punctual Timing'] },
      { aspect: 'Cleanliness & Products', tags: ['Clean Salon', 'Sterilized Tools', 'Tidy Stations', 'Quality Products'] },
      { aspect: 'Vibe & Comfort', tags: ['Relaxing Vibe', 'Comfortable Chairs', 'Great Coffee', 'Good Music'] }
    ],
    negativeAspectGroups: [
      { aspect: 'Styling & Care', tags: ['Unskilled Stylist', 'Rude Behavior', 'Late Appointment', 'Ignored Requests'] },
      { aspect: 'Cleanliness & Products', tags: ['Dirty Station', 'Unclean Tools', 'Messy Salon', 'Cheap Products'] },
      { aspect: 'Vibe & Comfort', tags: ['Uncomfortable Chairs', 'Loud Vibe', 'Poor Amenities', 'Cold Welcome'] }
    ],
    icon: 'Sparkles',
  },
  hotel: {
    templateKey: 'hotel',
    displayName: 'Boutique Hotel',
    toneDescriptor: 'refined, welcoming, luxurious, detail-oriented',
    paletteName: 'Navy & Gold',
    defaultTags: ['Stunning Rooms', 'Excellent Location', 'Impeccable Service', 'Great Amenities', 'Comfy Beds'],
    positiveAspectGroups: [
      { aspect: 'Rooms & Beds', tags: ['Stunning Rooms', 'Comfy Beds', 'Clean Sheets', 'Modern Decor'] },
      { aspect: 'Service & Check', tags: ['Impeccable Service', 'Friendly Reception', 'Easy Checkout', 'Quick Room Service'] },
      { aspect: 'Hotel Amenities', tags: ['Clean Pool', 'Delicious Breakfast', 'Great Gym', 'Fast Wi-Fi'] }
    ],
    negativeAspectGroups: [
      { aspect: 'Rooms & Beds', tags: ['Smelly Rooms', 'Hard Beds', 'Dirty Sheets', 'Old Furniture'] },
      { aspect: 'Service & Check', tags: ['Poor Service', 'Rude Reception', 'Slow Checkout', 'Bad Room Service'] },
      { aspect: 'Hotel Amenities', tags: ['Dirty Pool', 'Cold Breakfast', 'Broken Gym', 'Slow Wi-Fi'] }
    ],
    icon: 'Hotel',
  },
};

