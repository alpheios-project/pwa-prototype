import PointerEvt from './pointer-evt.js'

export default class Swipe extends PointerEvt {
  constructor (element, evtHandler, mvmntThreshold = 100, durationThreshold = 600) {
    super()
    this.element = element
    this.evtHandler = evtHandler

    this.mvmntThreshold = mvmntThreshold
    this.durationThreshold = durationThreshold
    this.direction = Swipe.directions.NONE
  }

  static get directions () {
    return {
      UP: 'up',
      RIGHT: 'right',
      DOWN: 'down',
      LEFT: 'left',
      NONE: 'none'
    }
  }

  isDirectedUp () {
    return this.direction === Swipe.directions.UP
  }

  isDirectedRight () {
    return this.direction === Swipe.directions.RIGHT
  }

  isDirectedDown () {
    return this.direction === Swipe.directions.DOWN
  }

  isDirectedLeft () {
    return this.direction === Swipe.directions.LEFT
  }

  setEndPoint (clientX, clientY) {
    super.setEndPoint(clientX, clientY)
    this.done = this.mvmntDist <= this.mvmntThreshold && this.duration >= this.durationThreshold

    if (this.mvmntXAbs > this.mvmntThreshold || this.mvmntYAbs > this.mvmntThreshold) {
      // This is a swipe
      this.done = true
      if (this.mvmntX > this.mvmntThreshold && this.mvmntYAbs < this.mvmntThreshold) {
        this.direction = Swipe.directions.RIGHT
      } else if (this.mvmntX > this.mvmntThreshold && this.mvmntYAbs < this.mvmntThreshold) {
        this.direction = Swipe.directions.LEFT
      } else if (this.mvmntY > this.mvmntThreshold && this.mvmntXAbs < this.mvmntThreshold) {
        this.direction = Swipe.directions.DOWN
      } else if (-this.mvmntY > this.mvmntThreshold && this.mvmntXAbs < this.mvmntThreshold) {
        this.direction = Swipe.directions.UP
      }
    }
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
