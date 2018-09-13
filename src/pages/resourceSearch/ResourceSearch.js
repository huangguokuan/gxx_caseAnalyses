import TabsMenu from "@/components/TabsMenu/TabsMenu";
export default {
    name: 'ResourceSearch',
    components: {
        TabsMenu
    },
    data() {
        return {
            tabList: [{
                text: '人脸检索',
                path: 'personInfo'
            }, {
                text: '车辆检索',
                path: 'carInfo'
            }, {
                text: '旅业人脸检索',
                path: 'tourInfo'
            }, {
                text: 'WIFI检索',
                path: 'wifiInfo'
            }]
        }
    },
    methods: {
        onTabClick(item, index) {
            this.$router.push(item.path);
        }
    },
    created() {

    },
    mounted() {

    }
}
