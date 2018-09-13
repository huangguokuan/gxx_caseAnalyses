<style scoped lang="less" src="./JudgeAnalyse.less"></style>
<template>
    <div id="judgeAnalyse">
        <tabs-menu @on-click="onTabClick" :tabList="tabList">
            <transition name="fade" appear>
                <keep-alive>
                    <router-view/>
                </keep-alive>
            </transition>
        </tabs-menu>
    </div>
</template>
<script src="./JudgeAnalyse"></script>
