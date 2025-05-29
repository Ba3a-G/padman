export interface FileRenameOptions {
  dryRun?: boolean;
}

export interface CliOptions extends FileRenameOptions {
  directory: string;
}
