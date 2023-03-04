import { CellPossibilities, CellContent, RowColIndex, CellRule, GameRule } from './AppTypes'

/** Specific game data
 * cellResult is the unique string which will be set to a cell.
 * cellResult is the result of rule application
 * It excludes the representation for unknownCell (of type cellUnknown).
 *
 */
export const CELLRESULTS: CellPossibilities = [0, 1]
export const MAXROW: RowColIndex = 12
export const MAXCOL: RowColIndex = 12
