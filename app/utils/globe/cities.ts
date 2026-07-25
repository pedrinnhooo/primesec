/**
 * Base de cidades usada pela simulação de ataques.
 * `weight` controla a probabilidade da cidade ser sorteada como origem/destino
 * (hubs de internet e grandes centros aparecem com mais frequência).
 */
export interface City {
  name: string
  country: string
  lat: number
  lng: number
  weight: number
}

export const CITIES: City[] = [
  // América do Norte
  { name: 'Nova York', country: 'EUA', lat: 40.71, lng: -74.01, weight: 5 },
  { name: 'Washington', country: 'EUA', lat: 38.9, lng: -77.04, weight: 4 },
  { name: 'Los Angeles', country: 'EUA', lat: 34.05, lng: -118.24, weight: 4 },
  { name: 'San Francisco', country: 'EUA', lat: 37.77, lng: -122.42, weight: 4 },
  { name: 'Seattle', country: 'EUA', lat: 47.61, lng: -122.33, weight: 3 },
  { name: 'Chicago', country: 'EUA', lat: 41.88, lng: -87.63, weight: 3 },
  { name: 'Dallas', country: 'EUA', lat: 32.78, lng: -96.8, weight: 3 },
  { name: 'Houston', country: 'EUA', lat: 29.76, lng: -95.37, weight: 2 },
  { name: 'Miami', country: 'EUA', lat: 25.76, lng: -80.19, weight: 3 },
  { name: 'Atlanta', country: 'EUA', lat: 33.75, lng: -84.39, weight: 2 },
  { name: 'Boston', country: 'EUA', lat: 42.36, lng: -71.06, weight: 2 },
  { name: 'Denver', country: 'EUA', lat: 39.74, lng: -104.99, weight: 2 },
  { name: 'Phoenix', country: 'EUA', lat: 33.45, lng: -112.07, weight: 1 },
  { name: 'Ashburn', country: 'EUA', lat: 39.04, lng: -77.49, weight: 4 },
  { name: 'Toronto', country: 'Canadá', lat: 43.65, lng: -79.38, weight: 3 },
  { name: 'Vancouver', country: 'Canadá', lat: 49.28, lng: -123.12, weight: 2 },
  { name: 'Montreal', country: 'Canadá', lat: 45.5, lng: -73.57, weight: 2 },
  { name: 'Ottawa', country: 'Canadá', lat: 45.42, lng: -75.7, weight: 1 },
  { name: 'Calgary', country: 'Canadá', lat: 51.04, lng: -114.07, weight: 1 },
  { name: 'Cidade do México', country: 'México', lat: 19.43, lng: -99.13, weight: 3 },
  { name: 'Guadalajara', country: 'México', lat: 20.67, lng: -103.35, weight: 1 },
  { name: 'Monterrey', country: 'México', lat: 25.69, lng: -100.32, weight: 1 },
  { name: 'Havana', country: 'Cuba', lat: 23.11, lng: -82.37, weight: 1 },
  { name: 'Cidade do Panamá', country: 'Panamá', lat: 8.98, lng: -79.52, weight: 1 },
  { name: 'San José', country: 'Costa Rica', lat: 9.93, lng: -84.08, weight: 1 },
  { name: 'Guatemala', country: 'Guatemala', lat: 14.63, lng: -90.51, weight: 1 },
  { name: 'Santo Domingo', country: 'República Dominicana', lat: 18.49, lng: -69.99, weight: 1 },
  { name: 'San Juan', country: 'Porto Rico', lat: 18.47, lng: -66.11, weight: 1 },

  // América do Sul
  { name: 'São Paulo', country: 'Brasil', lat: -23.55, lng: -46.63, weight: 5 },
  { name: 'Rio de Janeiro', country: 'Brasil', lat: -22.91, lng: -43.17, weight: 3 },
  { name: 'Brasília', country: 'Brasil', lat: -15.79, lng: -47.88, weight: 2 },
  { name: 'Fortaleza', country: 'Brasil', lat: -3.72, lng: -38.54, weight: 2 },
  { name: 'Porto Alegre', country: 'Brasil', lat: -30.03, lng: -51.23, weight: 2 },
  { name: 'Recife', country: 'Brasil', lat: -8.05, lng: -34.9, weight: 1 },
  { name: 'Curitiba', country: 'Brasil', lat: -25.43, lng: -49.27, weight: 1 },
  { name: 'Belo Horizonte', country: 'Brasil', lat: -19.92, lng: -43.94, weight: 1 },
  { name: 'Manaus', country: 'Brasil', lat: -3.12, lng: -60.02, weight: 1 },
  { name: 'Buenos Aires', country: 'Argentina', lat: -34.6, lng: -58.38, weight: 3 },
  { name: 'Córdoba', country: 'Argentina', lat: -31.42, lng: -64.18, weight: 1 },
  { name: 'Santiago', country: 'Chile', lat: -33.45, lng: -70.67, weight: 2 },
  { name: 'Lima', country: 'Peru', lat: -12.05, lng: -77.04, weight: 2 },
  { name: 'Bogotá', country: 'Colômbia', lat: 4.71, lng: -74.07, weight: 2 },
  { name: 'Medellín', country: 'Colômbia', lat: 6.24, lng: -75.58, weight: 1 },
  { name: 'Quito', country: 'Equador', lat: -0.18, lng: -78.47, weight: 1 },
  { name: 'Guayaquil', country: 'Equador', lat: -2.17, lng: -79.92, weight: 1 },
  { name: 'Caracas', country: 'Venezuela', lat: 10.48, lng: -66.9, weight: 1 },
  { name: 'Montevidéu', country: 'Uruguai', lat: -34.9, lng: -56.16, weight: 1 },
  { name: 'Assunção', country: 'Paraguai', lat: -25.26, lng: -57.58, weight: 1 },
  { name: 'La Paz', country: 'Bolívia', lat: -16.5, lng: -68.15, weight: 1 },
  { name: 'Santa Cruz de la Sierra', country: 'Bolívia', lat: -17.78, lng: -63.18, weight: 1 },

  // Europa
  { name: 'Londres', country: 'Reino Unido', lat: 51.51, lng: -0.13, weight: 5 },
  { name: 'Manchester', country: 'Reino Unido', lat: 53.48, lng: -2.24, weight: 1 },
  { name: 'Dublin', country: 'Irlanda', lat: 53.35, lng: -6.26, weight: 2 },
  { name: 'Paris', country: 'França', lat: 48.86, lng: 2.35, weight: 4 },
  { name: 'Marselha', country: 'França', lat: 43.3, lng: 5.37, weight: 1 },
  { name: 'Frankfurt', country: 'Alemanha', lat: 50.11, lng: 8.68, weight: 5 },
  { name: 'Berlim', country: 'Alemanha', lat: 52.52, lng: 13.41, weight: 3 },
  { name: 'Munique', country: 'Alemanha', lat: 48.14, lng: 11.58, weight: 2 },
  { name: 'Hamburgo', country: 'Alemanha', lat: 53.55, lng: 9.99, weight: 1 },
  { name: 'Amsterdã', country: 'Holanda', lat: 52.37, lng: 4.9, weight: 4 },
  { name: 'Bruxelas', country: 'Bélgica', lat: 50.85, lng: 4.35, weight: 2 },
  { name: 'Luxemburgo', country: 'Luxemburgo', lat: 49.61, lng: 6.13, weight: 1 },
  { name: 'Madri', country: 'Espanha', lat: 40.42, lng: -3.7, weight: 3 },
  { name: 'Barcelona', country: 'Espanha', lat: 41.39, lng: 2.17, weight: 2 },
  { name: 'Lisboa', country: 'Portugal', lat: 38.72, lng: -9.14, weight: 2 },
  { name: 'Porto', country: 'Portugal', lat: 41.15, lng: -8.61, weight: 1 },
  { name: 'Roma', country: 'Itália', lat: 41.9, lng: 12.5, weight: 3 },
  { name: 'Milão', country: 'Itália', lat: 45.46, lng: 9.19, weight: 2 },
  { name: 'Zurique', country: 'Suíça', lat: 47.37, lng: 8.54, weight: 2 },
  { name: 'Genebra', country: 'Suíça', lat: 46.2, lng: 6.14, weight: 1 },
  { name: 'Viena', country: 'Áustria', lat: 48.21, lng: 16.37, weight: 2 },
  { name: 'Praga', country: 'Tchéquia', lat: 50.08, lng: 14.44, weight: 2 },
  { name: 'Bratislava', country: 'Eslováquia', lat: 48.15, lng: 17.11, weight: 1 },
  { name: 'Varsóvia', country: 'Polônia', lat: 52.23, lng: 21.01, weight: 2 },
  { name: 'Cracóvia', country: 'Polônia', lat: 50.06, lng: 19.94, weight: 1 },
  { name: 'Budapeste', country: 'Hungria', lat: 47.5, lng: 19.04, weight: 1 },
  { name: 'Bucareste', country: 'Romênia', lat: 44.43, lng: 26.1, weight: 2 },
  { name: 'Sófia', country: 'Bulgária', lat: 42.7, lng: 23.32, weight: 1 },
  { name: 'Atenas', country: 'Grécia', lat: 37.98, lng: 23.73, weight: 1 },
  { name: 'Estocolmo', country: 'Suécia', lat: 59.33, lng: 18.07, weight: 2 },
  { name: 'Oslo', country: 'Noruega', lat: 59.91, lng: 10.75, weight: 1 },
  { name: 'Copenhague', country: 'Dinamarca', lat: 55.68, lng: 12.57, weight: 2 },
  { name: 'Helsinque', country: 'Finlândia', lat: 60.17, lng: 24.94, weight: 1 },
  { name: 'Reykjavík', country: 'Islândia', lat: 64.15, lng: -21.94, weight: 1 },
  { name: 'Kyiv', country: 'Ucrânia', lat: 50.45, lng: 30.52, weight: 3 },
  { name: 'Moscou', country: 'Rússia', lat: 55.76, lng: 37.62, weight: 5 },
  { name: 'São Petersburgo', country: 'Rússia', lat: 59.93, lng: 30.34, weight: 3 },
  { name: 'Novosibirsk', country: 'Rússia', lat: 55.03, lng: 82.92, weight: 2 },
  { name: 'Ecaterimburgo', country: 'Rússia', lat: 56.84, lng: 60.65, weight: 1 },
  { name: 'Minsk', country: 'Bielorrússia', lat: 53.9, lng: 27.57, weight: 2 },
  { name: 'Belgrado', country: 'Sérvia', lat: 44.79, lng: 20.45, weight: 1 },
  { name: 'Zagreb', country: 'Croácia', lat: 45.81, lng: 15.98, weight: 1 },
  { name: 'Ljubljana', country: 'Eslovênia', lat: 46.06, lng: 14.51, weight: 1 },
  { name: 'Vilnius', country: 'Lituânia', lat: 54.69, lng: 25.28, weight: 1 },
  { name: 'Riga', country: 'Letônia', lat: 56.95, lng: 24.11, weight: 1 },
  { name: 'Tallinn', country: 'Estônia', lat: 59.44, lng: 24.75, weight: 1 },

  // Oriente Médio
  { name: 'Istambul', country: 'Turquia', lat: 41.01, lng: 28.98, weight: 3 },
  { name: 'Ancara', country: 'Turquia', lat: 39.93, lng: 32.86, weight: 1 },
  { name: 'Tel Aviv', country: 'Israel', lat: 32.08, lng: 34.78, weight: 3 },
  { name: 'Jerusalém', country: 'Israel', lat: 31.77, lng: 35.21, weight: 1 },
  { name: 'Dubai', country: 'Emirados Árabes', lat: 25.2, lng: 55.27, weight: 3 },
  { name: 'Abu Dhabi', country: 'Emirados Árabes', lat: 24.45, lng: 54.38, weight: 1 },
  { name: 'Riade', country: 'Arábia Saudita', lat: 24.71, lng: 46.68, weight: 2 },
  { name: 'Jidá', country: 'Arábia Saudita', lat: 21.49, lng: 39.19, weight: 1 },
  { name: 'Doha', country: 'Catar', lat: 25.29, lng: 51.53, weight: 1 },
  { name: 'Kuwait', country: 'Kuwait', lat: 29.38, lng: 47.99, weight: 1 },
  { name: 'Manama', country: 'Bahrein', lat: 26.22, lng: 50.58, weight: 1 },
  { name: 'Mascate', country: 'Omã', lat: 23.59, lng: 58.41, weight: 1 },
  { name: 'Teerã', country: 'Irã', lat: 35.69, lng: 51.39, weight: 3 },
  { name: 'Bagdá', country: 'Iraque', lat: 33.31, lng: 44.36, weight: 1 },
  { name: 'Beirute', country: 'Líbano', lat: 33.89, lng: 35.5, weight: 1 },
  { name: 'Amã', country: 'Jordânia', lat: 31.96, lng: 35.95, weight: 1 },

  // África
  { name: 'Cairo', country: 'Egito', lat: 30.04, lng: 31.24, weight: 2 },
  { name: 'Alexandria', country: 'Egito', lat: 31.2, lng: 29.92, weight: 1 },
  { name: 'Lagos', country: 'Nigéria', lat: 6.52, lng: 3.38, weight: 2 },
  { name: 'Abuja', country: 'Nigéria', lat: 9.06, lng: 7.5, weight: 1 },
  { name: 'Joanesburgo', country: 'África do Sul', lat: -26.2, lng: 28.05, weight: 2 },
  { name: 'Cidade do Cabo', country: 'África do Sul', lat: -33.92, lng: 18.42, weight: 1 },
  { name: 'Nairóbi', country: 'Quênia', lat: -1.29, lng: 36.82, weight: 2 },
  { name: 'Acra', country: 'Gana', lat: 5.6, lng: -0.19, weight: 1 },
  { name: 'Casablanca', country: 'Marrocos', lat: 33.57, lng: -7.59, weight: 1 },
  { name: 'Argel', country: 'Argélia', lat: 36.75, lng: 3.06, weight: 1 },
  { name: 'Túnis', country: 'Tunísia', lat: 36.81, lng: 10.18, weight: 1 },
  { name: 'Adis Abeba', country: 'Etiópia', lat: 9.01, lng: 38.75, weight: 1 },
  { name: 'Dacar', country: 'Senegal', lat: 14.72, lng: -17.47, weight: 1 },
  { name: 'Luanda', country: 'Angola', lat: -8.84, lng: 13.23, weight: 1 },
  { name: 'Kinshasa', country: 'RD Congo', lat: -4.44, lng: 15.27, weight: 1 },
  { name: 'Dar es Salaam', country: 'Tanzânia', lat: -6.79, lng: 39.21, weight: 1 },
  { name: 'Kigali', country: 'Ruanda', lat: -1.95, lng: 30.06, weight: 1 },
  { name: 'Maputo', country: 'Moçambique', lat: -25.97, lng: 32.58, weight: 1 },
  { name: 'Abidjan', country: 'Costa do Marfim', lat: 5.36, lng: -4.01, weight: 1 },

  // Ásia
  { name: 'Pequim', country: 'China', lat: 39.9, lng: 116.41, weight: 5 },
  { name: 'Xangai', country: 'China', lat: 31.23, lng: 121.47, weight: 4 },
  { name: 'Shenzhen', country: 'China', lat: 22.54, lng: 114.06, weight: 3 },
  { name: 'Guangzhou', country: 'China', lat: 23.13, lng: 113.26, weight: 2 },
  { name: 'Chengdu', country: 'China', lat: 30.57, lng: 104.07, weight: 1 },
  { name: 'Hangzhou', country: 'China', lat: 30.27, lng: 120.16, weight: 2 },
  { name: 'Wuhan', country: 'China', lat: 30.59, lng: 114.3, weight: 1 },
  { name: 'Tianjin', country: 'China', lat: 39.13, lng: 117.2, weight: 1 },
  { name: 'Hong Kong', country: 'China', lat: 22.32, lng: 114.17, weight: 4 },
  { name: 'Macau', country: 'Macau', lat: 22.2, lng: 113.55, weight: 1 },
  { name: 'Taipé', country: 'Taiwan', lat: 25.03, lng: 121.57, weight: 3 },
  { name: 'Tóquio', country: 'Japão', lat: 35.68, lng: 139.69, weight: 5 },
  { name: 'Osaka', country: 'Japão', lat: 34.69, lng: 135.5, weight: 2 },
  { name: 'Nagoia', country: 'Japão', lat: 35.18, lng: 136.91, weight: 1 },
  { name: 'Seul', country: 'Coreia do Sul', lat: 37.57, lng: 126.98, weight: 4 },
  { name: 'Busan', country: 'Coreia do Sul', lat: 35.18, lng: 129.08, weight: 1 },
  { name: 'Pyongyang', country: 'Coreia do Norte', lat: 39.04, lng: 125.75, weight: 2 },
  { name: 'Singapura', country: 'Singapura', lat: 1.35, lng: 103.82, weight: 4 },
  { name: 'Kuala Lumpur', country: 'Malásia', lat: 3.14, lng: 101.69, weight: 2 },
  { name: 'Johor Bahru', country: 'Malásia', lat: 1.49, lng: 103.74, weight: 1 },
  { name: 'Jacarta', country: 'Indonésia', lat: -6.21, lng: 106.85, weight: 3 },
  { name: 'Surabaya', country: 'Indonésia', lat: -7.26, lng: 112.75, weight: 1 },
  { name: 'Bangkok', country: 'Tailândia', lat: 13.76, lng: 100.5, weight: 2 },
  { name: 'Hanói', country: 'Vietnã', lat: 21.03, lng: 105.85, weight: 2 },
  { name: 'Ho Chi Minh', country: 'Vietnã', lat: 10.82, lng: 106.63, weight: 2 },
  { name: 'Manila', country: 'Filipinas', lat: 14.6, lng: 120.98, weight: 2 },
  { name: 'Mumbai', country: 'Índia', lat: 19.08, lng: 72.88, weight: 4 },
  { name: 'Nova Délhi', country: 'Índia', lat: 28.61, lng: 77.21, weight: 3 },
  { name: 'Bangalore', country: 'Índia', lat: 12.97, lng: 77.59, weight: 3 },
  { name: 'Hyderabad', country: 'Índia', lat: 17.39, lng: 78.49, weight: 1 },
  { name: 'Chennai', country: 'Índia', lat: 13.08, lng: 80.27, weight: 1 },
  { name: 'Calcutá', country: 'Índia', lat: 22.57, lng: 88.36, weight: 1 },
  { name: 'Pune', country: 'Índia', lat: 18.52, lng: 73.86, weight: 1 },
  { name: 'Karachi', country: 'Paquistão', lat: 24.86, lng: 67.01, weight: 2 },
  { name: 'Lahore', country: 'Paquistão', lat: 31.55, lng: 74.34, weight: 1 },
  { name: 'Islamabad', country: 'Paquistão', lat: 33.68, lng: 73.05, weight: 1 },
  { name: 'Daca', country: 'Bangladesh', lat: 23.81, lng: 90.41, weight: 1 },
  { name: 'Colombo', country: 'Sri Lanka', lat: 6.93, lng: 79.85, weight: 1 },
  { name: 'Katmandu', country: 'Nepal', lat: 27.72, lng: 85.32, weight: 1 },
  { name: 'Almaty', country: 'Cazaquistão', lat: 43.24, lng: 76.89, weight: 1 },
  { name: 'Tasquente', country: 'Uzbequistão', lat: 41.3, lng: 69.24, weight: 1 },
  { name: 'Baku', country: 'Azerbaijão', lat: 40.41, lng: 49.87, weight: 1 },
  { name: 'Tbilisi', country: 'Geórgia', lat: 41.72, lng: 44.83, weight: 1 },
  { name: 'Erevan', country: 'Armênia', lat: 40.18, lng: 44.51, weight: 1 },
  { name: 'Ulaanbaatar', country: 'Mongólia', lat: 47.89, lng: 106.91, weight: 1 },

  // Oceania
  { name: 'Sydney', country: 'Austrália', lat: -33.87, lng: 151.21, weight: 3 },
  { name: 'Melbourne', country: 'Austrália', lat: -37.81, lng: 144.96, weight: 2 },
  { name: 'Brisbane', country: 'Austrália', lat: -27.47, lng: 153.03, weight: 1 },
  { name: 'Perth', country: 'Austrália', lat: -31.95, lng: 115.86, weight: 1 },
  { name: 'Adelaide', country: 'Austrália', lat: -34.93, lng: 138.6, weight: 1 },
  { name: 'Canberra', country: 'Austrália', lat: -35.28, lng: 149.13, weight: 1 },
  { name: 'Auckland', country: 'Nova Zelândia', lat: -36.85, lng: 174.76, weight: 1 },
  { name: 'Wellington', country: 'Nova Zelândia', lat: -41.29, lng: 174.78, weight: 1 }
]

/** Soma acumulada dos pesos para sorteio ponderado em O(log n). */
const cumulativeWeights: number[] = []
let totalWeight = 0
for (const city of CITIES) {
  totalWeight += city.weight
  cumulativeWeights.push(totalWeight)
}

/** Sorteia uma cidade respeitando os pesos. */
export function pickRandomCity(): City {
  const target = Math.random() * totalWeight
  let lo = 0
  let hi = cumulativeWeights.length - 1
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (cumulativeWeights[mid]! < target) lo = mid + 1
    else hi = mid
  }
  return CITIES[lo]!
}
