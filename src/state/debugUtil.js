export const isTestEnv = process.env.NODE_ENV === "test";

export const debugDate = () => {
  const today = new Date();

  return new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
    0,
    0,
    0
  );
};
