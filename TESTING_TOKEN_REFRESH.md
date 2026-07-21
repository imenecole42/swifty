# Tester le refresh automatique du token 42 (bonus)

Ce document explique comment démontrer, le jour de l'éval, que l'app met en
cache le token OAuth 42 et le renouvelle automatiquement (sans redemander un
token à chaque recherche, et sans jamais laisser un token expiré être utilisé).

Le code concerné est dans [src/services/api42.js](src/services/api42.js).

## 1. Démontrer que le cache fonctionne (sans rien modifier)

1. Lance l'app normalement (`npx expo start`).
2. Fais une recherche → les logs du terminal Expo affichent :
   ```
   [42 API] Nouveau token demandé, valide 7200 s
   ```
3. Fais une 2e recherche (login différent ou identique) → les logs affichent :
   ```
   [42 API] Token en cache réutilisé
   ```
   au lieu de redemander un token. Répète autant de fois que tu veux, le
   comportement reste le même tant que le token n'a pas expiré (2h).

Ça suffit pour montrer que le token n'est pas redemandé à chaque appel API.

## 2. Démontrer le vrai renouvellement automatique (expiration forcée)

Comme un token dure normalement 2h, on ne peut pas attendre en live pendant
l'éval. Le fichier contient déjà deux lignes commentées prêtes à activer pour
simuler une expiration rapide (10 secondes).

### Étape A — activer l'expiration courte

Dans `src/services/api42.js`, fonction `requestNewToken` (~ligne 26-28) :

```js
const data = await response.json();
// const expiry = Date.now() + 10000; // TEST refresh token: ...
const expiry = Date.now() + data.expires_in * 1000 - 60000;
```

Commente la ligne normale et décommente la ligne de test, pour obtenir :

```js
const data = await response.json();
const expiry = Date.now() + 10000; // TEST refresh token: ...
// const expiry = Date.now() + data.expires_in * 1000 - 60000;
```

Sauvegarde. L'app se recharge automatiquement (Fast Refresh).

### Étape B — vider le token déjà en cache

Si tu as déjà utilisé l'app avant (token encore valide stocké sur le
téléphone), il faut le vider une fois pour que le changement ci-dessus
prenne effet. Dans la fonction `getToken` (~ligne 46-50) :

```js
async function getToken(forceRefresh = false) {
  // TEST refresh token: décommenter ces 2 lignes ...
  // await SecureStore.deleteItemAsync('ft_access_token');
  // await SecureStore.deleteItemAsync('ft_token_expiry');
```

Décommente les 2 lignes `SecureStore.deleteItemAsync`. Sauvegarde.

Fais **une recherche** dans l'app : ça vide le vieux token et en récupère un
nouveau (expirant dans 10s selon l'étape A).

**Recommente immédiatement ces 2 lignes** (`SecureStore.deleteItemAsync`) et
sauvegarde — sinon le cache est vidé à chaque recherche et le test suivant ne
prouve plus rien.

### Étape C — observer le cycle cache → expiration → refresh

1. Fais une recherche tout de suite → log attendu :
   ```
   [42 API] Token en cache réutilisé
   ```
   (le token vient d'être récupéré à l'étape B, encore valide quelques
   secondes)
2. Attends **15 secondes** (le token stocké est considéré expiré après 10s).
3. Fais une nouvelle recherche → log attendu :
   ```
   [42 API] Nouveau token demandé, valide 7200 s
   ```
   Le `7200 s` est la vraie durée renvoyée par l'API 42 (le raccourci à 10s
   n'existe que côté stockage local, pour le test) — c'est la preuve que le
   renouvellement automatique s'est déclenché tout seul à l'expiration.

## 3. Remettre le projet en état normal après l'éval

Remets le fichier dans son état d'origine (annule les modifications de
l'étape A si tu ne l'as pas déjà fait) :

```js
const data = await response.json();
const expiry = Date.now() + data.expires_in * 1000 - 60000;
```

Vérifie qu'aucune ligne `SecureStore.deleteItemAsync` n'est décommentée dans
`getToken`. Sans ça, l'app redemande un token toutes les 10 secondes en
usage normal, ce qui n'est plus le comportement attendu.
