import BModal from 'bootstrap-vue/src/components/modal/modal'
import Vue from 'vue'

const MessageBox = Vue.extend({
    name: 'MessageBox',

    template: `
          <b-modal v-bind="$attrs"
            :title="title"
            v-model="showDialog"
            @ok="onOk"
            @cancel="onCancel">
            <slot>{{ message }}</slot>
          </b-modal>`,

    inheritAttrs: false,

    components: {
        'b-modal': BModal
    },

    props: {
        title: {
            type: String,
            required: true,
        },
        message: {
            type: String,
            required: true,
        },
        resolve: {
            type: Function,
            required: true,
        },
        reject: {
            type: Function,
            required: true,
        }
    },

    data: function () {
        return {
            showDialog: false,
        }
    },

    mounted() {
        this.$on('ok', this.onOk)
        this.showDialog = true
    },

    methods: {
        onOk(value: any) {
            this.resolve(value)
        },

        onCancel(e: any) {
            this.reject(e)
        },
    }
})

export { MessageBox }
