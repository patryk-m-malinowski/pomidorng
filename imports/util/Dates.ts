export function addMonths(date: Date, months: number): Date {
  const newDate = new Date(date);
  newDate.setMonth(date.getMonth() + months);
  return newDate;
}

export function addDays(date: Date, days: number): Date {
  const newDate = new Date(date);
  newDate.setDate(date.getDate() + days);
  return newDate;
}

export function addHours(date: Date, hours: number): Date {
  const newDate = new Date(date);
  newDate.setHours(date.getHours() + hours);
  return newDate;
}