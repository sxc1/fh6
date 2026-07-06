export const CLASS_HEX_COLORS: Record<string, string> = {
  X: '#19D858',
  R: '#D61A9C',
  S2: '#165EDB',
  S1: '#B960E8',
  A: '#FF1A46',
  B: '#FF632C',
  C: '#FFC533',
  D: '#42BDF4',
}

export function getClassColor(carClass: string): string | undefined {
  return CLASS_HEX_COLORS[carClass]
}
