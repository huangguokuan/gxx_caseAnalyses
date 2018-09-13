<style scoped lang="less" src="./Home.less"></style>
<template>
    <div id="home">
        <Menu ref="menu" mode="horizontal" theme="primary" :active-name="activeName" @on-select="directTo">
            <div class="layout-logo"><img src="../../images/nav/logo.png" width="36">
                <span>公安情报分析系统</span>
            </div>
            <div class="layout-nav">
                <menu-item :name="menu.link" v-for="(menu,index) in menuLists" :key="index">
                    <span :style="{backgroundImage:'url('+menu.icon+')'}">{{menu.text}}</span>
                </menu-item>
            </div>
            <div class="layout-admin" :title="username">
                <img src="../../images/nav/admin/admin.png">
                <span>{{username}}</span>
            </div>
        </Menu>
        <div class="layout-content">
            <div class="layout-content-main">
                <transition name="fade" mode="out-in" appear>
                    <keep-alive>
                        <router-view></router-view>
                    </keep-alive>
                </transition>
            </div>
        </div>
        <div class="layout-copy">
            Copyright &copy; 高新兴科技集团股份有限公司 版权所有
        </div>
    </div>
</template>
<script>
import homePageSrc from '@/images/nav/homePage.png';
import dataSearchSrc from '@/images/nav/dataSearch.png';
import dataAnalyseSrc from '@/images/nav/dataAnalyse.png';
import superRecordSrc from '@/images/nav/superRecord.png';
import alertControlSrc from '@/images/nav/alertControl.png';
import operateLogSrc from '@/images/nav/operateLog.png';

const menuLists = [{
    text: '首页',
    icon: homePageSrc,
    link: '/homePage'
}, {
    text: '资源检索',
    icon: dataSearchSrc,
    link: '/resourceSearch'
}, {
    text: '研判分析',
    icon: dataAnalyseSrc,
    link: '/judgeAnalyse'
}, {
    text: '布控预警',
    icon: alertControlSrc,
    link: '/alertControl'
}, {
    text: '个人工作',
    icon: superRecordSrc,
    link: '/personalWork'
}, {
    text: '系统管理',
    icon: operateLogSrc,
    link: '/systemManage'
}];
export default {
    name:'Home',
    data() {
        return {
            username: '',
            menuLists,
            activeName: menuLists[0].link
        }
    },
    watch: {
        $route(to, from) {
            let path = to.fullPath.split('/')[1];
            for (let i of menuLists) {
                let link = i.link;
                if (path == link.slice(1)) {
                    this.activeName = link;
                    this.$nextTick(() => {
                        this.$refs.menu.updateActiveName();
                    });
                    break;
                }
            }
        }
    },
    methods: {
        directTo(name) {
            this.$router.push(name);
        }
    },
    created() {

    }
}

</script>
