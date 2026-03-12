const ACCESS_TOKEN_KEY = "booking_platform_access_token";
const USER_EMAIL_KEY = "booking_platform_user_email";
const USER_DISPLAY_NAME_KEY = "booking_platform_user_display_name";
const USER_PROFILES_KEY = "booking_platform_user_profiles";

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function getUserEmail(): string | null {
  return localStorage.getItem(USER_EMAIL_KEY);
}

export function setUserEmail(email: string): void {
  localStorage.setItem(USER_EMAIL_KEY, email);
}

export function removeUserEmail(): void {
  localStorage.removeItem(USER_EMAIL_KEY);
}

export function getUserDisplayName(): string | null {
  return localStorage.getItem(USER_DISPLAY_NAME_KEY);
}

export function setUserDisplayName(name: string): void {
  localStorage.setItem(USER_DISPLAY_NAME_KEY, name);
}

export function removeUserDisplayName(): void {
  localStorage.removeItem(USER_DISPLAY_NAME_KEY);
}

interface StoredUserProfiles {
  [email: string]: {
    fullName: string;
  };
}

function getUserProfiles(): StoredUserProfiles {
  const raw = localStorage.getItem(USER_PROFILES_KEY);
  if (!raw) return {};
  try {
    return JSON.parse(raw) as StoredUserProfiles;
  } catch {
    return {};
  }
}

export function saveUserProfile(email: string, fullName: string): void {
  const profiles = getUserProfiles();
  profiles[email] = { fullName };
  localStorage.setItem(USER_PROFILES_KEY, JSON.stringify(profiles));
}

export function getFullNameForEmail(email: string): string | null {
  const profiles = getUserProfiles();
  return profiles[email]?.fullName ?? null;
}
