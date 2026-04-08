import axios from "axios";
import { BASE_URL } from "./apiurl";

const API = `${BASE_URL}/api/subject`;

//GET ALL SUBJECTS
export const getSubjects = () => axios.get(`${API}/list/`);

//ADD SUBJECT
export const addSubjectApi = (data: {
  name: string;
  department: number;
  hours_per_week: number;
  semester: string;
  year: number;
  is_lab: boolean;
}) => axios.post(`${API}/add/`, data);

//UPDATE SUBJECT
export const updateSubjectApi = (
  id: number,
  data: {
    name: string;
    department: number;
    hours_per_week: number;
    semester: string;
    year: number;
    is_lab: boolean;
  }
) => axios.put(`${API}/update/${id}/`, data);

//DELETE SUBJECT
export const deleteSubjectApi = (id: number) =>
  axios.delete(`${API}/delete/${id}/`);