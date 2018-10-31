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

import { Component, p, Prop } from "av-ts";
import Vue from 'vue';
import MultiSelect from 'vue-multiselect'
import { MessageBox } from '../../plugins/MessageBox/MessageBox'

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
