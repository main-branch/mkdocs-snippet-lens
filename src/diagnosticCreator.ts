import { SnippetLocation } from './snippetLocator';
import { DiagnosticSeverity } from './severityResolver';

/**
 * Information about a diagnostic issue for a snippet (error or warning)
 */
export interface DiagnosticInfo {
  message: string;
  startOffset: number;
  endOffset: number;
  severity: DiagnosticSeverity;
}

/**
 * Creates diagnostic information for snippet locations that have issues
 * @param locations Array of snippet locations
 * @param resolvePath Function to resolve snippet paths
 * @param severity Diagnostic severity to apply (Error or Warning)
 * @returns Array of diagnostic information for snippets with issues (errors or warnings)
 */
export function createDiagnosticInfos(
  locations: SnippetLocation[],
  resolvePath: (path: string) => string | undefined,
  severity: DiagnosticSeverity
): DiagnosticInfo[] {
  const diagnostics: DiagnosticInfo[] = [];

  for (const location of locations) {
    // Check for ambiguous patterns first
    if (location.snippet.isAmbiguous && location.snippet.ambiguousReason) {
      diagnostics.push({
        message: location.snippet.ambiguousReason,
        startOffset: location.startOffset,
        endOffset: location.endOffset,
        severity,
      });
    }

    // Check for missing files
    const resolvedPath = resolvePath(location.snippet.path);
    if (!resolvedPath) {
      diagnostics.push({
        message: `Snippet file not found: '${location.snippet.path}'`,
        startOffset: location.startOffset,
        endOffset: location.endOffset,
        severity,
      });
    }
  }

  return diagnostics;
}
