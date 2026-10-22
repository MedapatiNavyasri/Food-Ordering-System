
const API_URL = '';

export async function api(path, options = {}) {
  const config = {
    method: options.method || 'GET',
    headers: {},
    credentials: 'include',
  };

  if (options.body !== undefined) {
    config.headers['Content-Type'] = 'application/json';
    config.body = JSON.stringify(options.body);
  }

  let response;

  try {
    response = await fetch(`${API_URL}${path}`, config);
  } catch (err) {
    throw new Error(
      'Cannot reach the server. Please check that the backend is running.'
    );
  }

  let data = {};

  try {
    data = await response.json();
  } catch (err) {
    // Response had no JSON body
  }

  if (!response.ok) {
    const fallback = response.status >= 500
      ? 'Server error. Please check that the backend and MongoDB are running.'
      : 'Something went wrong.';

    const error = new Error(data.message || fallback);
    error.status = response.status;
    throw error;
  }

  return data;
}
