import { keepState, nextState, repeatState } from "gen-statem"
import { ErrorLine } from "tslint/lib/verify/lines"
import { RunningScriptOptions } from "vm"
import { ErrorListener, Handler, SmData, StateChangeListener } from "./types"
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

    set errorListener(handler: ErrorListener) {
        this.set('errorHandler', handler)
        this.exec(`if (sm) sm.on( 'error', errorHandler )`)
    }

    exec(cmd: string, opts?: RunningScriptOptions): any {
        return this.vm.exec(cmd, opts)
    }

    get(name: string) {
        // @ts-ignore
        return this.vm.context[name]
    }

    /**
     *
     * @param code
     */
    init(code: string) {
        this.exec(code)
    }

    set(name: string, val: any) {
        // @ts-ignore
        this.vm.context[name] = val
    }
}
