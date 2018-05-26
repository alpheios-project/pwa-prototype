import MouseDoubleClick from './events/mouse-double-click.js'
import LongTap from './events/long-tap.js'
import Swipe from './events/swipe.js'

let messageBox = document.querySelector('#alpheios-pwa-test-pointer-message-box')

export default class PointerEventHandler {
  /**
   * Creates a PointerEventHandler
   * @param {Element} element - An HTML element that will monitor pointer interaction
   */
  constructor (element) {
    this.element = element
  }

  addEventListener (evt, evtHandler) {
    // region Test listeners
    this.element.addEventListener('selectionstart', () => {
      console.log('Selection start event')
      if (messageBox) {
        messageBox.innerHTML += `Selection start event<br>`
        messageBox.scrollTop = messageBox.scrollHeight
      }
    })

    this.element.addEventListener('selectionchange', evt => {
      console.log('Selection change event', evt)
      if (messageBox) {
        messageBox.innerHTML += `Selection change event<br>`
        messageBox.scrollTop = messageBox.scrollHeight
      }
    })
    // endregion Test listeners

    if (evt instanceof MouseDoubleClick) {
      this.element.addEventListener('dblclick', this.mouseDoubleClickHandler.bind(this, evt, evtHandler), {passive: true})
    } else if (evt instanceof LongTap) {
      this.element.addEventListener('touchstart', this.touchStartHandler.bind(this, evt, evtHandler), {passive: true})
      this.element.addEventListener('touchend', this.touchEndHandler.bind(this, evt, evtHandler))
    } else if (evt instanceof Swipe) {
      this.element.addEventListener('touchstart', this.touchStartHandler.bind(this, evt, evtHandler), {passive: true})
      this.element.addEventListener('touchend', this.touchEndHandler.bind(this, evt, evtHandler))
    }
    return this
  }

  mouseDoubleClickHandler (pointerEvent, pointerEventHandler, domEvent) {
    if (messageBox) {
      messageBox.innerHTML += `<hr>Mouse double click event<br>`
      messageBox.scrollTop = messageBox.scrollHeight
    }
    pointerEventHandler(pointerEvent, domEvent)
  }

  touchStartHandler (pointerEvent, pointerEventHandler, domEvent) {
    pointerEvent.tracking = true
    pointerEvent.start.x = domEvent.changedTouches[0].clientX
    pointerEvent.start.y = domEvent.changedTouches[0].clientY
    // Hack - would normally use e.timeStamp but it's whack in Fx/Android
    pointerEvent.start.t = new Date().getTime()
  }

  touchEndHandler (pointerEvent, pointerEventHandler, domEvent) {
    if (pointerEvent.tracking) {
      pointerEvent.tracking = false
      const now = new Date().getTime()
      pointerEvent.end.x = domEvent.changedTouches[0].clientX
      pointerEvent.end.y = domEvent.changedTouches[0].clientY
      const duration = now - pointerEvent.start.t
      const mvmtX = pointerEvent.end.x - pointerEvent.start.x
      const mvmtY = pointerEvent.end.y - pointerEvent.start.y
      console.log(`Touch end event, coordinates: [${pointerEvent.start.x}, ${pointerEvent.start.y}], movement: [${mvmtX}, ${mvmtY}], duration: ${duration}`)
      if (messageBox) {
        messageBox.innerHTML += `<hr>Touch end event, coordinates: [${pointerEvent.start.x}, ${pointerEvent.start.y}], movement: [${mvmtX}, ${mvmtY}], duration: ${duration}<br>`
        messageBox.scrollTop = messageBox.scrollHeight
      }

      if (pointerEvent instanceof LongTap) {
        // Check if this is a long tap
        const mvmtDistance = Math.sqrt(
          Math.pow(pointerEvent.end.x - pointerEvent.start.x, 2) +
          Math.pow(pointerEvent.end.y - pointerEvent.start.y, 2)
        )
        if (mvmtDistance < pointerEvent.movementThreshold && duration > pointerEvent.durationThreshold) {
          if (messageBox) {
            messageBox.innerHTML += `This is a long tap<br>`
            messageBox.scrollTop = messageBox.scrollHeight
          }
          pointerEventHandler(pointerEvent, domEvent)
          domEvent.preventDefault()
        }
      } else if (pointerEvent instanceof Swipe) {
        // Check if this is a swipe
        // Gesture should be within a duration threshold
        if (duration <= pointerEvent.durationThreshold) {
          const mvmtXAbs = Math.abs(mvmtX)
          const mvmtYAbs = Math.abs(mvmtY)

          // Pointer movement should be long enough to be counted as swipe
          if (mvmtXAbs > pointerEvent.movementThreshold || mvmtYAbs > pointerEvent.movementThreshold) {
            if (mvmtX > pointerEvent.movementThreshold && (mvmtYAbs < pointerEvent.movementThreshold)) {
              pointerEvent.setDirectionToRight()
            } else if ((-mvmtX > pointerEvent.movementThreshold) && (mvmtYAbs < pointerEvent.movementThreshold)) {
              pointerEvent.setDirectionToLeft()
            } else if ((mvmtY > pointerEvent.movementThreshold) && (mvmtXAbs < pointerEvent.movementThreshold)) {
              pointerEvent.setDirectionToDown()
            } else if ((-mvmtY > pointerEvent.movementThreshold) && (mvmtXAbs < pointerEvent.movementThreshold)) {
              pointerEvent.setDirectionToUp()
            }
            if (messageBox) {
              messageBox.innerHTML += `This is a swipe<br>`
              messageBox.scrollTop = messageBox.scrollHeight
            }
            pointerEventHandler(pointerEvent, domEvent)
            domEvent.preventDefault()
          }
        }
      }
    }
  }
}
