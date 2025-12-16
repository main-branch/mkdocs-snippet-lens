import { PathResolver } from './pathResolver';
import { SnippetLocation } from './snippetLocator';
import { formatForInlineDisplay } from './inlineFormatter';

/**
 * Creates preview content for a snippet location
 * @param location The snippet location to create preview for
 * @param documentPath The path of the markdown document
 * @param workspaceRoot The workspace root path
 * @param basePath The configured base path for snippets
 * @param maxLines Maximum number of lines to show in preview
 * @param maxChars Maximum number of characters to show in preview
 * @param resolver The path resolver to use
 * @param readFile Function to read file contents
 * @returns The formatted preview content or undefined if file can't be read
 */
export function createPreviewContent(
	location: SnippetLocation,
	documentPath: string,
	workspaceRoot: string,
	basePath: string,
	maxLines: number,
	maxChars: number,
	resolver: PathResolver,
	readFile: (path: string) => string
): string | undefined {
	const resolvedPath = resolver.resolve(
		location.snippet.path,
		documentPath,
		workspaceRoot,
		basePath
	);

	if (!resolvedPath) {
		return undefined;
	}

	try {
		let content = readFile(resolvedPath);

		// Extract section if specified
		if (location.snippet.section) {
			const extracted = extractSection(content.toString(), location.snippet.section);
			if (extracted) {
				content = extracted;
			}
		}

		// Extract line range if specified
		if (location.snippet.lines) {
			const extracted = extractLineRange(content.toString(), location.snippet.lines.start, location.snippet.lines.end);
			content = extracted;
		}

		// Extract multiple line ranges if specified
		if (location.snippet.lineRanges) {
			const extracted = extractMultipleLineRanges(content.toString(), location.snippet.lineRanges);
			content = extracted;
		}

		return formatForInlineDisplay(content.toString(), maxLines, maxChars);
	} catch (error) {
		return undefined;
	}
}

/**
 * Extracts a named section from content
 * @param content The full file content
 * @param sectionName The name of the section to extract
 * @returns The extracted section content or undefined if not found
 */
function extractSection(content: string, sectionName: string): string | undefined {
	const lines = content.split('\n');
	const startMarker = `--8<-- [start:${sectionName}]`;
	const endMarker = `--8<-- [end:${sectionName}]`;

	let startIndex = -1;
	let endIndex = -1;

	for (let i = 0; i < lines.length; i++) {
		if (lines[i].trim() === startMarker) {
			startIndex = i + 1;
		} else if (lines[i].trim() === endMarker && startIndex !== -1) {
			endIndex = i;
			break;
		}
	}

	if (startIndex !== -1 && endIndex !== -1) {
		return lines.slice(startIndex, endIndex).join('\n');
	}

	return undefined;
}

/**
 * Extracts a line range from content (1-indexed, inclusive)
 * @param content The full file content
 * @param start The starting line number (1-indexed)
 * @param end The ending line number (1-indexed, inclusive)
 * @returns The extracted line range
 */
function extractLineRange(content: string, start: number, end: number): string {
	const lines = content.split('\n');
	// Convert 1-indexed to 0-indexed and make end inclusive
	return lines.slice(start - 1, end).join('\n');
}

/**
 * Extracts multiple line ranges from content (1-indexed, inclusive)
 * @param content The full file content
 * @param ranges Array of line ranges to extract
 * @returns The concatenated extracted line ranges
 */
function extractMultipleLineRanges(content: string, ranges: Array<{ start: number; end: number }>): string {
	const lines = content.split('\n');
	const extractedLines: string[] = [];

	for (const range of ranges) {
		// Convert 1-indexed to 0-indexed and make end inclusive
		const rangeLines = lines.slice(range.start - 1, range.end);
		extractedLines.push(...rangeLines);
	}

	return extractedLines.join('\n');
}
