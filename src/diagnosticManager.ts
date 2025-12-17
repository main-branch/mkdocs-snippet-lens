import * as vscode from 'vscode';
import { SnippetDetector } from './snippetDetector';
import { PathResolver } from './pathResolver';
import { SnippetLocator } from './snippetLocator';
import { createDiagnosticInfos, DiagnosticSeverity } from './diagnosticCreator';

/**
 * Converts a DiagnosticSeverity enum to VS Code DiagnosticSeverity
 * @param severity The diagnostic severity from our enum
 * @returns VS Code DiagnosticSeverity
 */
function toVSCodeSeverity(severity: DiagnosticSeverity): vscode.DiagnosticSeverity {
  switch (severity) {
  case DiagnosticSeverity.Warning:
    return vscode.DiagnosticSeverity.Warning;
  case DiagnosticSeverity.Error:
    return vscode.DiagnosticSeverity.Error;
  default:
    // Fallback for unexpected severities; TypeScript enums can receive invalid values at runtime.
    return vscode.DiagnosticSeverity.Error;
  }
}

/**
 * Manages diagnostic errors for snippet references
 */
export class DiagnosticManager {
  private diagnostics: vscode.DiagnosticCollection;

  constructor(
    private detector: SnippetDetector,
    private resolver: PathResolver,
    private locator: SnippetLocator
  ) {
    this.diagnostics = vscode.languages.createDiagnosticCollection('mkdocs-snippet-lens');
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

    // Create diagnostic infos using the testable function
    const diagnosticInfos = createDiagnosticInfos(locations, (path: string) =>
      this.resolver.resolve(path, document.uri.fsPath, workspaceRoot, basePath)
    );

    // Convert to VS Code Diagnostics
    const vscodeDiagnostics: vscode.Diagnostic[] = diagnosticInfos.map(info => {
      const start = document.positionAt(info.startOffset);
      const end = document.positionAt(info.endOffset);
      const range = new vscode.Range(start, end);

      const diagnostic = new vscode.Diagnostic(
        range,
        info.message,
        toVSCodeSeverity(info.severity)
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
