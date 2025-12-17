import * as assert from 'assert';
import * as vscode from 'vscode';
import { PreviewManager } from '../../previewManager';
import { SnippetDetector } from '../../snippetDetector';
import { PathResolver } from '../../pathResolver';
import { SnippetLocator } from '../../snippetLocator';

suite('PreviewManager', () => {
  test('should be enabled by default', () => {
    const detector = new SnippetDetector();
    const resolver = new PathResolver(() => true);
    const locator = new SnippetLocator();
    const readFile = () => 'test content';

    const manager = new PreviewManager(detector, resolver, locator, readFile);

    assert.strictEqual(manager.isEnabled(), true);
    manager.dispose();
  });

  test('should toggle enabled state', () => {
    const detector = new SnippetDetector();
    const resolver = new PathResolver(() => true);
    const locator = new SnippetLocator();
    const readFile = () => 'test content';

    const manager = new PreviewManager(detector, resolver, locator, readFile);

    assert.strictEqual(manager.isEnabled(), true);
    manager.toggle();
    assert.strictEqual(manager.isEnabled(), false);
    manager.toggle();
    assert.strictEqual(manager.isEnabled(), true);

    manager.dispose();
  });
});
