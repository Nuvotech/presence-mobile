export type Subject = {
  code: string;
  label: string;
};

export const subjects: Subject[] = [
  { code: 'ANG', label: 'Anglais' },
  { code: 'TD AN', label: 'Travaux dirigés Anglais' },
  { code: 'FRAN', label: 'Français' },
  { code: 'TD FR', label: 'Travaux dirigés Français' },
  { code: 'SVT', label: 'Sciences de la Vie et de la Terre' },
  { code: 'PCHIM', label: 'Physique-Chimie' },
  { code: 'TD PC', label: 'Travaux dirigés Physique-Chimie' },
  { code: 'MATHS', label: 'Mathématiques' },
  { code: 'TD M', label: 'Travaux dirigés Mathématiques' },
  { code: 'INST CIV', label: 'Instruction Civique' },
  { code: 'HGEO', label: 'Histoire-Géographie' },
  { code: 'EPS', label: 'Éducation Physique et Sportive' },
];

export const subjectLabel = (code: string) => subjects.find((s) => s.code === code)?.label ?? code;
