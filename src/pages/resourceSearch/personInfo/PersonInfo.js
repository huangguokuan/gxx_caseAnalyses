import IframeBox from "@/components/IframeBox/IframeBox.vue";
export default {
    name: 'PersonInfo',
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
    mounted() {
        const {height,top} = this.$refs.personInfo.getBoundingClientRect()
        this.height=`${height}px`
        this.top=`${top}px`
        this.src = '/FaceFinder/facesearch/facesearch'
    },
    beforeDestory() {
        this.src = "about:blank"
    }
}