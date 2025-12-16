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
			const multiRangeMatch = ref.match(/^(.*?):(.+)$/);
			if (multiRangeMatch && multiRangeMatch[2].includes(',')) {
				const path = multiRangeMatch[1];
				const rangesStr = multiRangeMatch[2];
				const rangeParts = rangesStr.split(',');
				const ranges: Array<{ start: number; end: number }> = [];

				let allRangesValid = true;
				for (const part of rangeParts) {
					const rangeMatch = part.match(/^(\d+):(\d+)$/);
					if (rangeMatch) {
						ranges.push({ start: parseInt(rangeMatch[1], 10), end: parseInt(rangeMatch[2], 10) });
					} else {
						allRangesValid = false;
						break;
					}
				}

				if (allRangesValid && ranges.length > 0) {
					snippets.push({ path, lineRanges: ranges });
					continue;
				}
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
