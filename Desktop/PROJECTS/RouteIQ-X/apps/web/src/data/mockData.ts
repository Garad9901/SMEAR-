// ──────────────────────────────────────────────────────────
//  RouteIQ X — Mock Data Store (simulates live backend APIs)
// ──────────────────────────────────────────────────────────

export interface RoadSegment {
  id: string
  name: string
  city: string
  lat: number
  lng: number
  rhi: number          // Road Health Index 0–100
  risk: 'critical' | 'high' | 'medium' | 'low'
  lastInspected: string
  predictedFailure: string
  trafficLoad: 'very-high' | 'high' | 'medium' | 'low'
  complaints: number
  repairCost: number
  length: number       // km
  age: number          // years
  surface: string
  priority: number
}

export interface AIAgent {
  id: string
  name: string
  type: string
  status: 'active' | 'processing' | 'idle' | 'error'
  lastAction: string
  tasksCompleted: number
  accuracy: number
  uptime: number
  currentTask: string
  memoryUsage: number
  inferenceCount: number
}

export interface MaintenanceTask {
  id: string
  roadId: string
  road: string
  city: string
  type: 'crack-sealing' | 'pothole-repair' | 'resurfacing' | 'patching' | 'full-reconstruction'
  priority: 'critical' | 'high' | 'medium' | 'low'
  estimatedCost: number
  estimatedDays: number
  scheduledDate: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'pending-approval'
  assignedTeam: string
  rhi: number
  savings: number
}

export interface BudgetAllocation {
  city: string
  totalBudget: number
  allocated: number
  spent: number
  savings: number
  roadsScheduled: number
  roadsCompleted: number
  efficiency: number
}

export interface MLModel {
  id: string
  name: string
  type: string
  version: string
  status: 'production' | 'staging' | 'shadow' | 'retired'
  accuracy: number
  f1Score: number
  driftScore: number
  lastRetrained: string
  inferences: number
  latency: number
  framework: string
}

// ── Road Segments ──────────────────────────────────────────
export const mockRoadSegments: RoadSegment[] = [
  {
    id: 'RS-001', name: 'NH-48 Sector 7 Corridor', city: 'Mumbai',
    lat: 19.076, lng: 72.877, rhi: 23, risk: 'critical',
    lastInspected: '2026-05-01', predictedFailure: '2026-06-15',
    trafficLoad: 'very-high', complaints: 247, repairCost: 1_850_000,
    length: 3.2, age: 18, surface: 'Bituminous', priority: 1
  },
  {
    id: 'RS-002', name: 'Ring Road South Extension', city: 'Delhi',
    lat: 28.613, lng: 77.209, rhi: 31, risk: 'critical',
    lastInspected: '2026-04-28', predictedFailure: '2026-06-22',
    trafficLoad: 'very-high', complaints: 189, repairCost: 2_200_000,
    length: 5.1, age: 22, surface: 'Concrete', priority: 2
  },
  {
    id: 'RS-003', name: 'Outer Ring Road Segment 3C', city: 'Bengaluru',
    lat: 12.971, lng: 77.594, rhi: 38, risk: 'high',
    lastInspected: '2026-05-05', predictedFailure: '2026-07-10',
    trafficLoad: 'high', complaints: 156, repairCost: 980_000,
    length: 2.8, age: 12, surface: 'Bituminous', priority: 3
  },
  {
    id: 'RS-004', name: 'Bay Bridge Access Road', city: 'San Francisco',
    lat: 37.774, lng: -122.419, rhi: 41, risk: 'high',
    lastInspected: '2026-05-10', predictedFailure: '2026-07-20',
    trafficLoad: 'high', complaints: 134, repairCost: 3_400_000,
    length: 1.9, age: 35, surface: 'Asphalt', priority: 4
  },
  {
    id: 'RS-005', name: 'Highway M-25 Junction 9', city: 'London',
    lat: 51.509, lng: -0.118, rhi: 55, risk: 'medium',
    lastInspected: '2026-05-12', predictedFailure: '2026-08-15',
    trafficLoad: 'high', complaints: 98, repairCost: 4_100_000,
    length: 4.3, age: 28, surface: 'Concrete', priority: 5
  },
  {
    id: 'RS-006', name: 'Sheikh Zayed Road S7', city: 'Dubai',
    lat: 25.204, lng: 55.270, rhi: 62, risk: 'medium',
    lastInspected: '2026-05-15', predictedFailure: '2026-09-01',
    trafficLoad: 'medium', complaints: 67, repairCost: 2_750_000,
    length: 6.2, age: 8, surface: 'Asphalt', priority: 6
  },
  {
    id: 'RS-007', name: 'Pacific Highway North', city: 'Sydney',
    lat: -33.868, lng: 151.209, rhi: 71, risk: 'medium',
    lastInspected: '2026-05-18', predictedFailure: '2026-09-20',
    trafficLoad: 'medium', complaints: 45, repairCost: 1_560_000,
    length: 3.7, age: 15, surface: 'Bituminous', priority: 7
  },
  {
    id: 'RS-008', name: 'A10 Autobahn Junction 22', city: 'Berlin',
    lat: 52.520, lng: 13.405, rhi: 78, risk: 'low',
    lastInspected: '2026-05-20', predictedFailure: '2026-10-30',
    trafficLoad: 'medium', complaints: 28, repairCost: 890_000,
    length: 2.1, age: 10, surface: 'Concrete', priority: 8
  },
  {
    id: 'RS-009', name: 'Chhatrapati Shivaji Marg', city: 'Pune',
    lat: 18.520, lng: 73.856, rhi: 29, risk: 'critical',
    lastInspected: '2026-04-25', predictedFailure: '2026-06-08',
    trafficLoad: 'high', complaints: 312, repairCost: 760_000,
    length: 2.4, age: 25, surface: 'Bituminous', priority: 1
  },
  {
    id: 'RS-010', name: 'Eastern Express Highway 4A', city: 'Mumbai',
    lat: 19.082, lng: 72.865, rhi: 45, risk: 'high',
    lastInspected: '2026-05-08', predictedFailure: '2026-07-30',
    trafficLoad: 'very-high', complaints: 201, repairCost: 3_100_000,
    length: 7.8, age: 20, surface: 'Bituminous', priority: 3
  },
]

// ── AI Agents ──────────────────────────────────────────────
export const mockAgents: AIAgent[] = [
  {
    id: 'agent-gis', name: 'GIS Intelligence Agent', type: 'geospatial',
    status: 'active', lastAction: 'Processed 15,230 road segments — OSM delta sync',
    tasksCompleted: 48_291, accuracy: 97.3, uptime: 99.91, currentTask: 'Sentinel-2 tile analysis — Mumbai Zone 4',
    memoryUsage: 68, inferenceCount: 2_847_293
  },
  {
    id: 'agent-climate', name: 'Climate Risk Agent', type: 'environmental',
    status: 'active', lastAction: 'Monsoon risk model updated — 847 segments flagged',
    tasksCompleted: 31_450, accuracy: 94.8, uptime: 99.87, currentTask: 'Rainfall trajectory correlation — Q3 2026',
    memoryUsage: 52, inferenceCount: 1_293_847
  },
  {
    id: 'agent-maintenance', name: 'Maintenance Planning Agent', type: 'planning',
    status: 'processing', lastAction: 'Generated 128-task repair schedule — ₹48.2M budget',
    tasksCompleted: 22_891, accuracy: 96.1, uptime: 99.78, currentTask: 'Optimizing repair sequence — Cluster 7B Delhi',
    memoryUsage: 75, inferenceCount: 987_234
  },
  {
    id: 'agent-budget', name: 'Budget Optimization Agent', type: 'financial',
    status: 'active', lastAction: 'LP optimization — 23.4% cost reduction achieved',
    tasksCompleted: 18_234, accuracy: 98.7, uptime: 99.95, currentTask: 'Knapsack allocation — FY2026-27 municipal budget',
    memoryUsage: 41, inferenceCount: 654_891
  },
  {
    id: 'agent-risk', name: 'Risk Assessment Agent', type: 'assessment',
    status: 'active', lastAction: 'Critical risk alert issued — RS-001 NH-48',
    tasksCompleted: 35_678, accuracy: 95.4, uptime: 99.82, currentTask: 'Multi-factor RHI scoring — 1,247 segments',
    memoryUsage: 58, inferenceCount: 3_102_445
  },
  {
    id: 'agent-forecast', name: 'Forecasting Agent', type: 'prediction',
    status: 'active', lastAction: 'TFT model — 60-day degradation forecast complete',
    tasksCompleted: 27_123, accuracy: 93.6, uptime: 99.73, currentTask: 'Prophet ensemble — seasonal pattern analysis',
    memoryUsage: 83, inferenceCount: 1_891_234
  },
  {
    id: 'agent-verify', name: 'Verification Agent', type: 'verification',
    status: 'idle', lastAction: 'Completed repair verification — RS-088 Pune Ring Road',
    tasksCompleted: 14_567, accuracy: 99.1, uptime: 99.99, currentTask: 'Awaiting new completion reports',
    memoryUsage: 23, inferenceCount: 421_893
  },
  {
    id: 'agent-audit', name: 'Audit Agent', type: 'governance',
    status: 'active', lastAction: 'Audit log sealed — 2,847 AI decisions recorded',
    tasksCompleted: 8_921, accuracy: 99.9, uptime: 100.0, currentTask: 'Compiling monthly governance report',
    memoryUsage: 31, inferenceCount: 198_234
  },
]

// ── Maintenance Tasks ──────────────────────────────────────
export const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: 'MT-001', roadId: 'RS-001', road: 'NH-48 Sector 7', city: 'Mumbai',
    type: 'full-reconstruction', priority: 'critical', estimatedCost: 1_850_000,
    estimatedDays: 45, scheduledDate: '2026-06-01', status: 'scheduled',
    assignedTeam: 'Alpha-7 Heavy Works', rhi: 23, savings: 420_000
  },
  {
    id: 'MT-002', roadId: 'RS-009', road: 'Chhatrapati Shivaji Marg', city: 'Pune',
    type: 'resurfacing', priority: 'critical', estimatedCost: 760_000,
    estimatedDays: 21, scheduledDate: '2026-05-28', status: 'in-progress',
    assignedTeam: 'Beta-3 Resurfacing', rhi: 29, savings: 190_000
  },
  {
    id: 'MT-003', roadId: 'RS-002', road: 'Ring Road South Extension', city: 'Delhi',
    type: 'full-reconstruction', priority: 'critical', estimatedCost: 2_200_000,
    estimatedDays: 60, scheduledDate: '2026-06-10', status: 'pending-approval',
    assignedTeam: 'Gamma-1 Metro Works', rhi: 31, savings: 560_000
  },
  {
    id: 'MT-004', roadId: 'RS-003', road: 'Outer Ring Road 3C', city: 'Bengaluru',
    type: 'pothole-repair', priority: 'high', estimatedCost: 980_000,
    estimatedDays: 18, scheduledDate: '2026-06-15', status: 'scheduled',
    assignedTeam: 'Delta-4 Rapid Response', rhi: 38, savings: 230_000
  },
  {
    id: 'MT-005', roadId: 'RS-010', road: 'Eastern Express Highway 4A', city: 'Mumbai',
    type: 'crack-sealing', priority: 'high', estimatedCost: 3_100_000,
    estimatedDays: 30, scheduledDate: '2026-07-01', status: 'scheduled',
    assignedTeam: 'Alpha-2 Highway Team', rhi: 45, savings: 780_000
  },
  {
    id: 'MT-006', roadId: 'RS-004', road: 'Bay Bridge Access', city: 'San Francisco',
    type: 'patching', priority: 'high', estimatedCost: 3_400_000,
    estimatedDays: 25, scheduledDate: '2026-07-15', status: 'pending-approval',
    assignedTeam: 'City Roads Division 3', rhi: 41, savings: 890_000
  },
]

// ── Budget Allocations ─────────────────────────────────────
export const mockBudgetAllocations: BudgetAllocation[] = [
  { city: 'Mumbai', totalBudget: 150_000_000, allocated: 127_500_000, spent: 84_200_000, savings: 23_400_000, roadsScheduled: 47, roadsCompleted: 29, efficiency: 91 },
  { city: 'Delhi', totalBudget: 200_000_000, allocated: 178_000_000, spent: 121_000_000, savings: 31_200_000, roadsScheduled: 63, roadsCompleted: 38, efficiency: 88 },
  { city: 'Bengaluru', totalBudget: 95_000_000, allocated: 82_000_000, spent: 51_000_000, savings: 15_800_000, roadsScheduled: 34, roadsCompleted: 22, efficiency: 93 },
  { city: 'Pune', totalBudget: 60_000_000, allocated: 54_000_000, spent: 33_000_000, savings: 9_200_000, roadsScheduled: 21, roadsCompleted: 14, efficiency: 95 },
]

// ── ML Models ─────────────────────────────────────────────
export const mockMLModels: MLModel[] = [
  {
    id: 'model-001', name: 'SatelliteVision-v4', type: 'Computer Vision',
    version: '4.2.1', status: 'production', accuracy: 94.7, f1Score: 0.941,
    driftScore: 0.02, lastRetrained: '2026-05-01', inferences: 2_847_293,
    latency: 48, framework: 'YOLOv8 + EfficientNet-B7'
  },
  {
    id: 'model-002', name: 'RHI-Predictor-XGB', type: 'Tabular ML',
    version: '3.8.0', status: 'production', accuracy: 97.2, f1Score: 0.968,
    driftScore: 0.01, lastRetrained: '2026-05-10', inferences: 8_291_847,
    latency: 12, framework: 'XGBoost + LightGBM Ensemble'
  },
  {
    id: 'model-003', name: 'DegradationTFT-v2', type: 'Time Series',
    version: '2.4.0', status: 'production', accuracy: 93.6, f1Score: 0.929,
    driftScore: 0.04, lastRetrained: '2026-04-25', inferences: 1_891_234,
    latency: 187, framework: 'Temporal Fusion Transformer'
  },
  {
    id: 'model-004', name: 'CrackDetect-ResNet', type: 'Computer Vision',
    version: '2.1.0', status: 'staging', accuracy: 96.1, f1Score: 0.958,
    driftScore: 0.00, lastRetrained: '2026-05-20', inferences: 124_891,
    latency: 62, framework: 'ResNet50 Fine-tuned'
  },
  {
    id: 'model-005', name: 'BudgetRL-v1', type: 'Reinforcement Learning',
    version: '1.3.0', status: 'shadow', accuracy: 88.4, f1Score: 0.871,
    driftScore: 0.07, lastRetrained: '2026-05-15', inferences: 89_234,
    latency: 23, framework: 'PPO + Gymnasium'
  },
  {
    id: 'model-006', name: 'LSTM-Forecaster-v3', type: 'Deep Learning',
    version: '3.1.0', status: 'production', accuracy: 91.8, f1Score: 0.914,
    driftScore: 0.03, lastRetrained: '2026-05-05', inferences: 3_102_445,
    latency: 94, framework: 'BiLSTM + Attention'
  },
]

// ── Time Series Data ────────────────────────────────────────
export const generateDegradationForecast = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep']
  return months.map((month, i) => ({
    month,
    rhi: Math.max(15, 75 - i * 7 + Math.random() * 5 - 2),
    predicted: Math.max(10, 75 - i * 8 + 3),
    confidence_upper: Math.max(20, 78 - i * 6),
    confidence_lower: Math.max(5, 72 - i * 10),
  }))
}

export const generateAlertStream = () => [
  { id: 1, time: '22:08:41', type: 'critical', msg: 'RS-001 NH-48 — RHI dropped below 25. Immediate action required.' },
  { id: 2, time: '22:07:12', type: 'warning', msg: 'Climate Agent — Heavy rainfall predicted: 47 segments at elevated risk.' },
  { id: 3, time: '22:05:33', type: 'info', msg: 'Satellite pass complete — 1,247 segments re-scored via Sentinel-2 analysis.' },
  { id: 4, time: '22:03:55', type: 'success', msg: 'MT-002 Pune — Resurfacing 67% complete. On schedule and within budget.' },
  { id: 5, time: '22:01:18', type: 'warning', msg: 'Budget Agent — Delhi allocation 89% utilised. Rebalancing recommended.' },
  { id: 6, time: '21:58:44', type: 'info', msg: 'Forecasting Agent — 60-day predictions updated for 847 road segments.' },
  { id: 7, time: '21:56:22', type: 'critical', msg: 'RS-009 Pune — 312 citizen complaints clustered. Escalation triggered.' },
  { id: 8, time: '21:54:01', type: 'success', msg: 'Model drift check passed — SatelliteVision-v4 within tolerance (0.02).' },
]

export const generateTrafficData = () => {
  const hours = Array.from({ length: 24 }, (_, i) => `${String(i).padStart(2, '0')}:00`)
  return hours.map(hour => ({
    hour,
    volume: Math.floor(2000 + Math.sin((parseInt(hour) - 8) * 0.5) * 3000 + Math.random() * 500),
    incidents: Math.floor(Math.random() * 8),
  }))
}

export const generateBudgetTrend = () => {
  const months = ['Q1 FY25', 'Q2 FY25', 'Q3 FY25', 'Q4 FY25', 'Q1 FY26', 'Q2 FY26']
  return months.map((q, i) => ({
    quarter: q,
    budgeted: 12_000_000 + i * 500_000,
    spent: 10_800_000 + i * 420_000 + Math.random() * 200_000,
    savings: 1_200_000 + i * 80_000,
    roiMultiplier: 3.2 + i * 0.15,
  }))
}

export const globalKPIs = {
  totalRoadsMonitored: 1_847_293,
  criticalSegments: 234,
  scheduledRepairs: 847,
  totalBudget: 505_000_000,
  budgetUtilized: 64,
  predictedSavings: 79_600_000,
  agentsOnline: 7,
  avgRHI: 63.4,
  dataPointsProcessed: 2_847_293_847,
  modelInferences: 15_201_847,
  citiesDeployed: 23,
  countriesDeployed: 8,
}
