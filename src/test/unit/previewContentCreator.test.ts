import { describe, it } from 'mocha';
import * as assert from 'assert';
import { createPreviewContent } from '../../previewContentCreator';
import { PathResolver } from '../../pathResolver';
import { SnippetLocation } from '../../snippetLocator';

describe('PreviewContentCreator', () => {
	describe('createPreviewContent', () => {
		it('should create formatted preview content for valid snippet', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () => 'Line 1\nLine 2\nLine 3';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, 'Line 1 ⏎ Line 2 ⏎ Line 3');
		});

		it('should return undefined when path cannot be resolved', () => {
			const location: SnippetLocation = {
				snippet: { path: 'nonexistent.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => false);
			const readFile = () => 'content';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, undefined);
		});

		it('should return undefined when file read throws error', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () => {
				throw new Error('File not found');
			};

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, undefined);
		});

		it('should apply maxLines truncation', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () => 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				3,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, 'Line 1 ⏎ Line 2 ⏎ Line 3 ⏎ ... (2 more lines)');
		});

		it('should apply maxChars truncation', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () => 'This is a very long line that should be truncated';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				20,
				resolver,
				readFile
			);

			assert.strictEqual(result, 'This is a very long ...');
		});

		it('should handle empty file content', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () => '';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, '');
		});

		it('should use basePath when resolving paths', () => {
			const location: SnippetLocation = {
				snippet: { path: 'snippets/test.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			let resolvedWithBasePath = false;
			const resolver = new PathResolver(() => true);
			// Override resolve to check basePath is used
			const originalResolve = resolver.resolve.bind(resolver);
			resolver.resolve = (path, docPath, wsRoot, base) => {
				if (base === '/custom/base') {
					resolvedWithBasePath = true;
				}
				return originalResolve(path, docPath, wsRoot, base);
			};
			const readFile = () => 'content';

			createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'/custom/base',
				20,
				200,
				resolver,
				readFile
			);

			assert.ok(resolvedWithBasePath, 'Should use basePath when resolving');
		});

		it('should handle multi-line content with both truncations', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () => 'First line content\nSecond line content\nThird line content\nFourth line';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				2,
				40,
				resolver,
				readFile
			);

			// First truncated to 2 lines (exactly 40 chars after ⏎ replacement),
			// line indicator added (making it 61 chars), then char limit cuts it back to 40 + '...'
			assert.strictEqual(result, 'First line content ⏎ Second line content...');
		});

		it('should extract content from a named section', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md', section: 'my_section' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () =>
				'Before section\n' +
				'--8<-- [start:my_section]\n' +
				'Section line 1\n' +
				'Section line 2\n' +
				'--8<-- [end:my_section]\n' +
				'After section';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, 'Section line 1 ⏎ Section line 2');
		});

		it('should return full content when named section is not found', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md', section: 'missing_section' },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () =>
				'Line 1\n' +
				'Line 2\n' +
				'Line 3';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, 'Line 1 ⏎ Line 2 ⏎ Line 3');
		});

		it('should extract content from a line range', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md', lines: { start: 2, end: 4 } },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () =>
				'Line 1\n' +
				'Line 2\n' +
				'Line 3\n' +
				'Line 4\n' +
				'Line 5';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, 'Line 2 ⏎ Line 3 ⏎ Line 4');
		});

		it('should extract content from multiple line ranges', () => {
			const location: SnippetLocation = {
				snippet: { path: 'test.md', lineRanges: [{ start: 1, end: 2 }, { start: 4, end: 5 }] },
				startOffset: 0,
				endOffset: 10,
				lineEndOffset: 10
			};
			const resolver = new PathResolver(() => true);
			const readFile = () =>
				'Line 1\n' +
				'Line 2\n' +
				'Line 3\n' +
				'Line 4\n' +
				'Line 5';

			const result = createPreviewContent(
				location,
				'/docs/main.md',
				'/workspace',
				'',
				20,
				200,
				resolver,
				readFile
			);

			assert.strictEqual(result, 'Line 1 ⏎ Line 2 ⏎ Line 4 ⏎ Line 5');
		});

		describe('section markers embedded in comments', () => {
			it('should extract section with Python comment prefix (#)', () => {
				const location: SnippetLocation = {
					snippet: { path: 'example.py', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'# --8<-- [start:func]\n' +
					'def my_function(var):\n' +
					'    pass\n' +
					'# --8<-- [end:func]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'def my_function(var): ⏎     pass');
			});

			it('should extract section with JavaScript comment prefix (//)', () => {
				const location: SnippetLocation = {
					snippet: { path: 'example.js', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'// --8<-- [start:func]\n' +
					'function myFunction() {\n' +
					'    return true;\n' +
					'}\n' +
					'// --8<-- [end:func]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'function myFunction() { ⏎     return true; ⏎ }');
			});

			it('should extract section with HTML comment wrapper', () => {
				const location: SnippetLocation = {
					snippet: { path: 'example.html', section: 'content' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'<!-- --8<-- [start:content] -->\n' +
					'<div>Hello World</div>\n' +
					'<!-- --8<-- [end:content] -->';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, '<div>Hello World</div>');
			});

			it('should extract section with C-style block comment', () => {
				const location: SnippetLocation = {
					snippet: { path: 'example.c', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'/* --8<-- [start:func] */\n' +
					'void myFunction() {\n' +
					'    return;\n' +
					'}\n' +
					'/* --8<-- [end:func] */';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'void myFunction() { ⏎     return; ⏎ }');
			});

			it('should extract section with Lisp comment prefix (;;)', () => {
				const location: SnippetLocation = {
					snippet: { path: 'example.lisp', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					';; --8<-- [start:func]\n' +
					'(defun my-function (x)\n' +
					'  (* x x))\n' +
					';; --8<-- [end:func]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, '(defun my-function (x) ⏎   (* x x))');
			});

			it('should extract section with Batch file comment prefix (REM)', () => {
				const location: SnippetLocation = {
					snippet: { path: 'example.bat', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'REM --8<-- [start:func]\n' +
					'@echo off\n' +
					'echo Hello World\n' +
					'REM --8<-- [end:func]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, '@echo off ⏎ echo Hello World');
			});
		});

		describe('section markers with whitespace variations', () => {
			it('should handle markers with no spaces around brackets', () => {
				const location: SnippetLocation = {
					snippet: { path: 'test.md', section: 'section' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'--8<--[start:section]\n' +
					'Content here\n' +
					'--8<--[end:section]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'Content here');
			});

			it('should handle markers with spaces everywhere', () => {
				const location: SnippetLocation = {
					snippet: { path: 'test.md', section: 'section' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'--8<-- [ start : section ]\n' +
					'Content here\n' +
					'--8<-- [ end : section ]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'Content here');
			});

			it('should handle markers with multiple spaces', () => {
				const location: SnippetLocation = {
					snippet: { path: 'test.md', section: 'section' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'--8<--  [  start  :  section  ]\n' +
					'Content here\n' +
					'--8<--  [  end  :  section  ]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'Content here');
			});
		});

		describe('section markers with mixed content on same line', () => {
			it('should handle marker with text before it', () => {
				const location: SnippetLocation = {
					snippet: { path: 'test.py', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'print("debug") # --8<-- [start:func]\n' +
					'def my_function():\n' +
					'    pass\n' +
					'# --8<-- [end:func]';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'def my_function(): ⏎     pass');
			});

			it('should handle marker with text after it', () => {
				const location: SnippetLocation = {
					snippet: { path: 'test.py', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'--8<-- [start:func] # inline comment\n' +
					'def my_function():\n' +
					'    pass\n' +
					'--8<-- [end:func] # end marker';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'def my_function(): ⏎     pass');
			});

			it('should handle marker with text before and after', () => {
				const location: SnippetLocation = {
					snippet: { path: 'test.c', section: 'func' },
					startOffset: 0,
					endOffset: 10,
					lineEndOffset: 10
				};
				const resolver = new PathResolver(() => true);
				const readFile = () =>
					'/* prefix */ --8<-- [start:func] /* suffix */\n' +
					'void my_function() {}\n' +
					'/* prefix */ --8<-- [end:func] /* suffix */';

				const result = createPreviewContent(
					location,
					'/docs/main.md',
					'/workspace',
					'',
					20,
					200,
					resolver,
					readFile
				);

				assert.strictEqual(result, 'void my_function() {}');
			});
		});
	});
});
