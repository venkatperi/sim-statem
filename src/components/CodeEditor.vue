<template>
  <!--suppress HtmlFormInputWithoutLabel, CheckEmptyScriptTag -->
  <textarea
    ref="editor"
    :id="id"
    v-resize-on-input
    v-resize-on-value
    v-model="code" />
</template>

<script lang="ts">
    import { Component, Lifecycle, p, Prop, Watch } from "av-ts";
    import * as uniqid from 'uniqid'
    import Vue from "vue";
    import VueResizeOnEvent from "../../../vue-resize-on-event/src/VueResizeOnEvent";

    @Component({
        name: "CodeEditor",
        directives: {
            ...VueResizeOnEvent("value"),
            ...VueResizeOnEvent("input")
        },
    })
    export default class CodeEditor extends Vue {

        code: string = ""

        id = uniqid()

        codeMirror?: any

        $refs!: { editor: HTMLTextAreaElement }

        @Prop value = p({
            type: String,
            default: ""
        });

        @Lifecycle mounted() {
            this.code = this.value
        }

        @Watch('value')
        valueChanged(v: string) {
            this.code = v
        }

        @Watch('code')
        codeChanged(v: string) {
            this.$emit('input', v)
        }

    }
</script>

<style type="scss" scoped>

  textarea {
    z-index: 10;
  }

</style>
