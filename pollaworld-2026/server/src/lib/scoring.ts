/**
 * Sistema de puntuación para predicciones:
 * - Marcador exacto (cualquier resultado): 5 puntos
 * - Predices quién gana (marcador incorrecto): 3 puntos
 * - Predices empate (sin importar los goles exactos): 2 puntos
 * - No aciertas nada: 0 puntos
 */
export function calculatePoints(
  homePred: number,
  awayPred: number,
  homeReal: number,
  awayReal: number
): number {
  // Marcador exacto → 5 pts
  if (homePred === homeReal && awayPred === awayReal) {
    return 5;
  }

  const predResult = Math.sign(homePred - awayPred);
  const realResult = Math.sign(homeReal - awayReal);

  // Predijo empate y el resultado real fue empate → 2 pts
  if (predResult === 0 && realResult === 0) {
    return 2;
  }

  // Predijo el ganador correcto (pero no marcador exacto) → 3 pts
  if (predResult === realResult) {
    return 3;
  }

  return 0;
}
