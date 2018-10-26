<template>
  <codemirror
    v-on="$listeners"
    v-bind="$attrs"
    :class="xClass"
    v-model="code"
    :options="cmOptions"
    @ready="onReady"
  />
</template>

<script lang="ts">
    import { Component, Lifecycle, p, Prop, Watch } from "av-ts";
    import { Editor, KeyMap } from 'codemirror'
    import 'codemirror/lib/codemirror.css'
    import 'codemirror/mode/javascript/javascript'
    import 'codemirror/theme/midnight.css'
    import Vue from "vue";
    import codemirror from 'vue-codemirror/src/codemirror.vue'
    import { CodeMirrorOptions } from "../CodeMirrorTypes";

    @Component({
        name: "VueCodeMirror",
        inheritAttrs: false,
        components: {
            codemirror
        },
    })
    export default class VueCodeMirror extends Vue {

        code = ""

        cm?: Editor

        @Prop value = p({
            type: String,
            default: ''
        })

        @Prop lineSeparator = p(String)

        @Prop xClass = p(String)

        @Prop theme = p({
            type: String,
            required: true
        })

        @Prop mode = p({
            type: String,
            required: true
        })

        @Prop indentUnit = p(Number)

        @Prop smartIndent = p(Boolean)

        @Prop tabSize = p(Number)

        @Prop indentWithTabs = p(Boolean)

        @Prop electricChars = p(Boolean)

        @Prop specialChars = p(RegExp)

        @Prop specialCharPlaceHolder = p(Function)

        @Prop direction = p(String)

        @Prop rtlMoveVisually = p(Boolean)

        @Prop keyMap = p(String)

        @Prop extraKeys = p(Object)

        @Prop lineWrapping = p(Boolean)

        @Prop lineNumbers = p(Boolean)

        @Prop gutters = p({type: Array})

        @Prop fixedGutter = p(Boolean)

        @Prop scrollbarStyle = p(String)

        @Prop coverGutterNextToScrollbar = p(Boolean)

        @Prop inputStyle = p({
            type: String,
            default: 'contenteditable'
        })

        @Prop readOnly = p(Boolean)

        @Prop showCursorWhenSelecting = p(Boolean)

        @Prop lineWiseCopyCut = p(Boolean)

        @Prop pasteLinesPerSelection = p(Boolean)

        @Prop selectionsMayTouch = p(Boolean)

        @Prop undoDepth = p(Number)

        @Prop historyEventDelay = p(Number)

        @Prop tabIndex = p(Number)

        @Prop autoFocus = p(Boolean)

        @Prop phrases = p(Object)

        @Prop dragDrop = p(Boolean)

        @Prop allowDropFileTypes = p({type: Array})

        @Prop cursorBlinkRate = p(Number)

        @Prop cursorScrollMargin = p(Number)

        @Prop cursorHeight = p(Number)

        @Prop name = p(String)

        @Lifecycle created() {
            this.loadMode()
            this.loadTheme()
            this.code = this.value
        }

        @Watch('mode')
        modeChanged() {
            this.loadMode()
        }

        @Watch('theme')
        themeChanged() {
            this.loadTheme()
        }

        @Watch('name')
        nameChanged() {
            this.loadTheme()
        }

        @Watch('value')
        valueChanged() {
            this.code = this.value
        }

        @Watch('code')
        codeChanged(v: string) {
            this.$emit('input', v)
        }

        get fullTheme(): string {
            return [this.theme, this.name].join(' ')
        }

        get cmOptions(): CodeMirrorOptions {
            return {
                mode: this.mode,
                theme: this.fullTheme,
                inputStyle: this.inputStyle,
                lineNumbers: this.lineNumbers,
                extraKeys: this.extraKeys as KeyMap,
                readOnly: this.readOnly
            }
        }

        loadMode() {
            // noinspection TypeScriptUnresolvedFunction
            require(`codemirror/mode/${this.mode}/${this.mode}`)
        }

        loadTheme() {
            // noinspection TypeScriptUnresolvedFunction
            require(`codemirror/theme/${this.theme}.css`)
        }

        onReady(cm: Editor) {
            this.cm = cm
        }
    }
</script>

<style scoped>

</style>


<style type="scss">
  @import '../styles/theme';

  .cm-s-midnight .CodeMirror-gutters {
    border-right: solid 1px $dark !important;
  }

  .cm-s-midnight .CodeMirror-linenumber {
    color: $dark !important;
  }
</style>
