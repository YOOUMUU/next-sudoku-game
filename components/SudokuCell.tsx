type SudokuProps = {
  value: number | null;
  index: number;
  isSelected: Boolean;
  onChange: (index: number) => void;
  borderStyle: string;
  selectedRow: number;
  selectedCol: number;
  currentValue: number | null;
  highlightError: boolean;
  highlight: boolean;
  initialEmpty: boolean;
};

const SudokuCell = ({
  value,
  index,
  onChange,
  isSelected,
  borderStyle,
  selectedRow,
  selectedCol,
  currentValue,
  highlightError,
  highlight,
  initialEmpty,
}: SudokuProps) => {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const isInSameBox =
    Math.floor(row / 3) === Math.floor(selectedRow / 3) &&
    Math.floor(col / 3) === Math.floor(selectedCol / 3);

  let backgroundColor = '';

  if (isSelected) {
    backgroundColor = 'bg-yellow-400/60';
  } else if (highlight) {
    backgroundColor = 'bg-yellow-200/60';
  } else if (row === selectedRow || col === selectedCol) {
    backgroundColor = 'bg-yellow-100/60';
  } else if (isInSameBox) {
    backgroundColor = 'bg-yellow-50/60';
  } else if (!initialEmpty) {
    backgroundColor = 'bg-gray-200';
  }

  const handleClick = () => {
    onChange(index);
  };

  return (
    <div
      className={`flex justify-center items-center w-8 h-8 ${borderStyle} ${backgroundColor}`}
      onClick={handleClick}
    >
      {value}
    </div>
  );
};

export default SudokuCell;
