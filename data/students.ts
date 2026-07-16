export type PresentStudent = {
  id: number;
  name: string;
  time: string;
  initials?: string;
  color?: string;
  img?: string;
};

export type AbsentStudent = {
  id: number;
  name: string;
  initials: string;
};

export const presentStudents: PresentStudent[] = [
  { id: 1, name: 'Aria Anderson', time: '07:42', initials: 'AA', color: 'bg-secondary-container' },
  {
    id: 2,
    name: 'Benjamin Carter',
    time: '07:45',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBdk0nzu7tGXz6FYz1o5Bqq_HFAn_Vs2ikTQU65wrWmB4_6SwiElZTqst45nPC2KzmwT7CHnG28HFYXc8lQ3hz3I9GbRCf_Xujf5yBtnRyaN4L4smOA_NCXHSL8OkqwL0ezvb2STfNzzJU4aEmDC-Cdb3pz0ulEffz3dylrLffaPMMMVbIehk_sqEr9mj3f4gCpMDyCQJvNUSS7Zbzxc0ZhWQv3YVnYhNhtvWtx9V36bUOUXV1430NO8w',
  },
  { id: 3, name: 'Chloe Lewis', time: '07:48', initials: 'CL', color: 'bg-tertiary-fixed' },
  {
    id: 4,
    name: 'David Wong',
    time: '07:50',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAgFuFTvIel0dzCd63qWmwhXYHC2LKI4Tqd1Ea01DJ8StOXRAIJCAHX2I5kAqaSHXXsb3boNZZEw2iU9YangQRQN5WNP02JFeA-FzeTX1n_ipDDJphvB9Ay1cdW_M6bjyesYmzxt1SKtIvvGqBZq_mN1KtyVOBd3UejVwJHckIlD_HVCsy_Qx6s_HsRnGJ2QQB_c2WDGyp4F_zPfyRKIPdEy-6NG_9e1Qqzv399S6s1zTUYwf0BC72OQA',
  },
  { id: 5, name: 'Elena Fischer', time: '07:55', initials: 'EF', color: 'bg-secondary-fixed-dim' },
];

export const absentStudents: AbsentStudent[] = [
  { id: 6, name: 'Henry Smith', initials: 'HS' },
  { id: 7, name: 'Isabella Miller', initials: 'IM' },
];

export const studentPhotoUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAyEait_qbH87r7AG95C1WqGLyS9-rvpZDBMZYKtRRg3B92fJ1JMICT0Em1QUtYuiHPumYLD1dvP0fIwBdT261Iz7-ts0CuRl4cyAlfWcrJyKTZGJ-ceLzqAvNubLTnemW1rh9X8AesArUiZ_azRxC8SnopM2Q-N3ZTWY3xjMOoVQMG_XhA9mjrQtNaRKjVG9ULKTDxXByQwrZPvYdgX5JV-Zg_AKEZ1KVUuNM0oKpzI7pLRc-TrQtaVA';

export const logoUri =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDJkCDmRkvx6FIdErAVhzPzNHHw7BjnOEhUcocnhtC9zT7oTljtprvc1eteF3ombnbe5cGH5kXqq_8o-zTUOCT3ZcQST6AXJ_Qz3alprp_uwLFRut-JNIQ-t8Or0XE176eCjj-ZqSeLgODFCdnn9gkuTTFGanRhWcbnGGMbwSh1OwBfaX4425KsDKQEkQwF9HsRtTd6BSUzQyGvydDhHsHUCqsVlHNlIj8hRkzQVoAkyamr29BpiPEscQ';
