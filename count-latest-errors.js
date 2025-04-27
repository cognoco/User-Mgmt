import fs from 'fs';
import readline from 'readline';

const inputFile = 'vitest-fulltest-report.txt';
const outputFile = 'latest_error_summary.md';

// Map to store error message counts
const errorCounts = new Map();

async function processFile() {
  const rl = readline.createInterface({
    input: fs.createReadStream(inputFile),
    crlfDelay: Infinity,
  });

  let totalLines = 0;
  for await (const line of rl) {
    totalLines++;
    const msg = line.trim();
    if (!msg) continue; // skip empty lines
    if (!errorCounts.has(msg)) {
      errorCounts.set(msg, 0);
    }
    errorCounts.set(msg, errorCounts.get(msg) + 1);
  }

  // Write summary
  const out = [
    '# Latest Error Summary',
    '',
    '| Error Message | Count |',
    '|--------------|-------|',
    ...Array.from(errorCounts.entries()).map(
      ([msg, count]) => `| ${msg.replace(/\|/g, '\\|')} | ${count} |`
    ),
    '',
    `Total unique errors: ${errorCounts.size}`,
    `Total error lines: ${Array.from(errorCounts.values()).reduce((a, b) => a + b, 0)}`,
    `Total lines read: ${totalLines}`
  ].join('\n');

  fs.writeFileSync(outputFile, out, 'utf8');
  console.log(`Summary written to ${outputFile}`);
}

processFile();
