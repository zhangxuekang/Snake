const CHANGECOLOR = false
const FLASH = CHANGECOLOR && false
const MOVE = CHANGECOLOR && false
const BOOM = CHANGECOLOR && false
const DIRECTIONS = [37, 38, 39, 40] // 移动方向
const SNAKECOLOR = [
  'rgb(153, 0, 0)',
  'rgb(180, 95, 6)',
  'rgb(191, 144, 0)',
  'rgb(56, 118, 29)',
  'rgb(19, 79, 92)',
  'rgb(17, 85, 204)',
  'rgb(11, 83, 148)',
  'rgb(53, 28, 117)',
  'rgb(116, 27, 71)',
  'rgb(91, 15, 0)',
  'rgb(152, 0, 0)',
  'rgb(255, 0, 0)',
  'rgb(255, 153, 0)',
  'rgb(255, 255, 0)',
  'rgb(0, 255, 0)',
  'rgb(0, 255, 255)',
  'rgb(74, 134, 232)',
  'rgb(0, 0, 255)',
  'rgb(153, 0, 255)',
  'rgb(255, 0, 255)'
]
const THEME = {
  bodyColor: '#555',
  stageColor: '#fff',
  stageBorder: '#555',
  snakeNode: '#0d3634',
  food: '#d1a85b'
}
const $head = document.querySelector('head')
const $body = document.querySelector('body')
const style = `
body{background-color:${THEME.bodyColor}}
#stage *, #grade *{margin:0;padding:0}
#stage{width:500px;height:500px;border:1px solid ${THEME.stageBorder};margin:0 auto;position:relative;background-color:${THEME.stageColor}}
#grade{width:500px;height:20px;margin:0 auto;position:relative;background-color:${THEME.stageColor};line-height:20px;text-align:center;margin-bottom:4px;font-size:12px}
.number{display:inline-block;width:50px}
.node{position:absolute;background-color:${THEME.snakeNode}}
.food{position:absolute;background-color:${THEME.food};border-radius:50%}
`
const $style = document.createElement('style')
$style.innerHTML = style
$head.appendChild($style)
const $stage = document.createElement('div')
const $grade = document.createElement('div')
$stage.setAttribute('id', 'stage')
$grade.setAttribute('id', 'grade')
$body.appendChild($grade)
$body.appendChild($stage)
if (CHANGECOLOR) {
  const $style_s = document.createElement('style')
  $style_s.setAttribute('id', 'snake-color')
  let style_s = ''
  let i = 0
  while (i < 10000) {
    style_s += `.n-${i}{background-color:${SNAKECOLOR[Math.floor(Math.random() * SNAKECOLOR.length)]}}`
    i++
  }
  $style_s.innerHTML = style_s
  $body.appendChild($style_s)
}

/**
 * 链表节点类
 */
class LinkItem {
  constructor(value) {
    this.value = value
    this.next = null
  }
}

/**
 * 链表类
 */
class LinkedList {
  constructor(list = []) {
    this.head = null
    this.length = 0
    list.forEach((item) => {
      this.addLast(item)
    })
  }

  addLast(node) {
    return this._insert(this.length, node)
  }

  addFirst(node) {
    return this._insert(0, node)
  }

  removeLast() {
    return this._removeAt(this.length - 1)
  }

  removeFirst() {
    return this._removeAt(0)
  }

  _removeAt(position) {
    const node = this._get(position)
    return this._remove(node)
  }

  _insert(position, node) {
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

  _remove(node) {
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

  _get(position) {
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

}

/**
 * 游戏主类
 */
class Game {
  constructor() {
    this.$stage = document.querySelector('#stage')
    this.food = []
    this.speed = 150
    this.snake = new Snake(this.$stage)
    this.addFood()
    this.handleKeyDown = this.handleKeyDown.bind(this)
    window.addEventListener('keydown', this.handleKeyDown)
  }

  /**
   * 键盘事件
   * @param {*} e 
   */
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

  /**
   * 放蛇(游戏开始)
   */
  go() {
    const $grade = document.querySelector('#grade')
    $grade.innerHTML = `小蛇长度: <span class='number'>${this.snake.body.length}</span>  吃下的食物: <span class='number'>${this.snake.food}</span>  步数: <span class='number'>${this.snake.step}</span>  速度: <span class='number'>${this.speed}</span>`
    // 判断上次走步有没有吃食物
    const $head = this.snake.body.head.value
    const { x: bx, y: by } = this.getPosition($head)
    const $food = this.food.find(($item) => {
      const { x: fx, y: fy } = this.getPosition($item)
      return fx === bx && fy === by
    })
    this.snake.move(!!$food)
    if (!!$food) {
      const snakeLen = this.snake.body.length
      // 每增加5节, 就加速一次
      if (snakeLen % 5 === 0) {
        this.incSpeed()
      }
      // 如果吃到了, 就添加新食物
      this.food.length = 0
      this.$stage.removeChild($food)
      this.addFood()
    }

    if (this.isAlive()) {
      setTimeout(() => {
        this.go()
      }, this.speed)
    } else {
      alert('小蛇已死, 埋了吧。')
    }
  }

  isAlive() {
    const $head = this.snake.body.head.value
    const { x: headX, y: headY } = this.getPosition($head)
    const stageSize = this.getSize(this.$stage)
    // 撞墙而死
    if (headX < 0 || headX > stageSize.width - this.snake.nodeSize.width || headY < 0 || headY > stageSize.height - this.snake.nodeSize.height) {
      return false
    }
    // 撞自己而死
    let current = this.snake.body.head
    while (current) {
      const $node = current.value
      const { x: nodeX, y: nodeY } = this.getPosition($node)
      if ($node !== $head && nodeX === headX && nodeY === headY) {
        return false
      }
      current = current.next
    }

    return true
  }

  incSpeed() {
    this.speed = Math.max(10, this.speed - 10)
  }

  decSpeed() {
    this.speed = Math.min(2000, this.speed + 10)
  }

  /**
   * 随机在页面中投食
   */
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

/**
 * 小蛇类
 */
class Snake {
  constructor($stage) {
    this.$stage = $stage
    this.direction = 39
    this.nodeSize = {
      width: 10,
      height: 10
    }
    this.step = 1
    this.food = 0
    this.body = new LinkedList([10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((num) => {
      return this.addNode(this.nodeSize.width * num, this.nodeSize.height)
    }))
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
      // 如果没有吃到食物, 就去掉一节
      this.$stage.removeChild(this.body.removeLast())
    } else {
      this.food++
    }
    this.updateColorClass()
    this.step++
  }

  updateColorClass() {
    const snake = this.body
    const len = snake.length
    let current = snake.head
    let prevNum
    let index = 0
    const nowNum = Math.floor(Math.random() * len)
    while (current) {
      const $node = current.value
      this._removeClass($node, /^d-\d+$/)
      this._addClass($node, 'd-' + index)
      let num
      if (FLASH) {
        this._removeClass($node, /^n-\d+$/)
        num = Math.floor(Math.random() * len)
        this._addClass($node, 'n-' + num)
      } else if (MOVE) {
        if (index === 0) {
          this._removeClass($node, /^n-\d+$/)
          this._addClass($node, 'n-' + nowNum)
        } else {
          this._addClass($node, 'n-' + prevNum)
        }
        const flag = /\bn-(\n+)\b/.exec($node.getAttribute('class'))
        prevNum = flag ? parseInt(flag[1], 10) : 0
      } else if (BOOM) {
        this._removeClass($node, /^n-\d+$/)
        this._addClass($node, 'n-' + nowNum)
      } else {
        this._removeClass($node, /^n-\d+$/)
        this._addClass($node, 'n-' + index)
      }
      current = current.next
      index++
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

  _addClass($e, className) {
    const classString = $e.getAttribute('class')
    $e.setAttribute('class', classString ? classString + ' ' + className : className)
  }

  _removeClass($e, nameReg) {
    let classArr = $e.getAttribute('class').split(' ')
    classArr = classArr.filter(item => !nameReg.test(item))
    $e.setAttribute('class', classArr.join(' '))
  }

}

const game = new Game()
game.go()
