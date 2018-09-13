<style scoped lang="less" src="./PersonManage.less"></style>
<template>
    <div id="personManage">
        <tabs-menu @on-click="onTabClick" :tabList="tabList" vertical>
            <transition name="fade" appear>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </transition>
        </tabs-menu>
    </div>
</template>
<script src="./PersonManage"></script>
