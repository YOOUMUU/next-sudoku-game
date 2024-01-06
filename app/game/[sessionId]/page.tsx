import SudokuBoard from '@/components/SudokuBoard';

const Game = () => {
  return (
    <div className="flex flex-col justify-center items-center py-16">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-8">
        数独小游戏
      </h1>
      <SudokuBoard />
    </div>
  );
};

export default Game;
