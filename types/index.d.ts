import { getType } from "./tools"

export type tokensType = Array<tokenType>

export type tokenType = {
  type: "paren" | "number" | "string" | "name",
  value: string
}

export type Visitor= Partial<{
  Program?: BindExitAndEnter<Ast.Program>,
  CallExpression?: BindExitAndEnter<Ast.CallExpression>,
  NumberLiteral?: BindExitAndEnter<Ast.NumberLiteral>,
  StringLiteral?: BindExitAndEnter<Ast.StringLiteral>,
}>

interface BindExitAndEnter<T>{
  enter?: (node: T, parent: Ast.ParentTypes) => void
  exit?: (node: T, parent: Ast.ParentTypes) => void 
} 

