import {Constants} from 'alpheios-data-models'
import {AlpheiosTuftsAdapter} from 'alpheios-morph-client'
import {Lexicons} from 'alpheios-lexicon-client'
import { HTMLSelector, LexicalQuery, LanguageOptionDefaults, UIOptionDefaults, DefaultsLoader,
  Options, LocalStorageArea, UIStateAPI } from 'alpheios-components'
// import TextSelector from '../node_modules/alpheios-components/src/lib/selection/text-selector.js'
import UIControllerMobile from './lib/ui-controller-mobile.js'
import ContentOptionDefaults from './settings/content-options-defaults.json'
import Package from '../package.json'

// Popup components
import Popup from '../node_modules/alpheios-components/src/vue-components/popup.vue'
import PopupMobile from '../node_modules/alpheios-components/src/vue-components/popup-mobile.vue'
const popupComponents = {
  popup: Popup,
  popupMobile: PopupMobile
}

// CSS skins
import SkinBlue from '../node_modules/alpheios-components/dist/skins/blue/style.min.css' // eslint-disable-line
import SkinGreen from '../node_modules/alpheios-components/dist/skins/green/style.min.css' // eslint-disable-line
const availableSkins = [
  {
    value: 'blue',
    text: 'Blue Skin'
  },
  {
    value: 'green',
    text: 'Green Skin'
  }
]

export default class AppProcess {
  constructor () {
    this.state = new UIStateAPI()
    this.state.status = UIStateAPI.statuses.script.PENDING
    this.state.panelStatus = UIStateAPI.statuses.panel.CLOSED
    this.options = new Options(DefaultsLoader.fromJSON(ContentOptionDefaults), LocalStorageArea)
    this.maAdapter = new AlpheiosTuftsAdapter() // Morphological analyzer adapter, with default arguments
    this.langOptions = new Options(DefaultsLoader.fromJSON(LanguageOptionDefaults), LocalStorageArea)
    this.uiOptions = new Options(DefaultsLoader.fromJSON(UIOptionDefaults), LocalStorageArea)
    for (const skin of availableSkins) { this.uiOptions.items.skin.addValue(skin.value, skin.text) }
    const template = {
      popupComponents: popupComponents,
      defaultPopupComponent: 'popupMobile'
    }
    this.uiOptions.items.popup.addValue('popupMobile', 'Popup Mobile')
    let pckg
    try {
      pckg = JSON.parse(Package)
    } catch (e) {
      throw new Error(`Cannot parse package.json, its format is probably incorrect`)
    }
    this.ui = new UIControllerMobile(this.state, this.options, this.langOptions, this.uiOptions, pckg, template)
    this.target = {
      start: {},
      end: {}
    }
    let universalTestZone = document.querySelector('#universal-events-test')
    if (universalTestZone) {
      // This is a test page
      universalTestZone.addEventListener('dblclick', this.handleMouseDblClick.bind(this))
      universalTestZone.addEventListener('touchstart', this.handleTouchStart.bind(this, this.target), false)
      universalTestZone.addEventListener('touchend', this.handleTouchEnd.bind(this, this.target), false)

      document.querySelector('#dblclick-test').addEventListener('dblclick', this.getSelectedText.bind(this))
      let touchTestZone = document.querySelector('#touch-events-test')
      // touchTestZone.addEventListener('click', this.handleMouseClick.bind(this), false)
      // touchTestZone.addEventListener('dblclick', this.handleMouseDblClick.bind(this), false)
      // touchTestZone.addEventListener('mousedown', this.handleMouseDown.bind(this), false)
      // touchTestZone.addEventListener('mouseup', this.handleMouseUp.bind(this), false)

      touchTestZone.addEventListener('touchstart', this.handleTouchStart.bind(this, this.target), false)
      touchTestZone.addEventListener('touchend', this.handleTouchEnd.bind(this, this.target), false)
      // touchTestZone.addEventListener('touchcancel', this.handleTouchCancel.bind(this, this.target), false)
      // touchTestZone.addEventListener('touchmove', this.handleTouchMove.bind(this, this.target), false)
    } else {
      // This is a regular page
      document.body.addEventListener('dblclick', this.getSelectedText.bind(this))
      document.body.addEventListener('touchstart', this.handleTouchStart.bind(this, this.target), false)
      document.body.addEventListener('touchend', this.handleTouchEnd.bind(this, this.target), false)
    }
  }

  static get defaults () {
    return {
      languageCode: 'lat'
    }
  }

  getSelectedText (event) {
    /*
    TextSelector conveys text selection information. It is more generic of the two.
    HTMLSelector conveys page-specific information, such as location of a selection on a page.
    It's probably better to keep them separated in order to follow a more abstract model.
     */
    let htmlSelector = new HTMLSelector(event, this.constructor.defaults.languageCode)
    let textSelector = htmlSelector.createTextSelector()
    if (!textSelector.isEmpty()) {
      LexicalQuery.create(textSelector, {
        htmlSelector: htmlSelector,
        uiController: this.ui,
        maAdapter: this.maAdapter,
        lexicons: Lexicons,
        resourceOptions: this.langOptions,
        langOpts: {[Constants.LANG_PERSIAN]: {lookupMorphLast: true}} // TODO this should be externalized
      }).getData()
    }
  }

  handleTouchStart (target, evt) {
    evt.preventDefault() // To prevent `mousedown` and `mouseup` to be fired for touch events
    console.log('touchstart, event is:', evt)
    target.tracking = true
    // Hack - would normally use e.timeStamp but it's whack in Fx/Android
    target.start.t = new Date().getTime()
    target.start.x = evt.changedTouches[0].clientX
    target.start.y = evt.changedTouches[0].clientY
  }

  handleTouchEnd (target, evt) {
    // evt.preventDefault()
    console.log('touchend, event is:', evt)
    if (target.tracking) {
      target.tracking = false
      const now = new Date().getTime()
      target.end.x = evt.changedTouches[0].clientX
      target.end.y = evt.changedTouches[0].clientY
      const timeDelta = now - target.start.t
      const deltaX = target.end.x - target.start.x
      const deltaY = target.end.y - target.start.y
      const movementDelta = Math.sqrt(Math.pow(target.end.x - target.start.x, 2) + Math.pow(target.end.y - target.start.y, 2))
      console.log(`Movement delta: [${deltaX}, ${deltaY}, ${movementDelta}], duration: ${timeDelta}`)
      if (movementDelta < 5 && timeDelta > 1000) {
        console.log('This is a long tap')
        this.getSelectedText(evt)
      }
    }
  }

  handleTouchCancel (target, evt) {
    evt.preventDefault()
    console.log('touchcancel, event is:', evt)
  }

  handleTouchMove (target, evt) {
    evt.preventDefault()
    console.log('touchmove, event is:', evt)
  }

  handleMouseClick (evt) {
    // evt.preventDefault()
    console.log('mouse click, event is:', evt)
  }

  handleMouseDblClick (evt) {
    // evt.preventDefault()
    console.log('mouse double click, event is:', evt)
    this.getSelectedText(evt)
  }

  handleMouseDown (evt) {
    // evt.preventDefault()
    console.log('mouse down, event is:', evt)
  }

  handleMouseUp (evt) {
    // evt.preventDefault()
    console.log('mouse up, event is:', evt)
  }
}
