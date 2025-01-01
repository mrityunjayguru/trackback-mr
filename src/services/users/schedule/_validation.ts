import { model } from "mongoose";
import { scheduleSchema } from "../../../models/schedule";
import { holidaySchema } from "../../../models/doctorHolidays";

export const Schedule = model("Schedule", scheduleSchema);
export const Holidays = model("Holidays", holidaySchema);
