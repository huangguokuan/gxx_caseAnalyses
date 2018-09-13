<style lang="less" src="./style/custom.less"></style>
<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>
<script>
export default {
    name: 'App',
    mounted() {
        this.$router.push('/');
    }
}
</script>