import { Component, p, Prop } from "av-ts";
import Vue from 'vue';

@Component({
    name: 'Repl',
    template: `<VueTerm class="repl" @input="onInput" />`
})
export default class Repl extends Vue {
    @Prop onCommand = p({
        type: Function,
        required: true
    })

    onInput(str: string){
        this.onCommand(str)
    }
}
