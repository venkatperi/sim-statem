<!-- // Copyright 2018, Venkat Peri. --><!-- // --><!-- // Permission is hereby granted, free of charge, to any person obtaining a --><!-- // copy of this software and associated documentation files (the --><!-- // "Software"), to deal in the Software without restriction, including --><!-- // without limitation the rights to use, copy, modify, merge, publish, --><!-- // distribute, sublicense, and/or sell copies of the Software, and to permit --><!-- // persons to whom the Software is furnished to do so, subject to the --><!-- // following conditions: --><!-- // --><!-- // The above copyright notice and this permission notice shall be included --><!-- // in all copies or substantial portions of the Software. --><!-- // --><!-- // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS --><!-- // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF --><!-- // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN --><!-- // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, --><!-- // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR --><!-- // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE --><!-- // USE OR OTHER DEALINGS IN THE SOFTWARE. -->

<template>
  <!--suppress CheckEmptyScriptTag -->
  <div :class="xClass" />
</template>

<script lang="ts">
    import { Component, Lifecycle, p, Prop, Watch } from 'av-ts';
    import LocalEchoController from 'local-echo';
    import Vue from 'vue';
    import { ITerminalOptions, Terminal } from 'xterm'
    import * as fit from 'xterm/dist/addons/fit/fit'
    import 'xterm/dist/xterm.css'

    Terminal.applyAddon(fit)

    @Component({
        name: 'VueTerm',
    })
    export default class VueTerm extends Vue {
        @Prop value = p({
            type: String,
            default: ''
        })

        @Prop prompt = p({
            type: String,
            default: '> '
        })

        @Prop xClass = p(String)

        @Prop title = p(String)

        @Prop cols = p(Number)

        @Prop rows = p(Number)

        @Prop convertEol = p(Boolean)

        @Prop termName = p(String)

        @Prop cursorBlink = p(Boolean)

        @Prop cursorStyle = p(String)

        @Prop bellSound = p(String)

        @Prop bellStyle = p(String)

        @Prop enableBold = p(Boolean)

        @Prop fontFamily = p(String)

        @Prop fontSize = p(Number)

        @Prop fontWeight = p(String)

        @Prop fontWeightBold = p(String)

        @Prop lineHeight = p(Number)

        @Prop letterSpacing = p(Number)

        @Prop scrollback = p(Number)

        @Prop screenKeys = p(Boolean)

        @Prop debug = p(Boolean)

        @Prop macoptionsIsMeta = p(Boolean)

        @Prop cancelEvents = p(Boolean)

        @Prop disableStdin = p(Boolean)

        @Prop useFlowControl = p(Boolean)

        @Prop allowTransparency = p(Boolean)

        @Prop tabStopWidth = p(Number)

        @Prop theme = p(Object)

        @Prop command = p(String)

        options: ITerminalOptions = {}

        $terminal!: Terminal

        $localEcho!: LocalEchoController


        @Watch('cols')
        colsChanged() {
            if (this.cols && this.rows) {
                this.$terminal.resize(this.cols, this.rows)
            }
        }

        @Watch('rows')
        rowsChanged() {
            if (this.cols && this.rows) {
                this.$terminal.resize(this.cols, this.rows)
            }
        }

        @Watch('command')
        onCommand() {
            switch (this.command) {
                case 'clear':
                    this.$terminal.clear();
                    break;
            }

            this.command = ''
        }


        @Lifecycle mounted() {
            let term = new Terminal(this.options)
            term.open(this.$el)

            this.$terminal = term
            this.$localEcho = new LocalEchoController(term);

            if (this.value) {
                this.$localEcho.println(this.value)
            }

            const self = this
            this.$parent.$on('result', function (value: string) {
                if (value && value.length > 0) {
                    self.$localEcho.println(value)
                }
                setImmediate(() => self.readInput())
            })

            setImmediate(() => this.readInput())
            setImmediate(() => this.fit())
        }

        @Lifecycle beforeDestroy() {
            this.$terminal.dispose()
        }

        readInput() {
            this.$localEcho.read(this.prompt)
                .then((input: string) => this.$emit('input', input))
                .catch((error: any) => {
                    this.$emit('error', error)
                    setImmediate(() => this.readInput())
                });
        }

        fit() {
            let parent = this.$el.parentElement
            let term = this.$terminal
            term.element.style.display = 'none'
            setTimeout(() => {
                if (this.$el && parent) {
                    this.$el.style.width =
                        (parent.offsetWidth - this.$el.offsetLeft +
                            parent.offsetLeft) + 'px'
                    this.$el.style.height =
                        (parent.offsetHeight - this.$el.offsetTop +
                            parent.offsetTop) + 'px'
                    fit.fit(term)
                    // term.fit()
                    term.element.style.display = ''
                    term.refresh(0, term.rows - 1)
                }
            }, 0)
        }

        focus() {
            this.$terminal.focus()
        }

        blur() {
            this.$terminal.blur()
        }
    }
</script>
