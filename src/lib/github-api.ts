// Import the spark object
import { spark } from '@github/spark';

/**
 * Functions for interacting with GitHub API
 */

/**
 * Gets the current user's GitHub username
 * @returns Promise with the username
 */
export async function getUserName(): Promise<string> {
  try {
    // Use the spark built-in octokit instance to make an authenticated request
    const response = await spark.octokit.request('GET /user');
    return response.data.login || 'Player';
  } catch (error) {
    console.error('Error fetching GitHub user:', error);
    return 'Player';
  }
}

/**
 * Gets the current user's avatar URL
 * @returns Promise with the avatar URL
 */
export async function getUserAvatar(): Promise<string | null> {
  try {
    const response = await spark.octokit.request('GET /user');
    return response.data.avatar_url;
  } catch (error) {
    console.error('Error fetching GitHub avatar:', error);
    return null;
  }
}