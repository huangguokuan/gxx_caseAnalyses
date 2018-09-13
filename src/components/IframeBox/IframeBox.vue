<style scoped lang="less" src="./IframeBox.less"></style>
<template>
    <div v-show="showIframe" class="iframeBox" v-transfer-dom :style="{width,height,zIndex,top,left,right,bottom}" >
        <iframe :src="src" frameborder="0"></iframe>
    </div>
</template>
<script src="./IframeBox"></script>
