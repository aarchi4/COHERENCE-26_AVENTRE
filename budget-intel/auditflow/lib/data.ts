import { State, District, Project, MoneyTrail } from './types'

export const initialStates: State[] = [
  {
    id: 'mh',
    name: 'Maharashtra',
    allocatedFunds: 50000,
    usedFunds: 32000,
    districts: [
      {
        id: 'mh-mum',
        name: 'Mumbai',
        stateId: 'mh',
        allocatedFunds: 20000,
        usedFunds: 14000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 15000, date: '2024-01-15', type: 'central-to-state' },
          { source: 'Maharashtra State', amount: 15000, date: '2024-01-20', type: 'state-to-district' },
          { source: 'Central Government', amount: 5000, date: '2024-06-10', type: 'central-to-state' },
          { source: 'Maharashtra State', amount: 5000, date: '2024-06-15', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p1', name: 'Metro Line Extension', districtId: 'mh-mum', allocatedFunds: 8000, usedFunds: 5500, status: 'in-progress', progress: 68, description: 'Extension of metro line to suburban areas' },
          { id: 'p2', name: 'Coastal Road', districtId: 'mh-mum', allocatedFunds: 7000, usedFunds: 4500, status: 'in-progress', progress: 55, description: 'Construction of coastal highway' },
          { id: 'p3', name: 'Smart City Initiative', districtId: 'mh-mum', allocatedFunds: 5000, usedFunds: 4000, status: 'in-progress', progress: 80, description: 'Digital infrastructure development' },
        ]
      },
      {
        id: 'mh-pun',
        name: 'Pune',
        stateId: 'mh',
        allocatedFunds: 15000,
        usedFunds: 9000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 10000, date: '2024-02-01', type: 'central-to-state' },
          { source: 'Maharashtra State', amount: 10000, date: '2024-02-05', type: 'state-to-district' },
          { source: 'Central Government', amount: 5000, date: '2024-07-01', type: 'central-to-state' },
          { source: 'Maharashtra State', amount: 5000, date: '2024-07-05', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p4', name: 'IT Park Development', districtId: 'mh-pun', allocatedFunds: 6000, usedFunds: 4000, status: 'in-progress', progress: 65, description: 'New IT hub construction' },
          { id: 'p5', name: 'Ring Road Project', districtId: 'mh-pun', allocatedFunds: 9000, usedFunds: 5000, status: 'in-progress', progress: 45, description: 'Outer ring road construction' },
        ]
      },
      {
        id: 'mh-nag',
        name: 'Nagpur',
        stateId: 'mh',
        allocatedFunds: 15000,
        usedFunds: 9000,
        flagged: true,
        moneyTrail: [
          { source: 'Central Government', amount: 12000, date: '2024-01-25', type: 'central-to-state' },
          { source: 'Maharashtra State', amount: 12000, date: '2024-01-30', type: 'state-to-district' },
          { source: 'Reallocation from Pune', amount: 3000, date: '2024-05-15', type: 'reallocation' },
        ],
        projects: [
          { id: 'p6', name: 'Airport Expansion', districtId: 'mh-nag', allocatedFunds: 10000, usedFunds: 7000, status: 'flagged', progress: 30, description: 'International airport terminal expansion' },
          { id: 'p7', name: 'Industrial Zone', districtId: 'mh-nag', allocatedFunds: 5000, usedFunds: 2000, status: 'planning', progress: 10, description: 'Special economic zone development' },
        ]
      }
    ]
  },
  {
    id: 'ka',
    name: 'Karnataka',
    allocatedFunds: 45000,
    usedFunds: 28000,
    districts: [
      {
        id: 'ka-blr',
        name: 'Bengaluru',
        stateId: 'ka',
        allocatedFunds: 25000,
        usedFunds: 18000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 20000, date: '2024-01-10', type: 'central-to-state' },
          { source: 'Karnataka State', amount: 20000, date: '2024-01-15', type: 'state-to-district' },
          { source: 'Central Government', amount: 5000, date: '2024-05-20', type: 'central-to-state' },
          { source: 'Karnataka State', amount: 5000, date: '2024-05-25', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p8', name: 'Namma Metro Phase 3', districtId: 'ka-blr', allocatedFunds: 12000, usedFunds: 9000, status: 'in-progress', progress: 75, description: 'Metro rail expansion' },
          { id: 'p9', name: 'Tech Corridor', districtId: 'ka-blr', allocatedFunds: 8000, usedFunds: 5500, status: 'in-progress', progress: 60, description: 'IT infrastructure corridor' },
          { id: 'p10', name: 'Lake Restoration', districtId: 'ka-blr', allocatedFunds: 5000, usedFunds: 3500, status: 'in-progress', progress: 70, description: 'Urban lake cleanup initiative' },
        ]
      },
      {
        id: 'ka-mys',
        name: 'Mysuru',
        stateId: 'ka',
        allocatedFunds: 20000,
        usedFunds: 10000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 15000, date: '2024-02-10', type: 'central-to-state' },
          { source: 'Karnataka State', amount: 15000, date: '2024-02-15', type: 'state-to-district' },
          { source: 'Central Government', amount: 5000, date: '2024-08-01', type: 'central-to-state' },
          { source: 'Karnataka State', amount: 5000, date: '2024-08-05', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p11', name: 'Heritage Tourism', districtId: 'ka-mys', allocatedFunds: 8000, usedFunds: 4000, status: 'in-progress', progress: 50, description: 'Heritage site restoration' },
          { id: 'p12', name: 'Green Energy Park', districtId: 'ka-mys', allocatedFunds: 12000, usedFunds: 6000, status: 'in-progress', progress: 40, description: 'Solar and wind energy project' },
        ]
      }
    ]
  },
  {
    id: 'tn',
    name: 'Tamil Nadu',
    allocatedFunds: 42000,
    usedFunds: 25000,
    districts: [
      {
        id: 'tn-chn',
        name: 'Chennai',
        stateId: 'tn',
        allocatedFunds: 22000,
        usedFunds: 15000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 18000, date: '2024-01-05', type: 'central-to-state' },
          { source: 'Tamil Nadu State', amount: 18000, date: '2024-01-10', type: 'state-to-district' },
          { source: 'Central Government', amount: 4000, date: '2024-06-20', type: 'central-to-state' },
          { source: 'Tamil Nadu State', amount: 4000, date: '2024-06-25', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p13', name: 'Port Modernization', districtId: 'tn-chn', allocatedFunds: 10000, usedFunds: 7000, status: 'in-progress', progress: 70, description: 'Chennai port infrastructure upgrade' },
          { id: 'p14', name: 'Flood Management', districtId: 'tn-chn', allocatedFunds: 7000, usedFunds: 5000, status: 'in-progress', progress: 65, description: 'Storm water drainage system' },
          { id: 'p15', name: 'Metro Rail Phase 2', districtId: 'tn-chn', allocatedFunds: 5000, usedFunds: 3000, status: 'in-progress', progress: 55, description: 'Metro expansion project' },
        ]
      },
      {
        id: 'tn-cbe',
        name: 'Coimbatore',
        stateId: 'tn',
        allocatedFunds: 20000,
        usedFunds: 10000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 15000, date: '2024-02-15', type: 'central-to-state' },
          { source: 'Tamil Nadu State', amount: 15000, date: '2024-02-20', type: 'state-to-district' },
          { source: 'Central Government', amount: 5000, date: '2024-07-10', type: 'central-to-state' },
          { source: 'Tamil Nadu State', amount: 5000, date: '2024-07-15', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p16', name: 'Textile Hub', districtId: 'tn-cbe', allocatedFunds: 12000, usedFunds: 6000, status: 'in-progress', progress: 50, description: 'Modern textile manufacturing zone' },
          { id: 'p17', name: 'Smart Grid', districtId: 'tn-cbe', allocatedFunds: 8000, usedFunds: 4000, status: 'planning', progress: 20, description: 'Electricity distribution upgrade' },
        ]
      }
    ]
  },
  {
    id: 'gj',
    name: 'Gujarat',
    allocatedFunds: 48000,
    usedFunds: 30000,
    districts: [
      {
        id: 'gj-ahm',
        name: 'Ahmedabad',
        stateId: 'gj',
        allocatedFunds: 28000,
        usedFunds: 18000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 22000, date: '2024-01-12', type: 'central-to-state' },
          { source: 'Gujarat State', amount: 22000, date: '2024-01-17', type: 'state-to-district' },
          { source: 'Central Government', amount: 6000, date: '2024-05-15', type: 'central-to-state' },
          { source: 'Gujarat State', amount: 6000, date: '2024-05-20', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p18', name: 'GIFT City Phase 2', districtId: 'gj-ahm', allocatedFunds: 15000, usedFunds: 10000, status: 'in-progress', progress: 66, description: 'International financial services center' },
          { id: 'p19', name: 'Metro Connectivity', districtId: 'gj-ahm', allocatedFunds: 8000, usedFunds: 5000, status: 'in-progress', progress: 55, description: 'Metro network expansion' },
          { id: 'p20', name: 'Riverfront Development', districtId: 'gj-ahm', allocatedFunds: 5000, usedFunds: 3000, status: 'completed', progress: 100, description: 'Sabarmati riverfront beautification' },
        ]
      },
      {
        id: 'gj-srt',
        name: 'Surat',
        stateId: 'gj',
        allocatedFunds: 20000,
        usedFunds: 12000,
        flagged: true,
        moneyTrail: [
          { source: 'Central Government', amount: 18000, date: '2024-02-01', type: 'central-to-state' },
          { source: 'Gujarat State', amount: 18000, date: '2024-02-05', type: 'state-to-district' },
          { source: 'Reallocation from Rajkot', amount: 2000, date: '2024-06-10', type: 'reallocation' },
        ],
        projects: [
          { id: 'p21', name: 'Diamond Bourse', districtId: 'gj-srt', allocatedFunds: 12000, usedFunds: 8000, status: 'flagged', progress: 40, description: 'World-class diamond trading hub' },
          { id: 'p22', name: 'BRTS Expansion', districtId: 'gj-srt', allocatedFunds: 8000, usedFunds: 4000, status: 'in-progress', progress: 50, description: 'Bus rapid transit system expansion' },
        ]
      }
    ]
  },
  {
    id: 'up',
    name: 'Uttar Pradesh',
    allocatedFunds: 55000,
    usedFunds: 35000,
    districts: [
      {
        id: 'up-lko',
        name: 'Lucknow',
        stateId: 'up',
        allocatedFunds: 30000,
        usedFunds: 20000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 25000, date: '2024-01-08', type: 'central-to-state' },
          { source: 'Uttar Pradesh State', amount: 25000, date: '2024-01-12', type: 'state-to-district' },
          { source: 'Central Government', amount: 5000, date: '2024-04-20', type: 'central-to-state' },
          { source: 'Uttar Pradesh State', amount: 5000, date: '2024-04-25', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p23', name: 'IT City Development', districtId: 'up-lko', allocatedFunds: 15000, usedFunds: 10000, status: 'in-progress', progress: 66, description: 'Information technology hub' },
          { id: 'p24', name: 'Heritage Conservation', districtId: 'up-lko', allocatedFunds: 8000, usedFunds: 5500, status: 'in-progress', progress: 68, description: 'Historical monument restoration' },
          { id: 'p25', name: 'Metro Phase 2', districtId: 'up-lko', allocatedFunds: 7000, usedFunds: 4500, status: 'in-progress', progress: 58, description: 'Metro rail network expansion' },
        ]
      },
      {
        id: 'up-agr',
        name: 'Agra',
        stateId: 'up',
        allocatedFunds: 25000,
        usedFunds: 15000,
        flagged: false,
        moneyTrail: [
          { source: 'Central Government', amount: 20000, date: '2024-02-05', type: 'central-to-state' },
          { source: 'Uttar Pradesh State', amount: 20000, date: '2024-02-10', type: 'state-to-district' },
          { source: 'Central Government', amount: 5000, date: '2024-07-01', type: 'central-to-state' },
          { source: 'Uttar Pradesh State', amount: 5000, date: '2024-07-05', type: 'state-to-district' },
        ],
        projects: [
          { id: 'p26', name: 'Tourism Infrastructure', districtId: 'up-agr', allocatedFunds: 15000, usedFunds: 9000, status: 'in-progress', progress: 60, description: 'Taj Mahal area development' },
          { id: 'p27', name: 'Expressway Link', districtId: 'up-agr', allocatedFunds: 10000, usedFunds: 6000, status: 'in-progress', progress: 55, description: 'High-speed expressway connection' },
        ]
      }
    ]
  }
]

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)} Cr`
  } else if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} L`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export function getStatusColor(status: Project['status']): string {
  switch (status) {
    case 'completed': return 'bg-success text-success-foreground'
    case 'in-progress': return 'bg-primary text-primary-foreground'
    case 'planning': return 'bg-muted text-muted-foreground'
    case 'flagged': return 'bg-destructive text-destructive-foreground'
    default: return 'bg-muted text-muted-foreground'
  }
}
