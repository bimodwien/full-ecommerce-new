const CLOTHING_SIZE_ORDER = [
  'xs',
  's',
  'm',
  'l',
  'xl',
  'xxl',
  'xxxl',
  '4xl',
  '5xl',
];

const groupOf = (s: string) =>
  s
    .replace(/[\d/.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const firstNumber = (s: string) =>
  parseFloat((s.match(/\d+(\.\d+)?/) || [])[0] ?? '');

// Clothing sizes in size order, then by text group, then by leading number
// (so "Size 9" sorts before "Size 10").
export function compareVariants(a: string, b: string): number {
  const normA = a.trim().toLowerCase();
  const normB = b.trim().toLowerCase();

  const idxA = CLOTHING_SIZE_ORDER.indexOf(normA);
  const idxB = CLOTHING_SIZE_ORDER.indexOf(normB);
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;

  const groupA = groupOf(normA);
  const groupB = groupOf(normB);
  if (groupA !== groupB) return groupA.localeCompare(groupB);

  const numA = firstNumber(normA);
  const numB = firstNumber(normB);
  const hasNumA = !Number.isNaN(numA);
  const hasNumB = !Number.isNaN(numB);
  if (hasNumA && hasNumB) return numA - numB;
  if (hasNumA) return -1;
  if (hasNumB) return 1;
  return normA.localeCompare(normB);
}
