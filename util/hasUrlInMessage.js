/**
 * Extracts a URL from a message content if one exists
 * @param {string} content - The message content to check
 * @return {string|null} - The first URL found or null if none exists
 */
export function hasUrlInMessage(content) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const matches = content.match(urlRegex);
    return matches ? matches[0] : null;
}
