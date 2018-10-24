import { Doc, Editor, KeyMap, PositionConstructor as Pos } from 'codemirror'
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

export type SmData = {
    handlers: Array<HandlerType>,
    initialState: string,
    initialData: string,
    events: string
}

export type InputContinuation = (input: string) => void

export type InputCallback = (done: InputContinuation) => void

export type OutputCallback = (res: string) => void

export type OnStateHandler = (state: State, prev: State, data: any,
    event: Event, handlerIndex: number) => void

export interface VmData {
    code: string
    // input: InputCallback,
    // onState: OnStateHandler
    // output: OutputCallback
}

type CodeMirrorConfigMouseFn = (cm: Editor, pos: Pos) => { from: Pos, to: Pos }

export type CodeMirrorOptions = {
    value?: string | Doc
    mode?: string | { [k: string]: any, name: string }
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
    extraKeys?: KeyMap
    configureMouse?: (cm: Editor,
        repeat: 'single' | 'double' | 'triple', event: Event) => {
        unit?: "char" | "word" | "line" | "rectangle" | CodeMirrorConfigMouseFn,
        extend?: boolean,
        addNew?: boolean,
        moveOnDrag?: boolean,
    }
    lineWrapping?: boolean
    lineNumbers?: boolean
    firstLineNumber?: number
    lineNumberFormatter?: (line: number) => string
    gutters?: Array<string>
    fixedGutter?: boolean
    scrollbarStyle?: string
    coverGutterNextToScrollbar?: boolean
    inputStyle?: string
    readOnly?: boolean | string
    showCursorWhenSelecting?: boolean
    lineWiseCopyCut?: boolean
    pasteLinesPerSelection?: boolean
    selectionsMayTouch?: boolean
    undoDepth?: number
    historyEventDelay?: number
    tabIndex?: number
    autoFocus?: boolean
    phrases?: object
    dragDrop?: boolean
    allowDropFileTypes?: Array<string>
    cursorBlinkRate?: number
    cursorScrollMargin?: number
    cursorHeight?: number
    resetSelectionOnContextMenu?: boolean
    workTime?: number
    workDelay?: number
    pollInterval?: number
    flattenSpans?: boolean
    addModeClass?: boolean
    maxHighlightLength?: number
    viewportMargin?: number
}

export const KeyNames = {
    3: "Pause", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl",
    18: "Alt", 19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space",
    33: "PageUp", 34: "PageDown", 35: "End", 36: "Home", 37: "Left", 38: "Up",
    39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert", 46: "Delete",
    59: ";", 61: "=", 91: "Mod", 92: "Mod", 93: "Mod", 106: "*", 107: "=",
    109: "-", 110: ".", 111: "/", 127: "Delete", 145: "ScrollLock", 173: "-",
    186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`",
    219: "[", 220: "\\", 221: "]", 222: "'", 63232: "Up", 63233: "Down",
    63234: "Left", 63235: "Right", 63272: "Delete", 63273: "Home", 63275: "End",
    63276: "PageUp", 63277: "PageDown", 63302: "Insert"
};
