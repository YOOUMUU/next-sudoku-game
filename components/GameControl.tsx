interface SudokuControlProps {
  validateSolution: () => Boolean;
  resetGame: () => void;
}

const SudokuControl = ({ validateSolution, resetGame }: SudokuControlProps) => {
  return (
    <div className="grid grid-cols-2 md:flex md:flex-col w-full gap-2 md:gap-4 justify-center">
      <button
        className="p-2 md:p-4 bg-green-500 text-white md:text-xl hover:bg-gray-900 hover:text-white rounded"
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
        className="p-2 md:p-4 bg-gray-200 md:text-xl hover:bg-gray-900 hover:text-white rounded"
        onClick={() => resetGame()}
      >
        新游戏
      </button>
    </div>
  );
};

export default SudokuControl;
