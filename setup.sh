#!/usr/bin/env bash
# Script d'installation pour lancer le projet Swifty sur une nouvelle machine
# (ex: poste de correction à l'école).
#
# Usage: bash setup.sh
set -euo pipefail

REPO_URL="https://github.com/imenecole42/swifty.git"
DIR="swifty"

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js n'est pas installé sur cette machine. Installe-le avant de continuer."
  exit 1
fi

if [ -d "$DIR/.git" ]; then
  echo "Dépôt déjà présent, mise à jour..."
  cd "$DIR"
  git pull
else
  echo "Clonage du dépôt..."
  git clone "$REPO_URL" "$DIR"
  cd "$DIR"
fi

echo "Installation des dépendances npm..."
npm install

if [ ! -f .env ]; then
  echo ""
  echo "Fichier .env manquant (normal, il n'est jamais commité dans git)."
  echo "Entre tes identifiants d'application 42 OAuth (intra.42.fr > Settings > API) :"
  read -rp "EXPO_PUBLIC_FT_UID: " FT_UID
  read -rsp "EXPO_PUBLIC_FT_SECRET: " FT_SECRET
  echo ""
  cat > .env <<EOF
EXPO_PUBLIC_FT_UID=$FT_UID
EXPO_PUBLIC_FT_SECRET=$FT_SECRET
EOF
  echo ".env créé."
fi

echo ""
echo "Tout est prêt. Lancement du serveur Expo..."
npx expo start
