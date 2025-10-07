/**
 * Token counting utilities using tiktoken
 */

import { encoding_for_model } from 'tiktoken';

const encoder = encoding_for_model('gpt-3.5-turbo');

export function countTokens(text: string): number {
  try {
    const tokens = encoder.encode(text);
    return tokens.length;
  } catch (error) {
    // Fallback: rough estimate (1 token ≈ 4 characters)
    return Math.ceil(text.length / 4);
  }
}

export function truncateToTokens(text: string, maxTokens: number): string {
  const tokens = encoder.encode(text);

  if (tokens.length <= maxTokens) {
    return text;
  }

  const truncatedTokens = tokens.slice(0, maxTokens);
  return new TextDecoder().decode(encoder.decode(truncatedTokens));
}

export function freeEncoder(): void {
  encoder.free();
}
