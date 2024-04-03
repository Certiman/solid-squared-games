import { GameSettings, Rules, GameRule, CoordinateCollection, GameField, Cell } from './App.Types';
import { createCell } from './helpers/App.helpers';

/** Specific game data
 * cellResult is the unique string which will be set to a cell.
 * cellResult is the result of rule application
 * It excludes the representation for unknownCell (of type cellUnknown).
 *
 */
export const binarioGameSettings: GameSettings = {
  NAME: 'Binario',
  CELLRESULTS: [0, 1],
  MAXROW: 12,
  MAXCOL: 12,
};

export const binarioExample: Cell[] = [
  createCell(['1'], true, [0,0] ),
  createCell(['1'], true, [3,0] ),
  createCell(['1'], true, [4,0] ),
  createCell(['1'], true, [1,4] ),
  createCell(['1'], true, [1,10] ),
  createCell(['1'], true, [2,0] ),
  createCell(['1'], true, [2,1] ),
  createCell(['1'], true, [3,0] ),
  createCell(['1'], true, [3,11] ),
  createCell(['1'], true, [4,2] ),
  createCell(['1'], true, [5,0] ),
  createCell(['1'], true, [5,2] ),
];

const binarioColumnRule: GameRule = (column: CoordinateCollection, gf: GameField): boolean => {
  /** This rule assures that the number of ones and zeros in a column cannot be more than 6 each */
  return false;
};

export const binarioRules: Rules = [binarioColumnRule];
