/// <reference types="nativewind/types" />

// TypeScript 6 type-checks side-effect imports; global.css is handled by
// NativeWind's Metro transformer, so declare CSS imports as modules.
declare module '*.css';
