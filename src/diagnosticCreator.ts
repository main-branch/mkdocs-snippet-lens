import { SnippetLocation } from './snippetLocator';

/**
 * Severity level for diagnostics
 */
export enum DiagnosticSeverity {
  Error = 'error',
  Warning = 'warning'
}

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
 * Maps a DiagnosticSeverity enum value to a numeric severity level
 * that can be compared for priority ordering
 * @param severity The diagnostic severity
 * @returns Numeric severity level (higher = more severe)
 */
export function getSeverityLevel(severity: DiagnosticSeverity): number {
  switch (severity) {
  case DiagnosticSeverity.Error:
    return 2;
  case DiagnosticSeverity.Warning:
    return 1;
  default: {
    // Defensive programming: handle unexpected enum values at runtime
    const exhaustiveCheck: never = severity as never;
    throw new Error(`Unsupported DiagnosticSeverity: ${String(exhaustiveCheck)}`);
  }
  }
}

/**
 * Creates diagnostic information for snippet locations that have issues
 * @param locations Array of snippet locations
 * @param resolvePath Function to resolve snippet paths
 * @returns Array of diagnostic information for snippets with issues (errors or warnings)
 */
export function createDiagnosticInfos(
  locations: SnippetLocation[],
  resolvePath: (path: string) => string | undefined
): DiagnosticInfo[] {
  const diagnostics: DiagnosticInfo[] = [];

  for (const location of locations) {
    // Check for ambiguous patterns first
    if (location.snippet.isAmbiguous && location.snippet.ambiguousReason) {
      diagnostics.push({
        message: location.snippet.ambiguousReason,
        startOffset: location.startOffset,
        endOffset: location.endOffset,
        severity: DiagnosticSeverity.Warning,
      });
    }

    // Check for missing files
    const resolvedPath = resolvePath(location.snippet.path);
    if (!resolvedPath) {
      diagnostics.push({
        message: `Snippet file not found: '${location.snippet.path}'`,
        startOffset: location.startOffset,
        endOffset: location.endOffset,
        severity: DiagnosticSeverity.Error,
      });
    }
  }

  return diagnostics;
}
