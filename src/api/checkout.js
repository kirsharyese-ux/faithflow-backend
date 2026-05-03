import axios from 'axios';
import { API_URL } from '../config/api';

const safePost = async (url, accessToken) => {
  try {
    return await axios.post(
      url,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 20000,
      }
    );
  } catch (err) {
    console.log('❌ AXIOS ERROR:', err);
    console.log('❌ AXIOS RESPONSE:', err?.response);
    console.log('❌ AXIOS REQUEST:', err?.request);
    throw err;
  }
};

export const createCheckoutSession = async (accessToken) => {
  const url = `${API_URL}/api/create-checkout-session`;
  console.log('📡 createCheckoutSession calling:', url);

  try {
    let res = await safePost(url, accessToken);
    console.log('📡 Axios response status:', res.status);
    console.log('📦 Axios response:', res.data);
    return res.data;
  } catch (firstErr) {
    console.log('⚠️ retrying checkout request...');
    const res = await safePost(url, accessToken);
    console.log('📡 Axios retry response status:', res.status);
    console.log('📦 Axios retry response:', res.data);
    return res.data;
  }
};
