#!/usr/bin/env node
import { Command } from 'commander';
import { renameFiles, validateDirectory } from './fileUtils.js';
import { CliOptions } from './types.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

async function getPackageVersion(): Promise<string> {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packagePath = join(__dirname, '..', 'package.json');
    const packageJson = JSON.parse(await fs.readFile(packagePath, 'utf8'));
    return packageJson.version || '1.0.0';
  } catch (error) {
    return '1.0.0';
  }
}

export async function cli(): Promise<void> {
  const program = new Command();
  const version = await getPackageVersion();
  
  program
    .name('padman')
    .description('Utility to normalize numeric prefixes in filenames by padding zeroes')
    .version(version)
    .argument('[directory]', 'Directory containing files to rename', process.cwd())
    .option('-d, --dry-run', 'Show what would be renamed without making changes', false)
    .action(async (directoryArg: string, options: { dryRun: boolean }) => {
      try {
        const cliOptions: CliOptions = {
          directory: directoryArg,
          dryRun: options.dryRun
        };
        
        await validateDirectory(cliOptions.directory);
        const results = await renameFiles(cliOptions.directory, { dryRun: cliOptions.dryRun });
        
        console.log(results.join('\n'));
      } catch (error) {
        console.error(error instanceof Error ? error.message : String(error));
        process.exit(1);
      }
    });
  
  await program.parseAsync();
}

if (import.meta.url === fileURLToPath(import.meta.resolve(process.argv[1])) || 
    process.argv[1]?.endsWith('padman')) {
  cli().catch(err => {
    console.error('Unexpected error:', err);
    process.exit(1);
  });
}
