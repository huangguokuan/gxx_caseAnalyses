export default {
    name: 'IframeBox',
    props:{
        src:{
            type:String,
            default:'about:blank'
        },
        height:{
            type: [String,Number],
            default:'100%'
        },
        width: {
            type: [String, Number],
            default: '100%'
        },
        top:{
            type: [String, Number],
            default: 0
        },
        left: {
            type: [String, Number],
            default: 0
        },
        bottom: {
            type: [String, Number],
            default: 'auto'
        },
        right: {
            type: [String, Number],
            default: 'auto'
        },
        zIndex: {
            type: Number,
            default: 9
        }
    },
    data() {
        return {
            showIframe:true
        }
    },
    activated() {
        this.showIframe = true
    },
    deactivated() {
        this.showIframe = false
    }
}
