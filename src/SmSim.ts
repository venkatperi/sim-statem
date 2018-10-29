import { keepState, nextState, repeatState } from "gen-statem"
import { RunningScriptOptions } from "vm"
import { CmdListener, ErrorListener, StateChangeListener } from "./types"
import { VM } from './VM'

const {StateMachine} = require('gen-statem')

export type SimButton = {
    name: string,
    command: string
}

export class SmSim {

    vm: VM

    constructor() {
        this.vm = new VM({
            StateMachine,
            setImmediate,
            keepState,
            nextState,
            repeatState,
            buttons: [],
            sm: undefined
        })
    }

    set errorListener(handler: ErrorListener) {
        this.set('errorHandler', handler)
        this.exec(`if (sm) sm.on( 'error', errorHandler )`)
    }


    set cmdListener(handler: CmdListener) {
        this.set('cmdHandler', handler)
        this.exec(`exec = (...args) => { if (cmdHandler) cmdHandler(...args) }`)
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
