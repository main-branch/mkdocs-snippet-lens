import * as assert from 'assert';
import { SnippetDetector } from '../../snippetDetector';

describe('SnippetDetector', () => {
  describe('detect', () => {
    it('should detect snippet with double quotes', () => {
      const detector = new SnippetDetector();
      const text = '--8<-- "path/to/file.txt"';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].path, 'path/to/file.txt');
    });

    it('should detect snippet with single quotes', () => {
      const detector = new SnippetDetector();
      const text = "--8<-- 'path/to/file.txt'";
      const result = detector.detect(text);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].path, 'path/to/file.txt');
    });

    it('should return empty array when no snippets found', () => {
      const detector = new SnippetDetector();
      const text = 'This is just regular markdown text';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 0);
    });

    it('should detect multiple snippets', () => {
      const detector = new SnippetDetector();
      const text = '--8<-- "file1.txt"\nSome text\n--8<-- "file2.txt"';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 2);
      assert.strictEqual(result[0].path, 'file1.txt');
      assert.strictEqual(result[1].path, 'file2.txt');
    });

    it('should handle whitespace after --8<--', () => {
      const detector = new SnippetDetector();
      const text = '--8<--   "path/to/file.txt"';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].path, 'path/to/file.txt');
    });

    it('should detect snippet with named section', () => {
      const detector = new SnippetDetector();
      const text = '--8<-- "file.md:my_section"';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].path, 'file.md');
      assert.strictEqual(result[0].section, 'my_section');
    });

    it('should detect snippet with line range', () => {
      const detector = new SnippetDetector();
      const text = '--8<-- "file.md:10:20"';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].path, 'file.md');
      assert.deepStrictEqual(result[0].lines, { start: 10, end: 20 });
    });

    it('should detect snippet with multiple line ranges', () => {
      const detector = new SnippetDetector();
      const text = '--8<-- "file.md:1:3,5:7"';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 1);
      assert.strictEqual(result[0].path, 'file.md');
      assert.deepStrictEqual(result[0].lineRanges, [
        { start: 1, end: 3 },
        { start: 5, end: 7 }
      ]);
    });

    it('should fall back to section pattern when multi-range validation fails', () => {
      const detector = new SnippetDetector();
      const text = '--8<-- "file.md:1:3,invalid"';
      const result = detector.detect(text);

      assert.strictEqual(result.length, 1);
      // Now marked as ambiguous instead of silently falling back
      assert.strictEqual(result[0].path, 'file.md');
      assert.strictEqual(result[0].section, '1:3,invalid');
      assert.strictEqual(result[0].isAmbiguous, true);
    });

    describe('ambiguous pattern detection', () => {
      it('should mark pattern as ambiguous when multi-range contains non-numeric part', () => {
        const detector = new SnippetDetector();
        const text = '--8<-- "file.md:1:3,invalid"';
        const result = detector.detect(text);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].path, 'file.md');
        assert.strictEqual(result[0].section, '1:3,invalid');
        assert.strictEqual(result[0].isAmbiguous, true);
        assert.strictEqual(result[0].ambiguousReason, 'Multi-range pattern contains non-numeric part: "invalid"');
      });

      it('should mark pattern as ambiguous when multi-range has empty range', () => {
        const detector = new SnippetDetector();
        const text = '--8<-- "file.md:1:,5:7"';
        const result = detector.detect(text);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].path, 'file.md');
        assert.strictEqual(result[0].section, '1:,5:7');
        assert.strictEqual(result[0].isAmbiguous, true);
        assert.strictEqual(result[0].ambiguousReason, 'Multi-range pattern contains malformed range: "1:"');
      });

      it('should mark pattern as ambiguous when multi-range has incomplete range', () => {
        const detector = new SnippetDetector();
        const text = '--8<-- "file.md:1:3,5:"';
        const result = detector.detect(text);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].path, 'file.md');
        assert.strictEqual(result[0].section, '1:3,5:');
        assert.strictEqual(result[0].isAmbiguous, true);
        assert.strictEqual(result[0].ambiguousReason, 'Multi-range pattern contains malformed range: "5:"');
      });

      it('should mark pattern as ambiguous when multi-range has trailing comma', () => {
        const detector = new SnippetDetector();
        const text = '--8<-- "file.md:1:3,"';
        const result = detector.detect(text);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].path, 'file.md');
        assert.strictEqual(result[0].section, '1:3,');
        assert.strictEqual(result[0].isAmbiguous, true);
        assert.strictEqual(result[0].ambiguousReason, 'Multi-range pattern contains malformed range: ""');
      });

      it('should not mark valid section patterns as ambiguous', () => {
        const detector = new SnippetDetector();
        const text = '--8<-- "file.md:my_section"';
        const result = detector.detect(text);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].isAmbiguous, undefined);
        assert.strictEqual(result[0].ambiguousReason, undefined);
      });

      it('should not mark valid line range patterns as ambiguous', () => {
        const detector = new SnippetDetector();
        const text = '--8<-- "file.md:10:20"';
        const result = detector.detect(text);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].isAmbiguous, undefined);
        assert.strictEqual(result[0].ambiguousReason, undefined);
      });

      it('should not mark valid multi-range patterns as ambiguous', () => {
        const detector = new SnippetDetector();
        const text = '--8<-- "file.md:1:3,5:7"';
        const result = detector.detect(text);

        assert.strictEqual(result.length, 1);
        assert.strictEqual(result[0].isAmbiguous, undefined);
        assert.strictEqual(result[0].ambiguousReason, undefined);
      });
    });
  });
});
