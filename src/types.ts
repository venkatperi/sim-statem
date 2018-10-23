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
    handlerIndex: number
}

export type CodeMirrorOptions = {
    value?: string
    mode?: string
    lineSeparator?: string
    theme?: string
    indentUnit?: number
    smartIndent?: boolean
    tabSize?: number
    indentWithTabs?: boolean
    electricChars?: boolean
    specialChars?: RegExp
    specialCharPlaceHolder?: (c: string) => Element
    direction?: 'ltr' | 'rtl'
    rtlMoveVisually?: boolean
    keyMap?: string
    extraKeys?: object
    lineWrapping?: boolean
    lineNumbers?: boolean
    gutters?: Array<string>
    fixedGutter?: boolean
    scrollbarStyle?: string
    coverGutterNextToScrollbar?: boolean
    inputStyle?: string
    readOnly?: boolean
    showCursorWhenSelecting?: boolean
    lineWiseCopyCut?: boolean
    pasteLinesPerSelection?: boolean
    selectionsMayTouch?: boolean
    undoDepth?: number
    historyEventDelay?: number
    tabIndex?: number
    autoFocus?: boolean
    phrases?: any
    dragDrop?: boolean
    allowDropFileTypes?: Array<string>
    cursorBlinkRate?: number
    cursorScrollMargin?: number
    cursorHeight?: number
}

export type CodeMirrorAttrs = {
    [k in keyof CodeMirrorOptions]: string
}

