export const getStartOfDay = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const getEndOfDay = (date: Date): Date => {
    const newDate = new Date(date);
    newDate.setHours(23, 59, 59, 999);
    return newDate;
}

export const getStartOfWeek = (date: Date): Date => {
  const newDate = new Date(date);
  const day = newDate.getDay();
  const diff = newDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return getStartOfDay(new Date(newDate.setDate(diff)));
};

export const getEndOfWeek = (date: Date): Date => {
    const startOfWeek = getStartOfWeek(date);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);
    return getEndOfDay(endOfWeek);
}

export const getStartOfMonth = (date: Date): Date => {
  const newDate = new Date(date);
  return getStartOfDay(new Date(newDate.getFullYear(), newDate.getMonth(), 1));
};

export const getEndOfMonth = (date: Date): Date => {
    const newDate = new Date(date);
    return getEndOfDay(new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0));
}

// Previous period helpers
export const getStartOfLastWeek = (date: Date): Date => {
    const startOfThisWeek = getStartOfWeek(date);
    const startOfLastWeek = new Date(startOfThisWeek);
    startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);
    return startOfLastWeek;
}

export const getEndOfLastWeek = (date: Date): Date => {
    const endOfLastWeek = getStartOfWeek(date);
    endOfLastWeek.setDate(endOfLastWeek.getDate() - 1);
    return getEndOfDay(endOfLastWeek);
}

export const getStartOfLastMonth = (date: Date): Date => {
    const startOfThisMonth = getStartOfMonth(date);
    const startOfLastMonth = new Date(startOfThisMonth);
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    return startOfLastMonth;
}

export const getEndOfLastMonth = (date: Date): Date => {
    return getEndOfDay(new Date(date.getFullYear(), date.getMonth(), 0));
}

export const getStartOfYesterday = (date: Date): Date => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return getStartOfDay(yesterday);
}

export const getEndOfYesterday = (date: Date): Date => {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    return getEndOfDay(yesterday);
}
