export type RosterStudent = {
  id: number;
  name: string;
  initials: string;
  color: string;
  img?: string;
};

export type ClassInfo = {
  id: string;
  qrCode: string;
  name: string;
  roster: RosterStudent[];
};

export const classes: ClassInfo[] = [
  {
    id: 'grade-5b',
    qrCode: 'SCHOOLCLOCK-CLASS-5B',
    name: 'Grade 5B',
    roster: [
      { id: 1, name: 'Aria Anderson', initials: 'AA', color: 'bg-secondary-container' },
      {
        id: 2,
        name: 'Benjamin Carter',
        initials: 'BC',
        color: 'bg-tertiary-fixed',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdk0nzu7tGXz6FYz1o5Bqq_HFAn_Vs2ikTQU65wrWmB4_6SwiElZTqst45nPC2KzmwT7CHnG28HFYXc8lQ3hz3I9GbRCf_Xujf5yBtnRyaN4L4smOA_NCXHSL8OkqwL0ezvb2STfNzzJU4aEmDC-Cdb3pz0ulEffz3dylrLffaPMMMVbIehk_sqEr9mj3f4gCpMDyCQJvNUSS7Zbzxc0ZhWQv3YVnYhNhtvWtx9V36bUOUXV1430NO8w',
      },
      { id: 3, name: 'Chloe Lewis', initials: 'CL', color: 'bg-tertiary-fixed' },
      {
        id: 4,
        name: 'David Wong',
        initials: 'DW',
        color: 'bg-secondary-fixed-dim',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgFuFTvIel0dzCd63qWmwhXYHC2LKI4Tqd1Ea01DJ8StOXRAIJCAHX2I5kAqaSHXXsb3boNZZEw2iU9YangQRQN5WNP02JFeA-FzeTX1n_ipDDJphvB9Ay1cdW_M6bjyesYmzxt1SKtIvvGqBZq_mN1KtyVOBd3UejVwJHckIlD_HVCsy_Qx6s_HsRnGJ2QQB_c2WDGyp4F_zPfyRKIPdEy-6NG_9e1Qqzv399S6s1zTUYwf0BC72OQA',
      },
      { id: 5, name: 'Elena Fischer', initials: 'EF', color: 'bg-secondary-fixed-dim' },
      { id: 6, name: 'Henry Smith', initials: 'HS', color: 'bg-error-container' },
      { id: 7, name: 'Isabella Miller', initials: 'IM', color: 'bg-error-container' },
    ],
  },
  {
    id: 'grade-4a',
    qrCode: 'SCHOOLCLOCK-CLASS-4A',
    name: 'Grade 4A',
    roster: [
      { id: 8, name: 'Liam Johnson', initials: 'LJ', color: 'bg-secondary-container' },
      { id: 9, name: 'Maya Patel', initials: 'MP', color: 'bg-tertiary-fixed' },
      { id: 10, name: 'Noah Bennett', initials: 'NB', color: 'bg-secondary-fixed-dim' },
      { id: 11, name: 'Olivia Grant', initials: 'OG', color: 'bg-error-container' },
    ],
  },
  {
    id: 'grade-3c',
    qrCode: 'SCHOOLCLOCK-CLASS-3C',
    name: 'Grade 3C',
    roster: [
      { id: 12, name: 'Ethan Brooks', initials: 'EB', color: 'bg-secondary-container' },
      { id: 13, name: 'Grace Kim', initials: 'GK', color: 'bg-tertiary-fixed' },
      { id: 14, name: 'Lucas Ferreira', initials: 'LF', color: 'bg-secondary-fixed-dim' },
    ],
  },
];
