import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export async function uploadImage(file) {
  if (!file) throw new Error('Please select an image.');
  if (import.meta.env.VITE_LOCAL_UPLOADS === 'true') {
    return axios.post(`${API_BASE_URL}/local/uploads`, file, {
      headers: { 'Content-Type': file.type },
    });
  }
  return axios.post(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
    { image: file },
    { headers: { 'Content-Type': 'multipart/form-data' } },
  );
}
