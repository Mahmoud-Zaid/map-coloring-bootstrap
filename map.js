let mainTable = document.querySelector('#colorsTable')
mainTable.addEventListener('click', getColor)
let mapSVG = document.querySelector('#theMap')
mapSVG.addEventListener('click', fillCountry, false)
let chosenColor = { color: '', default: '#D0D0D0' }

//----------------------------------------------------
//pick up a color by clicking

function getColor(e) {
  if (e.target.matches('.picColor')) {
    chosenColor.color = e.target.dataset.color
    let colorsBoxes = document.querySelectorAll('.selectedColorBox')
    for (const colorsBoxe of colorsBoxes) {
      colorsBoxe.classList.remove('selectedColorBox')
    }
    e.target.classList.add('selectedColorBox')
  }
}

//----------------------------------------------------
// fill a country(path) by clicking

function fillCountry(e) {
  if (e.target.matches('path')) {
    if (
      e.target.style.fill === chosenColor.color &&
      e.target.style.fill !== chosenColor.default
    ) {
      e.target.style.fill = chosenColor.default
    } else {
      e.target.style.fill = chosenColor.color
    }
  }
}

//----------------------------------------------------
//zoom with respect the mouse pointer postion

const container = document.querySelector('#divContainer')
const image = document.querySelector('#mapContainer')
const speed = 0.5
let size = {
  w: image.offsetWidth,
  h: image.offsetHeight,
}
let pos = { x: 0, y: 0 }
let target = { x: 0, y: 0 }
let pointer = { x: 0, y: 0 }
let scale = 1

window.addEventListener(
  'wheel',
  (event) => {
    event.preventDefault()
    if (event.ctrlKey) {
      pointer.x = event.pageX - container.offsetLeft
      pointer.y = event.pageY - container.offsetTop
      target.x = (pointer.x - pos.x) / scale
      target.y = (pointer.y - pos.y) / scale

      scale += -1 * Math.max(-1, Math.min(1, event.deltaY)) * speed * scale

      //max_scale = 4
      const max_scale = 8
      const min_scale = 1
      scale = Math.max(min_scale, Math.min(max_scale, scale))

      pos.x = -target.x * scale + pointer.x
      pos.y = -target.y * scale + pointer.y

      if (pos.x > 0) pos.x = 0
      if (pos.x + size.w * scale < size.w) pos.x = -size.w * (scale - 1)
      if (pos.y > 0) pos.y = 0
      if (pos.y + size.h * scale < size.h) pos.y = -size.h * (scale - 1)

      image.style.transform = `translate(${pos.x}px,${pos.y}px) scale(${scale},${scale})`
    } else {
      pos.x -= event.deltaX * 2
      pos.y -= event.deltaY * 2
    }
  },
  { passive: false }
)

//----------------------------------------------------

window.addEventListener('mousemove', getMouseDirection, false)

let oldX = 0
let oldY = 0

function getMouseDirection(e) {
  if (e.altKey) {
    //deal with the horizontal case
    if (oldX < e.pageX) {
      pos.x = pos.x + 10
    } else {
      pos.x = pos.x - 10
    }

    //deal with the vertical case
    if (oldY < e.pageY) {
      pos.y = pos.y + 10
    } else {
      pos.y = pos.y - 10
    }

    oldX = e.pageX
    oldY = e.pageY

    image.style.transform = `translate(${pos.x}px,${pos.y}px) scale(${scale},${scale})`
  }
}

//----------------------------------------------------

let svg = null
let width
let height

document.getElementById('button').addEventListener('click', function () {
  svg = mapSVG
  width = svg.getBoundingClientRect().width
  height = svg.getBoundingClientRect().height
  //-----------------------------------------
  let canvas = document.getElementById('c')
  svg.setAttribute('width', width)
  svg.setAttribute('height', height)
  canvas.width = width
  canvas.height = height
  let data = new XMLSerializer().serializeToString(svg)
  let win = window.URL || window.webkitURL || window
  let img = new Image()
  let blob = new Blob([data], { type: 'image/svg+xml' })
  let url = win.createObjectURL(blob)
  img.onload = function () {
    canvas.getContext('2d').drawImage(img, 0, 0)
    win.revokeObjectURL(url)
    let uri = canvas.toDataURL('image/png').replace('image/png', 'octet/stream')
    let a = document.createElement('a')
    document.body.appendChild(a)
    a.style = 'display: none'
    a.href = uri
    a.download =
      (svg.id ||
        svg.svg.getAttribute('name') ||
        svg.getAttribute('aria-label') ||
        'untitled') + '.png'
    a.click()
    window.URL.revokeObjectURL(uri)
    document.body.removeChild(a)
  }
  img.src = url
})
