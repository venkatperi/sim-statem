import { Event, State } from "gen-statem"

export type HandlerType = {
    id: string
    index: number
    handler: string
}

export type StateTransition = {
    state: State
    prev?: State
    data?: any
    event?: Event
}
