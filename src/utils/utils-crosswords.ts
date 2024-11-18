import { def } from "./content_grid";

export const find_position_selected_word = (
  grid: string[][],
  orientation: number,
  selectedCell: number[],
  gridHeight: number,
  gridWidth: number,
  setStartCell: React.Dispatch<React.SetStateAction<number[]>>,
  setEndCell: React.Dispatch<React.SetStateAction<number[]>>,
  setSelectedDefinition: React.Dispatch<React.SetStateAction<string>>
): void => {
  let startCellX: number = selectedCell[0];
  let startCellY: number = selectedCell[1];
  let endCellX: number = selectedCell[0];
  let endCellY: number = selectedCell[1];
  if (orientation === 1) {
    while (startCellX > 0 && grid[startCellX - 1][startCellY] !== "0") {
      startCellX -= 1;
    }
    while (endCellX < gridHeight - 1 && grid[endCellX + 1][endCellY] !== "0") {
      endCellX += 1;
    }
  } else {
    while (startCellY > 0 && grid[startCellX][startCellY - 1] !== "0") {
      startCellY -= 1;
    }
    while (endCellY < gridWidth - 1 && grid[endCellX][endCellY + 1] !== "0") {
      endCellY += 1;
    }
  }
  setStartCell([startCellX, startCellY]);
  setEndCell([endCellX, endCellY]);
  const wordSelected = find_selected_word(
    grid,
    orientation,
    [startCellX, startCellY],
    [endCellX, endCellY]
  );
  setSelectedDefinition(find_definition(wordSelected, def));
};

export const borderColor = (cell: number[], selectedCell: number[]): string => {
  if (cell[0] === selectedCell[0] && cell[1] === selectedCell[1]) {
    return "2px solid orange";
  } else {
    return "1px solid black";
  }
};

export const coloration_background = (
  cell: number[],
  orientation: number,
  startCell: number[],
  endCell: number[],
  showValidation: boolean,
  correctCells: {
    x: number;
    y: number;
    isCorrect: boolean;
  }[]
): string => {
  const correctedCell = correctCells.find(
    (correctCell) => cell[0] === correctCell.x && cell[1] === correctCell.y
  );
  if (showValidation && correctedCell) {
    if (correctedCell.isCorrect) {
      return "lightgreen";
    } else {
      return "crimson";
    }
  } else if (orientation === 0) {
    if (
      cell[0] === startCell[0] &&
      startCell[1] <= cell[1] &&
      endCell[1] >= cell[1]
    ) {
      return "lightblue";
    } else {
      return "white";
    }
  } else {
    if (
      cell[1] === startCell[1] &&
      startCell[0] <= cell[0] &&
      endCell[0] >= cell[0]
    ) {
      return "lightblue";
    } else {
      return "white";
    }
  }
};

export const find_selected_word = (
  grid: string[][],
  orientation: number,
  startCell: number[],
  endCell: number[]
): string => {
  let word: string = "";
  if (startCell[0] === -1 && startCell[1] === -1) return word;
  if (orientation === 0) {
    for (let i = startCell[1]; i <= endCell[1]; i++) {
      word += grid[startCell[0]][i];
    }
  } else {
    for (let i = startCell[0]; i <= endCell[0]; i++) {
      word += grid[i][startCell[1]];
    }
  }
  return word;
};

export const find_definition = (
  word: string,
  def: {
    word: string;
    definition: string;
  }[]
): string => {
  const wordDef = def.find((wordAndDef) => wordAndDef.word === word);
  if (wordDef) {
    return wordDef.definition;
  }
  return "";
};

export const update_validation_grid = (
  grid: string[][],
  gridUser: string[][],
  setIsGridTotallyCorrect: React.Dispatch<React.SetStateAction<boolean>>,
  blackCell: number,
  setCorrectCells: React.Dispatch<
    React.SetStateAction<
      {
        x: number;
        y: number;
        isCorrect: boolean;
      }[]
    >
  >
): void => {
  let hasNoFalse: boolean = true;
  let correctCells: {
    x: number;
    y: number;
    isCorrect: boolean;
  }[] = [];
  gridUser.forEach((row, rowIndex) =>
    row.forEach((col, colIndex) => {
      if (gridUser[rowIndex][colIndex].length === 1) {
        if (gridUser[rowIndex][colIndex] === grid[rowIndex][colIndex]) {
          correctCells.push({ x: rowIndex, y: colIndex, isCorrect: true });
        } else {
          correctCells.push({ x: rowIndex, y: colIndex, isCorrect: false });
          hasNoFalse = true;
        }
      }
    })
  );
  if (
    hasNoFalse &&
    correctCells.length === grid.length * grid[0].length - blackCell
  ) {
    setIsGridTotallyCorrect(true);
  }
  setCorrectCells(correctCells);
};
