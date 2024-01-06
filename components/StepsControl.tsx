interface StepsControlProps {
  goToPrev: () => void;
  goToNext: () => void;
  gameStatus: GameStatus;
}

const StepsControl = ({
  goToPrev,
  goToNext,
  gameStatus,
}: StepsControlProps) => {
  return (
    <div className="grid grid-cols-2 gap-2 md:gap-4 w-full">
      <button
        className="w-full p-2 text-gray-900 bg-gray-200 flex justify-center items-center rounded"
        onClick={goToPrev}
      >
        <svg
          className="w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 15h-6v4l-7-7 7-7v4h6v6z" />
        </svg>
      </button>
      <button
        className={`w-full p-2 flex justify-center items-center rounded ${
          gameStatus === 'processing'
            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
            : 'bg-gray-200 text-gray-900'
        }`}
        onClick={goToNext}
        disabled={gameStatus === 'processing'}
      >
        <svg
          className="w-6"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 9h6V5l7 7-7 7v-4H6V9z" />
        </svg>
      </button>
    </div>
  );
};

export default StepsControl;
