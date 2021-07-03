import { getType } from "./tools"

export type tokensType = Array<tokenType>

export type tokenType = {
  type: "paren" | "number" | "string" | "name",
  value: string
}

export type Visitor= Partial<{
  Program?: BindExitAndEnter<Program>,
  CallExpression?: BindExitAndEnter<CallExpression>,
  NumberLiteral?: BindExitAndEnter<NumberLiteral>,
  StringLiteral?: BindExitAndEnter<StringLiteral>,
}>

interface BindExitAndEnter<T>{
  enter?: (node: T, parent:withContextTypes) => void
  exit?: (node: T, parent: withContextTypes) => void 
} 

