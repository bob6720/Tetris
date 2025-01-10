import Board from './components/Board';
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from './hooks/useTetris';
import { SHAPES } from './types';

function App() {
  const { board, startGame, isPlaying, score, upcomingBlocks, heldBlock, currentBlock } = useTetris();

  return (
    <div className="app">
      <h1>Tetris</h1>

      <div className="board">
        <Board currentBoard={board} />
      </div>

      <div className="controls-container3">
        <h2>Hold</h2>
        {heldBlock ? (
          <div className="held-block">
            {/* Render the held block's shape */}
            <div className="block">
              {SHAPES[heldBlock].shape
                .filter((row) => row.some((cell) => cell))
                .map((row, rowIndex) => (
                  <div key={rowIndex} className="row">
                    {row.map((isSet, cellIndex) => {
                      const cellClass = isSet ? heldBlock : 'hidden';
                      return (
                        <div
                          key={`${rowIndex}-${cellIndex}`}
                          className={`cell ${cellClass}`}
                        ></div>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <p>No block held</p>
        )}
      </div>

      <div className="controls">
        <div className="controls-container">
          <h2>Score: {score}</h2>
          {isPlaying ? (
            <UpcomingBlocks upcomingBlocks={upcomingBlocks} />
          ) : (
            <button onClick={startGame}>New Game</button>
          )}
        </div>

        <div className="controls-container2">
          <h2>Controls</h2>
          <p>Left Arrow: Move left</p>
          <p>Right Arrow: Move right</p>
          <p>Down Arrow: Move down</p>
          <p>Up Arrow: Rotate block</p>
          <p>Space: Hold block</p>
        </div>
      </div>
    </div>
  );
}

export default App;
