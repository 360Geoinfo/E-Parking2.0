const BASE_URL = 'http://localhost:5000/api';

export const fetchData = async (endpoint) => {
  try {
    const res = await fetch(`${BASE_URL}/${endpoint}`);
    return await res.json();
  } catch (err) {
    console.error(err);
  }
};
