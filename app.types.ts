export type Tool = 'spacy' | 'plumber' | 'docling'

export interface Table {
  headers: string[]
  values: string[][]
}

export interface ExtractionResult {
  tables?: [Record<string, Table>]
  text?: string[]
}
