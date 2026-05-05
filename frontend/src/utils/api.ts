const BASE_URL = "https://learn-hub-backend-g1pi.onrender.com";

const request = async (url: string, options: any = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      ...options,
      headers,
    });

    // 🔐 AUTO LOGOUT
    if (res.status === 401) {
      alert("Session expired. Please login again.");
      localStorage.removeItem("token");
      localStorage.removeItem("learn_hub_user");
      window.location.href = "/login";
      return;
    }

    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || "Request failed");
    }

    return await res.json();
  } catch (err) {
    console.error("API ERROR:", err);
    throw err;
  }
};

const api = {
  get: (url: string) => request(url),

  post: (url: string, body: any) =>
    request(url, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  put: (url: string, body: any) =>
    request(url, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (url: string) =>
    request(url, {
      method: "DELETE",
    }),
};

export default api;