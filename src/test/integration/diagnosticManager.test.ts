import * as assert from 'assert';
import * as vscode from 'vscode';

/**
 * Integration tests for DiagnosticManager
 *
 * These tests verify that the DiagnosticManager registered by the extension
 * correctly creates diagnostics for missing snippet files.
 */
suite('DiagnosticManager Integration Tests', () => {
  // Test timing constants for CI environments (especially macOS)
  const CI_TEST_TIMEOUT = 5000;
  const EDITOR_ACTIVATION_DELAY = 200;
  const MAX_DIAGNOSTIC_RETRIES = 20;
  const RETRY_INTERVAL = 150;
  const NEGATIVE_TEST_WAIT = 500;

  test('should create diagnostics for missing files', async function() {
    // Increase timeout for slower CI environments (especially macOS)
    this.timeout(CI_TEST_TIMEOUT);

    const content = '--8<-- "this-file-does-not-exist.txt"';
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });

    // Open the document in an editor to trigger diagnostics
    await vscode.window.showTextDocument(doc);

    // Give the editor a moment to fully activate
    await new Promise(resolve => setTimeout(resolve, EDITOR_ACTIVATION_DELAY));

    // Wait for diagnostics to be processed with retry logic
    let snippetDiagnostics: vscode.Diagnostic[] = [];
    for (let i = 0; i < MAX_DIAGNOSTIC_RETRIES; i++) {
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      const diagnostics = vscode.languages.getDiagnostics(doc.uri);
      snippetDiagnostics = diagnostics.filter(d => d.source === 'mkdocs-snippet-lens');
      if (snippetDiagnostics.length > 0) {
        break;
      }
    }

    assert.strictEqual(snippetDiagnostics.length, 1);
    assert.strictEqual(snippetDiagnostics[0].message, "Snippet file not found: 'this-file-does-not-exist.txt'");
    assert.strictEqual(snippetDiagnostics[0].severity, vscode.DiagnosticSeverity.Error);
  });

  test('should create multiple diagnostics for multiple missing files', async function() {
    // Increase timeout for slower CI environments (especially macOS)
    this.timeout(CI_TEST_TIMEOUT);

    const content = `--8<-- "missing-file-1.txt"
--8<-- "missing-file-2.txt"`;
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });

    // Open the document in an editor to trigger diagnostics
    await vscode.window.showTextDocument(doc);

    // Give the editor a moment to fully activate
    await new Promise(resolve => setTimeout(resolve, EDITOR_ACTIVATION_DELAY));

    // Wait for diagnostics to be processed with retry logic
    let snippetDiagnostics: vscode.Diagnostic[] = [];
    for (let i = 0; i < MAX_DIAGNOSTIC_RETRIES; i++) {
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      const diagnostics = vscode.languages.getDiagnostics(doc.uri);
      snippetDiagnostics = diagnostics.filter(d => d.source === 'mkdocs-snippet-lens');
      if (snippetDiagnostics.length === 2) {
        break;
      }
    }

    assert.strictEqual(snippetDiagnostics.length, 2);
    assert.ok(snippetDiagnostics[0].message.includes('missing-file-1.txt'));
    assert.ok(snippetDiagnostics[1].message.includes('missing-file-2.txt'));
  });

  test('should ignore non-markdown documents', async function() {
    // Increase timeout for slower CI environments (especially macOS)
    this.timeout(CI_TEST_TIMEOUT);

    const content = '--8<-- "missing.txt"';
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: 'plaintext'
    });

    // Open the document in an editor to trigger diagnostics
    await vscode.window.showTextDocument(doc);

    // Wait to ensure diagnostics would have been processed if they were going to be
    await new Promise(resolve => setTimeout(resolve, NEGATIVE_TEST_WAIT));

    const diagnostics = vscode.languages.getDiagnostics(doc.uri);
    const snippetDiagnostics = diagnostics.filter(d => d.source === 'mkdocs-snippet-lens');

    assert.strictEqual(snippetDiagnostics.length, 0);
  });

  test('should create warning diagnostic for ambiguous multi-range pattern', async function() {
    // Increase timeout for slower CI environments (especially macOS)
    this.timeout(CI_TEST_TIMEOUT);

    const content = '--8<-- "file.md:1:3,invalid"';
    const doc = await vscode.workspace.openTextDocument({
      content,
      language: 'markdown'
    });

    // Open the document in an editor to trigger diagnostics
    await vscode.window.showTextDocument(doc);

    // Give the editor a moment to fully activate
    await new Promise(resolve => setTimeout(resolve, EDITOR_ACTIVATION_DELAY));

    // Wait for diagnostics to be processed with retry logic
    let snippetDiagnostics: vscode.Diagnostic[] = [];
    for (let i = 0; i < MAX_DIAGNOSTIC_RETRIES; i++) {
      await new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
      const diagnostics = vscode.languages.getDiagnostics(doc.uri);
      snippetDiagnostics = diagnostics.filter(d => d.source === 'mkdocs-snippet-lens');
      if (snippetDiagnostics.length > 0) {
        break;
      }
    }

    // We expect 2 diagnostics:
    // 1. Ambiguous pattern warning
    // 2. File not found error (because file.md doesn't exist)
    assert.strictEqual(snippetDiagnostics.length, 2);

    // Find the ambiguous pattern warning
    const ambiguousWarning = snippetDiagnostics.find(d =>
      d.message.includes('Multi-range pattern') && d.severity === vscode.DiagnosticSeverity.Warning
    );
    assert.ok(ambiguousWarning, 'Should have ambiguous pattern warning');
    assert.strictEqual(ambiguousWarning.message, 'Multi-range pattern contains non-numeric part: "invalid"');

    // Find the file not found error
    const fileNotFoundError = snippetDiagnostics.find(d =>
      d.message.includes('Snippet file not found') && d.severity === vscode.DiagnosticSeverity.Error
    );
    assert.ok(fileNotFoundError, 'Should have file not found error');
  });
});
