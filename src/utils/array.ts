export const pipe =
  (...functions: any[]) =>
  (args: any) =>
    functions.reduce((arg, fn) => fn(arg), args)
