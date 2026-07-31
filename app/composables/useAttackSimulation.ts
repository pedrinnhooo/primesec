import type { SimulationStats } from '~/utils/globe/meta'

/**
 * Estado reativo compartilhado entre a cena 3D (que escreve as estatísticas)
 * e o painel SOC (que as exibe em tempo real).
 */
export function useAttackSimulation() {
  return useState<SimulationStats>('attack-simulation', () => ({
    active: 0,
    perMinute: 0,
    totalEvents: 0,
    topTargetCountry: '-',
    topSourceCountry: '-',
    topType: 'malware'
  }))
}
