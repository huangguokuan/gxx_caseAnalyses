<style scoped lang="less" src="./SearchInput.less"></style>
<template>
    <div class="cmp-search-input" :class="{'large-input':type=='large','has-button':!!btnText || !!btnIcon,'is-ie9':isIE9,'no-icon':!inputIcon}">
        <i-input ref="searchInput" @click.native="onClick" @on-keyup="onInputChange" @on-blur="onBlur" @on-focus="showPlaceHolder=false;" v-model.trim="searchText" @on-click="inputIconClick" :icon="inputIcon" @on-enter="enter" :placeholder="placeholder">
        <Button type="primary" v-show="btnText" slot="append" @click.native="btnClick">{{btnText}}</Button>
        <Button type="primary" v-show="btnIcon" slot="append" :icon="btnIcon" @click.native="btnClick"></Button>
        <img v-show="type=='small'" slot="append" src="@/images/base/search.png" height="16" width="16" @click="inputIconClick" />
        </i-input>
        <span v-if="isIE9 && showPlaceHolder" class="placeholder" @click="$refs.searchInput.focus();">{{placeholder}}</span>
    </div>
</template>
<script>
    export default {
        name: 'SearchInput',
        props: {
            btnIcon: String,
            btnText: String,
            btnClick: Function,
            enter: Function,
            inputIconClick: Function,
            inputIcon: String,
            placeholder: String,
            searchText: String,
            type: {
                type: String,
                default: 'small'
            }
        },
        data() {
            return {
                isIE9: window.navigator.appVersion.indexOf('MSIE 9.0') > 0,
                showPlaceHolder: true
            }
        },
        methods: {
            onInputChange(e) {
                this.$emit('update:searchText', e.target.value);
            },
            onBlur() {
                if(!this.searchText) {
                    this.showPlaceHolder = true;
                }
            },
            onClick() {
                this.showPlaceHolder = false;
                this.$refs.searchInput.focus();
            }
        }
    }

</script>