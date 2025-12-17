/**
 * Information about a detected snippet reference
 */
export interface SnippetInfo {
  /** The file path referenced in the snippet */
  path: string;
  /** The section name referenced in the snippet, if any */
  section?: string;
  /** The line range referenced in the snippet, if any */
  lines?: { start: number; end: number };
  /** Multiple line ranges referenced in the snippet, if any */
  lineRanges?: Array<{ start: number; end: number }>;
}

/**
 * Detects MkDocs snippet syntax (--8<--) in markdown text
 */
export class SnippetDetector {
  /**
   * Detects snippet references in the given text
   * @param text The text to search for snippets
   * @returns Array of detected snippets
   */
  detect(text: string): SnippetInfo[] {
    const pattern = /--8<--\s+["']([^"']+)["']/g;
    const snippets: SnippetInfo[] = [];
    let match;

    while ((match = pattern.exec(text)) !== null) {
      // match[1] is the path, possibly with :section or :start:end or :start:end,start:end
      const ref = match[1];

      // Try to match multiple line ranges pattern (numeric:numeric,numeric:numeric...)
      // Note: If this validation fails, the code will fall through to the section pattern
      // matcher below. This means invalid multi-range patterns like "file.md:1:3,invalid"
      // will be parsed as a section reference instead of a multi-range reference (path="file.md:1", section="3,invalid").
      // This fallback behavior can result in unexpected parsing for malformed multi-range
      // input where the user likely intended a multi-range but made a typo. However, it
      // allows the extension to continue functioning rather than failing entirely.
      const multiRangeMatch = ref.match(/^(.*?):(.+)$/);
      if (multiRangeMatch && multiRangeMatch[2].includes(',')) {
        const path = multiRangeMatch[1];
        const rangesStr = multiRangeMatch[2];
        const rangeParts = rangesStr.split(',');
        const ranges: Array<{ start: number; end: number }> = [];

        // Validate each range part is in numeric:numeric format
        let allRangesValid = true;
        for (const part of rangeParts) {
          const rangeMatch = part.match(/^(\d+):(\d+)$/);
          if (rangeMatch) {
            ranges.push({ start: parseInt(rangeMatch[1], 10), end: parseInt(rangeMatch[2], 10) });
          } else {
            // Invalid range part found - will fall back to section pattern below
            allRangesValid = false;
            break;
          }
        }

        if (allRangesValid && ranges.length > 0) {
          snippets.push({ path, lineRanges: ranges });
          continue;
        }
        // If validation failed, fall through to try section pattern next
      }

      // Try to match line range pattern (numeric:numeric)
      const lineRangeMatch = ref.match(/^(.*?):(\d+):(\d+)$/);
      if (lineRangeMatch) {
        snippets.push({
          path: lineRangeMatch[1],
          lines: { start: parseInt(lineRangeMatch[2], 10), end: parseInt(lineRangeMatch[3], 10) }
        });
        continue;
      }

      // Try to match section pattern (non-numeric identifier)
      const sectionMatch = ref.match(/^(.*?):([^:\/]+)$/);
      if (sectionMatch) {
        snippets.push({ path: sectionMatch[1], section: sectionMatch[2] });
      } else {
        snippets.push({ path: ref });
      }
    }

    return snippets;
  }
}
