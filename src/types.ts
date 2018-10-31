import { Event, State } from "gen-statem"

export type ErrorListener = (...args: Array<any>) => void

export type CmdListener = (...args: Array<any>) => void

export type StateChangeListener = (state: State, prev: State, data: any,
    event: Event, handlerIndex: number) => void
