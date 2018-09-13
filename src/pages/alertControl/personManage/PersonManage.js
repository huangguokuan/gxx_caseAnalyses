import TabsMenu from "@/components/TabsMenu/TabsMenu";
export default {
    name: 'PersonManage',
    components: {
        TabsMenu
    },
    data() {
        return {
            tabList: [{
                text:'布控任务',
                path:'manageTask'
            },{
                text:'人脸预警',
                path:'faceAlert'
            }]
        }
    },
    methods: {
        onTabClick(item, index) {
            this.$router.push(`/alertControl/personManage/${item.path}`)
        }
    },
    created() {

    },
    mounted() {

    }
}
