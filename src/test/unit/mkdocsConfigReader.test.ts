import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { readMkdocsConfig, setLogger } from '../../mkdocsConfigReader';

describe('MkdocsConfigReader', () => {
  let tempDir: string;
  let logMessages: string[] = [];

  beforeEach(() => {
    // Create temporary directory for test files
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'mkdocs-test-'));

    // Set up test logger to capture log messages
    logMessages = [];
    setLogger({
      log: (message: string) => logMessages.push(message),
    });
  });

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  describe('setLogger', () => {
    it('should allow setting a custom logger', async () => {
      const customMessages: string[] = [];
      setLogger({
        log: (message: string) => customMessages.push(message),
      });

      const configContent = `invalid: [unclosed`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      await readMkdocsConfig(tempDir);

      assert.strictEqual(customMessages.length, 1);
      assert.ok(customMessages[0].includes('Failed to parse'));

      // Reset logger for other tests
      logMessages = [];
      setLogger({
        log: (message: string) => logMessages.push(message),
      });
    });
  });

  describe('readMkdocsConfig', () => {
    it('should return undefined when mkdocs.yml does not exist', async () => {
      const config = await readMkdocsConfig(tempDir);
      assert.strictEqual(config, undefined);
    });

    it('should parse mkdocs.yml with check_paths: false', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets:
      check_paths: false
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should parse mkdocs.yml with check_paths: true', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets:
      check_paths: true
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, true);
    });

    it('should default to false when check_paths is not specified', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should default to false when snippets extension is not configured', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - toc
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should try mkdocs.yaml as fallback', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets:
      check_paths: true
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yaml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, true);
    });

    it('should prefer mkdocs.yml over mkdocs.yaml', async () => {
      const ymlContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets:
      check_paths: true
`;
      const yamlContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets:
      check_paths: false
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), ymlContent);
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yaml'), yamlContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, true); // Should use .yml
    });

    it('should return undefined for invalid YAML', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - invalid: [unclosed
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.strictEqual(config, undefined);

      // Verify that parse error was logged
      assert.strictEqual(logMessages.length, 1);
      assert.ok(logMessages[0].includes('Failed to parse mkdocs.yml'));
      assert.ok(logMessages[0].includes('Falling back to default'));
    });

    it('should handle snippets extension with string format', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should handle snippets extension with dict format and nested config', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets:
      base_path: docs
      check_paths: true
      auto_append:
        - includes/abbreviations.md
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, true);
    });

    it('should handle markdown_extensions as undefined', async () => {
      const configContent = `
site_name: Test Site
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should handle snippets extension with null config object', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - pymdownx.snippets: null
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should handle config that is null', async () => {
      const configContent = `null`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should handle config that is a string', async () => {
      const configContent = `"just a string"`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });

    it('should handle extension object with non-snippets keys', async () => {
      const configContent = `
site_name: Test Site
markdown_extensions:
  - toc:
      permalink: true
  - admonition
`;
      fs.writeFileSync(path.join(tempDir, 'mkdocs.yml'), configContent);

      const config = await readMkdocsConfig(tempDir);
      assert.notStrictEqual(config, undefined);
      assert.strictEqual(config?.checkPaths, false);
    });
  });
});
