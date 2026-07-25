/**
 * Metadados da simulação de ataques, isolados em um arquivo sem dependência
 * de three.js: são consumidos por componentes renderizados no servidor
 * (painel SOC), enquanto a engine 3D roda apenas no cliente.
 */
export const ATTACK_TYPES = ['malware', 'ransomware', 'ddos', 'phishing', 'exploit', 'botnet'] as const
export type AttackType = (typeof ATTACK_TYPES)[number]

export const ATTACK_META: Record<AttackType, { label: string, color: string }> = {
  malware: { label: 'Malware', color: '#a3e635' },
  ransomware: { label: 'Ransomware', color: '#c084fc' },
  ddos: { label: 'DDoS', color: '#fb7185' },
  phishing: { label: 'Phishing', color: '#38bdf8' },
  exploit: { label: 'Exploit', color: '#fb923c' },
  botnet: { label: 'Botnet', color: '#22d3ee' }
}

export interface SimulationStats {
  active: number
  perMinute: number
  totalEvents: number
  topTargetCountry: string
  topSourceCountry: string
  topType: AttackType
}
