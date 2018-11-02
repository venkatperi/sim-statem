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

import { UserInfo } from "firebase"
import Vue from 'vue'
import Vuex from 'vuex'
import { VuexModule } from "vuex-module-decorators"
import * as fb from "../../firebase"
import { UserProfile, UserState } from "./UserState"

Vue.use(Vuex)

const store: VuexModule = new VuexModule<UserState>({
    namespaced: true,

    state: {
        uid: undefined,
        name: '',
        email: ''
    },

    mutations: {
        setCurrentUser(state: UserState, user: UserInfo) {
            state.uid = user.uid
            if (user.email) {
                state.email = user.email
            }
        },

        setUserProfile(state: UserState, profile: UserProfile) {
            state.name = profile.name
            console.log(state)
        },
    },


    actions: {
        async updateProfile({commit, state}, data) {
            let name = data.name
            let title = data.title

            if (!state.uid) {
                return
            }
            try {
                await fb.usersCollection
                        .doc(state.uid)
                        .update({name, title})
            } catch (e) {
                console.log(e)
            }
        },

        async fetchUserProfile({commit, state}) {
            if (!state.uid) {
                return
            }

            try {
                let res = await fb.usersCollection
                                  .doc(state.uid)
                                  .get()
                commit('setUserProfile', res.data())
            } catch (e) {
                console.log(e)
            }
        },
    },
})

export default store
