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

import BootstrapVue from "bootstrap-vue";
import "bootstrap-vue/dist/bootstrap-vue.css";
import "bootstrap/dist/css/bootstrap.css";
import Vue from "vue";
import { VueResizeDirectives } from "vue-resize-on-event";
import VueRouter from "vue-router";
import App from "./components/App.vue";
import AppCore from "./components/AppCore.vue";
import AppFooter from "./components/AppFooter.vue";
import AppMenu from "./components/AppMenu.vue";
import Icons from "./plugins/icons";
import store from "./store/index";

const icons = [
    "caret-down", "caret-right", "chevron-circle-down", "chevron-circle-right",
    "eye", "eye-slash", "hashtag", "circle", "code", "file", "regular/file",
    "save", "times-circle", "trash-alt", "link", "plus", "save", "times-circle",
    "vial"];

Vue.use(Icons, icons);
Vue.use(BootstrapVue);
Vue.use(VueResizeDirectives, ["input", "value"]);

Vue.config.productionTip = false;

const components = {
    core: AppCore,
    header: AppMenu,
    main: App,
    footer: AppFooter
};

let router = new VueRouter({
    routes: [{path: "/:args*", components}]
});

Vue.use(VueRouter);

let app = new Vue({
    router,
    store,
    el: "#app"
});
