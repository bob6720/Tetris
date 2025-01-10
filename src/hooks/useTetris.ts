import { useCallback, useEffect, useState } from 'react';
import { Block, BlockShape, BoardShape, EmptyCell, SHAPES } from '../types';
import { useInterval } from './useInterval';
import {
  useTetrisBoard,
  hasCollisions,
  BOARD_HEIGHT,
  getEmptyBoard,
  getRandomBlock,
} from './useTetrisBoard';

enum TickSpeed {
  Normal = 800,
  Sliding = 100,
  Fast = 50,
}

export function useTetris() {
  const [score, setScore] = useState(0);
  const [upcomingBlocks, setUpcomingBlocks] = useState<Block[]>([]);
  const [isCommitting, setIsCommitting] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tickSpeed, setTickSpeed] = useState<TickSpeed | null>(null);
  const [isShiftPressed, setIsShiftPressed] = useState(false); // Track Shift key press

  const [
    { board, droppingRow, droppingColumn, droppingBlock, droppingShape },
    dispatchBoardState,
  ] = useTetrisBoard();

  const startGame = useCallback(() => {
    const startingBlocks = [
      getRandomBlock(),
      getRandomBlock(),
      getRandomBlock(),
    ];
    setScore(0);
    setUpcomingBlocks(startingBlocks);
    setIsCommitting(false);
    setIsPlaying(true);
    setTickSpeed(TickSpeed.Normal);
    dispatchBoardState({ type: 'start' });
  }, [dispatchBoardState]);

  const commitPosition = useCallback(() => {
    if (!hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
      setIsCommitting(false);
      setTickSpeed(TickSpeed.Normal);
      return;
    }

    const newBoard = structuredClone(board) as BoardShape;
    addShapeToBoard(
      newBoard,
      droppingBlock,
      droppingShape,
      droppingRow,
      droppingColumn
    );

    let numCleared = 0;
    for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
      if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
        numCleared++;
        newBoard.splice(row, 1);
      }
    }

    const newUpcomingBlocks = structuredClone(upcomingBlocks) as Block[];
    const newBlock = newUpcomingBlocks.pop() as Block;
    newUpcomingBlocks.unshift(getRandomBlock());

    if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
      setIsPlaying(false);
      setTickSpeed(null);
    } else {
      setTickSpeed(TickSpeed.Normal);
    }
    setUpcomingBlocks(newUpcomingBlocks);
    setScore((prevScore) => prevScore + getPoints(numCleared));

    // Fixing the spread issue: Ensure both newBoard and emptyBoard are arrays
const emptyBoard = getEmptyBoard(BOARD_HEIGHT - newBoard.length);

// Ensure emptyBoard and newBoard are arrays of BoardShape
    if (Array.isArray(emptyBoard) && Array.isArray(newBoard)) {
    dispatchBoardState({
        type: 'commit',
        newBoard: [...emptyBoard, ...newBoard],  // Spread arrays correctly
        newBlock,
    });
    } else {
    console.error("Both emptyBoard and newBoard should be arrays!");
    }

    setIsCommitting(false);
  }, [
    board,
    dispatchBoardState,
    droppingBlock,
    droppingColumn,
    droppingRow,
    droppingShape,
    upcomingBlocks,
  ]);

  const getLandingPosition = useCallback(() => {
    let dropRow = droppingRow;
    while (!hasCollisions(board, droppingShape, dropRow + 1, droppingColumn)) {
      dropRow++;
    }
    return dropRow;
  }, [board, droppingColumn, droppingRow, droppingShape]);

  const gameTick = useCallback(() => {
    if (isCommitting) {
      commitPosition();
    } else if (isShiftPressed) {
      // Handle Shift (Instant Drop)
      let dropRow = getLandingPosition();
      const newBoard = structuredClone(board);
      addShapeToBoard(newBoard, droppingBlock, droppingShape, dropRow, droppingColumn);

      let numCleared = 0;
      for (let row = BOARD_HEIGHT - 1; row >= 0; row--) {
        if (newBoard[row].every((entry) => entry !== EmptyCell.Empty)) {
          numCleared++;
          newBoard.splice(row, 1);
        }
      }

      const newUpcomingBlocks = [...upcomingBlocks];
      const newBlock = newUpcomingBlocks.pop()!;
      newUpcomingBlocks.unshift(getRandomBlock());

      if (hasCollisions(board, SHAPES[newBlock].shape, 0, 3)) {
        setIsPlaying(false);
        setTickSpeed(null);
      } else {
        setTickSpeed(TickSpeed.Normal);
      }

      setUpcomingBlocks(newUpcomingBlocks);
      setScore((prevScore) => prevScore + getPoints(numCleared));

      dispatchBoardState({
        type: 'commit',
        newBoard: [...getEmptyBoard(BOARD_HEIGHT - newBoard.length), ...newBoard],
        newBlock,
      });

      setIsCommitting(false);
    } else if (hasCollisions(board, droppingShape, droppingRow + 1, droppingColumn)) {
      setTickSpeed(TickSpeed.Sliding);
      setIsCommitting(true);
    } else {
      dispatchBoardState({ type: 'drop' });
    }
  }, [
    board,
    commitPosition,
    dispatchBoardState,
    droppingColumn,
    droppingRow,
    droppingShape,
    isCommitting,
    isShiftPressed,
    upcomingBlocks,
    getLandingPosition,
  ]);

  useInterval(() => {
    if (!isPlaying) {
      return;
    }
    gameTick();
  }, tickSpeed);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    let isPressingLeft = false;
    let isPressingRight = false;
    let moveIntervalID: number | undefined;

    const updateMovementInterval = () => {
      clearInterval(moveIntervalID);
      dispatchBoardState({
        type: 'move',
        isPressingLeft,
        isPressingRight,
      });
      moveIntervalID = setInterval(() => {
        dispatchBoardState({
          type: 'move',
          isPressingLeft,
          isPressingRight,
        });
      }, 300);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return;
      }

      if (event.key === 'ArrowDown') {
        setTickSpeed(TickSpeed.Fast);
      }

      if (event.key === 'ArrowUp') {
        dispatchBoardState({
          type: 'move',
          isRotating: true,
        });
      }

      if (event.key === 'ArrowLeft') {
        isPressingLeft = true;
        updateMovementInterval();
      }

      if (event.key === 'ArrowRight') {
        isPressingRight = true;
        updateMovementInterval();
      }

      if (event.key === 'Shift') {
        setIsShiftPressed(true); // Track Shift key press
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') {
        setTickSpeed(TickSpeed.Normal);
      }

      if (event.key === 'ArrowLeft') {
        isPressingLeft = false;
        updateMovementInterval();
      }

      if (event.key === 'ArrowRight') {
        isPressingRight = false;
        updateMovementInterval();
      }

      if (event.key === ' ') {
        commitPosition();
      }

      if (event.key === 'Shift') {
        setIsShiftPressed(false); // Reset Shift key state
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      clearInterval(moveIntervalID);
      setTickSpeed(TickSpeed.Normal);
    };
  }, [dispatchBoardState, isPlaying]);

// Get the landing position of the falling block for guide rendering
const landingRow = getLandingPosition();

// Render the board with the guide (highlighting cells where the block will land)
const renderedBoard = structuredClone(board) as BoardShape;
if (isPlaying) {
  addShapeToBoard(
    renderedBoard,
    droppingBlock,
    droppingShape,
    droppingRow,
    droppingColumn
  );
}

// Highlight the cells where the block will land
for (let rowIndex = 0; rowIndex < droppingShape.length; rowIndex++) {
  for (let colIndex = 0; colIndex < droppingShape[rowIndex].length; colIndex++) {
    if (droppingShape[rowIndex][colIndex]) {
      const row = landingRow + rowIndex;
      const col = droppingColumn + colIndex;
      // Check if the cell is within the bounds of the board
      if (row < BOARD_HEIGHT) {
        // Ensure the cell is empty before highlighting (no overlap with placed blocks)
        if (renderedBoard[row][col] === EmptyCell.Empty) {
          renderedBoard[row][col] = {
            ...renderedBoard[row][col],
            highlight: true,  // Flag for highlighting
          };
        }
      }
    }
  }
}



  return {
    board: renderedBoard,
    startGame,
    isPlaying,
    score,
    upcomingBlocks,
    landingRow,  // Pass the landing row to the rendering component
  };
}

function getPoints(numCleared: number): number {
  switch (numCleared) {
    case 0:
      return 0;
    case 1:
      return 100;
    case 2:
      return 300;
    case 3:
      return 500;
    case 4:
      return 800;
    default:
      throw new Error('Unexpected number of rows cleared');
  }
}

function addShapeToBoard(
  board: BoardShape,
  droppingBlock: Block,
  droppingShape: BlockShape,
  droppingRow: number,
  droppingColumn: number
) {
  droppingShape
    .filter((row) => row.some((isSet) => isSet))
    .forEach((row: boolean[], rowIndex: number) => {
      row.forEach((isSet: boolean, colIndex: number) => {
        if (isSet) {
          board[droppingRow + rowIndex][droppingColumn + colIndex] =
            droppingBlock;
        }
      });
    });
}
