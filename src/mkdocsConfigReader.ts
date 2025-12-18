import * as fs from 'fs/promises';
import * as path from 'path';
import * as yaml from 'js-yaml';

/**
 * Logger interface for error reporting
 */
export interface Logger {
  log(message: string): void;
}

/* c8 ignore next 3 */
let logger: Logger = {
  log: (message: string) => console.error(message),
};

/**
 * MkDocs configuration relevant to snippet behavior
 */
export interface MkdocsConfig {
  /**
   * Whether MkDocs snippets extension will check paths strictly.
   * Corresponds to the `check_paths` option in pymdownx.snippets config.
   * Defaults to false (MkDocs default behavior).
   */
  checkPaths: boolean;
}

/**
 * Sets the logger for error reporting
 * @param newLogger Logger instance to use for error reporting
 */
export function setLogger(newLogger: Logger): void {
  logger = newLogger;
}

/**
 * Reads and parses MkDocs configuration file to extract snippet-related settings.
 *
 * @param workspaceRoot - Absolute path to the workspace root directory
 * @returns MkdocsConfig object if config file found and parsed successfully, undefined otherwise
 *
 * Tries the following files in order:
 * 1. mkdocs.yml
 * 2. mkdocs.yaml
 *
 * Extracts the `check_paths` setting from:
 * markdown_extensions → pymdownx.snippets → check_paths
 *
 * Returns undefined (caller should fall back to warnings) if:
 * - Config file not found
 * - YAML parse fails
 *
 * Returns MkdocsConfig with checkPaths: false (matches MkDocs default) if:
 * - Config file found but snippets extension not configured
 * - Config file found but check_paths not specified in snippets extension
 */
export async function readMkdocsConfig(workspaceRoot: string): Promise<MkdocsConfig | undefined> {
  // Try mkdocs.yml first, then mkdocs.yaml
  const configPaths = [
    path.join(workspaceRoot, 'mkdocs.yml'),
    path.join(workspaceRoot, 'mkdocs.yaml'),
  ];

  for (const configPath of configPaths) {
    try {
      // Check if file exists
      await fs.access(configPath);

      // Read file content
      const content = await fs.readFile(configPath, 'utf8');
      const config = yaml.load(content) as any;

      // Extract check_paths from markdown_extensions
      const checkPaths = extractCheckPaths(config);

      return {
        checkPaths,
      };
    } catch (error) {
      // Check if it's a file not found error (ENOENT)
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        // File doesn't exist - try next path
        continue;
      }

      // It's a parse error or other error - log it
      const fileName = path.basename(configPath);
      /* c8 ignore next */
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.log(
        `[MkDocs Config] Failed to parse ${fileName}: ${errorMessage}. Falling back to default (warnings).`
      );

      // Return undefined to fall back to warnings
      return undefined;
    }
  }

  // Config file not found
  return undefined;
}

/**
 * Extracts check_paths setting from parsed MkDocs config.
 * Returns false (MkDocs default) if not found or not specified.
 */
function extractCheckPaths(config: any): boolean {
  if (!config || typeof config !== 'object') {
    return false;
  }

  const extensions = config.markdown_extensions;
  if (!Array.isArray(extensions)) {
    return false;
  }

  // Find pymdownx.snippets extension
  for (const ext of extensions) {
    if (typeof ext === 'string' && ext === 'pymdownx.snippets') {
      // String format - no config specified, use default
      return false;
    }

    if (typeof ext === 'object' && ext !== null) {
      // Dict format - check if it's the snippets extension
      const extName = Object.keys(ext)[0];
      if (extName === 'pymdownx.snippets') {
        const snippetsConfig = ext[extName];
        if (typeof snippetsConfig === 'object' && snippetsConfig !== null) {
          // Check if check_paths is explicitly set
          if ('check_paths' in snippetsConfig) {
            return snippetsConfig.check_paths === true;
          }
        }
        // Extension found but check_paths not specified - use default
        return false;
      }
    }
  }

  // Extension not found - use default
  return false;
}
