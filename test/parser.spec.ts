import parser from "../src/parser";


describe("parser", ()=> {
  test("should return object", ()=> {
    expect(parser([
      { type: 'string', value: 'string'},
      { type: 'paren',  value: '('},
      { type: 'name',   value: 'add'},
      { type: 'number', value: '2'},
      { type: 'paren',  value: '('},
      { type: 'name',   value: 'subtract'},
      { type: 'number', value: '4'},
      { type: 'number', value: '2'},
      { type: 'paren',  value: ')'},
      { type: 'paren',  value: ')'}
    ])).toEqual({
      type: 'Program',
      body: [
        {
          type: 'StringLiteral',
          value: 'string',
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
    })
  })

  test("should return Error", ()=> {
    // @ts-ignore
    expect(()=> parser([{type: 'bbb', value: 'ccc'}])).toThrow(TypeError('bbb'))
  })
})