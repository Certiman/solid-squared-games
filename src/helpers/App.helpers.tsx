// HELPERS serve the game engine to use the type objects.
/**
 * Gamefield [row, col] = Cell
 *          Col 0     Col 1     Col 2 ...
 *  Row 0   [0,0]     [0,1]
 *  Row 1
 *  ...
 *                    Cell [ [remaining Cell Possibilities], isFixed boolean, [copy of cell coordinate] ]
 */

import {
  Cell,
  CellContent,
  CellCoordinate,
  CellFixed,
  CellPossibilities,
  Coordinate,
  CoordinateCollection,
  GameCell,
  GameField,
  GameSettings,
  RowColIndex,
} from '../App.Types';

/**
 * checks if a CoordinateCollection is a collection representing a Column
 * @param collection
 * @returns boolean
 */
export const isColumnCollection = (collection: CoordinateCollection): boolean => {
  let columnCoordinates: RowColIndex[] = collection.map((c) => c[Coordinate.Column]);
  return columnCoordinates.every(
    (val, i, arr) => val === arr[0] // all equal to the first
  );
};

/**
 * Checks if a coordinate collection is a Row.
 * @param collection
 * @returns boolean
 */
export const isRowCollection = (collection: CoordinateCollection): boolean => {
  let rowCoordinates: RowColIndex[] = collection.map((c) => c[Coordinate.Row]);
  return rowCoordinates.every(
    (val, i, arr) => val === arr[0] // all equal to the first
  );
};

/**
 * Generate the row and coordinate collection for row r and col c
 * Note that we use coordinate system (0,0) in top left corner.
 * @param row
 * @param maxRow, maxCol come from the GameSettings object
 */
export const rowCollection = (r: number, maxRow: RowColIndex): CoordinateCollection => {
  return [...Array(maxRow).keys()].map((itm) => [r, itm]);
};
export const colCollection = (c: number, maxCol: RowColIndex): CoordinateCollection => {
  return [...Array(maxCol).keys()].map((itm) => [itm, c]);
};

/**
 * A cell is found if it has exactly one remaining possibility left.
 * The front-end uses this to visualize the found cells.
 * @param cell
 * @returns
 */
export const cellIsFound = (cell: Cell): boolean => {
  return cell[GameCell.Possibilities].length === 1;
};
/**
 *
 * @param cell
 * @returns
 */
export const cellCanNotBeChanged = (cell: Cell): boolean => {
  return cell[GameCell.isFixed];
};
/**
 * cellAt returns the cell At coordinates c for a game g
 */
export const cellAt = (c: CellCoordinate, g: GameField): Cell => {
  return g[c[Coordinate.Row]][c[Coordinate.Column]];
};

/**
 * setCellAt updates the cell at coordinate c to cell in gamefield g.
 * @param c
 * @param g
 * @param cell
 */
export const setCellAt = (c: CellCoordinate, g: GameField, cell: Cell): void => {
  g[c[Coordinate.Row]][c[Coordinate.Column]] = cell;
};

export const createCell = (
  initialContent: CellPossibilities,
  isFixed: CellFixed,
  c: CellCoordinate
): Cell => {
  return [initialContent, isFixed, c];
};

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
      return cellIsFound(cellAt(coordinate, game));
    })
    .every(Boolean);
};

/**
 * initialiseGame creates a set of Cells with cellPossibilities all with length 1 (defined values).
 * Note that all other cell manipulations will happen through the front-end reactivity
 *
 * @param content : array of cells with set solutions at set coordinates
 * @param settings : settings for the gamefield
 * @returns gamefield
 */
export const initializeGame = (content: Cell[], settings: GameSettings): GameField => {
  // fill the initial GameField with the game's CellResults
  // Start with [ array of MAXROW rows ] and map all of them to certain cell contents
  let g = new Array(settings.MAXROW).map((row, colIndex) => {
    let colCoords = new Array(settings.MAXCOL); // [array of MAXCOL columns]
    return colCoords.map((col, rowIndex) => {
      return createCell(settings.CELLRESULTS, false, [rowIndex, colIndex]);
    });
  });

  // update the gamefield with the known gameresults
  let coordinatesForRow = content.forEach((cell) => {
    // create the Cell
    console.log(`Placing Cell `, cell, ' in gamefield coordinates:');
    let coordinate = cell[GameCell.Coordinates];
    if (cellIsFound(cell)) {
      console.log(`${coordinate[Coordinate.Row]} , ${coordinate[Coordinate.Column]}`);
      // add the cell to the gamefield if it is a Found cell
      setCellAt(coordinate, g, cell);
    } else {
      console.error(
        `GameFields cannot be initialised with Cells which have several possibilities for content.`
      );
    }
  });

  return g;
};
