import { IPromoCatSettings } from "../interfaces";
import { httpClient } from "./httpClient";

export async function getPromoCatsSettings() {
  const { data } = await httpClient.get<IPromoCatSettings>(
    "promo-cats/settings"
  );

  return data;
}

export async function setPromoCatsSettings({
  channel_id,
  post_time,
}: Partial<IPromoCatSettings>) {
  const { data } = await httpClient.post("promo-cats/settings", {
    channel_id,
    post_time,
  });

  return data;
}
