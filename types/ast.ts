namespace Ast {
  export type CallExpression = {
    type: "CallExpression",
    name: string,
    params: Array<Types>,
    _context?: Array<Types>
  }
  
  export type Types = CallExpression | NumberLiteral | StringLiteral
  
  export type TypesWithProgram = CallExpression | NumberLiteral | StringLiteral | Program
  
  export type ParentTypes = Program | CallExpression | null
  
  export type NumberLiteral = {
    type: "NumberLiteral",
    value: string
  }
  
  export type StringLiteral = {
    type: "StringLiteral",
    value: string
  }
  
  export type Program = {
    type: "Program",
    body: Array<Types>,
    _context?: Array<Types>
  }  
}