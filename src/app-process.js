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
    document.querySelector('#dblclick-test').addEventListener('dblclick', this.getSelectedText.bind(this))
    let touchTestZone = document.querySelector('#touch-events-test')
    // touchTestZone.addEventListener('click', this.handleMouseClick.bind(this), false)
    // touchTestZone.addEventListener('dblclick', this.handleMouseDblClick.bind(this), false)
    // touchTestZone.addEventListener('mousedown', this.handleMouseDown.bind(this), false)
    // touchTestZone.addEventListener('mouseup', this.handleMouseUp.bind(this), false)

    // touchTestZone.addEventListener('touchstart', this.handleTouchStart.bind(this), false)
    touchTestZone.addEventListener('touchend', this.handleTouchEnd.bind(this), false)
    // touchTestZone.addEventListener('touchcancel', this.handleCancel.bind(this), false)
    // touchTestZone.addEventListener('touchmove', this.handleMove.bind(this), false)
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

  handleTouchStart (evt) {
    evt.preventDefault() // To prevent `mousedown` and `mouseup` to be fired for touch events
    console.log('touchstart, event is:', evt)
  }

  handleTouchEnd (evt) {
    // evt.preventDefault()
    console.log('touchend, event is:', evt)
    // this.ui.panel.open()
    let htmlSelector = new HTMLSelector(evt, this.constructor.defaults.languageCode)
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

  handleTouchCancel (evt) {
    evt.preventDefault()
    console.log('touchcancel, event is:', evt)
  }

  handleTouchMove (evt) {
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
