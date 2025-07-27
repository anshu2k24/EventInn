import { jwtDecode } from "jwt-decode";

export function isTokenValid(token) {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now();
  } catch (err) {
    console.error("Invalid token:", err.message);
    return false;
  }
}
