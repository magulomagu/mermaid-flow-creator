
export enum DiagramType {
  FLOWCHART = 'flowchart',
  SEQUENCE = 'sequenceDiagram',
  STATE = 'stateDiagram'
}

export interface ConversionResponse {
  mermaidCode: string;
  explanation?: string;
}
