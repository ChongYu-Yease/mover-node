<template>
  <div class="mover-node" ref="mover-node" @mousedown="handleDragNode">
    <div v-if="notSlot" class="default-mover-node">
      <!-- <i class="el-icon-rank"></i> -->
    </div>
    <slot v-else></slot>
  </div>
</template>

<script lang='ts'>
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component({
  name: 'MoverNode',
})
export default class MoverNode extends Vue {
  timer: number = 0
  @Prop({
    default: () => '',
    type: String,
  })
  leftNodeClass!: string

  @Prop({
    default: () => '',
    type: String,
  })
  rightNodeClass!: string

  @Prop({
    default: () => '',
    type: String,
  })
  topNodeClass!: string

  @Prop({
    default: () => '',
    type: String,
  })
  bottomNodeClass!: string

  @Prop({
    default: () => 7,
    type: Number,
  })
  time!: number

  get allProps() {
    return {
      leftNodeClass: this.leftNodeClass,
      rightNodeClass: this.rightNodeClass,
      topNodeClass: this.topNodeClass,
      bottomNodeClass: this.bottomNodeClass,
    }
  }

  @Watch('allProps', { immediate: true, deep: true })
  handleAllPropsChange(lastedValue) {
    const { leftNodeClass, rightNodeClass, topNodeClass, bottomNodeClass } = lastedValue
    this.$nextTick(() => {
      const divElement = this.$refs['mover-node'] as HTMLDivElement
      if (leftNodeClass && rightNodeClass && divElement) {
        divElement.style.cursor = 'col-resize'
        return
      } else if (topNodeClass && bottomNodeClass && divElement) {
        divElement.style.cursor = 'row-resize'
        return
      } else if (divElement) {
        divElement.style.cursor = 'move'
        return
      }
    })
  }
  // 防抖函数
  private debounce(fn: Function, delay): Function {
    let timer: number = 0
    const _this = this // 取debounce执行作用域的this
    return function () {
      const args = arguments
      if (timer) {
        window.clearTimeout(timer)
      }
      timer = window.setTimeout(function () {
        fn.apply(_this, args) // 用apply指向调用debounce的对象，相当于_this.fn(args);
      }, delay)
    }
  }
  private handleDragNode(event): void {
    // 取消事件默认行为 防止页面拖动层的文字被选中
    event = event || window.event
    if (event.stopProgation) {
      event.stopPropagation()
    } else {
      event.cancelBubble = true
    }
    if (event.preventDefault) {
      event.preventDefault()
    } else {
      event.returnValue = false
    }
    const eventTargetElement: HTMLElement = event.target

    if (this.topNodeClass && this.bottomNodeClass) {
      this.handleTopAndBottomNode(event, eventTargetElement)
      return
    } else if (this.leftNodeClass && this.rightNodeClass) {
      this.handleLeftAndRightNode(event, eventTargetElement)
      return
    } else {
      this.handleSelfNode(event, eventTargetElement)
      return
    }
  }
  /**
   * 处理上下节点
   * @param event MouseEvent
   * @param eventTargetElement 运动节点 HTMLElement
   */
  handleTopAndBottomNode(event: MouseEvent, eventTargetElement: HTMLElement): false {
    const startPositionY = event.clientY

    const topNode: HTMLElement | null = document.querySelector(`.${this.topNodeClass}`) || null

    let topNodeOriginalHeight: number
    if (topNode) {
      topNodeOriginalHeight = topNode.getBoundingClientRect().height
    }
    const bottomNode: HTMLElement | null =
      document.querySelector(`.${this.bottomNodeClass}`) || null
    let bottomNodeOriginalOffsetTop: number
    if (bottomNode) {
      bottomNodeOriginalOffsetTop = bottomNode.offsetTop
    }

    const debounceFunction = this.debounce(this.handleTopAndBottomMousemove, this.time)
    document.onmousemove = (e) => {
      debounceFunction(
        e,
        startPositionY,
        topNode,
        topNodeOriginalHeight,
        bottomNode,
        bottomNodeOriginalOffsetTop
      )
    }

    document.onmouseup = () => {
      document.onmousemove = null
      document.onmouseup = null
    }
    return false
  }

  /**
   * 处理左右节点
   * @param event MouseEvent
   * @param eventTargetElement 运动节点 HTMLElement
   */
  private handleLeftAndRightNode(event: MouseEvent, eventTargetElement: HTMLElement): false {
    const startPositionX = event.clientX

    const leftNode: HTMLElement | null = document.querySelector(`.${this.leftNodeClass}`) || null

    let leftNodeOriginalWidth: number
    if (leftNode) {
      leftNodeOriginalWidth = leftNode.getBoundingClientRect().width
    }
    const rightNode: HTMLElement | null = document.querySelector(`.${this.rightNodeClass}`) || null
    let rightNodeOriginalOffsetLeft: number
    if (rightNode) {
      rightNodeOriginalOffsetLeft = rightNode.offsetLeft
    }

    const debounceFunction = this.debounce(this.handleLeftAndRightMousemove, this.time)
    document.onmousemove = (e) => {
      debounceFunction(
        e,
        startPositionX,
        leftNode,
        leftNodeOriginalWidth,
        rightNode,
        rightNodeOriginalOffsetLeft
      )
    }

    document.onmouseup = () => {
      document.onmousemove = null
      document.onmouseup = null
    }
    return false
  }
  private handleSelfNode(event: MouseEvent, eventTargetElement: HTMLElement): false {
    const startPositionX = event.clientX
    const startPositionY = event.clientY

    const slefNodeLeft = eventTargetElement.clientLeft
    const slefNodeTop = eventTargetElement.clientTop

    const debounceFunction = this.debounce(this.handleSelfMousemove, this.time)
    document.onmousemove = (e) => {
      debounceFunction(
        e,
        startPositionX,
        slefNodeLeft,
        startPositionY,
        slefNodeTop,
        eventTargetElement
      )
    }

    document.onmouseup = () => {
      document.onmousemove = null
      document.onmouseup = null
    }
    return false
  }
  /**
   * @param e MouseEvent
   * @param startPositionX 开始的x轴坐标
   * @param leftNode 拖动区域的左侧节点
   * @param leftNodeOriginalWidth 拖动区域的左侧节点的开始宽度
   * @param rightNode 拖动区域的右侧节点
   * @param rightNodeOriginalWidth 拖动区域的右侧节点的开始宽度
   */
  private handleLeftAndRightMousemove(
    e: MouseEvent,
    startPositionX: number,
    leftNode: HTMLElement,
    leftNodeOriginalWidth: number,
    rightNode: HTMLElement,
    rightNodeOriginalOffsetLeft: number
  ) {
    const endPositionX = e.clientX
    // 鼠标运动轨迹
    const moveDistance = endPositionX - startPositionX

    if (leftNode) {
      leftNode.style.width = leftNodeOriginalWidth + moveDistance + 'px'
      leftNode.style.minWidth = leftNodeOriginalWidth + moveDistance + 'px'
      leftNode.style.maxWidth = leftNodeOriginalWidth + moveDistance + 'px'
    }
    if (rightNode) {
      rightNode.style.left = rightNodeOriginalOffsetLeft + moveDistance + 'px'
    }
  }
  /**
   * @param e MouseEvent
   * @param startPositionY 开始的y轴坐标
   * @param topNode 拖动区域的上侧节点
   * @param topNodeOriginalHeight 拖动区域的上侧节点的开始高度
   * @param bottomNode 拖动区域的下侧节点
   * @param bottomNodeOriginalHeight 拖动区域的下侧节点的开始高度
   */
  private handleTopAndBottomMousemove(
    e: MouseEvent,
    startPositionY: number,
    topNode: HTMLElement,
    topNodeOriginalHeight: number,
    bottomNode: HTMLElement,
    bottomNodeOriginalOffsetTop: number
  ) {
    const endPositionY = e.clientY
    // 鼠标运动轨迹
    const moveDistance = endPositionY - startPositionY
    if (topNode) {
      topNode.style.height = topNodeOriginalHeight + moveDistance + 'px'
      topNode.style.minHeight = topNodeOriginalHeight + moveDistance + 'px'
      topNode.style.maxHeight = topNodeOriginalHeight + moveDistance + 'px'
    }
    if (bottomNode) {
      bottomNode.style.top = bottomNodeOriginalOffsetTop + moveDistance + 'px'
    }
  }
  /**
   * @param e MouseEvent
   * @param startPositionX X轴起点
   * @param startPositionY Y轴起点
   * @param eventTargetElement HtmlElement
   */
  private handleSelfMousemove(
    e,
    startPositionX,
    slefNodeLeft,
    startPositionY,
    slefNodeTop,
    eventTargetElement
  ) {
    const endPositionX = e.clientX
    const endPositionY = e.clientY
    // 鼠标运动轨迹
    const moveDistanceX = endPositionX - startPositionX
    const moveDistanceY = endPositionY - startPositionY

    if (eventTargetElement) {
      eventTargetElement.style.left = slefNodeLeft + moveDistanceX + 'px'
      eventTargetElement.style.top = slefNodeTop + moveDistanceY + 'px'
    }
  }
  private get notSlot(): boolean {
    const slots = this.$slots
    const notSlot = Object.keys(slots).map((slot) => slot).length === 0
    return notSlot
  }
}
</script>
<style lang='less' scoped>
.mover-node {
  position: relative;
  // cursor: pointer;
  // margin: 0 5px;
  .default-mover-node {
    display: table;
    background-color: #909399;
    height: 100%;
    width: 20px;
    border-radius: 4px;

    text-align: center;
    i {
      display: table-cell;
      vertical-align: middle;
    }
  }
}
</style>