import axios from "axios";
import { BASE_URL } from "./apiurl";

const API = `${BASE_URL}/api/timetable`;

export const generateTimetableApi = (data: {
  department: number;
  year: number;
  semester: string;
}) => {
  return axios.post(`${API}/generate/`, data);
};