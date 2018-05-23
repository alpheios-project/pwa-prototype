export default class PointerEvent {
  constructor () {
    this.tracking = false
    this.start = {
      x: null,
      y: null,
      time: null
    }
    this.end = {
      x: null,
      y: null,
      time: null
    }
  }

  get type () {
    return this.constructor.name
  }
}
