<style scoped lang="less" src="./CarManage.less"></style>
<template>
    <div id="carManage">
        <tabs-menu @on-click="onTabClick" :tabList="tabList" vertical>
            <transition name="fade" appear>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </transition>
        </tabs-menu>
    </div>
</template>
<script src="./CarManage"></script>
