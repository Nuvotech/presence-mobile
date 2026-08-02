import { subjects, type Subject } from './subjects';

export type Teacher = {
  id: string;
  name: string;
  email: string;
  avatarUri: string;
  subjects: Subject[];
};

const byCode = (codes: string[]): Subject[] => subjects.filter((s) => codes.includes(s.code));

const avatarFor = (name: string) =>
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1a1c1e&color=fff&size=128`;

export const teachers: Teacher[] = [
  {
    id: 'patrick-mbuyi',
    name: 'Patrick Mbuyi',
    email: 'patrick.mbuyi@school.cd',
    avatarUri: avatarFor('Patrick Mbuyi'),
    subjects: byCode(['ANG', 'TD AN']),
  },
  {
    id: 'chantal-kalonji',
    name: 'Chantal Kalonji',
    email: 'chantal.kalonji@school.cd',
    avatarUri: avatarFor('Chantal Kalonji'),
    subjects: byCode(['FRAN', 'TD FR']),
  },
  {
    id: 'emmanuel-tshibangu',
    name: 'Emmanuel Tshibangu',
    email: 'emmanuel.tshibangu@school.cd',
    avatarUri: avatarFor('Emmanuel Tshibangu'),
    subjects: byCode(['SVT', 'PCHIM', 'TD PC']),
  },
  {
    id: 'grace-mukendi',
    name: 'Grace Mukendi',
    email: 'grace.mukendi@school.cd',
    avatarUri: avatarFor('Grace Mukendi'),
    subjects: byCode(['MATHS', 'TD M']),
  },
  {
    id: 'joseph-ilunga',
    name: 'Joseph Ilunga',
    email: 'joseph.ilunga@school.cd',
    avatarUri: avatarFor('Joseph Ilunga'),
    subjects: byCode(['INST CIV', 'HGEO', 'EPS']),
  },
];
