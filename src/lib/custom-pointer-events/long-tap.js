import PointerEvt from './pointer-evt.js'

export default class LongTap extends PointerEvt {
  constructor (element, evtHandler, mvmntThreshold = 5, durationThreshold = 125) {
    super()
    this.element = element
    this.evtHandler = evtHandler

    this.mvmntThreshold = mvmntThreshold
    this.durationThreshold = durationThreshold
  }

  setEndPoint (clientX, clientY) {
    super.setEndPoint(clientX, clientY)
    this.done = this.mvmntDist <= this.mvmntThreshold && this.duration >= this.durationThreshold
  }

  static listen (selector, evtHandler, mvmntThreshold, durationThreshold) {
    let elements = document.querySelectorAll(selector)
    for (const element of elements) {
      let event = new this(element, evtHandler, mvmntThreshold, durationThreshold)
      if (window.PointerEvent) {
        // Will use pointer events
        element.addEventListener('pointerdown', this.pointerDownListener.bind(this, event), {passive: true})
        element.addEventListener('pointerup', this.pointerUpListener.bind(this, event), {passive: true})
      } else {
        element.addEventListener('touchstart', this.touchStartListener.bind(this, event), {passive: true})
        element.addEventListener('touchend', this.touchEndListener.bind(this, event), {passive: true})
      }
    }
  }
}
