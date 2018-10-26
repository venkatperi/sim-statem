import { keepState, nextState, repeatState } from "gen-statem"
import { Handler, SmData, StateChangeListener } from "./types"
import { VM } from './VM'

const {StateMachine} = require('gen-statem')

function handlerCode(h: Handler): string {
    let route = "\"" + [h.event, h.context, h.state].join("#") + "\""
    return `[${route},${h.handler}]`
}

export class SmSim {
    vm: VM

    constructor() {
        this.vm = new VM({
            StateMachine,
            keepState,
            nextState,
            repeatState,
            sm: undefined
        })
    }

    /**
     *
     * @return {StateChangeListener}
     */
    get stateListener(): StateChangeListener {
        return this.get('stateHandler') as StateChangeListener
    }

    /**
     *
     * @param handler
     */
    set stateListener(handler: StateChangeListener) {
        this.set('stateHandler', handler)
        this.exec(`if (sm) sm.on( 'state', stateHandler )`)
    }

    exec(cmd: string): any {
        return this.vm.exec(cmd)
    }

    get(name: string) {
        // @ts-ignore
        return this.vm.context[name]
    }

    /**
     *
     * @param data
     */
    init(data: SmData) {
        const handlers = data.handlers.map(x => handlerCode(x.handler))
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
        // @ts-ignore
        this.vm.context[name] = val
    }
}
