export function getDailyLoginCount(email: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const today = new Date().toISOString().split("T")[0];
    const key = `fa_login_count_${today}_${cleanEmail}`;
    const value = localStorage.getItem(key);
    return value ? parseInt(value, 10) : 0;
  } catch (e) {
    console.error("Error getting daily login count", e);
    return 0;
  }
}

export function incrementDailyLoginCount(email: string): void {
  if (typeof window === "undefined") return;
  try {
    const cleanEmail = email.trim().toLowerCase();
    const today = new Date().toISOString().split("T")[0];
    const key = `fa_login_count_${today}_${cleanEmail}`;
    const current = getDailyLoginCount(cleanEmail);
    localStorage.setItem(key, (current + 1).toString());
  } catch (e) {
    console.error("Error incrementing daily login count", e);
  }
}
