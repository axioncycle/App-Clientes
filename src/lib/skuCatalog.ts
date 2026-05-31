export type SKUItem = { id: number; category: string; name: string }

export const SKU_CATALOG: SKUItem[] = [
  { id: 1,  category: 'RIM',    name: 'Rim brake 38mm BLACK' },
  { id: 2,  category: 'RIM',    name: 'Rim brake 50mm BLACK' },
  { id: 3,  category: 'RIM',    name: 'Rim brake 50mm CINZA' },
  { id: 4,  category: 'RIM',    name: 'Rim brake 50mm BRANCO' },
  { id: 5,  category: 'RIM',    name: 'Rim brake 60mm BLACK' },
  { id: 6,  category: 'RIM',    name: 'Rim brake 60mm CINZA' },
  { id: 7,  category: 'RIM',    name: 'Rim brake 60mm BRANCO' },
  { id: 8,  category: 'RIM',    name: 'Rim brake 60/88mm BLACK' },
  { id: 9,  category: 'RIM',    name: 'Rim brake 60/88mm CINZA' },
  { id: 10, category: 'RIM',    name: 'Rim brake WAVE 45/50mm' },
  { id: 11, category: 'RIM',    name: 'Rim brake FECHADA/88mm CINZA' },
  { id: 12, category: 'RIM',    name: 'Rim brake FECHADA/88mm BRANCO' },
  { id: 13, category: 'RIM',    name: 'Rim brake FECHADA/3-spoke BRANCO' },
  { id: 14, category: 'RIM',    name: 'Rim brake 88mm dianteira BRANCO' },
  { id: 15, category: 'RIM',    name: 'Rim brake 88mm dianteira CINZA' },
  { id: 16, category: 'RIM',    name: 'Rim brake FECHADA Traseira BRANCO' },
  { id: 17, category: 'RIM',    name: 'Rim brake FECHADA Traseira CINZA' },
  { id: 18, category: 'RIM',    name: 'Rim brake 3-Spoke dianteira BRANCO' },
  { id: 19, category: 'RIM',    name: 'Rim brake 3-Spoke dianteira CINZA' },
  { id: 20, category: 'DISC',   name: 'Disc brake 38mm BLACK' },
  { id: 21, category: 'DISC',   name: 'Disc brake 50mm BLACK' },
  { id: 22, category: 'DISC',   name: 'Disc brake 50mm CINZA' },
  { id: 23, category: 'DISC',   name: 'Disc brake 50mm BRANCO' },
  { id: 24, category: 'DISC',   name: 'Disc brake 60mm BLACK' },
  { id: 25, category: 'DISC',   name: 'Disc brake 60mm CINZA' },
  { id: 26, category: 'DISC',   name: 'Disc brake 60mm BRANCO' },
  { id: 27, category: 'DISC',   name: 'Disc brake 60/88mm BLACK' },
  { id: 28, category: 'DISC',   name: 'Disc brake 60/88mm CINZA' },
  { id: 29, category: 'DISC',   name: 'Disc brake WAVE 55/60mm' },
  { id: 30, category: 'DISC',   name: 'Disc brake FECHADA/88mm CINZA' },
  { id: 31, category: 'DISC',   name: 'Disc brake FECHADA/88mm BRANCO' },
  { id: 32, category: 'DISC',   name: 'Disc brake FECHADA/3-spoke' },
  { id: 33, category: 'GRAVEL', name: 'Disc brake Gravel 40mm' },
  { id: 34, category: 'GRAVEL', name: 'Disc brake Gravel 35mm' },
  { id: 35, category: 'MTB',    name: 'Disc brake MTB' },
  { id: 36, category: 'DISC',   name: 'Disc brake 88mm dianteira BRANCO' },
  { id: 37, category: 'DISC',   name: 'Disc brake 88mm dianteira CINZA' },
  { id: 38, category: 'DISC',   name: 'Disc brake FECHADA Traseira BRANCO' },
  { id: 39, category: 'DISC',   name: 'Disc brake FECHADA Traseira CINZA' },
  { id: 40, category: 'DISC',   name: 'Disc brake 3-Spoke dianteira BRANCO' },
  { id: 41, category: 'DISC',   name: 'Disc brake 3-Spoke dianteira CINZA' },
]

export function searchSKU(query: string): SKUItem[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return SKU_CATALOG.filter(
    (s) => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)
  ).slice(0, 8)
}
