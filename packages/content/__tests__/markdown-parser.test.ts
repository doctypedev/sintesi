import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { extractAnchors, validateMarkdownAnchors, parseCodeRef } from '../index';

describe('Markdown Extraction (Rust-powered)', () => {
  describe('extractAnchors', () => {
    it('should parse a single anchor correctly', () => {
      const content = `# Test
<!-- sintesi:start id="test-id" code_ref="src/test.ts#testFunc" -->
Some content here
<!-- sintesi:end id="test-id" -->
More text`;

      const result = extractAnchors('test.md', content);

      expect(result.anchorCount).toBe(1);
      expect(result.errors).toHaveLength(0);
      expect(result.anchors[0]).toEqual({
        id: 'test-id',
        startLine: 1,
        endLine: 3,
        content: 'Some content here',
        codeRef: 'src/test.ts#testFunc',
        filePath: 'test.md',
      });
    });

    it('should parse multiple anchors correctly', () => {
      const content = `# Test
<!-- sintesi:start id="anchor1" code_ref="src/a.ts#funcA" -->
Content A
<!-- sintesi:end id="anchor1" -->

<!-- sintesi:start id="anchor2" code_ref="src/b.ts#funcB" -->
Content B
<!-- sintesi:end id="anchor2" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchorCount).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.anchors[0].id).toBe('anchor1');
      expect(result.anchors[1].id).toBe('anchor2');
    });

    it('should handle multi-line content', () => {
      const content = `<!-- sintesi:start id="multi" code_ref="src/test.ts#test" -->
Line 1
Line 2
Line 3
<!-- sintesi:end id="multi" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchors[0].content).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should collect error for unclosed anchor', () => {
      const content = `<!-- sintesi:start id="unclosed" code_ref="src/test.ts#test" -->
Some content`;

      const result = extractAnchors('test.md', content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.toLowerCase().includes('unclosed'))).toBe(true);
    });

    it('should collect error for end without start', () => {
      const content = `Some content
<!-- sintesi:end id="orphan" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.toLowerCase().includes('without matching'))).toBe(true);
    });

    it('should handle empty content between anchors', () => {
      const content = `<!-- sintesi:start id="empty" code_ref="src/test.ts#test" -->
<!-- sintesi:end id="empty" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchors[0].content).toBe('');
    });

    it('should preserve whitespace in content', () => {
      const content = `<!-- sintesi:start id="ws" code_ref="src/test.ts#test" -->
  Indented content
    More indentation
<!-- sintesi:end id="ws" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchors[0].content).toContain('  Indented content');
      expect(result.anchors[0].content).toContain('    More indentation');
    });
  });

  describe('validateMarkdownAnchors', () => {
    it('should return no errors for valid content', () => {
      const content = `<!-- sintesi:start id="valid" code_ref="src/test.ts#test" -->
Content
<!-- sintesi:end id="valid" -->`;

      const errors = validateMarkdownAnchors(content);

      expect(errors).toHaveLength(0);
    });

    it('should detect duplicate IDs', () => {
      const content = `<!-- sintesi:start id="dup" code_ref="src/a.ts#a" -->
A
<!-- sintesi:end id="dup" -->
<!-- sintesi:start id="dup" code_ref="src/b.ts#b" -->
B
<!-- sintesi:end id="dup" -->`;

      const errors = validateMarkdownAnchors(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });

    it('should detect invalid code_ref format', () => {
      const content = `<!-- sintesi:start id="invalid" code_ref="invalid-format" -->
Content
<!-- sintesi:end id="invalid" -->`;

      const errors = validateMarkdownAnchors(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Invalid code_ref'))).toBe(true);
    });

    it('should detect unclosed anchors', () => {
      const content = `<!-- sintesi:start id="unclosed" code_ref="src/test.ts#test" -->
Content`;

      const errors = validateMarkdownAnchors(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Unclosed'))).toBe(true);
    });

    it('should detect orphaned end anchors', () => {
      const content = `<!-- sintesi:end id="orphan" -->`;

      const errors = validateMarkdownAnchors(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('without matching'))).toBe(true);
    });
  });

  describe('parseCodeRef', () => {
    it('should parse valid code_ref correctly', () => {
      const result = parseCodeRef('src/utils/helper.ts#helperFunc');

      expect(result).toEqual({
        filePath: 'src/utils/helper.ts',
        symbolName: 'helperFunc',
      });
    });

    it('should handle paths with multiple slashes', () => {
      const result = parseCodeRef('src/deep/nested/path/file.ts#MyClass');

      expect(result.filePath).toBe('src/deep/nested/path/file.ts');
      expect(result.symbolName).toBe('MyClass');
    });

    it('should throw error for invalid format (no hash)', () => {
      expect(() => parseCodeRef('src/file.ts')).toThrow(/Invalid code_ref/);
    });

    it('should throw error for missing file path', () => {
      expect(() => parseCodeRef('#symbolOnly')).toThrow(/Invalid code_ref/);
    });

    it('should throw error for missing symbol name', () => {
      expect(() => parseCodeRef('src/file.ts#')).toThrow(/Invalid code_ref/);
    });
  });

  describe('extractAnchors with file', () => {
    it('should parse a file with valid anchors', () => {
      const filePath = 'packages/content/__tests__/fixtures/example-docs.md';
      const content = readFileSync(filePath, 'utf-8');
      const result = extractAnchors(filePath, content);

      expect(result.anchorCount).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      expect(result.anchors.every((a) => a.id && a.codeRef)).toBe(true);
    });
  });
});
