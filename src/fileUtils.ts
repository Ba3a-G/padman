import fs from 'fs/promises';
import path from 'path';
import { FileRenameOptions } from './types.js';

export async function validateDirectory(directory: string): Promise<boolean> {
  try {
    const stats = await fs.stat(directory);
    if (!stats.isDirectory()) {
      throw new Error(`Error: ${directory} is not a valid directory.`);
    }
    return true;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error: ${directory} is not accessible or does not exist. ${error.message}`);
    }
    throw error;
  }
}

export function getMaxDigitLength(files: string[]): number {
  let maxDigits = 0;
  
  for (const file of files) {
    const match = file.match(/^(\d+)(.*)/);
    if (match) {
      const digits = match[1].length;
      if (digits > maxDigits) {
        maxDigits = digits;
      }
    }
  }
  
  return maxDigits;
}

export async function renameFiles(
  directory: string, 
  options: FileRenameOptions = { dryRun: false }
): Promise<string[]> {
  try {
    const files = await fs.readdir(directory);
    const maxDigits = getMaxDigitLength(files);
    const results: string[] = [];
    
    if (maxDigits === 0) {
      return [`No files with numeric prefixes found in ${directory}.`];
    }
    
    results.push(`Maximum digit length found: ${maxDigits}`);

    for (const file of files) {
      const match = file.match(/^(\d+)(.*)/);
      if (match) {
        let digits = match[1];
        digits = digits.padStart(maxDigits, '0');
        const newFileName = `${digits}${match[2]}`;
        
        if (file !== newFileName) {
          const oldFilePath = path.join(directory, file);
          const newFilePath = path.join(directory, newFileName);
          
          if (!options.dryRun) {
            await fs.rename(oldFilePath, newFilePath);
          }
          
          results.push(`Renamed: ${file} -> ${newFileName}`);
        }
      }
    }
    
    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Error renaming files: ${error.message}`);
    }
    throw new Error(`Error renaming files: ${String(error)}`);
  }
}
