import { IPromoCatImage, IPromoCatSettings } from "../interfaces";
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

export async function getPromoCatsImages(): Promise<IPromoCatImage[]> {
  const { data } = await httpClient.get<any[]>("promo-cats/upload/images");

  const toBase64 = (bufferObj: Record<number, number>): string => {
    const bytes: number[] = [];

    let i = 0;
    while (bufferObj[i] !== undefined) {
      bytes.push(bufferObj[i]);
      i++;
    }

    const uint8 = new Uint8Array(bytes);
    return btoa(String.fromCharCode(...uint8));
  };

  return (data ?? []).map((item) => {
    return {
      name: item.name,
      preview: toBase64(item.preview),
    };
  });
}
