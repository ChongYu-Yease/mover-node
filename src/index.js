// import { Button } from 'element-ui'
// 开发单组件例子🌰
import LeftMenu from './left-menu.vue'

LeftMenu.install = function(Vue) {
    // Vue.use(Button)
    // Vue.use(Submenu)
    // Vue.use(MenuItem)
    // Vue.use(Icon)
    // Vue.use(Dropdown)
    // Vue.use(DropdownMenu)
    // Vue.use(DropdownItem)
    // Vue.use(Tooltip)
    Vue.component(LeftMenu.name, LeftMenu)
}
export default LeftMenu

// 开发多组件例子🌰
// const components = [LeftMenu]
// const install = function (Vue) {
//     components.forEach((component) => {
//         Vue.component(component.name, component)
//     })
// }
// export default {
//     install,
// }
