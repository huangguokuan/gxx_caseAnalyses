import Vue from 'vue';
function getTarget(node) {
    if (node === void 0) {
        node = document.body
    }
    if (node === true) return document.body
    return node instanceof window.Node ? node : document.querySelector(node)
}
Vue.directive('transferDom', {
    inserted(el, { value }, vnode) {
        // if (el.dataset.transfer !== 'true') return false
        el.className = el.className ? el.className + ' v-transfer-dom' : 'v-transfer-dom'
        const parentNode = el.parentNode
        if (!parentNode) return
        const home = document.createComment('')
        let hasMovedout = false

        if (value !== false) {
            parentNode.replaceChild(home, el)
            getTarget(value).appendChild(el)
            hasMovedout = true
        }

        if (!el.__transferDomData) {
            el.__transferDomData = {
                parentNode,
                home,
                target: getTarget(value),
                hasMovedout
            }
        }

    },
    componentUpdated(el, { value }) {
        // if (el.dataset.transfer !== 'true') return false
        const ref$1 = el.__transferDomData;
        if (!ref$1) return
        const { parentNode, home, hasMovedout } = ref$1
        if (!hasMovedout && value) {
            parentNode.replaceChild(home, el)
            getTarget(value).appendChild(el)
            el.__transferDomData = Object.assign({}, el.__transferDomData, { hasMovedout: true, target: getTarget(value) })

        } else if (hasMovedout && value === false) {
            parentNode.replaceChild(el, home)
            el.__transferDomData = Object.assign({}, el.__transferDomData, { hasMovedout: false, target: getTarget(value) })
        } else if (value) {
            getTarget(value).appendChild(el)
        }
    },
    unbind(el) {
        // if (el.dataset.transfer !== 'true') return false
        el.className = el.className.replace('v-transfer-dom', '')
        let ref$1 = el.__transferDomData
        if (!ref$1) return
        const { parentNode, hasMovedout } = ref$1
        if (hasMovedout) {
            parentNode && parentNode.appendChild(el)
        }
        ref$1 = null
    }
})

