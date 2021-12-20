import { readFileSync } from 'fs';

export type Vec3 = [number, number, number];

export type Scanner = {
  located: boolean;
  point: Vec3;
  orientation: number;
  beacons: Vec3[];
};

type Orientation = (p: Vec3) => Vec3;

const Orientations: Orientation[] = [
  ([x, y, z]) => [x, y, z],
  ([x, y, z]) => [y, z, x],
  ([x, y, z]) => [z, x, y],
  ([x, y, z]) => [x, z, y],
  ([x, y, z]) => [z, y, x],
  ([x, y, z]) => [y, x, z],

  ([x, y, z]) => [-x, y, z],
  ([x, y, z]) => [y, z, -x],
  ([x, y, z]) => [z, -x, y],
  ([x, y, z]) => [-x, z, y],
  ([x, y, z]) => [z, y, -x],
  ([x, y, z]) => [y, -x, z],

  ([x, y, z]) => [x, -y, z],
  ([x, y, z]) => [-y, z, x],
  ([x, y, z]) => [z, x, -y],
  ([x, y, z]) => [x, z, -y],
  ([x, y, z]) => [z, -y, x],
  ([x, y, z]) => [-y, x, z],

  ([x, y, z]) => [x, y, -z],
  ([x, y, z]) => [y, -z, x],
  ([x, y, z]) => [-z, x, y],
  ([x, y, z]) => [x, -z, y],
  ([x, y, z]) => [-z, y, x],
  ([x, y, z]) => [y, x, -z],

  ([x, y, z]) => [-x, -y, z],
  ([x, y, z]) => [-y, z, -x],
  ([x, y, z]) => [z, -x, -y],
  ([x, y, z]) => [-x, z, -y],
  ([x, y, z]) => [z, -y, -x],
  ([x, y, z]) => [-y, -x, z],

  ([x, y, z]) => [-x, y, -z],
  ([x, y, z]) => [y, -z, -x],
  ([x, y, z]) => [-z, -x, y],
  ([x, y, z]) => [-x, -z, y],
  ([x, y, z]) => [-z, y, -x],
  ([x, y, z]) => [y, -x, -z],

  ([x, y, z]) => [x, -y, -z],
  ([x, y, z]) => [-y, -z, x],
  ([x, y, z]) => [-z, x, -y],
  ([x, y, z]) => [x, -z, -y],
  ([x, y, z]) => [-z, -y, x],
  ([x, y, z]) => [-y, x, -z],

  ([x, y, z]) => [-x, -y, -z],
  ([x, y, z]) => [-y, -z, -x],
  ([x, y, z]) => [-z, -x, -y],
  ([x, y, z]) => [-x, -z, -y],
  ([x, y, z]) => [-z, -y, -x],
  ([x, y, z]) => [-y, -x, -z],
];

const add = ([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3): Vec3 => [
  x1 + x2,
  y1 + y2,
  z1 + z2,
];

const sub = ([x1, y1, z1]: Vec3, [x2, y2, z2]: Vec3): Vec3 => [
  x1 - x2,
  y1 - y2,
  z1 - z2,
];

const toKey = ([x, y, z]: Vec3) => `${x},${y},${z}`;

export const createScanners = (data: string) => {
  const lines = data
    .split('\n')
    .filter((line) => !!line)
    .map((line) => line.trimStart().trimEnd());

  const scanners: Scanner[] = [];
  for (let lineIdx = 1; lineIdx < lines.length; ++lineIdx) {
    const beacons: Vec3[] = [];
    while (
      lineIdx < lines.length &&
      !lines[lineIdx].startsWith('--- scanner')
    ) {
      beacons.push(
        lines[lineIdx].split(',').map((number) => parseInt(number, 10)) as Vec3
      );
      lineIdx++;
    }

    scanners.push({
      located: scanners.length === 0,
      point: [0, 0, 0],
      orientation: 0,
      beacons,
    });
  }

  return scanners;
};

const readScanners = (): Scanner[] =>
  createScanners(readFileSync('./data/2021/day19.txt', 'utf-8'));

export const locateScanners = (scanners: Scanner[]) => {
  const locatedScanners = scanners.filter((scanner) => scanner.located);
  const scannersToLocate = scanners.filter((scanner) => !scanner.located);

  while (scannersToLocate.length > 0) {
    for (
      let locatedIdx = 0;
      locatedIdx < locatedScanners.length;
      ++locatedIdx
    ) {
      const located = locatedScanners[locatedIdx];
      toLocateLoop: for (
        let toLocateIdx = scannersToLocate.length - 1;
        toLocateIdx >= 0;
        toLocateIdx--
      ) {
        const toLocate = scannersToLocate[toLocateIdx];
        for (let rotIdx = 0; rotIdx < Orientations.length; ++rotIdx) {
          const orientedBeacons = toLocate.beacons.map((beacon) =>
            Orientations[rotIdx](beacon)
          );
          const relativeDistances: Record<string, number> = {};
          for (const refBeacon of located.beacons) {
            for (const orientedBeacon of orientedBeacons) {
              const offset: Vec3 = sub(refBeacon, orientedBeacon);
              const key = toKey(offset);
              relativeDistances[key] = (relativeDistances[key] ?? 0) + 1;

              if (relativeDistances[key] >= 12) {
                locatedScanners.push({
                  located: true,
                  point: add(located.point, offset),
                  beacons: orientedBeacons,
                  orientation: 0,
                });
                scannersToLocate.splice(toLocateIdx, 1);
                continue toLocateLoop;
              }
            }
          }
        }
      }
    }
  }

  return locatedScanners;
};

export const countBeacons = (scanners: Scanner[]) => {
  const uniquePoints = new Set<string>();
  scanners.forEach((scanner) => {
    scanner.beacons.forEach((beacon) =>
      uniquePoints.add(toKey(add(scanner.point, beacon)))
    );
  });
  return uniquePoints.size;
};

const day19 = () => {
  const scanners = readScanners();
  const located = locateScanners(scanners);
  return countBeacons(located);
};

export default day19;
