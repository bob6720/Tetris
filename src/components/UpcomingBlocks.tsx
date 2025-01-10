import { Block, SHAPES } from '../types';

interface Props {
  upcomingBlocks: Block[];
  heldBlock: Block | null; // Add prop for heldBlock
}

function UpcomingBlocks({ upcomingBlocks, heldBlock }: Props) {
  return (
    <div className="upcoming">
      {/* Render the held block if it exists */}
      <div className="held-block-container">
        <h3>Held Block</h3>
        {heldBlock ? (
          <div className="block">
            {SHAPES[heldBlock]?.shape.filter((row) =>
              row.some((cell) => cell)
            ).map((row, rowIndex) => (
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
        ) : (
          <p>No block held</p>
        )}
      </div>

      {/* Render the upcoming blocks */}
      <div className="upcoming-blocks">
        <h3>Upcoming Blocks</h3>
        {upcomingBlocks.map((block, blockIndex) => {
          const shape = SHAPES[block]?.shape.filter((row) =>
            row.some((cell) => cell)
          );
          
          // In case SHAPES[block] is undefined, we return null
          if (!shape) {
            return null;
          }

          return (
            <div key={blockIndex}>
              {shape.map((row, rowIndex) => {
                return (
                  <div key={rowIndex} className="row">
                    {row.map((isSet, cellIndex) => {
                      const cellClass = isSet ? block : 'hidden';
                      return (
                        <div
                          key={`${blockIndex}-${rowIndex}-${cellIndex}`}
                          className={`cell ${cellClass}`}
                        ></div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default UpcomingBlocks;
