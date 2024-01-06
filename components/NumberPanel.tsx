interface NumberPanelProps {
  selectedNumber: number | null;
  handleNumberSelect: (number: number) => void;
}

const NumberPanel = ({
  selectedNumber,
  handleNumberSelect,
}: NumberPanelProps) => {
  return (
    <div className="grid gap-2 md:gap-0 grid-cols-5 md:grid md:grid-cols-3 w-full md:border border-gray-300">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
        <button
          key={num}
          className={`border aspect-square border-gray-300 w-full h-full md:text-xl ${
            selectedNumber === num ? 'bg-yellow-300' : 'bg-gray-100'
          }`}
          onClick={() => handleNumberSelect(num)}
        >
          {num}
        </button>
      ))}
    </div>
  );
};

export default NumberPanel;
