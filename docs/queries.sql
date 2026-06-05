-- =============================================================================
-- ConciergeFlow — Requêtes SQL métier
-- =============================================================================
-- Le projet utilise Prisma comme ORM, mais les agrégations complexes du
-- dashboard sont l'équivalent des requêtes ci-dessous. Ce fichier documente
-- le SQL réel exécuté sur PostgreSQL (Supabase) pour les cas non triviaux.
-- =============================================================================


-- ---------------------------------------------------------------------------
-- 1. Marge nette par logement (classement rentabilité)
-- ---------------------------------------------------------------------------
-- Calcule revenus, dépenses, marge nette et nombre de nuits pour chaque
-- logement d'un utilisateur, trié par marge décroissante.

SELECT
    p.id,
    p.name,
    p.city,
    COALESCE(SUM(b.total_amount), 0)                       AS revenue,
    COALESCE(SUM(e.amount), 0)                              AS expenses,
    COALESCE(SUM(b.total_amount), 0) - COALESCE(SUM(e.amount), 0)  AS profit,
    CASE
        WHEN COALESCE(SUM(b.total_amount), 0) > 0
        THEN ROUND(
            ((SUM(b.total_amount) - COALESCE(SUM(e.amount), 0)) / SUM(b.total_amount)) * 100,
            1
        )
        ELSE 0
    END                                                     AS margin_pct,
    COALESCE(SUM(b.nights), 0)                              AS total_nights,
    COUNT(DISTINCT b.id)                                    AS booking_count
FROM properties p
LEFT JOIN bookings b ON b.property_id = p.id
LEFT JOIN expenses e ON e.property_id = p.id
WHERE p.user_id = :user_id
GROUP BY p.id, p.name, p.city
ORDER BY margin_pct DESC;


-- ---------------------------------------------------------------------------
-- 2. Taux d'occupation mensuel par logement (6 derniers mois)
-- ---------------------------------------------------------------------------
-- Génère une série de mois, puis calcule pour chaque logement le ratio
-- nuits réservées / jours du mois, plafonné à 100%.

WITH months AS (
    SELECT generate_series(
        date_trunc('month', NOW()) - INTERVAL '5 months',
        date_trunc('month', NOW()),
        '1 month'
    )::date AS month_start
),
property_nights AS (
    SELECT
        b.property_id,
        date_trunc('month', b.check_in)::date AS month_start,
        SUM(b.nights)                          AS nights
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.user_id = :user_id
    GROUP BY b.property_id, date_trunc('month', b.check_in)
)
SELECT
    p.name,
    TO_CHAR(m.month_start, 'YYYY-MM')                      AS month,
    COALESCE(pn.nights, 0)                                  AS nights,
    EXTRACT(DAY FROM (m.month_start + INTERVAL '1 month' - INTERVAL '1 day'))  AS days_in_month,
    LEAST(100, ROUND(
        COALESCE(pn.nights, 0)::numeric
        / EXTRACT(DAY FROM (m.month_start + INTERVAL '1 month' - INTERVAL '1 day'))
        * 100, 1
    ))                                                      AS occupancy_pct
FROM properties p
CROSS JOIN months m
LEFT JOIN property_nights pn
    ON pn.property_id = p.id AND pn.month_start = m.month_start
WHERE p.user_id = :user_id
ORDER BY p.name, m.month_start;


-- ---------------------------------------------------------------------------
-- 3. Revenu moyen par nuitée (ADR) — tendance mensuelle
-- ---------------------------------------------------------------------------
-- Average Daily Rate par logement et par mois. Exclut les logements sans
-- réservation sur la période (évite les lignes à 0 qui écrasent le graphe).

SELECT
    p.name,
    TO_CHAR(date_trunc('month', b.check_in), 'YYYY-MM')    AS month,
    ROUND(SUM(b.total_amount)::numeric / NULLIF(SUM(b.nights), 0), 1) AS adr
FROM bookings b
JOIN properties p ON p.id = b.property_id
WHERE p.user_id = :user_id
  AND b.check_in >= NOW() - INTERVAL '6 months'
GROUP BY p.name, date_trunc('month', b.check_in)
HAVING SUM(b.nights) > 0
ORDER BY p.name, month;


-- ---------------------------------------------------------------------------
-- 4. Comparaison mois courant vs mois précédent (KPIs dashboard)
-- ---------------------------------------------------------------------------
-- Calcule les KPIs pour le mois en cours et le mois précédent en une seule
-- requête, puis retourne la variation en pourcentage.

WITH monthly_kpis AS (
    SELECT
        TO_CHAR(date_trunc('month', b.check_in), 'YYYY-MM') AS month,
        SUM(b.total_amount)                                   AS revenue,
        SUM(b.nights)                                         AS nights,
        COUNT(DISTINCT b.property_id)                         AS active_properties
    FROM bookings b
    JOIN properties p ON p.id = b.property_id
    WHERE p.user_id = :user_id
      AND b.check_in >= date_trunc('month', NOW()) - INTERVAL '1 month'
    GROUP BY date_trunc('month', b.check_in)
),
with_expenses AS (
    SELECT
        mk.month,
        mk.revenue,
        mk.nights,
        COALESCE(
            (SELECT SUM(e.amount) FROM expenses e
             WHERE e.user_id = :user_id
               AND TO_CHAR(e.date, 'YYYY-MM') = mk.month),
            0
        ) AS expenses,
        mk.active_properties
    FROM monthly_kpis mk
)
SELECT
    curr.month                                              AS current_month,
    curr.revenue                                            AS current_revenue,
    curr.expenses                                           AS current_expenses,
    curr.revenue - curr.expenses                            AS current_profit,
    CASE WHEN curr.revenue > 0
        THEN ROUND(((curr.revenue - curr.expenses) / curr.revenue) * 100, 1)
        ELSE 0
    END                                                     AS current_margin_pct,

    prev.revenue                                            AS previous_revenue,
    CASE WHEN prev.revenue > 0
        THEN ROUND(((curr.revenue - prev.revenue) / prev.revenue) * 100, 1)
        ELSE NULL
    END                                                     AS revenue_variation_pct,
    CASE WHEN prev.revenue - prev.expenses != 0
        THEN ROUND((
            (curr.revenue - curr.expenses) - (prev.revenue - prev.expenses)
        )::numeric / ABS(prev.revenue - prev.expenses) * 100, 1)
        ELSE NULL
    END                                                     AS profit_variation_pct
FROM with_expenses curr
LEFT JOIN with_expenses prev
    ON prev.month = TO_CHAR(date_trunc('month', NOW()) - INTERVAL '1 month', 'YYYY-MM')
WHERE curr.month = TO_CHAR(NOW(), 'YYYY-MM');


-- ---------------------------------------------------------------------------
-- 5. Répartition du chiffre d'affaires par plateforme
-- ---------------------------------------------------------------------------

SELECT
    b.platform,
    COUNT(*)                        AS booking_count,
    SUM(b.total_amount)             AS total_revenue,
    ROUND(
        SUM(b.total_amount)::numeric
        / NULLIF((SELECT SUM(total_amount) FROM bookings b2
                  JOIN properties p2 ON p2.id = b2.property_id
                  WHERE p2.user_id = :user_id), 0) * 100,
        1
    )                               AS revenue_share_pct
FROM bookings b
JOIN properties p ON p.id = b.property_id
WHERE p.user_id = :user_id
GROUP BY b.platform
ORDER BY total_revenue DESC;


-- ---------------------------------------------------------------------------
-- 6. Alertes : logements à marge négative ou occupation basse
-- ---------------------------------------------------------------------------
-- Identifie les logements problématiques en une seule requête (utilisée
-- pour les alertes intelligentes du dashboard).

WITH property_stats AS (
    SELECT
        p.id,
        p.name,
        COALESCE(SUM(b.total_amount), 0)                   AS revenue,
        COALESCE((
            SELECT SUM(e.amount) FROM expenses e WHERE e.property_id = p.id
        ), 0)                                               AS expenses,
        COALESCE(SUM(
            CASE WHEN date_trunc('month', b.check_in) = date_trunc('month', NOW())
                 THEN b.nights ELSE 0 END
        ), 0)                                               AS nights_this_month,
        EXTRACT(DAY FROM
            date_trunc('month', NOW()) + INTERVAL '1 month' - INTERVAL '1 day'
        )                                                   AS days_this_month
    FROM properties p
    LEFT JOIN bookings b ON b.property_id = p.id
    WHERE p.user_id = :user_id
    GROUP BY p.id, p.name
)
SELECT
    name,
    revenue,
    expenses,
    revenue - expenses                                      AS profit,
    CASE WHEN revenue > 0
        THEN ROUND(((revenue - expenses) / revenue) * 100, 1)
        ELSE 0
    END                                                     AS margin_pct,
    LEAST(100, ROUND(
        nights_this_month::numeric / NULLIF(days_this_month, 0) * 100, 1
    ))                                                      AS occupancy_pct,
    CASE
        WHEN revenue - expenses < 0             THEN 'NEGATIVE_MARGIN'
        WHEN revenue > 0 AND (revenue - expenses) / revenue < 0.15
                                                THEN 'LOW_MARGIN'
        WHEN nights_this_month::numeric / NULLIF(days_this_month, 0) < 0.4
                                                THEN 'LOW_OCCUPANCY'
        ELSE 'OK'
    END                                                     AS alert_type
FROM property_stats
WHERE revenue - expenses < 0
   OR (revenue > 0 AND (revenue - expenses) / revenue < 0.15)
   OR nights_this_month::numeric / NULLIF(days_this_month, 0) < 0.4
ORDER BY
    CASE
        WHEN revenue - expenses < 0 THEN 0
        WHEN revenue > 0 AND (revenue - expenses) / revenue < 0.15 THEN 1
        ELSE 2
    END;


-- ---------------------------------------------------------------------------
-- 7. Dépenses récurrentes à générer (cron quotidien)
-- ---------------------------------------------------------------------------
-- Trouve les dépenses récurrentes dont la prochaine occurrence n'existe pas
-- encore, en fonction de la fréquence (WEEKLY, MONTHLY, QUARTERLY, YEARLY).

WITH recurring AS (
    SELECT
        e.id,
        e.user_id,
        e.property_id,
        e.category,
        e.label,
        e.amount,
        e.frequency,
        MAX(e2.date) AS last_generated
    FROM expenses e
    LEFT JOIN expenses e2
        ON e2.user_id = e.user_id
        AND e2.label = e.label
        AND e2.category = e.category
        AND e2.amount = e.amount
        AND e2.property_id IS NOT DISTINCT FROM e.property_id
    WHERE e.is_recurring = true
    GROUP BY e.id, e.user_id, e.property_id, e.category, e.label, e.amount, e.frequency
)
SELECT *
FROM recurring
WHERE
    (frequency = 'WEEKLY'    AND last_generated + INTERVAL '7 days'   <= NOW())
 OR (frequency = 'MONTHLY'   AND last_generated + INTERVAL '1 month'  <= NOW())
 OR (frequency = 'QUARTERLY' AND last_generated + INTERVAL '3 months' <= NOW())
 OR (frequency = 'YEARLY'    AND last_generated + INTERVAL '1 year'   <= NOW());
