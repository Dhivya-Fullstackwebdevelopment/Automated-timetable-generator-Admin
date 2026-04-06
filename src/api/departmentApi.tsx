import axios from "axios";
import { BASE_URL } from "./apiurl";

const API = `${BASE_URL}/api/department`;

export const getDepartments = () => axios.get(`${API}/list/`);

export const addDepartmentApi = (data: { name: string; type: number }) =>
  axios.post(`${API}/add/`, data);

export const updateDepartmentApi = (id: number, data: { name: string; type: number }) =>
  axios.put(`${API}/update/${id}/`, data);

export const deleteDepartmentApi = (id: number) =>
  axios.delete(`${API}/delete/${id}/`);