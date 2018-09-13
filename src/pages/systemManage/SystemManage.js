import IframeBox from "@/components/IframeBox/IframeBox.vue";
export default {
    name: 'SystemManage',
    components: {
        IframeBox
    },
    data() {
        return {
            src: 'about:blank',
            height: 0,
            top: 0
        }
    },
    mounted() {
        const { height, top } = this.$refs.systemManage.getBoundingClientRect()
        this.height = `${height}px`
        this.top = `${top}px`
        this.src = '/FaceFinder/system/index'
    },
    beforeDestroy() {
        this.src = "about:blank"
    }
}
