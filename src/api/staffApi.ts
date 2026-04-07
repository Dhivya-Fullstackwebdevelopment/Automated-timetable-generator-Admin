import axios from "axios";
import { BASE_URL } from "./apiurl";

const API = `${BASE_URL}/api/staff`;

export const getStaff = () => axios.get(`${API}/list/`);

export const addStaffApi = (data: any) =>
  axios.post(`${API}/add/`, data);

export const updateStaffApi = (id: number, data: any) =>
  axios.put(`${API}/update/${id}/`, data);

export const deleteStaffApi = (id: number) =>
  axios.delete(`${API}/delete/${id}/`);