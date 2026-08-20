export type RosterStudent = {
  id: number;
  name: string;
  initials: string;
  color: string;
  img?: string;
  qrToken: string;
};

export type ClassInfo = {
  id: string;
  qrCode: string;
  name: string;
  roster: RosterStudent[];
};
