import { Event, State } from "gen-statem"

export const DefaultHandler: Handler = {
    event: '*_',
    context: '*_',
    state: '*_',
    handler: '() => keepState()'
}

export type Handler = {
    event: string
    context: string
    state: string,
    handler: string,
}

export type IndexedHandler = {
    id: string
    index: number
    handler: Handler
}

export type StateTransition = {
    state: State
    prev?: State
    data?: any
    event?: Event
    handlerIndex: number
}

export type SmData = {
    handlers: Array<IndexedHandler>,
    initialState: string,
    initialData: string,
    initialCode?: string,
    formatVersion?: number,
    revision?: number
}

export type ErrorListener = (...args: Array<any>) => void

export type StateChangeListener = (state: State, prev: State, data: any,
    event: Event, handlerIndex: number) => void
