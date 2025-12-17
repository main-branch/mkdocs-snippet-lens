/**
 * Information about a link to create
 */
export interface LinkInfo {
  path: string;
  startOffset: number;
  endOffset: number;
  resolvedPath: string;
}

/**
 * Creates link information from snippet locations and resolved paths
 * This is pure logic with no VS Code dependencies, making it testable
 */
export function createLinkInfos(
  locations: Array<{ snippet: { path: string }; startOffset: number; endOffset: number }>,
  resolvePath: (path: string) => string | undefined
): LinkInfo[] {
  const linkInfos: LinkInfo[] = [];

  for (const location of locations) {
    const resolvedPath = resolvePath(location.snippet.path);
    if (resolvedPath) {
      linkInfos.push({
        path: location.snippet.path,
        startOffset: location.startOffset,
        endOffset: location.endOffset,
        resolvedPath,
      });
    }
  }

  return linkInfos;
}
