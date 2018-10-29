import { uniqId } from "gen-statem/dist/src/util/uniqId"
import * as LocalStore from 'store'
//  Copyright 2018, Venkat Peri.
//
//  Permission is hereby granted, free of charge, to any person obtaining a
//  copy of this software and associated documentation files (the
//  "Software"), to deal in the Software without restriction, including
//  without limitation the rights to use, copy, modify, merge, publish,
//  distribute, sublicense, and/or sell copies of the Software, and to permit
//  persons to whom the Software is furnished to do so, subject to the
//  following conditions:
//
//  The above copyright notice and this permission notice shall be included
//  in all copies or substantial portions of the Software.
//
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
//  OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
//  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
//  NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
//  DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
//  OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
//  USE OR OTHER DEALINGS IN THE SOFTWARE.
import Vue from 'vue'
import Vuex from 'vuex'
import {
    DefaultHandler, Handler, SmData, SmState, StateTransition
} from "../types"
import { format, handlerCode, quote } from "../util"

Vue.use(Vuex)

const initialState = () => ({
    formatVersion: 1,
    revision: 1,

    name: 'Untitled',
    dirty: false,

    handlers: [],
    initialCode: '',
    initialState: quote('initial'),
    initialData: quote('{}'),

    currentState: '',
    currentData: '',
    transitions: []
})

const store = new Vuex.Store<SmState>({
    state: initialState(),

    getters: {
        getHandlers: state => state.handlers,

        code(s: SmState): string {
            const handlers = s.handlers.map(x => {
                return handlerCode(x.handler)
            })

            let code = `
          sm = new StateMachine( {
            handlers: [${handlers}],
            initialState: ${s.initialState},
            initialData: ${s.initialData},
          })

          exec = (...args) => { if (cmdHandler) setImmediate(cmdHandler,...args) }
          buttons = [ {
            name: 'init',
            command: 'exec("init")'
          }
          ]
          button = (name, command) => buttons.push({name, command})
          call = sm.call.bind( sm )
          cast = sm.cast.bind( sm )
          if (stateHandler) sm.on( 'state', stateHandler )
          if (errorHandler) sm.on('error', errorHandler)
          sm.startSM()
          ${s.initialCode}
`
            try {
                code = format(code)
            } catch (e) {

            }
            return code
        },
    },

    mutations: {
        initialize(state: SmState) {
            Object.assign(state, initialState())
        },

        createOrAddHandler(state: SmState, handler: Handler) {
            state.handlers.push({
                id: uniqId(),
                index: state.handlers.length,
                collapsed: false,
                handler
            })
            state.dirty = true
        },

        addTransition(state: SmState, transition: StateTransition) {
            state.transitions.push(transition)
        },

        clearTransitions(state: SmState) {
            state.transitions = []
        },

        collapseAll(state: SmState) {
            for (let h of state.handlers) {
                h.collapsed = true
            }
        },

        reindexHandlers(state: SmState) {
            state.handlers.forEach((h, i) => h.index = i)
        },

        removeHandler(state: SmState, index: number) {
            if (index >= 0 && index < state.handlers.length) {
                state.handlers.splice(index, 1)
                state.dirty = true
            }
        },

        setInitialState(state: SmState, value: string) {
            state.initialState = value
            state.dirty = true
        },

        clearDirty(state: SmState) {
            state.dirty = false
        },

        setInitialData(state: SmState, value: string) {
            state.initialData = value
            state.dirty = true
        },

        setInitialCode(state: SmState, value: string) {
            state.initialCode = value
            state.dirty = true
        },

        setCurrentState(state: SmState, value: string) {
            state.currentState = value
        },

        setCurrentData(state: SmState, value: string) {
            state.currentData = value
        },

        setFormatVersion(state: SmState, value: number) {
            state.formatVersion = value
        },

        setRevision(state: SmState, value: number) {
            state.revision = value
        },

        setName(state: SmState, value: string) {
            state.name = value
            state.dirty = true
        },
    },

    actions: {
        initialize({commit}) {
            commit('initialize')
            commit('createOrAddHandler', DefaultHandler)
        },

        createHandler({commit}) {
            commit('createOrAddHandler', DefaultHandler)
        },

        addHandler({commit}, handler: Handler) {
            commit('createOrAddHandler', handler)
        },

        addTransition({commit}, t: StateTransition) {
            commit('addTransition', t)
        },

        clearTransitions({commit}) {
            commit('clearTransitions')
        },

        removeHandler({commit}, index: number) {
            commit('removeHandler', index)
            commit('reindex')
        },

        setInitialData({commit}, value: string) {
            commit('setInitialData', value)
        },

        setInitialState({commit}, value: string) {
            commit('setInitialState', value)
        },

        setInitialCode({commit}, value: string) {
            commit('setInitialCode', value)
        },

        setCurrentState({commit}, value: string) {
            commit('setCurrentState', value)
        },

        setCurrentData({commit}, value: string) {
            commit('setCurrentData', value)
        },

        setFormatVersion({commit}, value: number) {
            commit('setFormatVersion', value)
        },

        setRevision({commit}, value: number) {
            commit('setRevision', value)
        },

        load({commit, state}, name: string) {
            let data: SmData = LocalStore.get(`sm-${name}`)
            commit('initialize')
            for (let h of data.handlers) {
                commit('createOrAddHandler', h)
            }
            commit('setInitialData', data.initialData)
            commit('setInitialState', data.initialState)
            commit('setInitialCode', data.initialCode)
            commit('setFormatVersion', data.formatVersion)
            commit('setRevision', data.revision)
            commit('setName', name)
            commit('clearDirty')
        },

        deleteFile({state, commit}): void {
            LocalStore.remove(`sm-${state.name}`)
            commit('initialize')
        },

        save({state, commit}): void {
            // console.log(state)
            let {
                handlers, initialData, initialState, formatVersion, revision,
                initialCode, name
            } = state

            let data: SmData = {
                handlers: handlers.map(x => x.handler),
                initialData, initialState, initialCode, formatVersion,
                revision
            }
            // console.log(data)
            LocalStore.set(`sm-${name}`, data)
            commit('clearDirty')
        },

    },
})

export default store
