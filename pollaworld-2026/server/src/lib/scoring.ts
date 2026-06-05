/**
 * Sistema de puntuación para predicciones:
 * - Marcador exacto (cualquier resultado): 5 puntos
 * - Predices quién gana (marcador incorrecto): 3 puntos
 * - Predices empate pero marcador incorrecto: 0 puntos
 */

export function calculatePoints(
  homePred: number,
  awayPred: number,
  homeReal: number,
  awayReal: number
): number {
  if (homePred === homeReal && awayPred === awayReal) {
    return 5;
  }

  const predResult = Math.sign(homePred - awayPred);
  const realResult = Math.sign(homeReal - awayReal);

  // Empate real: solo 5 pts por marcador exacto, 0 si solo aciertas empate
  if (realResult === 0) {
    return 0;
  }

  // Predijiste el ganador correcto → 3 puntos
  if (predResult === realResult) {
    return 3;
  }

  return 0;
}
