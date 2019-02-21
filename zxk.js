const DIRECTIONS = [37, 38, 39, 40]
class LinkItem {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

class LinkedList {
  constructor(list = []) {
    this.head = null
    this.length = 0
    list.forEach((item) => {
      this.addLast(item)
    })
  }

  /**
   * 根据位置, 获取元素
   * @param number position 
   */
  get(position) {
    if (position >= 0 && position <= this.length) {
      let current = this.head
      let index = 0
      while (index < position && current) {
        current = current.next
        index++
      }

      return current && current.value
    } else {
      return null
    }
  }

  /**
   * 清空链表
   */
  clear() {
    this.head = null
    this.length = 0
  }

  /**
   * 从尾部加元素
   * @param any node 
   */
  addLast(node) {
    return this.insert(this.length, node)
  }

  /**
   * 从头部加元素
   * @param any node 
   */
  addFirst(node) {
    return this.insert(0, node)
  }

  /**
   * 从尾部删元素
   */
  removeLast() {
    return this.removeAt(this.length - 1)
  }

  /**
   * 从头部删元素
   */
  removeFirst() {
    return this.removeAt(0)
  }

  /**
   * 根据位置删元素
   * @param number position 
   */
  removeAt(position) {
    const node = this.get(position)
    return this.remove(node)
  }

  /**
   * 判断是否存在指定元素
   * @param any node 
   */
  contains(node) {
    return this.indexOf(node) > -1
  }

  /**
   * 将元素插入到指定位置
   * @param number position 
   * @param any node 
   */
  insert(position, node) {
    const linkItem = new LinkItem(node)
    if (position >= 0 && position <= this.length) {
      if (position === 0) {
        linkItem.next = this.head
        this.head = linkItem
      } else {
        let current = this.head
        let prev
        let index = 0
        while (index < position) {
          prev = current
          current = current.next
          index++
        }
        linkItem.next = current
        prev.next = linkItem
      }
      this.length++

      return true
    } else {
      return false
    }
  }

  /**
   * 删除元素(第一个)
   * @param any node 
   */
  remove(node) {
    if (this.length !== 0) {
      let current = this.head
      let prev = null
      while (current.value !== node && current.next) {
        prev = current
        current = current.next
      }
      if (current.value === node) {
        if (this.head === current) {
          this.head = current.next
        } else {
          prev.next = current.next
        }
        this.length--
      }
    }

    return node
  }

  /**
   * 获取元素位置(第一个)
   * @param any node 
   */
  indexOf(node) {
    let current = this.head
    let index = 0
    while (current.value !== node && current.next) {
      current = current.next
      index++
    }
    if (current.value === node) {
      return index
    } else {
      return -1
    }
  }

  /**
   * 转成字符串
   */
  toString() {
    return this.toArray().join(',')
  }

  /**
   * 转成数组
   */
  toArray() {
    const list = []
    if (this.length === 0) {
      return list
    } else {
      let current = this.head
      list.push(current.value)
      while (current.next) {
        current = current.next
        list.push(current.value)
      }
      return list
    }
  }
}

class Game {
  constructor() {
    this.$stage = document.querySelector('#stage')
    this.food = []
    this.speed = 100
    this.snake = new Snake(this.$stage)
    this.addFood()
    this.handleKeyDown = this.handleKeyDown.bind(this)
    window.addEventListener('keydown', this.handleKeyDown)
  }

  handleKeyDown(e) {
    const { direction } = this.snake
    const keyCode = e.keyCode
    if (keyCode === 37 && direction === 39
      || keyCode === 38 && direction === 40
      || keyCode === 39 && direction === 37
      || keyCode === 40 && direction === 38) {
      return
    } else if (~DIRECTIONS.indexOf(keyCode)) { // 转向
      this.snake.turn(keyCode)
    } else if (keyCode === 187) { // +快
      this.incSpeed()
    } else if (keyCode === 189) { // -慢
      this.decSpeed()
    }
  }

  go() {
    const $head = this.snake.body.head.value
    const { x: bx, y: by } = this.getPosition($head)
    const $food = this.food.find(($item) => {
      const {x: fx, y: fy} = this.getPosition($item)
      return fx === bx && fy === by
    })
    this.snake.move(!!$food)
    if (!!$food) {
      this.food.length = 0
      this.$stage.removeChild($food)
      this.addFood()
    }
    const stageSize = this.getSize(this.$stage)
    const { x, y } = this.getPosition($head)
    if (x >= 0 && x <= stageSize.width - this.snake.nodeSize.width && y >= 0 && y <= stageSize.height - this.snake.nodeSize.height) {
      setTimeout(() => {
        this.go()
      }, this.speed)
    } else {
      alert('失败!')
    }
  }

  incSpeed() {
    this.speed = Math.min(2000, this.speed + 100)
  }

  decSpeed() {
    this.speed = Math.max(100, this.speed - 100)
  }

  addFood() {
    const { x, y } = this.computeFoodPosition()
    const $food = document.createElement('div')
    $food.className = 'food'
    $food.style.left = x + 'px'
    $food.style.top = y + 'px'
    $food.style.width = this.snake.nodeSize.width + 'px'
    $food.style.height = this.snake.nodeSize.height + 'px'
    this.$stage.appendChild($food)
    this.food.push($food)
    return $food
  }

  computeFoodPosition() {
    const stageSize = this.getSize(this.$stage)
    const nodeSize = this.snake.nodeSize
    const xSize = Math.floor(stageSize.width / nodeSize.width)
    const ySize = Math.floor(stageSize.height / nodeSize.height)
    let flag = false
    let x
    let y
    do {
      flag = false
      x = parseInt(Math.random() * (xSize - 0), 10) * nodeSize.width
      y = parseInt(Math.random() * (ySize - 0), 10) * nodeSize.height
      let current = this.snake.body.head
      while (current) {
        const pos = this.getPosition(current.value)
        if (pos.x === x && pos.y === y) {
          flag = true
          break
        }
        current = current.next
      }
    } while (flag);

    return { x, y }
  }

  getPosition($e) {
    const x = parseFloat($e.style.left)
    const y = parseFloat($e.style.top)
    return { x, y }
  }

  getSize($e) {
    const rect = $e.getClientRects()[0]
    const width = rect.width
    const height = rect.height
    return { width, height }
  }
}

class Snake {
  constructor($stage) {
    this.$stage = $stage
    this.direction = 39

    this.nodeSize = {
      width: 10,
      height: 10
    }
    this.body = new LinkedList([
      this.addNode(this.nodeSize.width * 2, this.nodeSize.height),
      this.addNode(this.nodeSize.width, this.nodeSize.height),
    ])
  }

  addNode(x, y) {
    const $node = document.createElement('div')
    $node.className = 'node'
    $node.style.left = x + 'px'
    $node.style.top = y + 'px'
    $node.style.width = this.nodeSize.width + 'px'
    $node.style.height = this.nodeSize.height + 'px'
    this.$stage.appendChild($node)
    return $node
  }

  move(eat = false) {
    const $head = this.body.head.value
    const { x, y } = this.getPosition($head)
    let nextX = x
    let nextY = y
    switch (this.direction) {
      case 37:
        nextX = x - this.nodeSize.width
        break
      case 38:
        nextY = y - this.nodeSize.height
        break
      case 39:
        nextX = x + this.nodeSize.width
        break
      case 40:
        nextY = y + this.nodeSize.height
        break
    }
    this.body.addFirst(this.addNode(nextX, nextY))
    if (!eat) {
      this.$stage.removeChild(this.body.removeLast())
    }
  }

  turn(type) {
    if (~DIRECTIONS.indexOf(type)) {
      this.direction = type
    }
  }

  getPosition($node) {
    const x = parseFloat($node.style.left)
    const y = parseFloat($node.style.top)
    return { x, y }
  }

}

const game = new Game()
game.go()