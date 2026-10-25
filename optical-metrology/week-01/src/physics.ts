export type LensSystem = {
  fMm: number
  objectMm: number
  imageMm: number
  magnification: number
  matrix: [number, number, number, number]
}

export function sinc(value: number): number {
  if (Math.abs(value) < 1e-10) return 1
  return Math.sin(value) / value
}

export function singleSlitIntensity(
  screenXmm: number,
  slitWidthUm: number,
  wavelengthNm: number,
  distanceM: number,
): number {
  const x = screenXmm * 1e-3
  const a = slitWidthUm * 1e-6
  const lambda = wavelengthNm * 1e-9
  const theta = Math.atan(x / distanceM)
  const beta = Math.PI * a * Math.sin(theta) / lambda
  return sinc(beta) ** 2
}

export function firstSingleSlitMinimumMm(
  slitWidthUm: number,
  wavelengthNm: number,
  distanceM: number,
): number {
  const ratio = wavelengthNm * 1e-9 / (slitWidthUm * 1e-6)
  if (ratio >= 1) return Number.POSITIVE_INFINITY
  return distanceM * Math.tan(Math.asin(ratio)) * 1e3
}

export function thinLensImageDistanceMm(fMm: number, objectMm: number): number {
  const denominator = 1 / fMm - 1 / objectMm
  if (Math.abs(denominator) < 1e-10) return Number.POSITIVE_INFINITY
  return 1 / denominator
}

export function multiplyMatrices(
  left: [number, number, number, number],
  right: [number, number, number, number],
): [number, number, number, number] {
  const [a, b, c, d] = left
  const [e, f, g, h] = right
  return [a * e + b * g, a * f + b * h, c * e + d * g, c * f + d * h]
}

export function transferMatrix(fMm: number, objectMm: number, imageMm: number): [number, number, number, number] {
  const objectToLens: [number, number, number, number] = [1, objectMm, 0, 1]
  const lens: [number, number, number, number] = [1, 0, -1 / fMm, 1]
  const lensToImage: [number, number, number, number] = [1, imageMm, 0, 1]
  return multiplyMatrices(lensToImage, multiplyMatrices(lens, objectToLens))
}

export function solveThinLens(fMm: number, objectMm: number): LensSystem {
  const imageMm = thinLensImageDistanceMm(fMm, objectMm)
  return {
    fMm,
    objectMm,
    imageMm,
    magnification: -imageMm / objectMm,
    matrix: transferMatrix(fMm, objectMm, imageMm),
  }
}

export function airyFirstMinimumRadiusUm(fMm: number, apertureMm: number, wavelengthNm: number): number {
  return 1.22 * wavelengthNm * 1e-3 * fMm / apertureMm
}

export function defocusCircleDiameterUm(fMm: number, apertureMm: number, defocusMm: number): number {
  return apertureMm * Math.abs(defocusMm) / fMm * 1e3
}

export function paraxialRayAtSensor(
  fMm: number,
  objectMm: number,
  objectHeightMm: number,
  lensHeightMm: number,
  sensorOffsetMm: number,
): { atLens: number; afterLensSlope: number; atSensor: number } {
  const incidentSlope = (lensHeightMm - objectHeightMm) / objectMm
  const outgoingSlope = incidentSlope - lensHeightMm / fMm
  const imageMm = thinLensImageDistanceMm(fMm, objectMm)
  return {
    atLens: lensHeightMm,
    afterLensSlope: outgoingSlope,
    atSensor: lensHeightMm + outgoingSlope * (imageMm + sensorOffsetMm),
  }
}
