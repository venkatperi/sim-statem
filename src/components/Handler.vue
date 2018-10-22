<template>
  <div :class="[odd?'odd':'even', 'handler-group', 'list-group-item']">
    <div class="controls-area">
      <div class="index" v-html="index + 1"></div>
      <div class="close" @click="$emit('remove')">x</div>
    </div>
    <div class="route">
      <input :class="['event', eventValid?'':'error']"
        v-model="event"
        placeholder="event" />
      <span class="hash">#</span>
      <input class="context "
        v-model="context"
        placeholder="context" />
      <span class="hash">#</span>
      <input class="state "
        v-model="state"
        placeholder="state" />
    </div>
    <textarea
      v-model="handler"
      placeholder="handler"
      v-resize-on-value
      v-resize-on-input
      :class="['handler' ]">
      </textarea>
  </div>
</template>

<script lang="ts">
    import { Component, Lifecycle, p, Prop, Watch } from "av-ts";
    import Vue from "vue";
    import VueResizeOnEvent from "../../../vue-resize-on-event/src/VueResizeOnEvent";

    const HANDLER: RegExp = /\[([^,]+),(.*)]/;

    const events: string[] = [
        "cast",
        "eventTimeout",
        "stateTimeout",
        "genericTimeout",
        "enter",
        "internal"
    ];

    const validateEvent = (e: string) => {
        return events.indexOf(e) >= 0 || e.startsWith("call");
    };

    @Component({
        name: "Handler",
        directives: {
            ...VueResizeOnEvent("value"),
            ...VueResizeOnEvent("input")
        }
    })
    export default class Handler extends Vue {
        event = "";

        context = "";

        state = "";

        route = "";

        handler = "";

        @Prop
        value = p({
            type: String,
            default: ""
        });

        @Prop
        index = p({type: Number})

        @Prop
        odd = p({
            type: Boolean,
            default: false
        });

        @Lifecycle
        created() {
            this.valueChanged();
        }

        @Watch("value")
        watchValue() {
            this.valueChanged();
        }

        @Watch("event")
        watchEvent() {
            this.updateRoute();
        }

        @Watch("route")
        watchRoute() {
            this.emitHandler();
        }

        @Watch("handler")
        watchHandler() {
            this.emitHandler();
        }

        get eventValid(): boolean {
            return validateEvent(this.event)
        }

        updateRoute() {
            this.route = "\""
                + [this.event, this.context, this.state].join("#")
                + "\"";
        }

        valueChanged(): void {
            let match = HANDLER.exec(this.value);
            if (match && match.length >= 3) {
                this.handler = match[2].trimLeft();

                let route = match[1].replace(/['"]/g, "").trim();
                let parts = route.split("#");
                this.event = parts[0];
                this.context = parts[1];
                this.state = parts[2];
            }
        }

        emitHandler() {
            const value = `[${this.route}, ${this.handler}]`;
            this.$emit("input", value);
        }
    }
</script>

<style type="scss" scoped>
  .route {
    margin-top: 0;
    width: 100%;
    display: flex;
    border-bottom: solid 1px #444;
  }

  input {
    border: solid 1px #272822;
  }

  input.error {
    border: solid 1px red;
  }

  .event,
  .context,
  .state {
    height: 32px;
    line-height: 32px;
    font-size: 17px;
    text-align: center;
    background-color: #272822;
    color: #bbb;
  }

  .event,
  .state {
    width: 100px;
  }

  .context {
    flex-grow: 1;
  }

  .hash {
    font-size: 20px;
    line-height: 32px;
    color: #777;
    font-weight: 200;
    width: 30px;
    text-align: center;
    background: #000;
    border-left: solid 1px #444;
    border-right: solid 1px #444;
  }

  textarea.handler {
    width: 100%;
    resize: none;
    background-color: #272822;
    color: #bbb;
    border: none;
    border-radius: 0;
    padding: 10px 20px;
  }

  .handler-group {
    padding: 0;
    width: auto;
    height: auto;
    border: none;
    border-radius: 0;
  }

  .oddx {
    color: #222;
    background: #aaa;
  }

  .even, .odd {
    color: #222;
    background: #bbb;
  }

  .controls-area {
    height: 25px;
    padding: 0 10px;
    line-height: 20px;
    margin-top: 5px;
  }

  .index,
  .controls {
    font-size: 22px;
    float: left;
  }

  .close {
    float: right;
  }
</style>
