interface SudokuControlProps {
  difficulty: GameDifficulty;
  validateSolution: () => Boolean;
  resetGame: () => void;
  handleDifficultyChange: (string: GameDifficulty) => void;
}

const SudokuControl = ({
  difficulty,
  validateSolution,
  resetGame,
  handleDifficultyChange,
}: SudokuControlProps) => {
  return (
    <div className="flex gap-3 justify-center">
      <button
        className="mt-4 p-2 bg-gray-200 hover:bg-gray-900 hover:text-white rounded"
        onClick={() => {
          const isCorrect = validateSolution();
          if (isCorrect) {
            alert('恭喜，您成功解开了数独！');
          } else {
            alert('解答错误，请再试一次。');
          }
        }}
      >
        提交
      </button>
      <button
        className="mt-4 p-2 bg-gray-200 hover:bg-gray-900 hover:text-white rounded"
        onClick={() => resetGame()}
      >
        新游戏
      </button>
      <button
        className={
          difficulty === 'easy'
            ? 'mt-4 p-2 rounded bg-gray-900 text-white cursor-default'
            : 'mt-4 p-2 bg-gray-200 rounded hover:bg-gray-900 hover:text-white'
        }
        onClick={() => handleDifficultyChange('easy')}
      >
        简单
      </button>
      <button
        className={
          difficulty === 'normal'
            ? 'mt-4 p-2 rounded bg-gray-900 text-white cursor-default'
            : 'mt-4 p-2 bg-gray-200 rounded hover:bg-gray-900 hover:text-white'
        }
        onClick={() => handleDifficultyChange('normal')}
      >
        普通
      </button>
      <button
        className={
          difficulty === 'hard'
            ? 'mt-4 p-2 rounded bg-gray-900 text-white cursor-default'
            : 'mt-4 p-2 bg-gray-200 rounded hover:bg-gray-900 hover:text-white'
        }
        onClick={() => handleDifficultyChange('hard')}
      >
        困难
      </button>
    </div>
  );
};

export default SudokuControl;
