import format from "date-fns/format";
import { PeriodValue, PeriodSettings } from "@/types/commonTypes";
import { vi } from "date-fns/locale";

export function formatDateParameter(date: Date) {
  return format(date, "yyyy-MM-dd");
}

export function getPeriodStartDate(period: PeriodValue) {
  const today = new Date();
  if (period === PeriodValue.week) {
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 6
    );
  } else if (period === PeriodValue.twoWeeks) {
    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() - 13
    );
  } else if (period === PeriodValue.month) {
    return new Date(
      today.getFullYear(),
      today.getMonth() - 1,
      today.getDate() + 1
    );
  } else if (period === PeriodValue.year) {
    return new Date(
      today.getFullYear() - 1,
      today.getMonth(),
      today.getDate() + 1
    );
  }
  return today;
}

export function getDashboardParams(psv: PeriodSettings, pss: PeriodSettings) {
  const visitParams = getRangeParams(psv);
  const sourceParams = getRangeParams(pss);
  return {
    visitDateFrom: visitParams.dateRangeFrom,
    visitDateTo: visitParams.dateRangeTo,
    sourceDateFrom: sourceParams.dateRangeFrom,
    sourceDateTo: sourceParams.dateRangeTo,
  }
}

export function getRangeParams(ps: PeriodSettings) {
  if (ps.period) {
    return {
      dateRangeFrom: formatDateParameter(getPeriodStartDate(ps.period)),
      dateRangeTo: formatDateParameter(new Date()),
    }
  }
  else {
    return {
      dateRangeFrom: formatDateParameter(ps.startDate),
      dateRangeTo: formatDateParameter(ps.endDate),
    }
  }
}
