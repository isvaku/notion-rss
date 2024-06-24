export default function splitString(input: string): string[] {
  const MAX_LENGTH = 20;

  function splitIntoChunks(str: string, maxLength: number): string[] {
    if (!str) return [];

    const words = str.split(" ");
    const chunks: string[] = [];
    let currentChunk = "";
    let currentLength = 0;

    words.forEach((word) => {
      if (word.length > maxLength) {
        const parts = word.match(new RegExp(`.{1,${maxLength}}`, "g")) || [];
        if (currentChunk.length > 0) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
          currentLength = 0;
        }
        chunks.push(...parts);
        return;
      }

      if (currentLength + word.length + 1 <= maxLength) {
        currentChunk += (currentChunk ? " " : "") + word;
        currentLength += word.length + 1;
        return;
      }

      chunks.push(currentChunk.trim());
      currentChunk = word;
      currentLength = word.length;
    });

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  let parts = input.split("\n");
  if (parts.every((part) => part.length <= MAX_LENGTH)) {
    return parts;
  }

  const result: string[] = [];
  parts.forEach((part) => {
    if (part.length > MAX_LENGTH) {
      result.push(...splitIntoChunks(part, MAX_LENGTH));
    } else {
      result.push(part);
    }
  });

  return result;
}
