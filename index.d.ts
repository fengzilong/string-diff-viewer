interface FormatOptions {
  disableSyntaxHighlight?: boolean
  forceSideBySide?: boolean
}
export function diff(oldStr: string, newStr: string): Promise<string>
export function format(diffs?: string, options?: FormatOptions): Promise<string>