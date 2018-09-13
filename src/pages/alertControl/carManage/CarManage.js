import TabsMenu from "@/components/TabsMenu/TabsMenu";
export default {
    name: 'CarManage',
    components: {
        TabsMenu
    },
    data() {
        return {
            tabList: [{
                text: '布控任务',
                path: 'manageTask'
            },{
                text:'车辆预警',
                path: 'carAlert'
            }]
        }
    },
    methods: {
        onTabClick(item, index) {
            this.$router.push(`/alertControl/carManage/${item.path}`);
        }
    },
    created() {

    },
    mounted() {

    }
}
