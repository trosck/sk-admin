import { httpClient } from "./httpClient";
import type { IUser } from "../interfaces";

export type UpdateUserPayload = Partial<IUser>;

export async function updateUser(
  userId: number | string,
  payload: UpdateUserPayload
): Promise<IUser> {
  const { data } = await httpClient.patch<IUser>(`/users/${userId}`, payload);
  return data;
}

export async function incrementUserXP(
  userId: number | string,
  xp: number
): Promise<IUser> {
  const { data } = await httpClient.post<IUser>(`/users/${userId}/give-xp`, {
    xp,
  });
  return data;
}
