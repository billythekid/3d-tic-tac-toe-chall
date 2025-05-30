// Removed GitHub Spark import to fix build errors
// import { spark } from '@github/spark';

/**
 * Functions for interacting with GitHub API
 * Note: GitHub Spark functionality removed to fix build issues
 */

/**
 * Gets the current user's GitHub username
 * @returns Promise with the username
 */
export async function getUserName(): Promise<string> {
  // Fallback implementation since GitHub Spark is not available
  return 'Player';
}

/**
 * Gets the current user's avatar URL
 * @returns Promise with the avatar URL
 */
export async function getUserAvatar(): Promise<string | null> {
  // Fallback implementation since GitHub Spark is not available
  return null;
}