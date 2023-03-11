import { z } from 'zod'
import { MAXROW, MAXCOL } from './Binario'

/**
 * Squared/rectangular games are executed in two dimenional planes of finite dimension,
 * set maximally to 50.
 * The size of the game square should be set by the game itself
 */
const rowcolIndexSchema = z.number().max(50).positive(),
  CellCoordinateSchema = z.tuple([rowcolIndexSchema, rowcolIndexSchema])
export type RowColIndex = z.infer<typeof rowcolIndexSchema>
export type CellCoordinate = z.infer<typeof CellCoordinateSchema>

// Convention for what coordinates come first (row, col)
enum Coordinate {
  Row = 0,
  Column = 1,
}

/**
 * Rules and initial values for the game field are checked in groups of coordinates.
 * Such groups can be: a row, a column, or a game area around the cell.
 *
 * For gamefield initialisation, it is required to send to the initialiser:
 * [ [CELLRESULT[0], CoordinateCollection[0]], ...] for all CELLRESULTs.
 *
 * For rulechecks, violating patterns are detected in the CoordinateCollection, and until no violation
 * errors are present, CELLRESULTS are updated (by iteration). CoordinateCollections can be rows,
 * columns or any area defined around individual cells.
 */
const CoordinateCollectionSchema = z.array(CellCoordinateSchema)
export type CoordinateCollection = z.infer<typeof CoordinateCollectionSchema>

// HELPERS
/**
 * checks if a CoordinateCollection is a collection representing a Column
 * @param collection
 * @returns boolean
 */
export const isColumnCollection = (
  collection: CoordinateCollection
): boolean => {
  let columnCoordinates: RowColIndex[] = collection.map(
    (c) => c[Coordinate.Column]
  )
  return columnCoordinates.every(
    (val, i, arr) => val === arr[0] // all equal to the first
  )
}
/**
 * Checks if a coordinate collection is a Row.
 * @param collection
 * @returns boolean
 */
export const isRowCollection = (collection: CoordinateCollection): boolean => {
  let rowCoordinates: RowColIndex[] = collection.map((c) => c[Coordinate.Row])
  return rowCoordinates.every(
    (val, i, arr) => val === arr[0] // all equal to the first
  )
}
/**
 * Generate the row and coordinate collection for row r and col c
 * Note that we use coordinate system (1,1) in top left corner.
 * @param row
 */
export const rowCollection = (r: number): CoordinateCollection => {
  return [...Array(MAXROW).keys()].map((itm) => [r, itm + 1])
}
export const colCollection = (c: number): CoordinateCollection => {
  return [...Array(MAXROW).keys()].map((itm) => [itm + 1, c])
}

/**
 * cellPossibilities is the array containing all acceptable cellResults in the game, limited to 10.
 * CellContent is the type of allowed content in each cell.
 *
 * Main objective: uninitialised, unfound cells get all cellPossibilities initially.
 *
 * Examples:
 * + BINARIO: 0, 1 as Number
 * + TECTONIC: 1,2,3,4,5 as Number
 * + TB: "T", "B", " " as Strings of length 1
 */
const CellContentSchema = z.union([z.string().length(1), z.number().max(9)])
export type CellContent = z.infer<typeof CellContentSchema>

const CellPossibilitiesSchema = z.array(CellContentSchema).length(10)
export type CellPossibilities = z.infer<typeof CellPossibilitiesSchema>

/**
 * This leads to the following for the cells themselves:
 *
 * cell.Possibilities: the remaining possible CellContent for the cell.
 * --- The cell is considered 'found', 'fixed' or 'set' if this list is of length 1.
 * --- The cell is considered 'invalid' if this list is of length 0.
 * --- Uninitialised cells will have the full cellPossibilities as their initial cellSolution
 * The type of cellContent is therefore cellPossibilities.
 *
 * Cell.isFixed: a cell can not be changed. For instance cells from the initial game state.
 *
 * Cell.Coordinates: the coordinates of the cell
 *    --> stored in the cell, but comes from the GameField itself. This enables the GameField to
 *        be searched Gamefield[row][col]=cell
 *
 */
enum GameCell {
  Possibilities = 0,
  isFixed = 1,
  Coordinates = 2,
}
const CellFixedSchema = z.boolean()
type CellFixed = z.infer<typeof CellFixedSchema>

const CellSchema = z.tuple([
  CellPossibilitiesSchema,
  CellFixedSchema,
  CellCoordinateSchema,
])
export type Cell = z.infer<typeof CellSchema>

// HELPERS
/**
 * A cell is found if it has exactly one remaining possibility left.
 * The front-end uses this to visualize the found cells.
 * @param cell
 * @returns
 */
export const cellIsFound = (cell: Cell): boolean => {
  return cell[GameCell.Possibilities].length === 1
}
/**
 *
 * @param cell
 * @returns
 */
export const cellCanNotBeChanged = (cell: Cell): boolean => {
  return cell[GameCell.isFixed]
}

/**
 * Gamefield is a two-dimensional array with
 * [ [ ROW 0], [ROW 1], [ROW 2], etc]
 * GameField[row:RowColIndex][col:RowColIndex] returns a Cell
 */
const GameFieldSchema = z.array(z.array(CellSchema))
export type GameField = z.infer<typeof GameFieldSchema>

/**
 * cellAt returns the cell At coordinates c for a game g
 */
export const cellAt = (c: CellCoordinate, g: GameField): Cell => {
  return g[c[Coordinate.Row]][c[Coordinate.Column]]
}
/**
 * setCellAt updates the cell at coordinate c to cell in gamefield g.
 * @param c
 * @param g
 * @param cell
 */
export const setCellAt = (
  c: CellCoordinate,
  g: GameField,
  cell: Cell
): void => {
  g[c[Coordinate.Row]][c[Coordinate.Column]] = cell
}

export const createCell = (
  initialContent: CellPossibilities,
  isFixed: CellFixed,
  c: CellCoordinate
): Cell => {
  return [initialContent, isFixed, c]
}

/**
 *
 * @param cc, the collection of coordinates to check
 * @param game, the gamefield to find the cell in
 * @returns
 */
export const isCoordinateCollectionAllFound = (
  cc: CoordinateCollection,
  game: GameField
): boolean => {
  /**
   * Scan the collection coordinates of the gamefield and check if all Possibilities are exactly reduced to 1
   */
  return cc
    .map((coordinate) => {
      return cellIsFound(cellAt(coordinate, game))
    })
    .every(Boolean)
}

/**
 * initialiseGame creates a set of Cells with cellPossibilities all with length 1 (defined values).
 * Note that all other cell manipulations will happen through the front-end reactivity
 *
 * @param content: the content to add, for instance 0 for BINARIO
 * @param cc: the collection of coordinates to fill with that content
 * @param g
 * @returns void (updated gamefield)
 */
export const initializeGame = (
  content: CellContent,
  cc: CoordinateCollection,
  g: GameField
): void => {
  cc.forEach((coordinate) => {
    // create the Cell
    // TODO: enum GameCell should be used!
    let newCell: Cell = createCell(Array(content), true, coordinate)
    console.log(`Placing Cell `, newCell, ' in gamefield coordinates:')
    if (cellIsFound(newCell)) {
      console.log(
        `${coordinate[Coordinate.Row]} , ${coordinate[Coordinate.Column]}`
      )
      // add the cell to the gamefield if it is a Found cell
      setCellAt(coordinate, g, newCell)
    } else {
      console.error(
        `GameFields cannot be initialised with Cells which have several possibilities for content.`
      )
    }
  })
}

/**
 * Rules will be created as a function which will iterate over a Cell's Possibilities and its effect
 * on the validity of the gamerule in a given CoordinateCollection. It will then return
 * a boolean if the contents of the cells at those collections can be accepted.
 *
 * Examples:
 * - BINARIO columns may maximally contain 6 1s and 6 0s.
 */
const CellRuleSchema = z
  .function()
  .args(CoordinateCollectionSchema, CellSchema)
  .returns(z.boolean())
export type CellRule = z.infer<typeof CellRuleSchema>

const GameFieldRuleSchema = z
  .function()
  .args(CoordinateCollectionSchema, GameFieldSchema)
  .returns(z.boolean())
export type GameRule = z.infer<typeof GameFieldRuleSchema>
