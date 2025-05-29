import { renameFiles } from 'padman';

const directory = process.argv[2] || '.';
const dryRun = process.argv.includes('--dry-run') || process.argv.includes('-d');

async function main() {
  try {
    const results = await renameFiles(directory, { dryRun });
    console.log(results.join('\n'));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

try {
  main();
} catch (err) {
  console.error('Unexpected error:', err);
  process.exit(1);
}