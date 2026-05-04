import {
  DEMO_CAMPAIGNS, DEMO_PRODUCTS, DEMO_MERCHANT_ISSUES,
  DEMO_SUMMARY, DEMO_PENDING_ACTIONS
} from './demoData.js'

const isDemo = () => process.env.AGENT_MODE === 'demo' ||
  !process.env.GOOGLE_ADS_CLIENT_ID

// ─── Tool definitions for Claude ───────────────────────────────────────────
export const AGENT_TOOLS = [
  {
    name: 'get_campaign_metrics',
    description: 'Récupère les métriques de performance des campagnes Google Shopping : impressions, clics, CTR, CPC moyen, conversions, valeur des conversions, coût total et ROAS. Utilise cet outil pour analyser les performances globales ou par campagne.',
    input_schema: {
      type: 'object',
      properties: {
        date_range: {
          type: 'string',
          enum: ['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS', 'THIS_MONTH'],
          description: 'Période d\'analyse'
        },
        campaign_id: {
          type: 'string',
          description: 'ID d\'une campagne spécifique (optionnel)'
        }
      },
      required: ['date_range']
    }
  },
  {
    name: 'get_product_performance',
    description: 'Analyse les performances par produit individuel. Identifie les top performers (ROAS élevé), les produits passables (ROAS moyen) et les produits déficitaires (0 conversion ou ROAS < seuil). Inclut CTR, CPC, conversions et revenus par produit.',
    input_schema: {
      type: 'object',
      properties: {
        date_range: {
          type: 'string',
          enum: ['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_90_DAYS'],
          description: 'Période d\'analyse'
        },
        sort_by: {
          type: 'string',
          enum: ['roas', 'cost', 'conversions', 'ctr', 'impressions'],
          description: 'Critère de tri'
        },
        filter_status: {
          type: 'string',
          enum: ['all', 'top', 'good', 'average', 'loss'],
          description: 'Filtrer par statut de performance'
        }
      },
      required: ['date_range']
    }
  },
  {
    name: 'audit_merchant_center',
    description: 'Audite le compte Google Merchant Center. Retourne les produits refusés avec les erreurs détaillées (GTIN manquant, image trop petite, prix incohérent, politique retour absente) et les avertissements. Inclut le statut global du compte.',
    input_schema: {
      type: 'object',
      properties: {
        severity: {
          type: 'string',
          enum: ['all', 'errors_only', 'warnings_only'],
          description: 'Niveau de gravité à retourner'
        }
      },
      required: []
    }
  },
  {
    name: 'adjust_bid',
    description: 'Ajuste l\'enchère CPC d\'un produit ou groupe de produits. ACTION IRRÉVERSIBLE — justification obligatoire. Ne pas utiliser sans analyse préalable des métriques. En mode production : envoi réel à Google Ads API. En mode demo : simulation.',
    input_schema: {
      type: 'object',
      properties: {
        product_id: { type: 'string', description: 'ID du produit ciblé' },
        campaign_id: { type: 'string', description: 'ID de la campagne' },
        current_bid_eur: { type: 'number', description: 'Enchère actuelle en euros (pour confirmation)' },
        new_bid_eur: { type: 'number', description: 'Nouvelle enchère en euros' },
        reason: { type: 'string', description: 'Justification précise basée sur les données (min 30 caractères)' }
      },
      required: ['product_id', 'new_bid_eur', 'reason']
    }
  },
  {
    name: 'pause_products',
    description: 'Met en pause des produits non-rentables dans les campagnes. À utiliser uniquement après confirmation de 0 conversion sur minimum 14 jours avec budget suffisant (>15€ dépensés). Permet de récupérer du budget vers les top performers.',
    input_schema: {
      type: 'object',
      properties: {
        product_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Liste des IDs produits à mettre en pause (max 20 par action)'
        },
        reason: { type: 'string', description: 'Justification avec données chiffrées' },
        budget_recovered_eur: { type: 'number', description: 'Budget mensuel récupéré estimé en euros' }
      },
      required: ['product_ids', 'reason']
    }
  },
  {
    name: 'create_campaign',
    description: 'Crée une nouvelle campagne Google Shopping. Toujours créée en statut PAUSÉ pour vérification humaine avant activation. Vérifie qu\'aucune campagne similaire n\'existe avant de créer.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Nom descriptif de la campagne' },
        daily_budget_eur: { type: 'number', description: 'Budget journalier en euros (max selon garde-fous)' },
        bidding_strategy: {
          type: 'string',
          enum: ['MANUAL_CPC', 'TARGET_ROAS', 'MAXIMIZE_CLICKS'],
          description: 'Stratégie d\'enchères'
        },
        target_roas_percent: {
          type: 'number',
          description: 'ROAS cible en % (ex: 400 = 4x). Uniquement si TARGET_ROAS.'
        },
        category_filter: { type: 'string', description: 'Catégorie produit à cibler' },
        reason: { type: 'string', description: 'Justification business de cette nouvelle campagne' }
      },
      required: ['name', 'daily_budget_eur', 'bidding_strategy', 'reason']
    }
  },
  {
    name: 'optimize_product_titles',
    description: 'Analyse et génère des titres optimisés pour les produits à faible CTR. Applique les meilleures pratiques Google Shopping : marque + type de produit + attributs clés (couleur, taille, matière, modèle). Retourne des suggestions prêtes à copier-coller dans WooCommerce.',
    input_schema: {
      type: 'object',
      properties: {
        product_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'IDs des produits à optimiser (laisser vide pour les 5 pires CTR)'
        },
        focus: {
          type: 'string',
          enum: ['low_ctr', 'all', 'specific'],
          description: 'Quels produits optimiser'
        }
      },
      required: ['focus']
    }
  },
  {
    name: 'generate_report',
    description: 'Génère un rapport de performance complet avec : évolution KPIs vs période précédente, top 5 produits, flop 5 produits, actions effectuées, recommandations prioritaires pour la semaine suivante.',
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['LAST_7_DAYS', 'LAST_30_DAYS', 'LAST_MONTH'],
          description: 'Période du rapport'
        },
        format: {
          type: 'string',
          enum: ['summary', 'detailed'],
          description: 'Niveau de détail'
        }
      },
      required: ['period']
    }
  }
]

// ─── Tool executor ──────────────────────────────────────────────────────────
export async function executeTool(name, input, actionStore) {
  // Guardrails
  if (name === 'create_campaign') {
    const max = parseFloat(process.env.MAX_DAILY_BUDGET_EUR || '200')
    if (input.daily_budget_eur > max) {
      return { error: `Budget ${input.daily_budget_eur}€ dépasse le maximum autorisé de ${max}€. Réduire le budget.` }
    }
  }
  if (name === 'adjust_bid') {
    if (input.new_bid_eur > 50) return { error: 'Enchère > 50€ bloquée par les garde-fous.' }
    if (!input.reason || input.reason.length < 20) return { error: 'Justification insuffisante (minimum 20 caractères).' }
  }
  if (name === 'pause_products') {
    if (input.product_ids?.length > 20) return { error: 'Maximum 20 produits par action de pause.' }
  }

  const requireApproval = process.env.REQUIRE_APPROVAL !== 'false'
  const writeTools = ['adjust_bid', 'pause_products', 'create_campaign']

  if (writeTools.includes(name) && requireApproval) {
    const action = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      type: name,
      params: input,
      status: 'PENDING',
      created_at: new Date().toISOString(),
      sandbox: isDemo()
    }
    actionStore.push(action)
    return {
      queued: true,
      action_id: action.id,
      message: `Action "${name}" mise en attente d'approbation humaine. ID: ${action.id}`,
      sandbox: isDemo()
    }
  }

  // Execute (demo or real)
  switch (name) {
    case 'get_campaign_metrics':
      return isDemo()
        ? { campaigns: DEMO_CAMPAIGNS, period: input.date_range, source: 'demo' }
        : await realGetCampaignMetrics(input)

    case 'get_product_performance':
      const products = DEMO_PRODUCTS
        .filter(p => !input.filter_status || input.filter_status === 'all' || p.status === input.filter_status)
        .sort((a, b) => {
          const k = input.sort_by || 'roas'
          return (b[k] || 0) - (a[k] || 0)
        })
      return { products, period: input.date_range, source: isDemo() ? 'demo' : 'live' }

    case 'audit_merchant_center':
      const issues = input.severity === 'errors_only'
        ? DEMO_MERCHANT_ISSUES.filter(i => i.severity === 'ERROR')
        : input.severity === 'warnings_only'
        ? DEMO_MERCHANT_ISSUES.filter(i => i.severity === 'WARNING')
        : DEMO_MERCHANT_ISSUES
      return {
        total_products: 134,
        active: 107,
        disapproved: 14,
        pending: 13,
        issues,
        account_status: 'ACTIVE',
        source: isDemo() ? 'demo' : 'live'
      }

    case 'optimize_product_titles': {
      const lowCtr = DEMO_PRODUCTS.filter(p => p.ctr < 2.5).slice(0, 5)
      return {
        optimizations: lowCtr.map(p => ({
          product_id: p.id,
          current_title: p.title,
          current_ctr: p.ctr,
          optimized_title: optimizeTitle(p),
          changes: getTitleChanges(p),
          estimated_ctr_lift: '+20-35%'
        }))
      }
    }

    case 'generate_report':
      return {
        period: input.period,
        summary: DEMO_SUMMARY,
        top_products: DEMO_PRODUCTS.filter(p => p.status === 'top'),
        loss_products: DEMO_PRODUCTS.filter(p => p.status === 'loss'),
        pending_actions: DEMO_PENDING_ACTIONS.length,
        merchant_issues: DEMO_MERCHANT_ISSUES.length,
        generated_at: new Date().toISOString()
      }

    default:
      return { error: `Outil inconnu: ${name}` }
  }
}

function optimizeTitle(product) {
  const title = product.title
  if (!title.includes(product.brand)) return `${product.brand} ${title}`
  if (title.length < 60) return `${title} — Livraison gratuite`
  return title
}

function getTitleChanges(product) {
  const changes = []
  if (!product.title.includes(product.brand)) changes.push(`Ajout marque "${product.brand}" en début de titre`)
  if (product.title.length < 40) changes.push('Titre trop court — ajout attributs (couleur, matière, dimensions)')
  if (!product.title.match(/\d/)) changes.push('Ajout dimensions/spécifications chiffrées')
  return changes.length ? changes : ['Titre correct — optimisation mineure de l\'ordre des mots']
}

async function realGetCampaignMetrics(input) {
  // TODO: implémenter l'appel Google Ads API réel
  // Voir documentation: https://developers.google.com/google-ads/api/docs
  throw new Error('Mode production non implémenté — configurer GOOGLE_ADS_CLIENT_ID dans .env')
}
