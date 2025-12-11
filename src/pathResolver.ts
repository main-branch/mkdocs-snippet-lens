import * as path from 'path';
import * as fs from 'fs';

/**
 * Resolves file paths for snippet references using a defined precedence order
 */
export class PathResolver {
	/**
	 * Creates a new PathResolver
	 * @param fileExistsSync Function to check if a file exists (defaults to fs.existsSync)
	 */
	constructor(private fileExistsSync: (path: string) => boolean = fs.existsSync) {}

	/**
	 * Resolves a snippet file path to an absolute path
	 * @param snippetPath The path from the snippet reference
	 * @param markdownFilePath Absolute path to the markdown file containing the snippet
	 * @param workspaceRoot Absolute path to the workspace root
	 * @param basePath Optional base path from configuration
	 * @returns Absolute path to the snippet file, or undefined if not found
	 */
	resolve(
		snippetPath: string,
		markdownFilePath: string,
		workspaceRoot: string,
		basePath: string
	): string | undefined {
		// 1. If path is absolute, use as-is
		if (path.isAbsolute(snippetPath)) {
			return snippetPath;
		}

		// 2. Try relative to markdown file's directory
		const markdownDir = path.dirname(markdownFilePath);
		const relativeToMarkdown = path.join(markdownDir, snippetPath);
		if (this.fileExistsSync(relativeToMarkdown)) {
			return relativeToMarkdown;
		}

		// 3. Try relative to workspace root
		const relativeToWorkspace = path.join(workspaceRoot, snippetPath);
		if (this.fileExistsSync(relativeToWorkspace)) {
			return relativeToWorkspace;
		}

		// 4. Try relative to basePath if provided
		if (basePath) {
			const relativeToBasePath = path.join(basePath, snippetPath);
			if (this.fileExistsSync(relativeToBasePath)) {
				return relativeToBasePath;
			}
		}

		// File not found in any location
		return undefined;
	}
}
