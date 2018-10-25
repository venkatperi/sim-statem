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
            // this.$terminal.selectAll()
            // this.$emit('update:buffer', this.$terminal.getSelection().trim())
            this.$terminal.dispose()
        }

        readInput() {
            this.$localEcho.read(this.prompt)
                .then((input: string) => {
                    this.$emit('input', input)
                })
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
                    this.$el.style.width = (parent.offsetWidth - this.$el.offsetLeft + parent.offsetLeft) + 'px'
                    this.$el.style.height = (parent.offsetHeight - this.$el.offsetTop + parent.offsetTop) + 'px'
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
