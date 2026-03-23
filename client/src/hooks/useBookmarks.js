import { useState, useEffect, useCallback, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import axios from '../api/axios.js';

/**
 * useBookmarks
 * Manages bookmark state for the logged-in user.
 * Fetches bookmarks once on mount if logged in.
 * Exposes: { bookmarks, isBookmarked, toggleBookmark, loading }
 */
export function useBookmarks() {
  const { user, isLoggedIn, updateUser } = useContext(AuthContext);
  const [bookmarks, setBookmarks] = useState(user?.bookmarks || []);
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
      // Sync shraddha back to user context
      updateUser({ bookmarks: res.data.bookmarks, shraddha: res.data.shraddha, shraddhaRank: res.data.shraddhaRank });
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
  }, [bookmarks, isLoggedIn, updateUser]);

  return { bookmarks, isBookmarked, toggleBookmark, loading };
}
