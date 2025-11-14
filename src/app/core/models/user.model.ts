export interface UserCharacter {
  id: string;
  name: string;
  level: number;
  avatarUrl?: string;
}

export interface UserMusic {
  ownedTrackIds: string[];
  activeTrackId: string | null;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  preferredSessionLength: number;
  preferredBreakLength: number;
}

export interface User {
  id: string;
  displayName: string;
  character: UserCharacter;
  music: UserMusic;
  settings: UserSettings;
  streak: number;
}

