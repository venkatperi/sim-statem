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


import { GetterTree } from "vuex"
import { RootState, SmState } from "../../types"
import { format, handlerCode } from '../../util'

export const getters: GetterTree<SmState, RootState> = {

    code(state: SmState): string {
        let {data} = state
        if (data) {
            const handlers = data.handlers.map(x => handlerCode(x.handler))
            let code = `
          sm = new StateMachine( {
            handlers: [${handlers}],
            initialState: ${data.initialState},
            initialData: ${data.initialData},
          })

          call = sm.call.bind( sm )
          cast = sm.cast.bind( sm )
          if (stateHandler) sm.on( 'state', stateHandler )
          if (errorHandler) sm.on('error', errorHandler)
          sm.startSM()
          ${data.initialCode}
`
            return format(code)
        }
        return ''
    }
};
