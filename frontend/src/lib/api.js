import auth from "../firebase/firebase.config";
import { API_BASE_URL } from "../config/api";
export async function api(path, options = {}) {
  await auth.authStateReady();
  const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;
  const headers = {
    ...(options.body && !(options.body instanceof Blob)
      ? { "Content-Type": "application/json" }
      : {}),
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      body:
        options.body && !(options.body instanceof Blob)
          ? JSON.stringify(options.body)
          : options.body,
      signal: options.signal || AbortSignal.timeout(20000),
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(
      "Cannot reach the service. Check your connection and try again.",
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(
      new Error(data.error || "Something went wrong. Please try again."),
      { status: response.status },
    );
  return data;
}
export const money = (value) =>
  new Intl.NumberFormat("en-BD", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
export const categories = [
  "Electronics",
  "Books",
  "Home & Living",
  "Clothes & Fashion",
  "Sports & Outdoors",
  "Accessories",
];
export async function uploadImage(file) {
  if (
    !file ||
    !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
      file.type,
    ) ||
    file.size > 5 * 1024 * 1024
  )
    throw new Error("Choose a PNG, JPEG, WebP or GIF image under 5 MB.");
  return (
    await api("/uploads", {
      method: "POST",
      headers: { "Content-Type": file.type },
      body: file,
    })
  ).url;
}
