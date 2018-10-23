<template>
    <textarea
      autocomplete="off"
      autocapitalize="off"
      spellcheck="false"
      v-model="code"
      v-resize-on-value
      v-resize-on-input
    ></textarea>
</template>

<script lang="ts">
    import { Component, Lifecycle, p, Prop, Watch } from "av-ts";
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

        @Prop value = p({
            type: String,
            default: ""
        });

        @Lifecycle created() {
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


</style>
