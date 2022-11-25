export const loginMethods = ["phone", "email", "lightning"] as const;
export type LoginMethod = typeof loginMethods[number];
