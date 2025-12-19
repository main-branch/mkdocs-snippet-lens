import * as vscode from 'vscode';
import { SnippetDetector } from './snippetDetector';
import { PathResolver } from './pathResolver';
import { SnippetLocator } from './snippetLocator';
import { SnippetLinkProvider } from './snippetLinkProvider';
import { PreviewManager } from './previewManager';
import { SnippetHoverProvider } from './snippetHoverProvider';
import { DiagnosticManager } from './diagnosticManager';
import { setLogger } from './mkdocsConfigReader';
import { AsyncSerializer } from './asyncSerializer';

/**
 * Activates the mkdocs-snippet-lens extension
 */
export async function activate(context: vscode.ExtensionContext) {
  // Create output channel for logging
  const outputChannel = vscode.window.createOutputChannel('MkDocs Snippet Lens');
  context.subscriptions.push(outputChannel);

  // Set up logger for mkdocsConfigReader
  setLogger({
    log: (message: string) => outputChannel.appendLine(message),
  });

  // Create core service instances
  const detector = new SnippetDetector();
  const resolver = new PathResolver();
  const locator = new SnippetLocator();

  // Create diagnostic manager for error reporting
  const diagnosticManager = new DiagnosticManager(detector, resolver, locator);

  // Load MkDocs configuration on activation
  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (workspaceFolders && workspaceFolders.length > 0) {
    await diagnosticManager.loadMkdocsConfig(workspaceFolders[0].uri.fsPath);
  }

  // Watch for changes to mkdocs.yml/mkdocs.yaml in workspace root only
  // Use pattern without '**/' to match only root-level files
  const mkdocsWatcher = vscode.workspace.createFileSystemWatcher(
    '{mkdocs.yml,mkdocs.yaml}',
    false, // ignoreCreateEvents
    false, // ignoreChangeEvents
    false  // ignoreDeleteEvents
  );

  // Create serializer to prevent race conditions when mkdocs.yml changes rapidly
  const configReloadSerializer = new AsyncSerializer();

  // Reload config and refresh diagnostics when mkdocs config changes
  const reloadMkdocsConfig = async () => {
    await configReloadSerializer.execute(async () => {
      if (workspaceFolders && workspaceFolders.length > 0) {
        await diagnosticManager.loadMkdocsConfig(workspaceFolders[0].uri.fsPath);

        // Refresh diagnostics for all open markdown files
        vscode.window.visibleTextEditors
          .filter(editor => editor.document.languageId === 'markdown')
          .forEach(editor => {
            diagnosticManager.updateDiagnostics(editor.document);
          });
      }
    });
  };

  mkdocsWatcher.onDidCreate(reloadMkdocsConfig);
  mkdocsWatcher.onDidChange(reloadMkdocsConfig);
  mkdocsWatcher.onDidDelete(reloadMkdocsConfig);

  // Register document link provider for markdown files
  const linkProvider = new SnippetLinkProvider(detector, resolver, locator);
  const linkProviderDisposable = vscode.languages.registerDocumentLinkProvider(
    { language: 'markdown', scheme: 'file' },
    linkProvider
  );

  // Create preview manager for inline decorations
  const previewManager = new PreviewManager(detector, resolver, locator);

  // Register hover provider for snippet previews
  const hoverProvider = new SnippetHoverProvider(detector, resolver, locator);
  const hoverDisposable = vscode.languages.registerHoverProvider(
    { language: 'markdown', scheme: 'file' },
    hoverProvider
  );

  // Update previews and diagnostics when document changes
  const changeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
    if (event.document.languageId === 'markdown') {
      previewManager.updatePreviews(event.document);
      diagnosticManager.updateDiagnostics(event.document);
    }
  });

  // Update previews and diagnostics when active editor changes
  const editorDisposable = vscode.window.onDidChangeActiveTextEditor(editor => {
    if (editor && editor.document.languageId === 'markdown') {
      previewManager.updatePreviews(editor.document);
      diagnosticManager.updateDiagnostics(editor.document);
    }
  });

  // Initial preview and diagnostics for currently open markdown files
  vscode.window.visibleTextEditors
    .filter(editor => editor.document.languageId === 'markdown')
    .forEach(editor => {
      previewManager.updatePreviews(editor.document);
      diagnosticManager.updateDiagnostics(editor.document);
    });

  // Register toggle command
  const toggleCommand = vscode.commands.registerCommand(
    'mkdocs-snippet-lens.toggleAllPreviews',
    () => {
      previewManager.toggle();
      const status = previewManager.isEnabled() ? 'enabled' : 'disabled';
      vscode.window.showInformationMessage(`MkDocs Snippet Lens: Previews ${status}`);
    }
  );

  context.subscriptions.push(
    linkProviderDisposable,
    previewManager,
    hoverDisposable,
    diagnosticManager,
    changeDisposable,
    editorDisposable,
    toggleCommand,
    mkdocsWatcher
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
