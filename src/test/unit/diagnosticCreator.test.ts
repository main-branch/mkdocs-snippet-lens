import * as assert from 'assert';
import { createDiagnosticInfos } from '../../diagnosticCreator';
import { SnippetLocation } from '../../snippetLocator';

describe('DiagnosticCreator', () => {
	describe('createDiagnosticInfos', () => {
		it('should create diagnostic for unresolved path', () => {
			const locations: SnippetLocation[] = [
				{
					snippet: { path: 'missing.txt' },
					startOffset: 10,
					endOffset: 21,
					lineEndOffset: 22
				}
			];

			const resolvePath = (path: string) => undefined;

			const diagnostics = createDiagnosticInfos(locations, resolvePath);

			assert.strictEqual(diagnostics.length, 1);
			assert.strictEqual(diagnostics[0].message, "Snippet file not found: 'missing.txt'");
			assert.strictEqual(diagnostics[0].startOffset, 10);
			assert.strictEqual(diagnostics[0].endOffset, 21);
		});

		it('should not create diagnostic for resolved path', () => {
			const locations: SnippetLocation[] = [
				{
					snippet: { path: 'found.txt' },
					startOffset: 10,
					endOffset: 19,
					lineEndOffset: 20
				}
			];

			const resolvePath = (path: string) => '/absolute/path/to/found.txt';

			const diagnostics = createDiagnosticInfos(locations, resolvePath);

			assert.strictEqual(diagnostics.length, 0);
		});

		it('should create diagnostics only for unresolved paths', () => {
			const locations: SnippetLocation[] = [
				{
					snippet: { path: 'found.txt' },
					startOffset: 10,
					endOffset: 19,
					lineEndOffset: 20
				},
				{
					snippet: { path: 'missing.txt' },
					startOffset: 30,
					endOffset: 41,
					lineEndOffset: 42
				},
				{
					snippet: { path: 'another.txt' },
					startOffset: 50,
					endOffset: 61,
					lineEndOffset: 62
				}
			];

			const resolvePath = (path: string) => {
				if (path === 'found.txt') {
					return '/absolute/path/to/found.txt';
				}
				if (path === 'another.txt') {
					return '/absolute/path/to/another.txt';
				}
				return undefined;
			};

			const diagnostics = createDiagnosticInfos(locations, resolvePath);

			assert.strictEqual(diagnostics.length, 1);
			assert.strictEqual(diagnostics[0].message, "Snippet file not found: 'missing.txt'");
			assert.strictEqual(diagnostics[0].startOffset, 30);
			assert.strictEqual(diagnostics[0].endOffset, 41);
		});

		it('should return empty array when all paths resolve', () => {
			const locations: SnippetLocation[] = [
				{
					snippet: { path: 'file1.txt' },
					startOffset: 10,
					endOffset: 19,
					lineEndOffset: 20
				},
				{
					snippet: { path: 'file2.txt' },
					startOffset: 30,
					endOffset: 39,
					lineEndOffset: 40
				}
			];

			const resolvePath = (path: string) => `/absolute/path/to/${path}`;

			const diagnostics = createDiagnosticInfos(locations, resolvePath);

			assert.strictEqual(diagnostics.length, 0);
		});

		it('should return empty array for empty locations', () => {
			const locations: SnippetLocation[] = [];
			const resolvePath = (path: string) => undefined;

			const diagnostics = createDiagnosticInfos(locations, resolvePath);

			assert.strictEqual(diagnostics.length, 0);
		});

		it('should handle multiple missing files', () => {
			const locations: SnippetLocation[] = [
				{
					snippet: { path: 'missing1.txt' },
					startOffset: 10,
					endOffset: 22,
					lineEndOffset: 23
				},
				{
					snippet: { path: 'missing2.txt' },
					startOffset: 30,
					endOffset: 42,
					lineEndOffset: 43
				}
			];

			const resolvePath = (path: string) => undefined;

			const diagnostics = createDiagnosticInfos(locations, resolvePath);

			assert.strictEqual(diagnostics.length, 2);
			assert.strictEqual(diagnostics[0].message, "Snippet file not found: 'missing1.txt'");
			assert.strictEqual(diagnostics[1].message, "Snippet file not found: 'missing2.txt'");
		});
	});
});
