export interface IUser {
  user_id: number;
  discord_user_id: string;
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

export interface IScheduledPost {
  id: number;
  channel_id: string;
  text: string;
  media: string;
  status: ScheduledPostStatus;
  error: string;
  scheduled_at: Date;
}

export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};
