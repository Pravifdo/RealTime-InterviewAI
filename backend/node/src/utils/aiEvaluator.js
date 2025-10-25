const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'YOUR_API_KEY_HERE');

/**
 * Evaluate answer using Google Gemini AI
 * @param {string} question - The interview question
 * @param {string} answer - Participant's answer
 * @param {Array} expectedKeywords - Expected keywords (optional, for context)
 * @returns {Object} - { score, feedback, strengths, improvements, matched_concepts }
 */
async function evaluateAnswerWithAI(question, answer, expectedKeywords = []) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `You are an expert technical interviewer evaluating a candidate's answer.

Question: "${question}"

Expected Keywords/Concepts: ${expectedKeywords.join(', ')}

Candidate's Answer: "${answer}"

Evaluate this answer and provide:
1. A score from 0-100 based on correctness, completeness, and clarity
2. Brief feedback (2-3 sentences)
3. Strengths in the answer
4. Areas for improvement
5. Which expected concepts were covered

Respond ONLY with valid JSON in this exact format:
{
  "score": <number 0-100>,
  "feedback": "<brief overall feedback>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "matched_concepts": ["<concept 1>", "<concept 2>"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI response');
    }
    
    const evaluation = JSON.parse(jsonMatch[0]);
    
    console.log('✨ AI Evaluation:', {
      score: evaluation.score,
      feedback: evaluation.feedback.substring(0, 50) + '...'
    });
    
    return {
      score: Math.min(100, Math.max(0, evaluation.score)),
      feedback: evaluation.feedback,
      strengths: evaluation.strengths || [],
      improvements: evaluation.improvements || [],
      matchedConcepts: evaluation.matched_concepts || [],
      evaluationType: 'AI'
    };
    
  } catch (error) {
    console.error('❌ AI Evaluation Error:', error.message);
    
    // Fallback to keyword matching if AI fails
    const { extractKeywords, evaluateAnswer } = require('./keywordExtractor');
    const fallbackResult = evaluateAnswer(answer, expectedKeywords);
    
    return {
      score: fallbackResult.score,
      feedback: `Basic keyword matching used (AI unavailable). Score based on ${fallbackResult.matchPercentage}% keyword match.`,
      strengths: [`Mentioned ${fallbackResult.matchedKeywords.length} relevant keywords`],
      improvements: ['AI evaluation unavailable - keyword matching used as fallback'],
      matchedConcepts: fallbackResult.matchedKeywords,
      evaluationType: 'Keyword (Fallback)'
    };
  }
}

/**
 * Generate interview feedback summary using AI
 * @param {Array} questionsAndAnswers - Array of {question, answer, score}
 * @returns {Object} - Overall feedback and recommendations
 */
async function generateInterviewSummary(questionsAndAnswers) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const qaText = questionsAndAnswers.map((qa, i) => 
      `Q${i + 1}: ${qa.question}\nAnswer: ${qa.answer}\nScore: ${qa.score}%`
    ).join('\n\n');

    const prompt = `As a technical interviewer, provide a summary of this interview:

${qaText}

Provide:
1. Overall performance assessment (1-2 sentences)
2. Key strengths (2-3 points)
3. Areas for improvement (2-3 points)
4. Hiring recommendation (Strong Hire, Hire, Maybe, No Hire)

Respond ONLY with valid JSON:
{
  "overall": "<assessment>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvements": ["<improvement 1>", "<improvement 2>"],
  "recommendation": "<recommendation>",
  "average_score": <calculated average>
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse AI summary');
    }
    
    return JSON.parse(jsonMatch[0]);
    
  } catch (error) {
    console.error('❌ AI Summary Error:', error.message);
    
    const avgScore = questionsAndAnswers.reduce((sum, qa) => sum + qa.score, 0) / questionsAndAnswers.length;
    
    return {
      overall: `Interview completed with ${questionsAndAnswers.length} questions answered.`,
      strengths: ['Completed the interview'],
      improvements: ['AI summary unavailable'],
      recommendation: avgScore >= 70 ? 'Maybe' : 'No Hire',
      average_score: avgScore
    };
  }
}

module.exports = {
  evaluateAnswerWithAI,
  generateInterviewSummary
};
