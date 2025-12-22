export interface IUser {
  id: number;
  discord_id: string;
  username: string;
  roles: string[];
  total_xp: number;
  level: number;
  cookies: number;
  avatar: string;
}

export interface IUserFilterVariables {
  q: string;
}

export interface IFilterVariables {
  q: string;
}

export interface IIdentity {
  id: number;
  name: string;
  avatar: string;
}

enum ScheduledPostStatus {
  SCHEDULED = "SCHEDULED",
  PROCESSING = "PROCESSING",
  SENT = "SENT",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export interface IMedia {
  id: number;
  path: string;
  preview: Record<number, number> | string; // объект с числовыми ключами или строка base64
  scheduledPostId?: number;
}

export interface IScheduledPost {
  id: number;
  channel_id: string;
  text: string;
  media: IMedia[];
  status: ScheduledPostStatus;
  error: string;
  scheduled_at: Date;
}

export interface IPromoCat {
  id: number;
  promocode: string;
  discount: number;
  date: string;
}

export interface IPromoCatImage {
  name: string;
  preview: string; // base64
}

export interface IPromoCatSettings {
  channel_id: string;
  post_time: string;
}

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
