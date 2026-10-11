import '@testing-library/jest-dom/vitest';

// recharts measures its container; jsdom has no ResizeObserver.
global.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
