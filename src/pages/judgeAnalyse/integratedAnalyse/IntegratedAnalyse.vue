<style scoped lang="less" src="./IntegratedAnalyse.less"></style>
<template>
    <div id="integratedAnalyse">
        <tabs-menu @on-click="onTabClick" :tabList="tabList" vertical>
            <transition name="fade" appear>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </transition>
        </tabs-menu>
    </div>
</template>
<script src="./IntegratedAnalyse"></script>
