
export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return getStartOfDay(new Date(newDate.setDate(diff)));
};

export const getStartOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  return getStartOfDay(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
};
