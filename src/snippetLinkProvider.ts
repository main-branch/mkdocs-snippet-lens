import * as vscode from 'vscode';
import { SnippetDetector } from './snippetDetector';
import { PathResolver } from './pathResolver';
import { SnippetLocator } from './snippetLocator';
import { createLinkInfos } from './linkCreation';

/**
 * Provides clickable links for MkDocs snippet references in markdown files
 */
export class SnippetLinkProvider implements vscode.DocumentLinkProvider {
  constructor(
    private detector: SnippetDetector,
    private resolver: PathResolver,
    private locator: SnippetLocator
  ) {}

  /**
   * Provides document links for snippet references in the document
   * @param document The document to search for snippet links
   * @returns Array of document links
   */
  provideDocumentLinks(
    document: vscode.TextDocument
  ): vscode.DocumentLink[] | undefined {
    const text = document.getText();
    const snippets = this.detector.detect(text);
    const locations = this.locator.locateSnippets(text, snippets);

    // Get workspace root and basePath from configuration
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const workspaceRoot = workspaceFolder?.uri.fsPath || '';
    const config = vscode.workspace.getConfiguration('mkdocsSnippetLens');
    const basePath = config.get<string>('basePath', '');

    // Create link infos using the testable function
    const linkInfos = createLinkInfos(locations, (path: string) =>
      this.resolver.resolve(path, document.uri.fsPath, workspaceRoot, basePath)
    );

    // Convert to VS Code DocumentLinks
    const links: vscode.DocumentLink[] = linkInfos.map(info => {
      const start = document.positionAt(info.startOffset);
      const end = document.positionAt(info.endOffset);
      const range = new vscode.Range(start, end);
      const link = new vscode.DocumentLink(range, vscode.Uri.file(info.resolvedPath));
      link.tooltip = 'Open snippet file';
      return link;
    });

    return links.length > 0 ? links : undefined;
  }
}

