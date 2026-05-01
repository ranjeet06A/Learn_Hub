const USERS_KEY = "learn_hub_users";
const CURRENT_USER = "learn_hub_user";

// 🔐 SIGNUP
export function signup(email: string, password: string) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

  const exists = users.find((u: any) => u.email === email);
  if (exists) {
    throw new Error("User already exists");
  }

  users.push({ email, password });
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// 🔐 LOGIN
export function login(email: string, password: string) {
  const users = JSON.parse(localStorage.getItem(USERS_KEY) || "[]");

  const user = users.find(
    (u: any) => u.email === email && u.password === password
  );

  if (!user) {
    throw new Error("Invalid email or password");
  }

  localStorage.setItem(CURRENT_USER, JSON.stringify(user));
}

// 🔐 LOGOUT
export function logout() {
  localStorage.removeItem(CURRENT_USER);
}
export function isAdmin() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  return user?.role === "admin";
}

export function changePassword(email: string, newPassword: string) {
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  const updated = users.map((u: any) =>
    u.email === email ? { ...u, password: newPassword } : u
  );

  localStorage.setItem("users", JSON.stringify(updated));
  return true;
}