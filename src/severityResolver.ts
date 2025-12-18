/**
 * Diagnostic severity levels that can be applied to snippets
 */
export enum DiagnosticSeverity {
  Error = 'error',
  Warning = 'warning',
}

/**
 * Determines the appropriate diagnostic severity based on strictMode setting and MkDocs check_paths config
 *
 * @param strictMode - The strictMode setting from VS Code configuration ("auto", "true", "false", or undefined)
 * @param checkPaths - The check_paths value from mkdocs.yml (true = strict, false = forgiving)
 * @returns DiagnosticSeverity.Error or DiagnosticSeverity.Warning
 *
 * Logic:
 * - strictMode "true": Always Error (red squiggles)
 * - strictMode "false": Always Warning (yellow squiggles)
 * - strictMode "auto" or undefined: Use check_paths value
 *   - check_paths true: Error (matches MkDocs strict mode)
 *   - check_paths false: Warning (matches MkDocs default)
 * - Invalid strictMode: Treated as "auto"
 */
export function resolveDiagnosticSeverity(
  strictMode: string | undefined,
  checkPaths: boolean
): DiagnosticSeverity {
  // Explicit override modes
  if (strictMode === 'true') {
    return DiagnosticSeverity.Error;
  }
  if (strictMode === 'false') {
    return DiagnosticSeverity.Warning;
  }

  // Auto mode (or undefined/invalid) - use check_paths from MkDocs config
  // This includes the case where strictMode is "auto" or any invalid value
  return checkPaths ? DiagnosticSeverity.Error : DiagnosticSeverity.Warning;
}
