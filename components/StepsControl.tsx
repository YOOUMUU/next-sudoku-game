interface StepsControlProps {
  undo: () => void;
}

const StepsControl = ({ undo }: StepsControlProps) => {
  return (
    <div className="md:grid md:grid-cols-2 gap-3 w-full">
      <button
        className="w-full p-2 bg-gray-200 flex justify-center items-center rounded"
        onClick={undo}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 14 4 9l5-5" />
          <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
        </svg>
      </button>
    </div>
  );
};

export default StepsControl;
