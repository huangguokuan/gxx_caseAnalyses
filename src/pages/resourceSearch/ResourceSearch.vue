<style scoped lang="less" src="./ResourceSearch.less"></style>
<template>
    <div id="resourceSearch">
        <tabs-menu @on-click="onTabClick" :tabList="tabList">
            <transition name="fade" appear>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </transition>
        </tabs-menu>
    </div>
</template>
<script src="./ResourceSearch"></script>
