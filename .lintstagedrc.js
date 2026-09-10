// Both apps' format/lint scripts already target their whole project (hardcoded globs in
// package.json), so passing lint-staged's per-file list through wouldn't narrow anything.
// `ng lint` additionally errors on any extra positional argument, so `web` must not receive
// the auto-appended file list at all - a function return is used verbatim, with no auto-append.
module.exports = {
  'api/**/*.ts': ['npm --prefix api run format:check', 'npm --prefix api run lint:check'],
  'web/**/*.{ts,html,scss}': () => ['npm --prefix web run format:check', 'npm --prefix web run lint:check'],
};
