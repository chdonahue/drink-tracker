const getColorForCount = (count) => {
  if (count === undefined) return 'bg-gray-200';
  if (count >= 10) return 'bg-neutral-700';
  if (count >= 6) return 'bg-red-500';
  if (count >= 3) return 'bg-orange-400';
  if (count >= 1) return 'bg-yellow-400';
  if (count >= 0) return 'bg-green-300';
  return 'bg-gray-100';
};

export default getColorForCount;