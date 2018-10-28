//  Copyright 2018, Venkat Peri.
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the
//  "Software"), to deal in the Software without restriction, including
//  without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to permit
//  persons to whom the Software is furnished to do so, subject to the
//  following conditions:
//
//  The above copyright notice and this permission notice shall be included
//  in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
//  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
//  USE OR OTHER DEALINGS IN THE SOFTWARE.
import quoteIt from 'quote-it'
import { Handler } from "./types"

const _stringify = require("json-stringify-pretty-compact")

const prettier = require('prettier/standalone')
const plugins = [require('prettier/parser-babylon')]

export function stringify(object: any): string {
    return _stringify(object)
}

function unquote(str: string, type: string): string {
    if (str.startsWith(type) && str.endsWith(type)) {
        str = str.substr(1, str.length - 2)
    }
    return str
}

export function quote(str: string, type: string = '"'): string {
    if (str.length === 0) {
        return str;
    }

    str = unquote(str, '"')
    str = unquote(str, "'")
    return quoteIt(str, type)
}

export function handlerCode(h: Handler): string {
    // console.log(h)
    let route = "\"" + [h.event, h.context, h.state].join("#") + "\""
    return `[${route}, ${h.handler}]`
}

export function format(src: string): string {
    let code = prettier.format(src, {
        parser: 'babylon',
        plugins,
        printWidth: 40,
        semi: false
    })
    if (code.startsWith(';')) {
        code = code.substr(1)
    }
    return code.trim()
}
