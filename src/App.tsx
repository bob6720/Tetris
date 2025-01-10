import Board from './components/Board';
import UpcomingBlocks from './components/UpcomingBlocks';
import { useTetris } from './hooks/useTetris';

function App() {
  const { board, startGame, isPlaying, score, upcomingBlocks } = useTetris();

  return (
    <div className="app">
      <h1>Tetris</h1>
  

  
      <div className="board">
        <Board currentBoard={board} />
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
          <p>Space: Drop block</p>
          <p>Shift: Hold block</p>
        </div>
      </div>
    </div>
  );
}

export default App;