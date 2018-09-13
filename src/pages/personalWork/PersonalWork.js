import IframeBox from "@/components/IframeBox/IframeBox.vue";
export default {
    name: 'PersonalWork',
    components: {
        IframeBox
    },
    data() {
        return {
            src: 'about:blank',
            height:0,
            top:0
        }
    },
    mounted(){
        const {height,top} = this.$refs.personalWork.getBoundingClientRect()
        this.height=`${height}px`
        this.top=`${top}px`
        this.src = '/FaceFinder/mycase/index'
    },
    beforeDestroy() {
        this.src = "about:blank"
    }
}
