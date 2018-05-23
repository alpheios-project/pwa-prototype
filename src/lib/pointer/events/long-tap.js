import PointerEvent from './pointer-event.js'

export default class LongTap extends PointerEvent {
  constructor (movementThreshold = 5, durationThreshold = 1000) {
    super()
    this.movementThreshold = movementThreshold
    this.durationThreshold = durationThreshold
  }
}
