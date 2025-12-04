// Test what gets loaded in test mode
process.env.VITEST = 'true';

const { AstAnalyzer } = require('./packages/core/dist/index.js');

console.log('AstAnalyzer:', AstAnalyzer);
console.log('typeof AstAnalyzer:', typeof AstAnalyzer);

const analyzer = new AstAnalyzer();
console.log('analyzer instance:', analyzer);
console.log('analyzer.analyzeFile:', typeof analyzer.analyzeFile);
console.log('analyzer.analyzeCode:', typeof analyzer.analyzeCode);

// Try calling it
try {
  const result = analyzer.analyzeFile('./test.ts');
  console.log('analyzeFile result:', result);
  console.log('result type:', typeof result);
  console.log('result.find:', typeof result.find);
} catch (e) {
  console.error('Error:', e.message);
}
