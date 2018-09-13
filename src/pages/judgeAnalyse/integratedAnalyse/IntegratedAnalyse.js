import TabsMenu from "@/components/TabsMenu/TabsMenu";
export default {
    name: 'IntegratedAnalyse',
    components: {
        TabsMenu
    },
    data() {
        return {
            tabList: [{
                text: 'wifi与人脸分析',
                path: 'wifiFace'
            }, {
                text: 'wifi与车辆分析',
                path: 'wifiCar'
            }]
        }
    },
    methods: {
        onTabClick(item, index) {
            this.$router.push(`/judgeAnalyse/integratedAnalyse/${item.path}`);
        }
    },
    created() {

    },
    mounted() {

    }
}
