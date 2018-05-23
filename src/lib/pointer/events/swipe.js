import PointerEvent from './pointer-event.js'

export default class Swipe extends PointerEvent {
  constructor (movementThreshold = 100, durationThershold = 600) {
    super()
    this.movementThreshold = movementThreshold
    this.durationThreshold = durationThershold
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

  setDirectionToUp () {
    this.direction = Swipe.directions.UP
  }

  setDirectionToRight () {
    this.direction = Swipe.directions.RIGHT
  }

  setDirectionToDown () {
    this.direction = Swipe.directions.DOWN
  }

  setDirectionToLeft () {
    this.direction = Swipe.directions.LEFT
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
}
