import { PASTEL_ACCENTS } from "../theme/tokens";

export const avatarUriFor = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=EAE3FD&color=5B45B8&size=128`;

export const AVATAR_COLORS = PASTEL_ACCENTS.map((a) => a.bg);

export const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
