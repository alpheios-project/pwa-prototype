import {Constants} from 'alpheios-data-models'
import {AlpheiosTuftsAdapter} from 'alpheios-morph-client'
import {Lexicons} from 'alpheios-lexicon-client'
import { HTMLSelector, LexicalQuery, LanguageOptionDefaults, UIOptionDefaults, DefaultsLoader,
  Options, LocalStorageArea, UIStateAPI, HTMLConsole } from 'alpheios-components'
// import TextSelector from '../node_modules/alpheios-components/src/lib/selection/text-selector.js'
import UIControllerMobile from './lib/ui-controller-mobile.js'
import ContentOptionDefaults from './settings/content-options-defaults.json'
import Package from '../package.json'

// Custom pointer events
import MouseDblClick from '../../components/src/lib/custom-pointer-events/mouse-dbl-click.js'
import LongTap from '../../components/src/lib/custom-pointer-events/long-tap.js'
import Swipe from '../../components/src/lib/custom-pointer-events/swipe.js'

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
      console.log(`PWA version is ${pckg.version}`)
    } catch (e) {
      throw new Error(`Cannot parse package.json, its format is probably incorrect`)
    }

    // Checks whether this is a test page
    this.hasTestContent = !!document.querySelector(`[data-alpheios-pwa-test-content="true"]`)

    this.ui = new UIControllerMobile(this.state, this.options, this.langOptions, this.uiOptions, pckg, template)

    if (this.hasTestContent) {
      let versionBox = document.querySelector('.alpheios-pwa-test-version')
      if (versionBox) { versionBox.innerHTML = `PWA version: ${pckg.version}` }

      // Testing both double click and long taps
      MouseDblClick.listen('#universal-events-test', evt => this.getSelectedText(evt.domEvent))
      LongTap.listen('#universal-events-test', evt => this.getSelectedText(evt.domEvent), 5, 125)

      // Testing double-click only
      MouseDblClick.listen('#dblclick-test', evt => this.getSelectedText(evt.domEvent))

      // For testing taps
      LongTap.listen('#touch-events-test', evt => this.getSelectedText(evt.domEvent), 5, 0)
      LongTap.listen('#touch-events-test-125', evt => this.getSelectedText(evt.domEvent), 5, 125)
      LongTap.listen('#touch-events-test-250', evt => this.getSelectedText(evt.domEvent), 5, 250)
      LongTap.listen('#touch-events-test-375', evt => this.getSelectedText(evt.domEvent), 5, 375)
      LongTap.listen('#touch-events-test-500', evt => this.getSelectedText(evt.domEvent), 5, 500)
    } else {
      // This is a regular page
      // TODO: make events take HTML element as an argument
      console.log('Document body is', document.body)
      MouseDblClick.listen('body', evt => this.getSelectedText(evt.domEvent))
      LongTap.listen('body', evt => this.getSelectedText(evt.domEvent), 5, 125)
    }

    Swipe.listen('#panel-header', swipe => {
      if (swipe.isDirectedRight()) { this.ui.selectNextTab() }
      if (swipe.isDirectedLeft()) { this.ui.selectPrevTab() }
    }, 100, 600)

    let htmlConsoleClearBtn = document.querySelector('#alpheios-html-console-clear-btn')
    if (htmlConsoleClearBtn) {
      htmlConsoleClearBtn.addEventListener('click', () => {
        console.log(`Clear callback`)
        HTMLConsole.instance.clear()
      })
    }
    HTMLConsole.instance.enable(this.options.items.verboseMode.currentValue === 'verbose')
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
