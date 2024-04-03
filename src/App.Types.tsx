import { z } from 'zod'

// Convention for what coordinates come first (row, col)
export enum Coordinate {
  Row = 0,
  Column = 1,
}
// Convention on the GameCell tuple
export enum GameCell {
  Possibilities = 0, // the array which memorizes the remaining values for the cell
  isFixed = 1, // sets if the cell can no longer be changed. Might be overlap with Possibilities, can be used to set initial cells
  Coordinates = 2, // [row, col] of the cell
}

/**
 * Squared/rectangular games are executed in two dimenional planes of finite dimension,
 * set maximally to 50.
 * The size of the game square should be set by the game itself
 */
const rowcolIndexSchema = z.number().max(50).positive(),
  CellCoordinateSchema = z.tuple([rowcolIndexSchema, rowcolIndexSchema])
export type RowColIndex = z.infer<typeof rowcolIndexSchema>
export type CellCoordinate = z.infer<typeof CellCoordinateSchema>

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
const CellFixedSchema = z.boolean()
export type CellFixed = z.infer<typeof CellFixedSchema>

const CellSchema = z.tuple([
  CellPossibilitiesSchema,
  CellFixedSchema,
  CellCoordinateSchema,
])
export type Cell = z.infer<typeof CellSchema>

/**
 * Gamefield is a two-dimensional array with
 * [ [ ROW 0], [ROW 1], [ROW 2], etc]
 * GameField[row:RowColIndex][col:RowColIndex] returns a Cell
 */
const GameFieldSchema = z.array(z.array(CellSchema))
export type GameField = z.infer<typeof GameFieldSchema>

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

/**
 * The total set of rules to check will be in an array, with the rulechecker going over all of them
 * and storing the result in a boolean for each rule applied.
 */
const RulesSchema = z.array(z.union([CellRuleSchema, GameFieldRuleSchema]))
export type Rules = z.infer<typeof RulesSchema>

/** Gamesettings are then just the following object */
const gameSettingsSchema = z.object({
  NAME: z.string().max(20),
  CELLRESULTS: CellPossibilitiesSchema,
  MAXROW: rowcolIndexSchema,
  MAXCOL: rowcolIndexSchema,
})
export type GameSettings = z.infer<typeof gameSettingsSchema>
