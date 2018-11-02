<!-- // Copyright 2018, Venkat Peri. --><!-- // --><!-- // Permission is hereby granted, free of charge, to any person obtaining a --><!-- // copy of this software and associated documentation files (the --><!-- // "Software"), to deal in the Software without restriction, including --><!-- // without limitation the rights to use, copy, modify, merge, publish, --><!-- // distribute, sublicense, and/or sell copies of the Software, and to permit --><!-- // persons to whom the Software is furnished to do so, subject to the --><!-- // following conditions: --><!-- // --><!-- // The above copyright notice and this permission notice shall be included --><!-- // in all copies or substantial portions of the Software. --><!-- // --><!-- // THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS --><!-- // OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF --><!-- // MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN --><!-- // NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, --><!-- // DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR --><!-- // OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE --><!-- // USE OR OTHER DEALINGS IN THE SOFTWARE. -->

<template>
  <b-modal :ok-title="title"
           v-bind="$attrs"
           :title="title"
           @ok="process"
           :ok-disabled="!isValid"
           @cancel="cancel">
    <form v-if="mode==='login'" @submit.prevent>
      <b-form-group :state="validEmail(loginForm.email)"
                    invalid-feedback="Invalid email address">
        <b-form-input v-model.trim="loginForm.email"
                      type="text"
                      placeholder="email"
                      id="email1" />
      </b-form-group>

      <b-form-group>
        <b-form-input v-model.trim="loginForm.password"
                      type="password"
                      placeholder="password"
                      id="password1" />
      </b-form-group>

      <div class="extras">
        <b-link @click="mode='reset'">Forgot Password</b-link>
        <b-link @click="mode='signup'">Create Account</b-link>
      </div>

    </form>

    <form v-else-if="mode==='signup'" @submit.prevent>
      <b-form-group :state="signupForm.name.length > 3"
                    invalid-feedback="Name is too short">
        <b-form-input v-model.trim="signupForm.name"
                      type="text"
                      placeholder="name"
                      id="name2" />
      </b-form-group>

      <b-form-group :state="validEmail(signupForm.email)"
                    invalid-feedback="Invalid email address">
        <b-form-input v-model.trim="signupForm.email"
                      type="text"
                      placeholder="email"
                      id="email2" />
      </b-form-group>

      <b-form-group>
        <b-form-input v-model.trim="signupForm.password"
                      type="password"
                      placeholder="password"
                      id="password2" />
      </b-form-group>

        <b-form-group :state="signupForm.password === signupForm.confirmPassword"
                      invalid-feedback="Passwords don't match">
        <b-form-input v-model.trim="signupForm.confirmPassword"
                      type="password"
                      placeholder="confirm password"
                      id="passwordConfirm2" />
      </b-form-group>

      <b-form-group class="extras">
        <a @click="mode='login'">Back to Log In</a>
      </b-form-group>

    </form>
  </b-modal>
</template>

<script lang="ts">
    import { Component } from "av-ts";
    import BFormGroup from 'bootstrap-vue/src/components/form-group/form-group'
    import BFormInput from 'bootstrap-vue/src/components/form-input/form-input'
    import BLink from 'bootstrap-vue/src/components/link/link'
    import BModal from 'bootstrap-vue/src/components/modal/modal'
    import * as equals from 'validator/lib/equals'
    import * as isEmail from 'validator/lib/isEmail'
    import * as isEmpty from 'validator/lib/isEmpty'
    import Vue from 'vue'
    import * as fb from "../../firebase";

    type Mode = 'login' | 'signup' | 'reset'

    type Login = {
        email: string,
        password: string
    }

    type Signup = {
        name: string,
        email: string,
        password: string,
        confirmPassword: string
    }

    type Reset = {
        email: string,
    }

    const modes: {
        [k in Mode]: {
            title: string,
            validate: (args: Login | Reset | Signup) => boolean
        }
    } = {
        login: {
            title: 'Login',
            validate: (args: Login) => {
                return isEmail(args.email)
            }
        },

        signup: {
            title: 'Signup',
            validate: (args: Signup) => {
                return isEmail(args.email)
                    && !isEmpty(args.name)
                    && !isEmpty(args.password)
                    && equals(args.password, args.confirmPassword)
            }
        },

        reset: {
            title: 'Reset Password',
            validate: (args: Reset) => {
                return isEmail(args.email)
            }
        }

    }

    const defaults = {
        loginForm: {
            email: '',
            password: ''
        },

        signupForm: {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        }
    }

    @Component({
        inheritAttrs: false,
        components: {
            'b-modal': BModal,
            'b-form-input': BFormInput,
            'b-form-group': BFormGroup,
            'b-link': BLink,
        },
    })
    export default class VueLogin extends Vue {
        loginForm: Login = {
            email: '',
            password: ''
        }

        signupForm: Signup = {
            name: '',
            email: '',
            password: '',
            confirmPassword: '',
        }

        resetForm: Reset = {
            email: ''
        }

        mode: Mode = 'login'

        errorMsg = ''

        get title(): string {
            return modes[this.mode].title
        }

        cancel() {
            this.reset()
        }

        reset() {
            Object.assign(this.loginForm, defaults.loginForm)
            Object.assign(this.signupForm, defaults.signupForm)
        }

        validEmail(str: string): boolean {
            return isEmpty(str) ||
                isEmail(str)
        }

        get isValid(): boolean {
            const validate = modes[this.mode].validate
            switch (this.mode) {
                case 'login':
                    return validate(this.loginForm)
                case 'signup':
                    return validate(this.signupForm)
                case 'reset':
                    return validate(this.resetForm)
            }
        }

        async process() {
            try {
                switch (this.mode) {
                    case 'login':
                        await this.login()
                        break
                    case 'signup':
                        await this.signup()
                        break
                }
            }
            catch (err) {
                console.log(err)
                this.errorMsg = err.message
            }
            this.reset()
        }

        async login() {
            let auth =
                await fb.auth.signInWithEmailAndPassword(
                    this.loginForm.email,
                    this.loginForm.password)
            this.$store.commit('user/setCurrentUser', auth.user)
            await this.$store.dispatch('user/fetchUserProfile')
            // this.$router.push('/dashboard')
        }

        async signup() {
            let data = Object.assign({}, this.signupForm)
            let cred = await fb.auth.createUserWithEmailAndPassword(
                this.signupForm.email,
                this.signupForm.password)

            let user = cred.user
            if (!user) {
                throw new Error('no user?')
            }
            this.$store.commit('user/setCurrentUser', user)

            await fb.usersCollection
                    .doc(user.uid).set({
                    name: data.name,
                })
            await this.$store.dispatch('user/fetchUserProfile')
            // this.$router.push('/dashboard')
        }

        // resetPassword() {
        //     this.performingRequest = true
        //
        //     fb.auth.sendPasswordResetEmail(this.passwordForm.email)
        //       .then(() => {
        //           this.performingRequest = false
        //           this.passwordResetSuccess = true
        //           this.passwordForm.email = ''
        //       }).catch(err => {
        //         console.log(err)
        //         this.performingRequest = false
        //         this.errorMsg = err.message
        //     })
        // }
    }
</script>

<style lang="scss" scoped>
  @import "../../styles/theme";

  label {
    text-transform: uppercase;
    font-size: 0.9rem;
  }
</style>
