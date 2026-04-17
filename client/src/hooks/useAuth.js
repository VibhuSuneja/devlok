import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';

export const useAuth = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();

  // Bridge legacy user properties
  const user = clerkUser ? {
    ...clerkUser,
    _id: clerkUser.id,
    id: clerkUser.id,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    name: clerkUser.fullName || clerkUser.firstName || clerkUser.username || 'Seeker',
    role: clerkUser.publicMetadata?.role,
    gurukul: clerkUser.publicMetadata?.gurukul,
    shraddha: clerkUser.publicMetadata?.shraddha || 0,
    ...clerkUser.publicMetadata
  } : null;

  const isAdmin = user?.role === 'admin' || user?.email === 'admin@devlok.com';

  return {
    user,
    isLoggedIn: isSignedIn,
    isAdmin,
    loading: !isLoaded,
    logout: () => signOut(),
    reloadUser: () => clerkUser?.reload(),
  };
};

