import { Component, p, Prop } from "av-ts";
import Vue from 'vue';
import MultiSelect from 'vue-multiselect'
import { MessageBox } from '../plugins/MessageBox/MessageBox'

@Component({
    name: 'SelectDialog',

    inheritAttrs: false,

    template: `
          <message-box :title="title">
             <MultiSelect @select="onSelect" v-bind="$attrs" />
          </message-box>`,

    components: {
        'message-box': MessageBox,
        MultiSelect,
    }
})

export class SelectDialog extends Vue {
    @Prop title = p({
        type: String,
        required: true
    })

    onSelect(name: string) {
        this.$parent.$emit('ok', name)
    }
}

export function selectDialog(vue: Vue, title: string,
    options: Array<any>): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        let mb = new SelectDialog({
            propsData: {title, options, resolve, reject}
        })
        mb.$mount()
        vue.$root.$el.appendChild(mb.$el)
    })
}
