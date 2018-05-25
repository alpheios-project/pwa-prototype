import {Constants} from 'alpheios-data-models'
import {AlpheiosTuftsAdapter} from 'alpheios-morph-client'
import {Lexicons} from 'alpheios-lexicon-client'
import { HTMLSelector, LexicalQuery, LanguageOptionDefaults, UIOptionDefaults, DefaultsLoader,
  Options, LocalStorageArea, UIStateAPI } from 'alpheios-components'
// import TextSelector from '../node_modules/alpheios-components/src/lib/selection/text-selector.js'
import UIControllerMobile from './lib/ui-controller-mobile.js'
import ContentOptionDefaults from './settings/content-options-defaults.json'
import Package from '../package.json'

// Interactions
import PointerEventHandler from './lib/pointer/pointer-event-handler.js'
import MouseDoubleClick from './lib/pointer/events/mouse-double-click.js'
import LongTap from './lib/pointer/events/long-tap.js'
import Swipe from './lib/pointer/events/swipe.js'

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
      console.log(`PWA version is ${Package.version}`)
    } catch (e) {
      throw new Error(`Cannot parse package.json, its format is probably incorrect`)
    }

    // Checks whether this is a test page
    this.hasTestContent = !!document.querySelector(`[data-alpheios-pwa-test-content="true"]`)

    this.ui = new UIControllerMobile(this.state, this.options, this.langOptions, this.uiOptions, pckg, template)

    if (this.hasTestContent) {
      // For testing both double click and long taps

      let universalTestZone = document.querySelector('#universal-events-test')
      if (universalTestZone) {
        // This is a test page
        let utzEventHandler = new PointerEventHandler(universalTestZone)
        utzEventHandler
          .addEventListener(new MouseDoubleClick(), (pevt, devt) => this.getSelectedText(devt))
          .addEventListener(new LongTap(5, 400), (pevt, devt) => this.getSelectedText(devt))
      }

      // For testing double clicks only
      let doubleClickTestZone = document.querySelector('#dblclick-test')
      if (doubleClickTestZone) {
        let dctzEventHandler = new PointerEventHandler(doubleClickTestZone)
        dctzEventHandler.addEventListener(new MouseDoubleClick(), (pevt, devt) => this.getSelectedText(devt))
      }

      // For testing long taps only
      let touchTestZone = document.querySelector('#touch-events-test')
      if (touchTestZone) {
        let ttzEventHandler = new PointerEventHandler(touchTestZone)
        ttzEventHandler.addEventListener(new LongTap(5, 400), (pevt, devt) => this.getSelectedText(devt))
      }
    } else {
      // This is a regular page
      let bodyEventHandler = new PointerEventHandler(document.body)
      bodyEventHandler
        .addEventListener(new MouseDoubleClick(), (pevt, devt) => this.getSelectedText(devt))
        .addEventListener(new LongTap(5, 1000), (pevt, devt) => this.getSelectedText(devt))
    }

    let panelHeader = document.querySelector('#panel-header')
    let panelHeaderHandler = new PointerEventHandler(panelHeader)
    panelHeaderHandler
      .addEventListener(new Swipe(100, 600), swipe => {
        if (swipe.isDirectedRight()) { this.ui.selectNextTab() }
        if (swipe.isDirectedLeft()) { this.ui.selectPrevTab() }
      })
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
}
