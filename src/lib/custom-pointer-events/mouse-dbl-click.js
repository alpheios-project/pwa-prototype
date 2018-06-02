import PointerEvt from './pointer-evt.js'

export default class MouseDblClick extends PointerEvt {
  constructor (element, evtHandler) {
    super()
    this.element = element
    this.evtHandler = evtHandler
  }

  setEndPoint (clientX, clientY) {
    super.setEndPoint(clientX, clientY)
    this.done = true
    return this
  }

  static listen (selector, evtHandler) {
    let elements = document.querySelectorAll(selector)
    for (const element of elements) {
      let event = new this(element, evtHandler)
      element.addEventListener('dblclick', this.dblClickListener.bind(this, event), {passive: true})
    }
  }
}
