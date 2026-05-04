# MAX Agent — Google Shopping Autonome 🤖

Agent IA autonome qui analyse, optimise et gère vos campagnes Google Shopping — construit avec Next.js 14 + Claude Opus.

## ✨ Fonctionnalités

- **Chat avec MAX** — pose des questions, demande des analyses, donne des instructions
- **8 outils autonomes** — analyse métriques, audit Merchant Center, ajustement enchères, création campagnes, optimisation titres, rapports
- **Dashboard temps réel** — KPIs, campagnes, ROAS global
- **File d'approbation** — MAX propose, vous approuvez ou refusez
- **Merchant Center** — liste toutes les erreurs avec les corrections WooCommerce
- **Mode DEMO** — données réalistes simulées sans aucune configuration Google
- **Mode PRODUCTION** — connexion réelle à Google Ads API

---

## 🚀 Déploiement en 5 minutes sur Vercel

### 1. Fork ce repository sur GitHub

```
https://github.com/VOTRE_USERNAME/max-agent
```

### 2. Importer sur Vercel

1. Aller sur [vercel.com](https://vercel.com) → **New Project**
2. Importer votre fork GitHub
3. Framework : **Next.js** (détecté automatiquement)
4. Cliquer **Deploy**

### 3. Ajouter les variables d'environnement

Dans Vercel → Settings → Environment Variables :

| Variable | Valeur | Requis |
|---|---|---|
| `ANTHROPIC_API_KEY` | `sk-ant-...` | ✅ Obligatoire |
| `AGENT_MODE` | `demo` | ✅ (ou `production`) |
| `REQUIRE_APPROVAL` | `true` | Recommandé |
| `MAX_DAILY_BUDGET_EUR` | `200` | Recommandé |
| `MIN_ROAS_THRESHOLD` | `1.5` | Recommandé |

**Pour le mode production (optionnel) :**

| Variable | Valeur |
|---|---|
| `GOOGLE_ADS_CLIENT_ID` | Depuis Google Cloud Console |
| `GOOGLE_ADS_CLIENT_SECRET` | Depuis Google Cloud Console |
| `GOOGLE_ADS_DEVELOPER_TOKEN` | Depuis Google Ads API Center |
| `GOOGLE_ADS_REFRESH_TOKEN` | Via OAuth2 flow |
| `GOOGLE_ADS_CUSTOMER_ID` | ID de votre compte Ads |
| `MERCHANT_CENTER_ID` | ID de votre compte Merchant |
| `WOOCOMMERCE_URL` | `https://votre-boutique.com` |
| `WOOCOMMERCE_CONSUMER_KEY` | `ck_...` |
| `WOOCOMMERCE_CONSUMER_SECRET` | `cs_...` |

### 4. Redéployer

Vercel → Deployments → **Redeploy**

---

## 💻 Développement local

```bash
# 1. Cloner
git clone https://github.com/VOTRE_USERNAME/max-agent
cd max-agent

# 2. Installer
npm install

# 3. Configurer
cp .env.example .env.local
# Éditer .env.local avec votre ANTHROPIC_API_KEY

# 4. Démarrer
npm run dev
# → http://localhost:3000
```

---

## 🔑 Obtenir une clé API Anthropic

1. Aller sur [console.anthropic.com](https://console.anthropic.com)
2. Settings → API Keys → **Create Key**
3. Copier la clé (`sk-ant-...`)
4. L'ajouter dans `.env.local` ou Vercel

---

## 🔧 Passer en mode Production Google Ads

### Étape 1 — Developer Token
1. [ads.google.com/aw/apicenter](https://ads.google.com/aw/apicenter)
2. Créer un compte Manager (MCC)
3. Demander un Developer Token (Basic Access — 1-2 jours)

### Étape 2 — OAuth2
1. [console.cloud.google.com](https://console.cloud.google.com)
2. Créer un projet → Activer **Google Ads API** + **Content API for Shopping**
3. Créer des identifiants OAuth 2.0 (type: Web Application)
4. URI de redirection : `https://developers.google.com/oauthplayground`

### Étape 3 — Refresh Token
1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
2. Scope : `https://www.googleapis.com/auth/adwords`
3. Autoriser → copier le **Refresh Token**

### Étape 4 — WooCommerce API
1. WooCommerce → Réglages → Avancé → API REST
2. Ajouter une clé → Lecture/Écriture
3. Copier Consumer Key et Consumer Secret

---

## 🏗️ Architecture

```
src/
├── app/
│   ├── page.js              # Interface complète (chat + dashboard + actions + merchant)
│   ├── layout.js            # Layout Next.js
│   └── api/
│       ├── agent/route.js   # Endpoint streaming SSE — boucle agentique Claude
│       ├── dashboard/route.js # KPIs, campagnes, logs
│       └── actions/route.js   # Approuver/refuser les actions
└── lib/
    ├── agentTools.js        # 8 outils + exécuteur + garde-fous
    ├── systemPrompt.js      # Personnalité et instructions de MAX
    └── demoData.js          # Données réalistes pour le mode DEMO
```

---

## 🛡️ Garde-fous de sécurité

- **Budget maximum** : aucune campagne ne peut dépasser `MAX_DAILY_BUDGET_EUR`
- **Approbation humaine** : toutes les actions d'écriture nécessitent votre OK
- **ROAS minimum** : alerte si le ROAS tombe sous le seuil
- **Limite actions** : max 20 produits par action de pause
- **Mode DEMO par défaut** : aucun risque sans configuration explicite

---

## 📝 Exemples de prompts efficaces

```
"Lance un audit complet et donne-moi un plan d'action prioritaire"
"Quels produits gaspillent du budget sans convertir ?"
"Augmente les enchères sur mes 3 meilleurs ROAS"
"Crée une campagne pour ma catégorie éclairage avec 15€/j"
"Génère le rapport mensuel avec recommandations"
"Corrige toutes les erreurs Merchant Center — dis-moi exactement quoi faire dans WooCommerce"
```

---

## 🔮 Roadmap

- [ ] Persistance des actions via Vercel KV
- [ ] Notifications email/Slack sur les alertes
- [ ] Connexion Google Ads API réelle
- [ ] Optimisation automatique des titres dans WooCommerce via REST API
- [ ] Rapport PDF hebdomadaire
- [ ] Multi-comptes (agences)

---

**Construit avec** Claude Opus (Anthropic) · Next.js 14 · Vercel
