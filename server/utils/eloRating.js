// ELO Rating System for Code Battles
// Based on standard ELO rating system with modifications for code battles

const K_FACTOR = 32; // Rating change factor
const DEFAULT_RATING = 1200;

/**
 * Calculate expected score for a player
 * @param {number} ratingA - Rating of player A
 * @param {number} ratingB - Rating of player B
 * @returns {number} Expected score for player A
 */
function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Calculate new ratings after a match
 * @param {number} ratingA - Rating of player A
 * @param {number} ratingB - Rating of player B
 * @param {number} scoreA - Actual score of player A (1 for win, 0 for loss, 0.5 for draw)
 * @returns {object} New ratings and changes
 */
function calculateEloRating(ratingA, ratingB, scoreA) {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = expectedScore(ratingB, ratingA);

  const changeA = Math.round(K_FACTOR * (scoreA - expectedA));
  const changeB = Math.round(K_FACTOR * ((1 - scoreA) - expectedB));

  return {
    player1Rating: ratingA + changeA,
    player2Rating: ratingB + changeB,
    player1Change: changeA,
    player2Change: changeB
  };
}

/**
 * Get rank name based on rating
 * @param {number} rating - Player rating
 * @returns {string} Rank name
 */
function getRankFromRating(rating) {
  if (rating >= 2400) return 'Grandmaster';
  if (rating >= 2200) return 'Master';
  if (rating >= 2000) return 'Expert';
  if (rating >= 1800) return 'Advanced';
  if (rating >= 1600) return 'Intermediate';
  if (rating >= 1400) return 'Beginner';
  return 'Beginner';
}

/**
 * Get rank color based on rating
 * @param {number} rating - Player rating
 * @returns {string} Color hex code
 */
function getRankColor(rating) {
  if (rating >= 2400) return '#FF6B6B'; // Grandmaster - Red
  if (rating >= 2200) return '#FFD700'; // Master - Gold
  if (rating >= 2000) return '#14A44D'; // Expert - Green
  if (rating >= 1800) return '#FF4B2B'; // Advanced - Orange
  if (rating >= 1600) return '#5F2EEA'; // Intermediate - Purple
  if (rating >= 1400) return '#96CEB4'; // Beginner - Light Green
  return '#96CEB4'; // Beginner - Light Green
}

/**
 * Calculate win probability
 * @param {number} ratingA - Rating of player A
 * @param {number} ratingB - Rating of player B
 * @returns {number} Win probability for player A (0-1)
 */
function winProbability(ratingA, ratingB) {
  return expectedScore(ratingA, ratingB);
}

/**
 * Initialize new player rating
 * @returns {number} Default rating
 */
function getDefaultRating() {
  return DEFAULT_RATING;
}

module.exports = {
  calculateEloRating,
  getRankFromRating,
  getRankColor,
  winProbability,
  getDefaultRating,
  K_FACTOR,
  DEFAULT_RATING
};
