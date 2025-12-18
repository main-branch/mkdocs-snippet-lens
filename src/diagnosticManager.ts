import * as vscode from 'vscode';
import { SnippetDetector } from './snippetDetector';
import { PathResolver } from './pathResolver';
import { SnippetLocator } from './snippetLocator';
import { createDiagnosticInfos } from './diagnosticCreator';
import { DiagnosticSeverity, resolveDiagnosticSeverity } from './severityResolver';
import { readMkdocsConfig } from './mkdocsConfigReader';

/**
 * Manages diagnostic errors for snippet references
 */
export class DiagnosticManager {
  private diagnostics: vscode.DiagnosticCollection;
  private mkdocsCheckPaths: boolean = false;

  constructor(
    private detector: SnippetDetector,
    private resolver: PathResolver,
    private locator: SnippetLocator
  ) {
    this.diagnostics = vscode.languages.createDiagnosticCollection('mkdocs-snippet-lens');
  }

  /**
   * Loads MkDocs configuration and caches check_paths setting
   */
  async loadMkdocsConfig(workspaceRoot: string): Promise<void> {
    const mkdocsConfig = await readMkdocsConfig(workspaceRoot);
    this.mkdocsCheckPaths = mkdocsConfig?.checkPaths ?? false;
  }

  /**
   * Updates diagnostics for a document
   */
  updateDiagnostics(document: vscode.TextDocument): void {
    if (document.languageId !== 'markdown') {
      return;
    }

    const text = document.getText();
    const snippets = this.detector.detect(text);
    const locations = this.locator.locateSnippets(text, snippets);

    // Get workspace root and basePath from configuration
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(document.uri);
    const workspaceRoot = workspaceFolder?.uri.fsPath || '';
    const config = vscode.workspace.getConfiguration('mkdocsSnippetLens');
    const basePath = config.get<string>('basePath', '');
    const strictMode = config.get<string>('strictMode', 'auto');

    // Determine diagnostic severity
    const severity = resolveDiagnosticSeverity(strictMode, this.mkdocsCheckPaths);

    // Create diagnostic infos using the testable function
    const diagnosticInfos = createDiagnosticInfos(
      locations,
      (path: string) => this.resolver.resolve(path, document.uri.fsPath, workspaceRoot, basePath),
      severity
    );

    // Convert to VS Code Diagnostics
    const vscodeDiagnostics: vscode.Diagnostic[] = diagnosticInfos.map(info => {
      const start = document.positionAt(info.startOffset);
      const end = document.positionAt(info.endOffset);
      const range = new vscode.Range(start, end);
      const vscodeSeverity = info.severity === DiagnosticSeverity.Error
        ? vscode.DiagnosticSeverity.Error
        : vscode.DiagnosticSeverity.Warning;
      const diagnostic = new vscode.Diagnostic(
        range,
        info.message,
        vscodeSeverity
      );
      diagnostic.source = 'mkdocs-snippet-lens';
      return diagnostic;
    });

    this.diagnostics.set(document.uri, vscodeDiagnostics);
  }

  /**
   * Clears diagnostics for a document
   */
  clearDiagnostics(document: vscode.TextDocument): void {
    this.diagnostics.delete(document.uri);
  }

  /**
   * Disposes of resources
   */
  dispose(): void {
    this.diagnostics.dispose();
  }
}
