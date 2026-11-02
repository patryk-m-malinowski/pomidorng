import dayjs from "dayjs";

export const formatDate = (date: Date, time: boolean = false) => {
  if (!date) {
    console.warn("formatDate called with nullish date");
    return "" + date;
  }
  return dayjs(date).format("DD MMM YYYY" + (time ? " HH:mm:ss" : ""));
};
export default { formatDate };