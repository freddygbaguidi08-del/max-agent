// Données de démonstration réalistes pour le mode DEMO
// Simule un compte Google Ads d'une boutique WooCommerce de meubles

export const DEMO_CAMPAIGNS = [
  {
    id: 'camp_001',
    name: 'Shopping — Meubles Bureau',
    status: 'ENABLED',
    daily_budget_eur: 35,
    impressions: 48320,
    clicks: 1932,
    ctr: 4.00,
    avg_cpc_eur: 0.52,
    conversions: 87,
    conversion_value: 12180,
    cost_eur: 1004.64,
    roas: 12.12,
    trend_roas: +1.8
  },
  {
    id: 'camp_002',
    name: 'Shopping — Chaises Ergonomiques',
    status: 'ENABLED',
    daily_budget_eur: 25,
    impressions: 21450,
    clicks: 858,
    ctr: 4.00,
    avg_cpc_eur: 0.61,
    conversions: 52,
    conversion_value: 10400,
    cost_eur: 523.38,
    roas: 19.87,
    trend_roas: +3.2
  },
  {
    id: 'camp_003',
    name: 'Shopping — Déco & Accessoires',
    status: 'ENABLED',
    daily_budget_eur: 15,
    impressions: 9870,
    clicks: 197,
    ctr: 2.00,
    avg_cpc_eur: 0.38,
    conversions: 6,
    conversion_value: 540,
    cost_eur: 74.86,
    roas: 7.21,
    trend_roas: -0.4
  },
  {
    id: 'camp_004',
    name: 'Shopping — Liquidation',
    status: 'PAUSED',
    daily_budget_eur: 10,
    impressions: 0,
    clicks: 0,
    ctr: 0,
    avg_cpc_eur: 0,
    conversions: 0,
    conversion_value: 0,
    cost_eur: 0,
    roas: 0,
    trend_roas: 0
  }
]

export const DEMO_PRODUCTS = [
  { id: 'prod_001', title: 'Bureau assis-debout électrique 160cm chêne naturel', brand: 'FlexDesk', category: 'Meubles Bureau', impressions: 12400, clicks: 744, ctr: 6.00, cost_eur: 387.88, revenue: 14400, conversions: 24, roas: 37.12, status: 'top' },
  { id: 'prod_002', title: 'Chaise de bureau ergonomique maillage noir réglable', brand: 'ErgoMax Pro', category: 'Chaises', impressions: 8930, clicks: 446, ctr: 5.00, cost_eur: 272.06, revenue: 6900, conversions: 23, roas: 25.36, status: 'top' },
  { id: 'prod_003', title: 'Bureau angle droit 140x100cm blanc', brand: 'OfficeStyle', category: 'Meubles Bureau', impressions: 6210, clicks: 310, ctr: 4.99, cost_eur: 161.20, revenue: 3600, conversions: 12, roas: 22.33, status: 'good' },
  { id: 'prod_004', title: 'Étagère bibliothèque 5 niveaux bois massif', brand: 'WoodHome', category: 'Rangement', impressions: 4320, clicks: 173, ctr: 4.00, cost_eur: 65.74, revenue: 840, conversions: 7, roas: 12.78, status: 'good' },
  { id: 'prod_005', title: 'Lampe de bureau LED avec variateur tactile', brand: 'LightPro', category: 'Éclairage', impressions: 5640, clicks: 113, ctr: 2.00, cost_eur: 36.16, revenue: 180, conversions: 3, roas: 4.98, status: 'average' },
  { id: 'prod_006', title: 'Tapis de souris XXL gaming noir 80x40', brand: 'DeskPad', category: 'Accessoires', impressions: 3200, clicks: 64, ctr: 2.00, cost_eur: 16.00, revenue: 60, conversions: 1, roas: 3.75, status: 'average' },
  { id: 'prod_007', title: 'Casque audio Bluetooth réducteur de bruit', brand: 'SoundMax', category: 'Audio', impressions: 2800, clicks: 56, ctr: 2.00, cost_eur: 35.28, revenue: 0, conversions: 0, roas: 0, status: 'loss' },
  { id: 'prod_008', title: 'Pouf décoratif velours bleu canard 45cm', brand: 'DecoHome', category: 'Décoration', impressions: 1870, clicks: 22, ctr: 1.18, cost_eur: 6.82, revenue: 0, conversions: 0, roas: 0, status: 'loss' },
]

export const DEMO_MERCHANT_ISSUES = [
  { id: 'iss_001', product_id: 'prod_007', title: 'Casque audio Bluetooth réducteur de bruit', issue: 'GTIN invalide — code EAN non reconnu', severity: 'ERROR', fix: 'Corriger le code EAN dans WooCommerce (Produits > modifier > champ EAN)' },
  { id: 'iss_002', product_id: 'SKU-145', title: 'Fauteuil de lecture velours', issue: 'Image trop petite (420×380px, minimum 800×800px requis)', severity: 'ERROR', fix: 'Remplacer l\'image principale par une photo ≥ 800×800px' },
  { id: 'iss_003', product_id: 'SKU-198', title: 'Organiseur bureau bambou', issue: 'Prix flux (24.99€) différent du prix site (27.99€)', severity: 'ERROR', fix: 'Synchroniser le prix ou forcer une mise à jour du flux dans Product Feed Pro' },
  { id: 'iss_004', product_id: 'prod_008', title: 'Pouf décoratif velours bleu canard', issue: 'Politique de retour absente sur la page produit', severity: 'WARNING', fix: 'Ajouter un lien vers la page politique de retour dans la description courte' },
  { id: 'iss_005', product_id: 'SKU-201', title: 'Bureau enfant réglable 120cm', issue: 'Attribut "marque" manquant dans le flux', severity: 'WARNING', fix: 'Ajouter l\'attribut brand dans Product Feed Pro ou dans les attributs produit WooCommerce' },
]

export const DEMO_SUMMARY = {
  total_cost_eur: 1603,
  total_revenue: 23120,
  global_roas: 14.42,
  total_conversions: 148,
  active_campaigns: 3,
  paused_campaigns: 1,
  total_products: 134,
  active_products: 107,
  disapproved_products: 14,
  merchant_errors: 3,
  merchant_warnings: 2,
  period: 'LAST_30_DAYS'
}

export const DEMO_PENDING_ACTIONS = [
  {
    id: 'act_001',
    type: 'adjust_bid',
    label: 'Augmenter enchère',
    icon: '↑',
    params: {
      campaign: 'Shopping — Meubles Bureau',
      product: 'Bureau assis-debout électrique 160cm',
      current_bid_eur: 0.65,
      new_bid_eur: 0.79,
      reason: 'ROAS ×37 sur 30j — sous-enchère identifiée, potentiel de croissance +40% de volume'
    },
    expected_impact: '+15-25% impressions, ROAS estimé ×30-35',
    risk: 'low',
    created_at: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'act_002',
    type: 'pause_products',
    label: 'Mettre en pause',
    icon: '⏸',
    params: {
      products: ['Casque audio Bluetooth réducteur de bruit', 'Pouf décoratif velours bleu canard'],
      reason: '0 conversion sur 30 jours. Budget gaspillé : 42.10€. Seuil ROAS minimum non atteint.',
      budget_recovered_eur: 42.10
    },
    expected_impact: 'Économie 42€/mois, budget redirigé vers top performers',
    risk: 'low',
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'act_003',
    type: 'create_campaign',
    label: 'Nouvelle campagne',
    icon: '+',
    params: {
      name: 'Shopping — Éclairage & Lampes',
      daily_budget_eur: 12,
      bidding_strategy: 'MANUAL_CPC',
      starting_bid_eur: 0.35,
      reason: 'Catégorie non couverte avec 890 recherches/mois estimées. Test budget conservateur.'
    },
    expected_impact: 'Couverture nouvelle catégorie, ~200-400 impressions/jour estimées',
    risk: 'medium',
    created_at: new Date(Date.now() - 1800000).toISOString()
  }
]

export const DEMO_LOGS = [
  { ts: new Date(Date.now() - 28800000).toISOString(), level: 'INFO', message: 'Optimisation quotidienne démarrée (cron 09:00)', tool: null },
  { ts: new Date(Date.now() - 28790000).toISOString(), level: 'INFO', message: 'Récupération métriques campagnes [LAST_30_DAYS]', tool: 'get_campaign_metrics' },
  { ts: new Date(Date.now() - 28770000).toISOString(), level: 'INFO', message: 'Analyse performances produits [sort: roas, limit: 50]', tool: 'get_product_performance' },
  { ts: new Date(Date.now() - 28750000).toISOString(), level: 'INFO', message: 'Audit Merchant Center — 134 produits analysés', tool: 'audit_merchant_center' },
  { ts: new Date(Date.now() - 28730000).toISOString(), level: 'WARN', message: '14 produits refusés détectés dont 3 erreurs critiques', tool: null },
  { ts: new Date(Date.now() - 28710000).toISOString(), level: 'INFO', message: 'Sous-enchère détectée : Bureau assis-debout (ROAS ×37)', tool: null },
  { ts: new Date(Date.now() - 28700000).toISOString(), level: 'INFO', message: 'Action générée : adjust_bid → prod_001 (0.65€ → 0.79€)', tool: 'adjust_bid' },
  { ts: new Date(Date.now() - 28690000).toISOString(), level: 'INFO', message: 'Action générée : pause_products → [prod_007, prod_008]', tool: 'pause_products' },
  { ts: new Date(Date.now() - 28680000).toISOString(), level: 'INFO', message: 'Catégorie non couverte identifiée : Éclairage & Lampes', tool: null },
  { ts: new Date(Date.now() - 28670000).toISOString(), level: 'INFO', message: 'Action générée : create_campaign → Shopping — Éclairage', tool: 'create_campaign' },
  { ts: new Date(Date.now() - 28660000).toISOString(), level: 'INFO', message: '[GUARDRAILS] 3 actions en attente approbation humaine', tool: null },
  { ts: new Date(Date.now() - 28650000).toISOString(), level: 'INFO', message: 'Rapport quotidien généré — ROAS global ×14.42', tool: 'generate_report' },
]
