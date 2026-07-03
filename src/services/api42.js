import * as SecureStore from 'expo-secure-store';

const API_BASE = 'https://api.intra.42.fr';
const CLIENT_ID = process.env.EXPO_PUBLIC_FT_UID;
const CLIENT_SECRET = process.env.EXPO_PUBLIC_FT_SECRET;

// Empêche les rafraîchissements concurrents : toutes les requêtes en attente
// partagent la même promesse au lieu de déclencher chacune leur propre appel.
let refreshPromise = null;

async function requestNewToken() {
  const response = await fetch(`${API_BASE}/oauth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'client_credentials',
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    }),
  });

  if (!response.ok) {
    throw new Error('Impossible de se connecter à l\'API 42');
  }

  const data = await response.json();
  const expiry = Date.now() + data.expires_in * 1000 - 60000;

  await SecureStore.setItemAsync('ft_access_token', data.access_token);
  await SecureStore.setItemAsync('ft_token_expiry', expiry.toString());

  console.log('[42 API] Nouveau token demandé, valide', data.expires_in, 's');

  return data.access_token;
}

async function refreshToken() {
  if (!refreshPromise) {
    refreshPromise = requestNewToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function getToken(forceRefresh = false) {
  if (!forceRefresh) {
    const token = await SecureStore.getItemAsync('ft_access_token');
    const expiry = await SecureStore.getItemAsync('ft_token_expiry');

    if (token && expiry && Date.now() < parseInt(expiry)) {
      console.log('[42 API] Token en cache réutilisé');
      return token;
    }
  }

  return refreshToken();
}

async function apiFetch(path, retryOn401 = true) {
  const token = await getToken();
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status === 401 && retryOn401) {
    // Le token stocké est invalide malgré une expiration théorique non
    // atteinte (horloge décalée, token révoqué...) : on force un nouveau
    // token et on retente une seule fois.
    await getToken(true);
    return apiFetch(path, false);
  }
  if (response.status === 404) {
    throw new Error('Utilisateur non trouvé');
  }
  if (!response.ok) {
    throw new Error('Erreur réseau, réessaie plus tard');
  }

  return response.json();
}

export async function fetchUser(login) {
  return apiFetch(`/v2/users/${encodeURIComponent(login)}`);
}
