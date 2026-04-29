import { useEffect, useState, useRef } from "react";
import { authManager } from "../utils/authManager";
import type { User } from "../utils/authManager";

/**
 * Custom hook to get current user with proper dependency tracking
 * Prevents infinite loops by tracking user ID changes instead of object reference changes
 */
export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(() => authManager.getCurrentUser());
  const prevUserIdRef = useRef<string | null>(user?.id || null);

  useEffect(() => {
    const checkUser = () => {
      const currentUser = authManager.getCurrentUser();
      const currentUserId = currentUser?.id || null;

      // Only update if user ID actually changed (login/logout/user switch)
      if (currentUserId !== prevUserIdRef.current) {
        setUser(currentUser);
        prevUserIdRef.current = currentUserId;
      }
    };

    // Check immediately
    checkUser();

    // Also check on storage changes (for multi-tab support)
    const handleStorageChange = () => {
      checkUser();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return user;
}
