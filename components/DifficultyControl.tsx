interface DifficultyControlProps {
  difficulty: GameDifficulty;
  handleDifficultyChange: (difficulty: GameDifficulty) => void;
}

const DifficultyControl = ({
  difficulty,
  handleDifficultyChange,
}: DifficultyControlProps) => {
  return (
    <div className="grid grid-cols-3 w-full md:flex md:gap-4">
      <button
        className={
          difficulty === 'easy'
            ? 'p-2 md:p-4 md:rounded bg-gray-900 text-white cursor-default'
            : 'p-2 md:p-4 bg-gray-200 md:rounded hover:bg-gray-900 hover:text-white'
        }
        onClick={() => handleDifficultyChange('easy')}
      >
        简单
      </button>
      <button
        className={
          difficulty === 'normal'
            ? 'p-2 md:p-4 md:rounded bg-gray-900 text-white cursor-default'
            : 'p-2 md:p-4 bg-gray-200 md:rounded hover:bg-gray-900 hover:text-white'
        }
        onClick={() => handleDifficultyChange('normal')}
      >
        普通
      </button>
      <button
        className={
          difficulty === 'hard'
            ? 'p-2 md:p-4 md:rounded bg-gray-900 text-white cursor-default'
            : 'p-2 md:p-4 bg-gray-200 md:rounded hover:bg-gray-900 hover:text-white'
        }
        onClick={() => handleDifficultyChange('hard')}
      >
        困难
      </button>
    </div>
  );
};

export default DifficultyControl;
