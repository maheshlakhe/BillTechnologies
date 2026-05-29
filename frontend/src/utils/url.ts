import { API_URL } from '../config/api';

/**
 * Resolves a file path to a full URL that can be used in an <img> tag.
 * Handles:
 * 1. Full URLs (starts with http/https)
 * 2. Absolute paths from root (starts with /)
 * 3. Relative paths
 */
export const resolveFileUrl = (path?: string | null): string => {
  if (!path) return '';
  
  // 1. Handle full URLs
  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  // 2. Handle Frontend Public Assets
  // If it's a known frontend asset like /logo.svg or /favicon.png, return as is
  if (path === '/logo.svg' || path === '/favicon.png' || path.startsWith('/static/')) {
    return path;
  }

  // 3. Normalize path for uploads
  let normalizedPath = path.startsWith('/') ? path.substring(1) : path;
  
  // 4. Handle "uploads/" prefix (remove it as it's added back in the baseUrl step)
  if (normalizedPath.startsWith('uploads/')) {
    normalizedPath = normalizedPath.substring(8);
  }

  // 5. Build final Backend URL
  const baseUrl = API_URL.replace(/\/$/, '');
  return `${baseUrl}/uploads/${normalizedPath}`;
};
