import {
  ICurve
} from './types';
export * from './types';
export * from './utils';

import Fq from './fq';
import Fr from './fr';
import Fq2 from './fq2';
import Fq4 from './fq4';
import Fq12 from './fq12';
import PointG1 from './point-g1';
import PointG2 from './point-g2';

import bls12381 from './curves/bls12381';
import bn462 from './curves/bn462';

export * from './pairing';

const curves: Record<string, ICurve> =
  [bls12381, bn462].reduce(
    (map, cur) => {
      map[cur.name.toUpperCase()] = cur;
      return map;
    }, {}
  );

function findCurve(name: string): ICurve | undefined {
  return curves[name.toUpperCase()];
}

function getCurveNames(): string[] {
  return Object.keys(curves)
    .reduce((list, key) => {
      list.push(curves[key].name);
      return list;
    }, [] as string[]);
}

export {
  PointG1,
  PointG2,
  Fq,
  Fr,
  Fq2,
  Fq4,
  Fq12,
  curves,
  findCurve,
  getCurveNames
};

