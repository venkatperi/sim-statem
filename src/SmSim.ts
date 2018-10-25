import { keepState, nextState, repeatState } from "gen-statem"
import { OnStateHandler, SmData } from "./types"

const VM = require('vm-plus')
const {StateMachine} = require('gen-statem')

export class SmSim {
    vm = new VM()

    constructor() {
        this.vm
            .global('StateMachine', StateMachine)
            .global('keepState', keepState)
            .global('nextState', nextState)
            .global('repeatState', repeatState)
            .global('sm', null)
            .global('stateHandler', null)
            .global('call', null)
            .global('cast', null)
    }

    /**
     *
     * @return {OnStateHandler}
     */
    get stateListener(): OnStateHandler {
        return this.get('stateHandler') as OnStateHandler
    }

    /**
     *
     * @param handler
     */
    set stateListener(handler: OnStateHandler) {
        this.set('stateHandler', handler)
        this.exec(`if (sm) sm.on( 'state', stateHandler )`)
    }

    exec(cmd: string) {
        return this.vm.runNaked(cmd)
    }

    get(name: string) {
        return this.vm.global[name]
    }

    /**
     *
     * @param data
     */
    init(data: SmData) {
        const handlers = data.handlers.map(x => x.handler)
        let code = `
          sm = new StateMachine( {
            handlers: [${handlers}],
            initialState: ${data.initialState},
            initialData: ${data.initialData},
          })
          
          call = sm.call.bind( sm )
          cast = sm.cast.bind( sm )
          if (stateHandler)
              sm.on( 'state', stateHandler )
          sm.startSM()
`
        console.log(code)
        this.exec(code)
    }

    set(name: string, val: any) {
        return this.vm.global(name, val)
    }
}

//
// let sim = new SmSim()
//
// let sm = sim.create({
//     handlers: [
//         {
//             id: '0',
//             index: 0,
//             handler: '[\'cast#flip#off\', \'on\']',
//         },
//         {
//             id: '1',
//             index: 1,
//             handler: '[\'cast#flip#on\', \'off\']',
//         },
//     ],
//
//     initialData: '{}',
//     initialState: '\'off\'',
//     events: 'cast(\'flip\')',
// })
//
// sim.exec('')
