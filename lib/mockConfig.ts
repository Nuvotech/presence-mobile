// Single switch for the whole data layer: when true, every lib/*.ts data
// function (auth, classes, students, sessions) returns local mock data
// instead of calling the real API. Flip via EXPO_PUBLIC_USE_MOCK_DATA=false
// in .env once the backend is ready — no code changes needed at that point.
export const USE_MOCK_DATA =
  (process.env.EXPO_PUBLIC_USE_MOCK_DATA ?? "true") !== "false";
