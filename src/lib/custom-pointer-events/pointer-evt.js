export default class PointerEvt {
  constructor () {
    this.tracking = false
    this.start = {
      client: {
        x: null,
        y: null
      },
      time: null
    }
    this.end = {
      client: {
        x: null,
        y: null
      },
      time: null
    }
    /**
     * Whether a pointer event is complete or not. This depends on the event type.
     * For example, a long tap event is complete if tap duration is longer than a threshold value,
     * swipe is complete if movement distance is greater than a threshold and swipe duration
     * is within a certain time limit.
     * @type {boolean}
     */
    this.done = false
  }

  setPoint (type, clientX, clientY) {
    this[type].client.x = clientX
    this[type].client.y = clientY
    this[type].time = new Date().getTime()
  }

  setStartPoint (clientX, clientY) {
    this.setPoint('start', clientX, clientY)
    return this
  }

  setEndPoint (clientX, clientY) {
    this.setPoint('end', clientX, clientY)
    return this
  }

  get type () {
    return this.constructor.name
  }

  get duration () {
    return this.end.time - this.start.time
  }

  get mvmntX () {
    return this.end.client.x - this.start.client.x
  }

  get mvmntY () {
    return this.end.client.y - this.start.client.y
  }

  get mvmntXAbs () {
    return Math.abs(this.mvmntX)
  }

  get mvmntYAbs () {
    return Math.abs(this.mvmntY)
  }

  get mvmntDist () {
    return Math.sqrt(Math.pow(this.mvmntX, 2) + Math.pow(this.mvmntY, 2))
  }

  get domEvent () {
    if (this._domEvt) {
      return this._domEvt
    }
  }

  static pointerDownListener (event, domEvt) {
    console.log(`Pointer down`, domEvt)
    event.setStartPoint(domEvt.clientX, domEvt.clientY)
  }

  static pointerUpListener (event, domEvt) {
    console.log(`Pointer up`, domEvt)
    event.setEndPoint(domEvt.clientX, domEvt.clientY)
    event._domEvt = domEvt
    if (event.done && !domEvt.target.dataset.alpheiosExcludeCustomPointer) { event.evtHandler(event) }
  }

  static touchStartListener (event, domEvt) {
    console.log(`Touch start`, domEvt)
    event.setStartPoint(domEvt.changedTouches[0].clientX, domEvt.changedTouches[0].clientY)
  }

  static touchEndListener (event, domEvt) {
    console.log(`Touch end`, domEvt)
    event.setEndPoint(domEvt.changedTouches[0].clientX, domEvt.changedTouches[0].clientY)
    event._domEvt = domEvt
    if (event.done && !domEvt.target.dataset.alpheiosExcludeCustomPointer) { event.evtHandler(event) }
  }

  static dblClickListener (event, domEvt) {
    console.log(`Mouse double click`, domEvt)
    event.setStartPoint(domEvt.clientX, domEvt.clientY).setEndPoint(domEvt.clientX, domEvt.clientY)
    event._domEvt = domEvt
    if (!domEvt.target.dataset.alpheiosExcludeCustomPointer) {
      event.evtHandler(event)
    }
  }
}
