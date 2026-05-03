import { API_URL } from "../config/api";

export const sendMessage = async (message) => {
  try {
    const res = await fetch(`${API_URL}/api/ai/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("AI API error", error);
    throw error;
  }
};
