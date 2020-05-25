import _ from "lodash";
import { debugDate, isTestEnv } from "./state/debugUtil";

export const curryRight2 = (func) => _.ary(_.curryRight(func), 2);

export const arrReplaceFirst = (arr, predicate, replacer) => {
  replacer = typeof replacer === "function" ? replacer : () => replacer;
  const index = arr.findIndex(predicate);
  arr[index] = replacer(arr[index]);
};

export const isDaysAgo = (date, range) => {
  const currentDate = isTestEnv ? debugDate() : Date.now();
  currentDate.setDate(currentDate.getDate() - range);
  return date.getDate() < currentDate.getDate();
};
