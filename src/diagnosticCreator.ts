import { SnippetLocation } from './snippetLocator';

/**
 * Information about a diagnostic error for a snippet
 */
export interface DiagnosticInfo {
	message: string;
	startOffset: number;
	endOffset: number;
}

/**
 * Creates diagnostic information for snippet locations that have errors
 * @param locations Array of snippet locations
 * @param resolvePath Function to resolve snippet paths
 * @returns Array of diagnostic information for snippets with errors
 */
export function createDiagnosticInfos(
	locations: SnippetLocation[],
	resolvePath: (path: string) => string | undefined
): DiagnosticInfo[] {
	const diagnostics: DiagnosticInfo[] = [];

	for (const location of locations) {
		const resolvedPath = resolvePath(location.snippet.path);
		if (!resolvedPath) {
			diagnostics.push({
				message: `Snippet file not found: '${location.snippet.path}'`,
				startOffset: location.startOffset,
				endOffset: location.endOffset,
			});
		}
	}

	return diagnostics;
}
