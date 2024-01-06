type SudokuProps = {
  value: number | null;
  index: number;
  isSelected: Boolean;
  onClick: (index: number) => void;
  borderStyle: string;
  selectedRow: number;
  selectedCol: number;
  currentValue: number | null;
  highlight: boolean;
  initialEmpty: boolean;
};

const SudokuCell = ({
  value,
  index,
  onClick: onChange,
  isSelected,
  borderStyle,
  selectedRow,
  selectedCol,
  currentValue,
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
  } else if (!initialEmpty && isInSameBox) {
    backgroundColor = 'bg-[#FFE280]/40';
  } else if (highlight) {
    backgroundColor = 'bg-yellow-400/50';
  } else if (
    (!initialEmpty && row === selectedRow) ||
    (!initialEmpty && col === selectedCol)
  ) {
    backgroundColor = 'bg-[#FFE280]/40';
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
      className={`cursor-pointer flex justify-center items-center w-8 h-8 md:w-14 md:h-14 md:text-xl ${borderStyle} ${backgroundColor}`}
      onClick={handleClick}
    >
      {value}
    </div>
  );
};

export default SudokuCell;
