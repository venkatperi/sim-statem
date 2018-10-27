import { Event, State } from "gen-statem"

export interface RootState {
    version: string,
}

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

export interface SmData {
    formatVersion?: number,

    handlers: Array<IndexedHandler>,

    initialCode?: string,

    initialData: string,

    initialState: string,

    revision?: number
}

export interface SmState {
    currentData: '',

    currentState: '',

    data?: SmData,

    dirty: boolean,

    error?: Error,

    name: string,

    transitions: Array<StateTransition>
}

export type ErrorListener = (...args: Array<any>) => void

export type StateChangeListener = (state: State, prev: State, data: any,
    event: Event, handlerIndex: number) => void
