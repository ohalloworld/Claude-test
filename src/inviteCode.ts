// Small embedded word lists so invite codes are short, memorable, and easy
// to read over text/voice — while still having enough entropy (roughly
// 60 * 60 * 10000 ≈ 36M combinations) that they're not practically
// guessable, given our security model treats "knows the code" as "has
// access" (see firestore.rules).
const ADJECTIVES = [
  'amber', 'brave', 'calm', 'coral', 'dusty', 'eager', 'fuzzy', 'gentle', 'golden', 'happy',
  'ivory', 'jolly', 'keen', 'lively', 'mellow', 'misty', 'noble', 'olive', 'plucky', 'quiet',
  'rosy', 'sunny', 'tidy', 'upbeat', 'vivid', 'warm', 'wispy', 'zesty', 'bold', 'crisp',
  'dandy', 'earthy', 'fresh', 'giddy', 'honest', 'jaunty', 'kind', 'lucky', 'merry', 'nifty',
];

const NOUNS = [
  'otter', 'panda', 'fox', 'heron', 'koala', 'lemur', 'mole', 'newt', 'owl', 'puffin',
  'quail', 'robin', 'seal', 'tapir', 'urchin', 'vole', 'wren', 'yak', 'zebra', 'badger',
  'crane', 'dove', 'egret', 'finch', 'goose', 'hare', 'ibis', 'jay', 'kite', 'lark',
  'moth', 'ferret', 'ocelot', 'pika', 'quokka', 'rabbit', 'stork', 'tiger', 'urial', 'vixen',
];

function randomFrom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export function generateInviteCode(): string {
  const digits = String(Math.floor(1000 + Math.random() * 9000));
  return `${randomFrom(ADJECTIVES)}-${randomFrom(NOUNS)}-${digits}`;
}

export function normalizeInviteCode(code: string): string {
  return code.trim().toLowerCase().replace(/\s+/g, '-');
}
