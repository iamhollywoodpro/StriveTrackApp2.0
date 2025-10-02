// Auto-emoji generation system for habits and goals
// Analyzes text input and suggests relevant emojis based on keywords

export const emojiDatabase = {
  // Fitness & Exercise
  workout: ['💪', '🏋️‍♀️', '🏋️‍♂️', '⚡'],
  exercise: ['🏃‍♀️', '🏃‍♂️', '🚴‍♀️', '💪'],
  gym: ['🏋️‍♀️', '💪', '🔥', '⚡'],
  run: ['🏃‍♀️', '🏃‍♂️', '👟', '🏃'],
  walk: ['🚶‍♀️', '🚶‍♂️', '👟', '🌟'],
  bike: ['🚴‍♀️', '🚴‍♂️', '🚲', '⚡'],
  swim: ['🏊‍♀️', '🏊‍♂️', '🌊', '💧'],
  yoga: ['🧘‍♀️', '🧘‍♂️', '☮️', '🌸'],
  stretch: ['🤸‍♀️', '🤸‍♂️', '🧘‍♀️', '✨'],
  cardio: ['❤️', '🔥', '⚡', '💨'],
  strength: ['💪', '🏋️‍♀️', '🔥', '💥'],
  pilates: ['🧘‍♀️', '💪', '✨', '🌸'],
  dance: ['💃', '🕺', '🎵', '✨'],
  
  // Health & Wellness
  water: ['💧', '🚰', '💦', '🌊'],
  drink: ['💧', '🥤', '☕', '🧃'],
  vitamins: ['💊', '🍊', '✨', '🌟'],
  medicine: ['💊', '🏥', '⚕️', '🩺'],
  pills: ['💊', '💉', '⚕️', '🏥'],
  supplement: ['💊', '💪', '🌟', '✨'],
  sleep: ['😴', '🛏️', '🌙', '💤'],
  rest: ['😴', '🛏️', '☁️', '😌'],
  nap: ['😴', '💤', '🌙', '☁️'],
  meditate: ['🧘‍♀️', '🧘‍♂️', '☮️', '✨'],
  breathe: ['🌬️', '😌', '☮️', '💨'],
  
  // Nutrition & Food
  eat: ['🍽️', '🥗', '🍎', '🥑'],
  breakfast: ['🌅', '🥞', '☕', '🍳'],
  lunch: ['☀️', '🥪', '🍽️', '🥗'],
  dinner: ['🌙', '🍽️', '🍝', '🥘'],
  snack: ['🍎', '🥜', '🍓', '🥨'],
  protein: ['🥩', '🍗', '🥚', '💪'],
  vegetable: ['🥗', '🥒', '🥕', '🌱'],
  fruit: ['🍎', '🍌', '🍓', '🥝'],
  salad: ['🥗', '🌱', '🥒', '🍅'],
  
  // Learning & Development
  read: ['📚', '📖', '🤓', '💡'],
  study: ['📚', '🎓', '💡', '✍️'],
  learn: ['🧠', '💡', '📚', '🎓'],
  book: ['📚', '📖', '🤓', '📝'],
  course: ['🎓', '💻', '📚', '📖'],
  practice: ['⚡', '💪', '🎯', '🔄'],
  
  // Work & Productivity
  work: ['💼', '💻', '📊', '⚡'],
  email: ['📧', '💻', '📬', '📨'],
  call: ['📞', '☎️', '📱', '🗣️'],
  meeting: ['👥', '💼', '📊', '🤝'],
  write: ['✍️', '📝', '💻', '✨'],
  
  // Personal Care
  shower: ['🚿', '🧼', '💧', '✨'],
  brush: ['🪥', '✨', '😁', '🦷'],
  teeth: ['🦷', '🪥', '😁', '✨'],
  skincare: ['✨', '🧴', '😌', '💆‍♀️'],
  
  // Habits & Routines
  routine: ['🔄', '⏰', '📅', '✨'],
  habit: ['🔄', '⭐', '💫', '🎯'],
  daily: ['📅', '☀️', '🔄', '⭐'],
  weekly: ['📅', '🗓️', '🔄', '📊'],
  morning: ['🌅', '☀️', '⏰', '✨'],
  evening: ['🌙', '🌆', '😌', '🛏️'],
  
  // Mindfulness & Mental Health
  journal: ['📔', '✍️', '💭', '✨'],
  gratitude: ['🙏', '❤️', '✨', '🌟'],
  mindful: ['🧘‍♀️', '☮️', '✨', '🌸'],
  calm: ['😌', '☮️', '🌸', '💆‍♀️'],
  
  // Goals & Achievements
  goal: ['🎯', '🏆', '⭐', '💫'],
  target: ['🎯', '🏹', '🎪', '⭐'],
  achieve: ['🏆', '🎉', '⭐', '💫'],
  complete: ['✅', '🎉', '🏆', '⭐'],
  finish: ['✅', '🏁', '🎉', '⭐'],
  
  // Social & Relationships
  friend: ['👫', '👭', '👬', '❤️'],
  family: ['👨‍👩‍👧‍👦', '❤️', '🏠', '👪'],
  social: ['👥', '🎉', '💬', '🤝'],
  
  // Default fallbacks
  default: ['⭐', '🎯', '💫', '✨']
};

// Generate emoji suggestions based on text input
export const generateEmojiSuggestions = (text) => {
  if (!text || text.trim().length === 0) {
    return emojiDatabase.default;
  }

  const normalizedText = text.toLowerCase().trim();
  const words = normalizedText.split(/\s+/);
  const suggestions = new Set();

  // Check each word against the emoji database
  words.forEach(word => {
    // Direct matches
    if (emojiDatabase[word]) {
      emojiDatabase[word].forEach(emoji => suggestions.add(emoji));
    }

    // Partial matches (contains keyword)
    Object.keys(emojiDatabase).forEach(keyword => {
      if (word.includes(keyword) || keyword.includes(word)) {
        emojiDatabase[keyword].forEach(emoji => suggestions.add(emoji));
      }
    });
  });

  // Check full text for compound phrases
  Object.keys(emojiDatabase).forEach(keyword => {
    if (normalizedText.includes(keyword)) {
      emojiDatabase[keyword].forEach(emoji => suggestions.add(emoji));
    }
  });

  // Return suggestions array (max 8 suggestions)
  const suggestionsArray = Array.from(suggestions).slice(0, 8);
  
  // If no suggestions found, return context-based defaults
  if (suggestionsArray.length === 0) {
    // Check for general categories
    if (normalizedText.includes('weight') || normalizedText.includes('lose') || normalizedText.includes('gain')) {
      return ['⚖️', '💪', '🎯', '📈'];
    }
    if (normalizedText.includes('healthy') || normalizedText.includes('health')) {
      return ['❤️', '🌟', '💪', '✨'];
    }
    if (normalizedText.includes('time') || normalizedText.includes('minute') || normalizedText.includes('hour')) {
      return ['⏰', '⏱️', '🕐', '⏲️'];
    }
    return emojiDatabase.default;
  }

  return suggestionsArray;
};

// Get the best single emoji suggestion (first match)
export const getBestEmojiSuggestion = (text) => {
  const suggestions = generateEmojiSuggestions(text);
  return suggestions[0] || '⭐';
};

// Preset emoji categories for manual selection
export const emojiCategories = {
  fitness: ['💪', '🏋️‍♀️', '🏃‍♀️', '🚴‍♀️', '🧘‍♀️', '🤸‍♀️', '🏊‍♀️', '⚡', '🔥'],
  health: ['❤️', '💊', '💧', '😴', '🧘‍♀️', '🌟', '✨', '🏥', '⚕️'],
  nutrition: ['🥗', '🍎', '🥑', '🍓', '🥕', '🥒', '🍽️', '🥤', '🍌'],
  learning: ['📚', '📖', '🎓', '💡', '🧠', '✍️', '📝', '💻', '🤓'],
  productivity: ['💼', '💻', '📊', '⚡', '🎯', '📞', '📧', '✅', '🗂️'],
  wellness: ['✨', '🌸', '☮️', '😌', '🙏', '💆‍♀️', '🛁', '🕯️', '🌙'],
  goals: ['🎯', '🏆', '⭐', '💫', '🏁', '🎉', '🚀', '📈', '🎪'],
  daily: ['☀️', '🌅', '📅', '⏰', '🔄', '🌙', '🌆', '🛏️', '⭐']
};

export default {
  generateEmojiSuggestions,
  getBestEmojiSuggestion,
  emojiDatabase,
  emojiCategories
};