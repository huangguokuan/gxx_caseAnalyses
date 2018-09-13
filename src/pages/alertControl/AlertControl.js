import TabsMenu from "@/components/TabsMenu/TabsMenu"
export default {
    name: 'AlertControl',
    components:{
        TabsMenu
    },
    data() {
        return {
            tabList:[{
                text:'人脸布控',
                path:'personManage'
            },{
                text:'车辆布控',
                path:'carManage'
            }]
        }
    },
    methods: {
        onTabClick(item, index) {
            this.$router.push(`/alertControl/${item.path}`);
        }
    },
    created() {

    },
    mounted() {

    }
}
