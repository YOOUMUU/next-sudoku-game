import CreateSudokuBoard from '@/components/CreateSudokuBoard';

const page = () => {
  return (
    <div className="flex flex-col justify-center items-center py-16">
      <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4 md:mb-8">
        创建你的数独小游戏
      </h1>
      <CreateSudokuBoard />
    </div>
  );
};

export default page;
