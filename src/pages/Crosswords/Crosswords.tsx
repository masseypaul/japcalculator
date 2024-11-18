import React, { useState } from "react";

import {
  coloration_background,
  find_position_selected_word,
  borderColor,
  update_validation_grid,
} from "../../utils/utils-crosswords";
import { grid as gridContent } from "../../utils/content_grid";

interface CrosswordsCellProps {
  value: string;
  onChange: (value: string) => void;
  selectedCell?: boolean;
  row: number;
  col: number;
  handleCellClick: (row: number, col: number) => void;
}

export const CrosswordsCell: React.FC<CrosswordsCellProps> = ({
  value,
  onChange,
  selectedCell,
}) => {
  return (
    <input
      type="text"
      readOnly
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="Crosswords-cell"
      style={{
        color: "black",
        textAlign: "center",
        width: "25px",
        height: "25px",
        border: selectedCell ? "2px solid red" : "1px solid black",
        backgroundColor: value.length >= 1 ? "white" : "black",
      }}
      maxLength={2}
    />
  );
};

// Only use what is below for the Crosswords
// Above is an old version kept here for no particular reason
export const CrosswordsGrid = () => {
  // variable used for the crosswords
  // cell selected by the user (with red border)
  const [selectedCell, setSelectedCell] = useState<number[]>([-1, -1]);
  // the orientation selected (double click to change)
  const [orientation, setOrientation] = useState<number>(1);
  // start and end cell of the selected word based on what the user have selected an the orientation
  const [startCell, setStartCell] = useState<number[]>(selectedCell);
  const [endCell, setEndCell] = useState<number[]>(selectedCell);
  // the definition of the selected word
  const [selectedDefinition, setSelectedDefinition] = useState<string>("");

  // grid with the answer of the crosswords
  const grid: string[][] = gridContent;
  // height and width of the grid
  const gridWidth = grid[0].length;
  const gridHeight = grid.length;
  let blackCell = 0;
  // the grid to be displayed for the user (what he write) initialized with empty cells
  const [gridUser, setGridUser] = useState<string[][]>(
    grid.map((line) =>
      line.map((cell) => {
        if (cell === "0") {
          blackCell += 1;
          return "space";
        }
        return "";
      })
    )
  );

  // validation of the grid to be display
  const [showValidation, setShowValidation] = useState<boolean>(false);
  // grid of correct cell
  const [correctCells, setCorrectCells] = useState([
    { x: 1, y: 2, isCorrect: true },
    { x: 2, y: 2, isCorrect: false },
  ]);
  // grid entirelly correct to display a congrats message
  const [isGridTotallyCorrect, setIsGridTotallyCorrect] =
    useState<boolean>(false);

  // function that is activate when the user press some arrow key to change cell
  const move_cell = (direction: string) => {
    setSelectedCell(([row, col]) => {
      let newRow = row;
      let newCol = col;

      if (direction === "ArrowUp" && grid[Math.max(0, row - 1)][col] !== "0") {
        newRow = Math.max(0, row - 1);
      }
      if (
        direction === "ArrowDown" &&
        grid[Math.min(gridHeight - 1, row + 1)][col] !== "0"
      ) {
        newRow = Math.min(gridHeight - 1, row + 1);
      }
      if (
        direction === "ArrowLeft" &&
        grid[row][Math.max(0, col - 1)] !== "0"
      ) {
        newCol = Math.max(0, col - 1);
      }
      if (
        direction === "ArrowRight" &&
        grid[row][Math.min(gridWidth - 1, col + 1)] !== "0"
      ) {
        newCol = Math.min(gridWidth - 1, col + 1);
      }

      find_position_selected_word(
        grid,
        orientation,
        [newRow, newCol],
        gridHeight,
        gridWidth,
        setStartCell,
        setEndCell,
        setSelectedDefinition
      );

      return [newRow, newCol];
    });
  };

  // when the user modify the content of the grid
  const handleGridChanges = (row: number, col: number, value: string) => {
    setGridUser((prevGrid) =>
      prevGrid.map((gridRow, rowIndex) =>
        rowIndex === row
          ? gridRow.map((cell, colIndex) => (colIndex === col ? value : cell))
          : gridRow
      )
    );
  };

  // function that deals all the interactions using the keyboard (moving cell, editing grid content)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      move_cell(e.key);
      e.preventDefault();
    }
    const isLetter = /^[a-zA-Z]$/.test(e.key);
    const isSpace = e.key === " ";
    const isBackSpace = e.key === "Backspace";
    if (isLetter && !isGridTotallyCorrect) {
      handleGridChanges(selectedCell[0], selectedCell[1], e.key.toUpperCase());
      setShowValidation(false);
      if (orientation === 0) {
        move_cell("ArrowRight");
      } else {
        move_cell("ArrowDown");
      }
    } else if (isSpace) {
      setOrientation((prevOrientation) => {
        const newOrientation = 1 - prevOrientation;

        find_position_selected_word(
          grid,
          newOrientation,
          selectedCell,
          gridHeight,
          gridWidth,
          setStartCell,
          setEndCell,
          setSelectedDefinition
        );

        return newOrientation;
      });
    } else if (isBackSpace && !isGridTotallyCorrect) {
      handleGridChanges(selectedCell[0], selectedCell[1], "");
      setShowValidation(false);
      if (orientation === 0) {
        move_cell("ArrowLeft");
      } else {
        move_cell("ArrowUp");
      }
    }
  };

  const handleValidationButton = (e: any) => {
    setShowValidation(!showValidation);
    update_validation_grid(
      grid,
      gridUser,
      setIsGridTotallyCorrect,
      blackCell,
      setCorrectCells
    );
  };

  // function that deals interaction using the mouse
  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col] !== "0") {
      if (row === selectedCell[0] && col === selectedCell[1]) {
        setOrientation((prevOrientation) => {
          const newOrientation = 1 - prevOrientation;

          find_position_selected_word(
            grid,
            newOrientation,
            [row, col],
            gridHeight,
            gridWidth,
            setStartCell,
            setEndCell,
            setSelectedDefinition
          );

          return newOrientation;
        });
      } else {
        setSelectedCell([row, col]);
        find_position_selected_word(
          grid,
          orientation,
          [row, col],
          gridHeight,
          gridWidth,
          setStartCell,
          setEndCell,
          setSelectedDefinition
        );
      }
    }
  };

  return (
    <>
      <div
        style={{
          backgroundColor: "white",
          color: "black",
          paddingTop: "100px",
          paddingLeft: "50px",
        }}
      >
        {isGridTotallyCorrect ? (
          <>Bravo, la grille est complète</>
        ) : (
          <>
            Definition :{" "}
            {selectedDefinition.length > 0
              ? selectedDefinition
              : "no definition"}
          </>
        )}
      </div>
      <div
        style={{
          backgroundColor: "white",
          color: "black",
          paddingLeft: "50px",
        }}
      >
        <button
          onClick={handleValidationButton}
          style={{
            color: "white",
            backgroundColor: "blue",
            paddingLeft: "5px",
            paddingRight: "5px",
          }}
        >
          Valider les lettres
        </button>
      </div>

      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridWidth}, 25px)`,
          gridTemplateRows: `repeat(${gridHeight}, 25px)`,
          gap: "3px",
          outline: "none",
          paddingTop: "10px",
          paddingLeft: "100px",
          paddingBottom: "50px",
          backgroundColor: "white",
        }}
      >
        {Array.from({ length: gridHeight }).map((_, row) =>
          Array.from({ length: gridWidth }).map((_, col) => (
            <div
              key={`${row}-${col}`}
              onClick={() => handleCellClick(row, col)}
              style={{
                width: "25px",
                height: "25px",
                display: "flex",
                boxSizing: "border-box",
                alignItems: "center",
                justifyContent: "center",
                border: borderColor([row, col], selectedCell),
                color: "black",
                backgroundColor:
                  gridUser[row][col] === "space"
                    ? "black"
                    : coloration_background(
                        [row, col],
                        orientation,
                        startCell,
                        endCell,
                        showValidation,
                        correctCells
                      ),
                cursor: "pointer",
              }}
            >
              {gridUser[row][col] === "space" ? "" : gridUser[row][col]}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default CrosswordsGrid;
