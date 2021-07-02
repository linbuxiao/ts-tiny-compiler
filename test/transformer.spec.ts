import transformer from "../src/transformer";
import { Program } from "../types";

describe("transformer", ()=> {
  test("should return newAst", ()=> {
    const ast: Program = {
      type: 'Program',
      body: [
        {
          type: 'StringLiteral',
          value: "1"
        },
        {
        type: 'CallExpression',
        name: 'add',
        params: [
          {
            type: 'NumberLiteral',
            value: '2'
          }, 
          {
            type: 'CallExpression',
            name: 'subtract',
            params: [
              {
                type: 'NumberLiteral',
                value: '4'
              }, 
              {
                type: 'NumberLiteral',
                value: '2'
              }
            ]
          }
        ]
      }]
    }


    expect(transformer(ast)).toEqual({
      type: 'Program',
      body: [
        {
          type: 'StringLiteral',
          value: '1'
        },
        {
          type: 'ExpressionStatement',
          expression: {
            type: 'CallExpression',
            callee: {
              type: 'Identifier',
              name: 'add'
            },
            arguments: [
              {
                type: 'NumberLiteral',
                value: '2'
              }, 
              {
              type: 'CallExpression',
              callee: {
                type: 'Identifier',
                name: 'subtract'
              },
              arguments: [
                {
                  type: 'NumberLiteral',
                  value: '4'
                }, 
                {
                  type: 'NumberLiteral',
                  value: '2'
                }
              ]
            }
          ]
        }
      }]
    })
  })


  test('should return simple newAst', ()=> {
    const ast: Program = {
      type: "Program",
      body: []
    }

    expect(transformer(ast)).toEqual({
      type: "Program",
      body: []
    })
  })
})