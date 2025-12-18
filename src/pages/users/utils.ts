import { IUser } from "../../interfaces";

export function getAvatarUrl(user: IUser) {
  const cdn_url = "http://cdn.discordapp.com/avatars";
  return `${cdn_url}/${user.discord_user_id}/${user.avatar}`;
}
