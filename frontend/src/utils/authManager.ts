import { jwtDecode } from "jwt-decode";

export interface User {
  id: string;
  username: string;
  email: string;
  password: string;
  createdAt: string;
}

interface DecodedToken {
  exp: number;
}

const USERS_STORAGE_KEY = "learn_hub_users";
const CURRENT_USER_KEY = "learn_hub_current_user";

export const authManager = {
  // ======================
  // REGISTER
  // ======================
  register: (
    username: string,
    email: string,
    password: string
  ): { success: boolean; message: string; user?: User } => {
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
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    return { success: true, message: "Registration successful", user: newUser };
  },

  // ======================
  // LOGIN (LOCAL)
  // ======================
  login: (
    username: string,
    password: string
  ): { success: boolean; message: string; user?: User } => {
    const users = authManager.getAllUsers();
    const user = users.find((u) => u.username === username);

    if (!user) {
      return { success: false, message: "Username not found" };
    }

    if (user.password !== password) {
      return { success: false, message: "Incorrect password" };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { success: true, message: "Login successful", user };
  },

  // ======================
  // GET CURRENT USER
  // ======================
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  // ======================
  // LOGOUT (FULL CLEANUP)
  // ======================
  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem("token"); // ✅ IMPORTANT
  },

  // ======================
  // USERS
  // ======================
  getAllUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getUserById: (id: string): User | null => {
    const users = authManager.getAllUsers();
    return users.find((u) => u.id === id) || null;
  },

  deleteUser: (id: string): boolean => {
    const users = authManager.getAllUsers();
    const filtered = users.filter((u) => u.id !== id);

    if (filtered.length === users.length) return false;

    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(filtered));
    return true;
  },

  // ======================
  // AUTH CHECK (🔥 FIXED)
  // ======================
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem("token");

    // ❌ No token
    if (!token) return false;

    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // ❌ Invalid token
      if (!decoded.exp) return false;

      // ❌ Expired token
      if (decoded.exp * 1000 < Date.now()) {
        authManager.logout(); // cleanup
        return false;
      }

      return true;
    } catch {
      return false;
    }
  },

  // ======================
  // ADMIN INIT
  // ======================
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

// initialize admin
authManager.initializeAdmin();