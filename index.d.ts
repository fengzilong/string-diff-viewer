interface DiffOptions {
  language?: string;
  theme?: string;
  syntaxTheme?: string;
  displayFilename?: string;
  sideBySide?: boolean;
  columns?: number;
  wrapLines?: boolean;
}

export function diff(
  oldSource: string,
  newSource: string,
  options?: DiffOptions
): Promise<string>