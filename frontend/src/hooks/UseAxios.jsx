import { API_BASE_URL } from '../config/api';
import React from 'react'
import axios from "axios";

const axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}`
})


const UseAxios = () => {
  return axiosInstance
}

export default UseAxios;
