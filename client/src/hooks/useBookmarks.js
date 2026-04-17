import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth.js';
import axios from '../api/axios.js';

/**
 * useBookmarks
 * Manages bookmark state for the logged-in user.
 * Fetches bookmarks once on mount if logged in.
 * Exposes: { bookmarks, isBookmarked, toggleBookmark, loading }
 */
export function useBookmarks() {
  const { user, isLoggedIn } = useAuth();
  const [bookmarks, setBookmarks] = useState(user?.publicMetadata?.bookmarks || []);
  const [loading, setLoading] = useState(false);

  // Sync bookmarks from user context whenever user object changes
  useEffect(() => {
    if (user?.bookmarks) {
      setBookmarks(user.bookmarks);
    } else {
      setBookmarks([]);
    }
  }, [user]);

  const isBookmarked = useCallback(
    (characterId) => bookmarks.includes(characterId),
    [bookmarks]
  );

  const toggleBookmark = useCallback(async (characterId) => {
    if (!isLoggedIn) return { needsLogin: true };

    const action = bookmarks.includes(characterId) ? 'remove' : 'add';
    // Optimistic update
    const newBookmarks = action === 'add'
      ? [...bookmarks, characterId]
      : bookmarks.filter(b => b !== characterId);
    setBookmarks(newBookmarks);

    try {
      setLoading(true);
      const res = await axios.put('/users/bookmarks', { characterId, action });
      setBookmarks(res.data.bookmarks);
      return { success: true, action };
    } catch (err) {
      // Rollback optimistic update on error
      setBookmarks(bookmarks);
      console.error('Bookmark error:', err);
      return { error: true };
    } finally {
      setLoading(false);
    }
  }, [bookmarks, isLoggedIn]);

  return { bookmarks, isBookmarked, toggleBookmark, loading };
}
