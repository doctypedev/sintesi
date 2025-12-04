import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { extractAnchors, validateMarkdownAnchors, parseCodeRef } from '../index';

describe('Markdown Extraction (Rust-powered)', () => {
  describe('extractAnchors', () => {
    it('should parse a single anchor correctly', () => {
      const content = `# Test
<!-- doctype:start id="test-id" code_ref="src/test.ts#testFunc" -->
Some content here
<!-- doctype:end id="test-id" -->
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
<!-- doctype:start id="anchor1" code_ref="src/a.ts#funcA" -->
Content A
<!-- doctype:end id="anchor1" -->

<!-- doctype:start id="anchor2" code_ref="src/b.ts#funcB" -->
Content B
<!-- doctype:end id="anchor2" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchorCount).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(result.anchors[0].id).toBe('anchor1');
      expect(result.anchors[1].id).toBe('anchor2');
    });

    it('should handle multi-line content', () => {
      const content = `<!-- doctype:start id="multi" code_ref="src/test.ts#test" -->
Line 1
Line 2
Line 3
<!-- doctype:end id="multi" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchors[0].content).toBe('Line 1\nLine 2\nLine 3');
    });

    it('should collect error for unclosed anchor', () => {
      const content = `<!-- doctype:start id="unclosed" code_ref="src/test.ts#test" -->
Some content`;

      const result = extractAnchors('test.md', content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.toLowerCase().includes('unclosed'))).toBe(true);
    });

    it('should collect error for end without start', () => {
      const content = `Some content
<!-- doctype:end id="orphan" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some((e) => e.toLowerCase().includes('without matching'))).toBe(true);
    });

    it('should handle empty content between anchors', () => {
      const content = `<!-- doctype:start id="empty" code_ref="src/test.ts#test" -->
<!-- doctype:end id="empty" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchors[0].content).toBe('');
    });

    it('should preserve whitespace in content', () => {
      const content = `<!-- doctype:start id="ws" code_ref="src/test.ts#test" -->
  Indented content
    More indentation
<!-- doctype:end id="ws" -->`;

      const result = extractAnchors('test.md', content);

      expect(result.anchors[0].content).toContain('  Indented content');
      expect(result.anchors[0].content).toContain('    More indentation');
    });
  });

  describe('validateMarkdownAnchors', () => {
    it('should return no errors for valid content', () => {
      const content = `<!-- doctype:start id="valid" code_ref="src/test.ts#test" -->
Content
<!-- doctype:end id="valid" -->`;

      const errors = validateMarkdownAnchors(content);

      expect(errors).toHaveLength(0);
    });

    it('should detect duplicate IDs', () => {
      const content = `<!-- doctype:start id="dup" code_ref="src/a.ts#a" -->
A
<!-- doctype:end id="dup" -->
<!-- doctype:start id="dup" code_ref="src/b.ts#b" -->
B
<!-- doctype:end id="dup" -->`;

      const errors = validateMarkdownAnchors(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Duplicate'))).toBe(true);
    });

    it('should detect invalid code_ref format', () => {
      const content = `<!-- doctype:start id="invalid" code_ref="invalid-format" -->
Content
<!-- doctype:end id="invalid" -->`;

      const errors = validateMarkdownAnchors(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Invalid code_ref'))).toBe(true);
    });

    it('should detect unclosed anchors', () => {
      const content = `<!-- doctype:start id="unclosed" code_ref="src/test.ts#test" -->
Content`;

      const errors = validateMarkdownAnchors(content);

      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.includes('Unclosed'))).toBe(true);
    });

    it('should detect orphaned end anchors', () => {
      const content = `<!-- doctype:end id="orphan" -->`;

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
