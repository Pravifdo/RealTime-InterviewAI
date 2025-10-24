const natural = require('natural');
const keyword = require('keyword-extractor');
const sw = require('stopword');

// Initialize tokenizer
const tokenizer = new natural.WordTokenizer();

/**
 * Extract keywords from text using multiple methods
 */
function extractKeywords(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Method 1: Using keyword-extractor
  const extractedKeywords = keyword.extract(text, {
    language: "english",
    remove_digits: false,
    return_changed_case: true,
    remove_duplicates: true
  });

  // Method 2: Remove stopwords manually
  const tokens = tokenizer.tokenize(text.toLowerCase());
  const withoutStopwords = sw.removeStopwords(tokens);

  // Combine and deduplicate
  const combined = [...new Set([...extractedKeywords, ...withoutStopwords])];
  
  // Filter out very short words (less than 3 characters)
  return combined.filter(word => word.length >= 3);
}

/**
 * Calculate similarity score between two sets of keywords
 */
function calculateKeywordMatch(participantKeywords, expectedKeywords) {
  if (!expectedKeywords || expectedKeywords.length === 0) {
    return {
      matchedKeywords: [],
      score: 0,
      matchPercentage: 0
    };
  }

  // Convert to lowercase for comparison
  const participantSet = new Set(participantKeywords.map(k => k.toLowerCase()));
  const expectedSet = new Set(expectedKeywords.map(k => k.toLowerCase()));

  // Find matched keywords
  const matched = [...participantSet].filter(k => expectedSet.has(k));

  // Calculate score
  const matchPercentage = (matched.length / expectedKeywords.length) * 100;
  
  // Score calculation (can be customized)
  let score = 0;
  if (matched.length === 0) {
    score = 0;
  } else if (matched.length === expectedKeywords.length) {
    score = 100; // Perfect match
  } else {
    // Partial credit based on percentage
    score = Math.min(100, Math.round(matchPercentage * 1.2)); // Slightly generous scoring
  }

  return {
    matchedKeywords: matched,
    score: Math.min(100, score),
    matchPercentage: Math.round(matchPercentage)
  };
}

/**
 * Calculate overall text similarity using Levenshtein distance
 */
function calculateTextSimilarity(text1, text2) {
  if (!text1 || !text2) return 0;
  
  const distance = natural.LevenshteinDistance(
    text1.toLowerCase(),
    text2.toLowerCase()
  );
  
  const maxLength = Math.max(text1.length, text2.length);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  
  return Math.round(similarity);
}

/**
 * Evaluate an answer against expected answer/keywords
 */
function evaluateAnswer(participantAnswer, expectedKeywords, expectedAnswer = null) {
  // Extract keywords from participant's answer
  const participantKeywords = extractKeywords(participantAnswer);

  // Calculate keyword match score
  const keywordMatch = calculateKeywordMatch(participantKeywords, expectedKeywords);

  // If expected answer is provided, also calculate text similarity
  let textSimilarity = 0;
  if (expectedAnswer) {
    textSimilarity = calculateTextSimilarity(participantAnswer, expectedAnswer);
  }

  // Final score (weighted average)
  const finalScore = expectedAnswer
    ? Math.round((keywordMatch.score * 0.7) + (textSimilarity * 0.3))
    : keywordMatch.score;

  return {
    participantKeywords,
    matchedKeywords: keywordMatch.matchedKeywords,
    score: finalScore,
    matchPercentage: keywordMatch.matchPercentage,
    textSimilarity
  };
}

module.exports = {
  extractKeywords,
  calculateKeywordMatch,
  calculateTextSimilarity,
  evaluateAnswer
};
