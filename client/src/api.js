// Secure API client helper for SynapseVault

export const TOKEN_STORAGE_KEY = 'synapse_vault_auth_token';

export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || sessionStorage.getItem(TOKEN_STORAGE_KEY) || null;
}

export function setAuthToken(token, remember = true) {
  if (remember) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } else {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
  }
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Authenticated fetch wrapper
 */
export async function apiFetch(url, options = {}) {
  const token = getAuthToken();
  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (response.status === 401 && !url.includes('/api/auth/login')) {
    clearAuthToken();
    window.dispatchEvent(new Event('vault:lock'));
    throw new Error('Vault locked or session expired');
  }

  return response;
}
