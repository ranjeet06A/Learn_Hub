export interface User {
  id: string;
  username: string;
  email: string;
  password: string; // In production, use hashing
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

const USERS_STORAGE_KEY = "learn_hub_users";
const CURRENT_USER_KEY = "learn_hub_current_user";

export const authManager = {
  // Register a new user
  register: (username: string, email: string, password: string): { success: boolean; message: string; user?: User } => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      return { success: false, message: "All fields are required" };
    }

    if (password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters" };
    }

    const users = authManager.getAllUsers();
    if (users.find((u) => u.username === username)) {
      return { success: false, message: "Username already exists" };
    }

    if (users.find((u) => u.email === email)) {
      return { success: false, message: "Email already registered" };
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      email,
      password, // In production, hash this
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    return { success: true, message: "Registration successful", user: newUser };
  },

  // Login user
  login: (username: string, password: string): { success: boolean; message: string; user?: User } => {
    const users = authManager.getAllUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return { success: false, message: "Username not found" };
    }

    if (user.password !== password) {
      return { success: false, message: "Incorrect password" };
    }

    // Set current user session
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, message: "Login successful", user };
  },

  // Get current logged-in user
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // Logout user
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  // Get all users (admin only)
  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Check if authenticated
  isAuthenticated: (): boolean => {
    return authManager.getCurrentUser() !== null;
  },

  // Get user by ID
  getUserById: (id: string): User | null => {
    const users = authManager.getAllUsers();
    return users.find((u) => u.id === id) || null;
  },

  // Delete user (admin only)
  deleteUser: (id: string): boolean => {
    const users = authManager.getAllUsers();
    const filtered = users.filter((u) => u.id !== id);
    if (filtered.length === users.length) return false;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // Create default admin user
  initializeAdmin: () => {
    const users = authManager.getAllUsers();
    if (users.length === 0) {
      const adminUser: User = {
        id: "admin_1",
        username: "admin",
        email: "admin@learnhub.com",
        password: "admin123",
        createdAt: new Date().toISOString(),
      };
      users.push(adminUser);
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  },
};

// Initialize admin user on first load
authManager.initializeAdmin();
