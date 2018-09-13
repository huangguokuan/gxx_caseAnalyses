import TabsMenu from "@/components/TabsMenu/TabsMenu";
export default {
    name: 'JudgeAnalyse',
    components: {
        TabsMenu
    },
    data() {
        return {
            tabList: [{
                text: '关系图谱',
                path: 'relationGraph'
            }, {
                text: '人脸技战法',
                path: 'faceTech'
            }, {
                text: '车辆技战法',
                path: 'carTech'
            }, {
                text: '综合分析',
                path: 'integratedAnalyse'
            }]
        }
    },
    methods: {
        onTabClick(item, index) {
            this.$router.push(`/judgeAnalyse/${item.path}`);
        }
    },
    created() {

    },
    mounted() {

    }
}