interface SudokuControlProps {
  setGameStatus: (status: GameStatus) => void;
  validateSolution: () => Boolean;
  resetGame: () => void;
  gameStatus: GameStatus;
}

const SudokuControl = ({
  setGameStatus,
  validateSolution,
  resetGame,
  gameStatus,
}: SudokuControlProps) => {
  return (
    <div className="grid grid-cols-2 md:flex md:flex-col w-full gap-2 md:gap-4 justify-center">
      <button
        className={`p-2 md:p-4 md:text-xl rounded ${
          gameStatus !== 'processing'
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-green-500 text-white hover:bg-gray-900 hover:text-white'
        }`}
        onClick={() => {
          const isCorrect = validateSolution();
          if (isCorrect) {
            setGameStatus('win');
          } else {
            setGameStatus('failed');
          }
        }}
        disabled={gameStatus !== 'processing'}
      >
        提交
      </button>
      <button
        className="p-2 md:p-4 bg-gray-200 md:text-xl hover:bg-gray-900 hover:text-white rounded"
        onClick={() => resetGame()}
      >
        新游戏
      </button>
    </div>
  );
};

export default SudokuControl;
