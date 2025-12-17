import { SnippetInfo } from './snippetDetector';

/**
 * Information about a snippet's location in text
 */
export interface SnippetLocation {
  snippet: SnippetInfo;
  startOffset: number;
  endOffset: number;
  lineEndOffset: number; // Position after the closing quote for decorations
}

/**
 * Finds the positions of snippets in text
 */
export class SnippetLocator {
  /**
   * Locates all snippets in the given text with their positions
   * @param text The text to search
   * @param snippets The snippets detected in the text
   * @returns Array of snippet locations with start/end offsets
   */
  locateSnippets(text: string, snippets: SnippetInfo[]): SnippetLocation[] {
    const locations: SnippetLocation[] = [];
    const usedPositions = new Set<number>();

    for (const snippet of snippets) {
      // Build the full reference string (path + optional section/line range)
      let fullRef = snippet.path;
      if (snippet.section) {
        fullRef += ':' + snippet.section;
      } else if (snippet.lines) {
        fullRef += ':' + snippet.lines.start + ':' + snippet.lines.end;
      } else if (snippet.lineRanges) {
        fullRef += ':' + snippet.lineRanges.map(r => `${r.start}:${r.end}`).join(',');
      }

      // Try double quotes first
      const doubleQuotePattern = `--8<-- "${fullRef}"`;
      const singleQuotePattern = `--8<-- '${fullRef}'`;

      let index = -1;
      let searchStart = 0;

      // Find the next unused occurrence
      while (true) {
        // Try double quotes
        let foundIndex = text.indexOf(doubleQuotePattern, searchStart);

        if (foundIndex === -1) {
          // Try single quotes
          foundIndex = text.indexOf(singleQuotePattern, searchStart);
        }

        if (foundIndex === -1) {
          // No more occurrences found
          break;
        }

        if (!usedPositions.has(foundIndex)) {
          // Found an unused occurrence
          index = foundIndex;
          usedPositions.add(foundIndex);
          break;
        }

        // This position was already used, search from next position
        searchStart = foundIndex + 1;
      }

      if (index !== -1) {
        // Calculate offset to just the path (skip '--8<-- "' or "--8<-- '")
        const startOffset = index + 8; // Length of '--8<-- "' or "--8<-- '"
        // End offset is at the end of the path, not including the quote (for link underline)
        const endOffset = startOffset + snippet.path.length;
        // Line end is after the closing quote (for decorations)
        const lineEndOffset = endOffset + 1;

        locations.push({
          snippet,
          startOffset,
          endOffset,
          lineEndOffset
        });
      }
    }

    return locations;
  }
}
