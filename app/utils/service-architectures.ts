export const SERVICE_IDS = [
  'frontend',
  'mobile',
  'backend',
  'devops',
  'architecture',
  'uxui',
  'pentest',
  'redteam',
  'blueteam',
  'purpleteam',
  'lgpd',
  'grc'
] as const

export type ServiceId = (typeof SERVICE_IDS)[number]

export interface ServiceDetail {
  id: ServiceId
  icon: string
  title: string
  description: string
  about: string
  highlights: string[]
  nodes: string[]
}

export interface ArchNode {
  id: string
  /** Centro X em viewBox 0–1000 */
  x: number
  /** Centro Y em viewBox 0–560 */
  y: number
  w: number
  h: number
  /** Índice no array de labels i18n */
  label: number
  tone?: 'primary' | 'muted' | 'danger' | 'info'
}

export interface ArchEdge {
  from: string
  to: string
  /** Curva suave em vez de linha reta */
  bend?: number
}

export interface ArchLayout {
  nodes: ArchNode[]
  edges: ArchEdge[]
}

const box = (
  id: string,
  x: number,
  y: number,
  label: number,
  tone: ArchNode['tone'] = 'muted',
  w = 148,
  h = 52
): ArchNode => ({ id, x, y, w, h, label, tone })

/** Topologias desenháveis: cada serviço tem um “esqueleto” próprio. */
export const SERVICE_ARCHITECTURES: Record<ServiceId, ArchLayout> = {
  frontend: {
    nodes: [
      box('user', 100, 280, 0, 'info', 120, 48),
      box('browser', 320, 280, 1, 'muted'),
      box('cdn', 520, 140, 2, 'muted'),
      box('app', 520, 280, 3, 'primary', 160, 56),
      box('ds', 520, 420, 4, 'muted'),
      box('api', 780, 280, 5, 'info')
    ],
    edges: [
      { from: 'user', to: 'browser' },
      { from: 'browser', to: 'cdn', bend: -40 },
      { from: 'browser', to: 'app' },
      { from: 'cdn', to: 'app', bend: 20 },
      { from: 'app', to: 'ds', bend: 10 },
      { from: 'app', to: 'api' }
    ]
  },
  mobile: {
    nodes: [
      box('user', 90, 280, 0, 'info', 120, 48),
      box('ios', 300, 160, 1, 'muted', 130, 48),
      box('android', 300, 400, 2, 'muted', 130, 48),
      box('app', 520, 280, 3, 'primary', 160, 56),
      box('push', 720, 160, 4, 'muted'),
      box('api', 720, 400, 5, 'info')
    ],
    edges: [
      { from: 'user', to: 'ios', bend: -30 },
      { from: 'user', to: 'android', bend: 30 },
      { from: 'ios', to: 'app', bend: 20 },
      { from: 'android', to: 'app', bend: -20 },
      { from: 'app', to: 'push', bend: -15 },
      { from: 'app', to: 'api', bend: 15 }
    ]
  },
  backend: {
    nodes: [
      box('clients', 90, 280, 0, 'info', 130, 48),
      box('gw', 300, 280, 1, 'primary', 150, 52),
      box('svc', 520, 160, 2, 'muted'),
      box('queue', 520, 400, 3, 'muted'),
      box('db', 760, 160, 4, 'info'),
      box('cache', 760, 400, 5, 'muted')
    ],
    edges: [
      { from: 'clients', to: 'gw' },
      { from: 'gw', to: 'svc', bend: -25 },
      { from: 'gw', to: 'queue', bend: 25 },
      { from: 'svc', to: 'db' },
      { from: 'queue', to: 'cache', bend: 10 },
      { from: 'svc', to: 'queue', bend: 15 }
    ]
  },
  devops: {
    nodes: [
      box('git', 90, 280, 0, 'muted'),
      box('ci', 280, 280, 1, 'primary'),
      box('build', 460, 160, 2, 'muted'),
      box('registry', 460, 400, 3, 'muted'),
      box('deploy', 660, 280, 4, 'primary'),
      box('cloud', 860, 280, 5, 'info')
    ],
    edges: [
      { from: 'git', to: 'ci' },
      { from: 'ci', to: 'build', bend: -30 },
      { from: 'ci', to: 'registry', bend: 30 },
      { from: 'build', to: 'deploy', bend: 20 },
      { from: 'registry', to: 'deploy', bend: -20 },
      { from: 'deploy', to: 'cloud' }
    ]
  },
  architecture: {
    nodes: [
      box('legacy', 100, 160, 0, 'danger', 140, 48),
      box('adapter', 320, 280, 1, 'muted'),
      box('core', 520, 280, 2, 'primary', 160, 56),
      box('events', 720, 160, 3, 'info'),
      box('modern', 720, 400, 4, 'muted'),
      box('obs', 900, 280, 5, 'muted', 120, 48)
    ],
    edges: [
      { from: 'legacy', to: 'adapter', bend: 40 },
      { from: 'adapter', to: 'core' },
      { from: 'core', to: 'events', bend: -25 },
      { from: 'core', to: 'modern', bend: 25 },
      { from: 'events', to: 'obs', bend: 15 },
      { from: 'modern', to: 'obs', bend: -15 }
    ]
  },
  uxui: {
    nodes: [
      box('research', 100, 280, 0, 'info'),
      box('wire', 300, 160, 1, 'muted'),
      box('proto', 300, 400, 2, 'muted'),
      box('ds', 520, 280, 3, 'primary', 160, 56),
      box('handoff', 740, 280, 4, 'muted'),
      box('eng', 920, 280, 5, 'info', 120, 48)
    ],
    edges: [
      { from: 'research', to: 'wire', bend: -30 },
      { from: 'research', to: 'proto', bend: 30 },
      { from: 'wire', to: 'ds', bend: 20 },
      { from: 'proto', to: 'ds', bend: -20 },
      { from: 'ds', to: 'handoff' },
      { from: 'handoff', to: 'eng' }
    ]
  },
  pentest: {
    nodes: [
      box('scope', 100, 280, 0, 'muted'),
      box('recon', 300, 160, 1, 'info'),
      box('exploit', 300, 400, 2, 'danger'),
      box('validate', 520, 280, 3, 'primary'),
      box('report', 740, 280, 4, 'muted'),
      box('fix', 920, 280, 5, 'info', 120, 48)
    ],
    edges: [
      { from: 'scope', to: 'recon', bend: -30 },
      { from: 'scope', to: 'exploit', bend: 30 },
      { from: 'recon', to: 'validate', bend: 20 },
      { from: 'exploit', to: 'validate', bend: -20 },
      { from: 'validate', to: 'report' },
      { from: 'report', to: 'fix' }
    ]
  },
  redteam: {
    nodes: [
      box('adv', 90, 280, 0, 'danger', 130, 48),
      box('access', 290, 160, 1, 'danger'),
      box('people', 290, 400, 2, 'muted'),
      box('lateral', 520, 280, 3, 'primary'),
      box('obj', 740, 280, 4, 'danger'),
      box('debrief', 920, 280, 5, 'info', 130, 48)
    ],
    edges: [
      { from: 'adv', to: 'access', bend: -30 },
      { from: 'adv', to: 'people', bend: 30 },
      { from: 'access', to: 'lateral', bend: 20 },
      { from: 'people', to: 'lateral', bend: -20 },
      { from: 'lateral', to: 'obj' },
      { from: 'obj', to: 'debrief' }
    ]
  },
  blueteam: {
    nodes: [
      box('sensors', 90, 160, 0, 'muted'),
      box('logs', 90, 400, 1, 'muted'),
      box('siem', 320, 280, 2, 'primary', 150, 52),
      box('detect', 540, 180, 3, 'info'),
      box('respond', 540, 380, 4, 'danger'),
      box('harden', 800, 280, 5, 'muted')
    ],
    edges: [
      { from: 'sensors', to: 'siem', bend: 25 },
      { from: 'logs', to: 'siem', bend: -25 },
      { from: 'siem', to: 'detect', bend: -15 },
      { from: 'siem', to: 'respond', bend: 15 },
      { from: 'detect', to: 'harden', bend: 20 },
      { from: 'respond', to: 'harden', bend: -20 }
    ]
  },
  purpleteam: {
    nodes: [
      box('red', 100, 160, 0, 'danger'),
      box('blue', 100, 400, 1, 'info'),
      box('attack', 360, 280, 2, 'primary', 150, 52),
      box('detect', 560, 280, 3, 'muted'),
      box('tune', 760, 280, 4, 'info'),
      box('retest', 920, 280, 5, 'muted', 120, 48)
    ],
    edges: [
      { from: 'red', to: 'attack', bend: 30 },
      { from: 'blue', to: 'attack', bend: -30 },
      { from: 'attack', to: 'detect' },
      { from: 'detect', to: 'tune' },
      { from: 'tune', to: 'retest' },
      { from: 'retest', to: 'red', bend: -80 }
    ]
  },
  lgpd: {
    nodes: [
      box('map', 100, 280, 0, 'muted'),
      box('legal', 300, 160, 1, 'info'),
      box('controls', 300, 400, 2, 'primary'),
      box('rights', 540, 280, 3, 'muted'),
      box('audit', 760, 280, 4, 'info'),
      box('ops', 920, 280, 5, 'muted', 120, 48)
    ],
    edges: [
      { from: 'map', to: 'legal', bend: -30 },
      { from: 'map', to: 'controls', bend: 30 },
      { from: 'legal', to: 'rights', bend: 20 },
      { from: 'controls', to: 'rights', bend: -20 },
      { from: 'rights', to: 'audit' },
      { from: 'audit', to: 'ops' }
    ]
  },
  grc: {
    nodes: [
      box('policy', 100, 160, 0, 'muted'),
      box('risk', 100, 400, 1, 'danger'),
      box('controls', 360, 280, 2, 'primary', 150, 52),
      box('compliance', 580, 280, 3, 'info'),
      box('exec', 800, 280, 4, 'muted'),
      box('improve', 940, 280, 5, 'muted', 110, 48)
    ],
    edges: [
      { from: 'policy', to: 'controls', bend: 30 },
      { from: 'risk', to: 'controls', bend: -30 },
      { from: 'controls', to: 'compliance' },
      { from: 'compliance', to: 'exec' },
      { from: 'exec', to: 'improve' },
      { from: 'improve', to: 'risk', bend: 70 }
    ]
  }
}

export function edgePath(
  from: ArchNode,
  to: ArchNode,
  bend = 0
): string {
  const x1 = from.x + from.w / 2
  const y1 = from.y
  const x2 = to.x - to.w / 2
  const y2 = to.y
  if (!bend) {
    return `M ${x1} ${y1} L ${x2} ${y2}`
  }
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2 + bend
  return `M ${x1} ${y1} Q ${mx} ${my} ${x2} ${y2}`
}
