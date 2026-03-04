import { apiClient } from "./client";

export interface InitUserPayload {
  email: string;
  goal: string;
}

export async function initUser(payload: InitUserPayload) {
  return apiClient("/auth/init", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}