-- ====================================================================
-- LogiPulse D1 Database - All-in-One Schema & Seed Migration
-- Target Database ID: fba2b323-787c-48c5-ab49-148704690258
-- ====================================================================

-- 1. Create table feed_items
CREATE TABLE IF NOT EXISTS feed_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    source TEXT,
    source_url TEXT,
    image_url TEXT,
    category TEXT,
    published_at TEXT,
    content_type TEXT DEFAULT 'news',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create performance & search indexes
CREATE INDEX IF NOT EXISTS idx_feed_items_published_at ON feed_items(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_items_category ON feed_items(category);
CREATE UNIQUE INDEX IF NOT EXISTS idx_feed_items_source_url ON feed_items(source_url);

-- 3. Seed initial logistics intelligence data
INSERT OR IGNORE INTO feed_items (title, description, source, source_url, image_url, category, published_at, content_type)
VALUES
(
    'Autonomous Mobile Robots (AMRs) Accelerate Fulfillment Speed in Tier-1 Mega Warehouses',
    'Next-generation AMRs equipped with 3D LiDAR and computer vision are reducing order cycle times by 38% across major fulfillment networks, driving rapid adoption ahead of peak retail seasons.',
    'Robotics Business Review',
    'https://example.com/robotics/amr-tier1-warehouses-2025',
    'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
    'AI & Robotics',
    '2026-11-14T17:45:00Z',
    'ai_insight'
),
(
    'Red Sea Routing Shifts Drive Asia-Europe Ocean Freight Spot Rates Upward',
    'Sustained diversions around the Cape of Good Hope continue to absorb container vessel capacity, pushing spot rates higher while carriers introduce blank sailings to stabilize schedules.',
    'The Loadstar',
    'https://example.com/shipping/red-sea-freight-rates-q4',
    'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    'Shipping',
    '2026-11-14T16:15:00Z',
    'news'
),
(
    'India Dedicated Freight Corridor (DFC) Nears 100% Operational Status, Slashing Transit Times',
    'The Western and Eastern Dedicated Freight Corridors have reduced freight transit times between Gujarat ports and northern industrial clusters from 60 hours down to just 18 hours.',
    'Economic Times Logistics',
    'https://example.com/india/dedicated-freight-corridor-transit-times',
    'https://images.unsplash.com/photo-1474487548417-781cb71495f3?auto=format&fit=crop&w=1200&q=80',
    'India',
    '2026-11-14T15:30:00Z',
    'news'
),
(
    'Generative AI Models Predict Port Congestion 72 Hours in Advance with 91% Accuracy',
    'Leading maritime analytics providers are deploying predictive transformer models that fuse AIS vessel tracking data, weather forecasts, and dockside crane telemetry to preempt bottleneck delays.',
    'Supply Chain Brain',
    'https://example.com/tech/genai-port-congestion-prediction',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'AI & Robotics',
    '2026-11-14T14:10:00Z',
    'ai_insight'
),
(
    'Micro-Fulfillment Centers Surge in Dense Urban Hubs to Support 15-Minute Deliveries',
    'Urban real estate conversions into automated high-density micro-fulfillment facilities are surging by 45% year-over-year as quick-commerce platforms scale dark store automation.',
    'Modern Materials Handling',
    'https://example.com/warehousing/micro-fulfillment-urban-centers',
    'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80',
    'Warehousing',
    '2026-11-14T13:00:00Z',
    'trend'
),
(
    'Heavy-Duty Electric Class-8 Trucks Surpass 1 Million Commercial Fleet Miles',
    'Regional haul operations in logistics corridors demonstrate 22% lower total cost of ownership per mile compared to clean diesel, spurred by megawatt charging infrastructure.',
    'Fleet Owner',
    'https://example.com/transportation/electric-class-8-milestone',
    'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    'Transportation',
    '2026-11-14T11:20:00Z',
    'news'
),
(
    'Nearshoring Shift: Mexico Surpasses Key Trade Benchmarks in North American Supply Chains',
    'Automotive and electronics manufacturing relocations have driven cross-border intermodal rail volume to record highs, testing border processing infrastructure at Laredo.',
    'Supply Chain Dive',
    'https://example.com/supply-chain/nearshoring-mexico-us-trade-surge',
    'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80',
    'Supply Chain',
    '2026-11-14T09:45:00Z',
    'trend'
),
(
    'National Logistics Policy (NLP) Accelerates Multi-Modal Parks Across Western India',
    'Multi-modal logistics parks (MMLPs) in Nagpur and Bengaluru receive fast-track clearances, aiming to reduce India logistics cost from 13% of GDP down to single digits.',
    'Logistics Update Africa & Asia',
    'https://example.com/india/national-logistics-policy-western-corridor',
    'https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80',
    'India',
    '2026-11-14T08:15:00Z',
    'news'
),
(
    'Automated Cold Chain Storage Employs IoT Digital Twins to Eliminate Perishable Spoilage',
    'Real-time temperature telemetry combined with automated vertical carousel storage systems is reducing food waste in cold storage distribution nodes by over 99.4%.',
    'Cold Chain World',
    'https://example.com/warehousing/automated-cold-chain-digital-twins',
    'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=1200&q=80',
    'Warehousing',
    '2026-11-14T06:30:00Z',
    'trend'
),
(
    'Autonomous Maritime Vessels Begin Commercial Coastal Feeder Trials in Nordic Waters',
    'Zero-emission battery-powered container feeder ships have begun scheduled autonomous routes, featuring remote supervisory control from shore-based monitoring centers.',
    'Maritime Executive',
    'https://example.com/shipping/autonomous-container-feeder-nordic',
    'https://images.unsplash.com/photo-1505705694340-019e1e335916?auto=format&fit=crop&w=1200&q=80',
    'AI & Robotics',
    '2026-11-13T20:00:00Z',
    'ai_insight'
),
(
    'Digital Freight Matching Platforms Consolidate LTL Shipments with Dynamic Load Balancing',
    'Machine learning algorithms optimizing less-than-truckload (LTL) linehauls report a 14% reduction in empty backhaul miles for mid-sized carrier fleets.',
    'FreightWaves',
    'https://example.com/logistics/digital-freight-matching-ltl-optimization',
    'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80',
    'Logistics',
    '2026-11-13T16:20:00Z',
    'ai_insight'
),
(
    'Supply Chain Resiliency Audits Reveal Shifts Toward Multi-Sourcing Critical Components',
    'Global tier-1 manufacturers are maintaining dual-sourcing strategies across Southeast Asia and the Americas, favoring localized suppliers despite slightly higher raw procurement costs.',
    'Logistics Management',
    'https://example.com/supply-chain/resiliency-audits-multisourcing',
    'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1200&q=80',
    'Supply Chain',
    '2026-11-13T12:00:00Z',
    'trend'
);
