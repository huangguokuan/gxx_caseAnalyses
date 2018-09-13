<style scoped lang="less" src="./AlertControl.less"></style>
<template>
    <div id="alertControl">
        <tabs-menu @on-click="onTabClick" :tabList="tabList">
            <transition name="fade" appear>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </transition>
        </tabs-menu>
    </div>
</template>
<script src="./AlertControl"></script>
