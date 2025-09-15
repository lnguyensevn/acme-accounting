export const getPagination = (
  {
    current,
    pageSize,
  }: {
    current: number;
    pageSize: number;
  } = { current: 1, pageSize: 20 },
) => {
  const limit = pageSize;
  const offset = (current - 1) * pageSize;

  return { limit, offset };
};
