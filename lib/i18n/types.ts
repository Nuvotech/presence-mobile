export type TranslationDictionary = {
  common: {
    appTitle: string;
    roleAdmin: string;
    roleTeacher: string;
    logout: string;
    presentCount: (count: number) => string;
    presentSuffix: string;
    cameraDeniedMessage: string;
    cameraPromptMessage: string;
  };
  drawer: {
    home: string;
    history: string;
    profile: string;
    logout: string;
  };
  login: {
    wordmark: string;
    subtitle: string;
    emailLabel: string;
    emailPlaceholder: string;
    passwordLabel: string;
    submit: string;
    forgotPassword: string;
    genericError: string;
    invalidCredentialsError: string;
    networkError: string;
  };
  home: {
    headerTitle: string;
    today: string;
    noSessionsToday: string;
    noSessionsOnDate: string;
    selectDateLabel: string;
    scanClass: string;
    chooseClass: string;
    historyButton: string;
    selectClassModalTitle: string;
    noClassesAvailable: string;
  };
  profile: {
    headerTitle: string;
    sessionsRecorded: string;
    classesCovered: string;
    viewHistory: string;
  };
  register: {
    headerTitle: string;
    noActiveClass: string;
    backToHome: string;
    attendanceSheet: string;
    presentTab: (count: number) => string;
    absentTab: (count: number) => string;
    searchPlaceholder: string;
    loadingStudents: string;
    submitSuccessTitle: string;
    submitSuccessMessage: string;
    submitFailTitle: string;
    submitFailPartial: (count: number) => string;
    submitFailSession: string;
    submitting: string;
    submittedUpdate: string;
    submitRegister: string;
  };
  registerStudent: {
    headerTitle: string;
    addPhoto: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    classLabel: string;
    guardianContact: string;
    whatsappLabel: string;
    whatsappPlaceholder: string;
    save: string;
  };
  classScanner: {
    headerTitle: string;
    scanErrorMessage: string;
    scanHint: string;
  };
  scanner: {
    headerTitle: string;
    scanHint: string;
    studentsScannedCount: (count: number) => string;
    scannedToday: string;
    goalLabel: (total: number) => string;
    viewRegister: string;
  };
  idCard: {
    headerTitle: string;
    previewTitle: string;
    previewSubtitle: string;
    share: string;
    edit: string;
    qrUnavailable: string;
    presentEachMorning: string;
    shareMessage: (name: string, grade: string, studentId: string) => string;
  };
  history: {
    headerTitle: string;
    emptyState: string;
    today: string;
  };
  historyDetail: {
    headerTitle: string;
    notFound: string;
    present: string;
    absent: string;
  };
  scanResult: {
    parentNotified: string;
    duplicateTitle: string;
    duplicateAlreadyMarked: (time: string) => string;
    duplicateStatusLabel: string;
    duplicateStatusValue: string;
    duplicateScanNext: string;
    duplicateForce: string;
    errorTitle: string;
    errorSubtitle: string;
    errorRetry: string;
    errorIgnore: string;
  };
  subjectPicker: {
    title: string;
    subtitle: string;
  };
  studentListItem: {
    arrivedAt: (time: string) => string;
    markedAbsent: string;
    notCounted: string;
    markPresentLabel: string;
    markAbsentLabel: string;
  };
};

export type Language = 'en' | 'fr';
