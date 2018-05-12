import {Constants} from 'alpheios-data-models'
import {AlpheiosTuftsAdapter} from 'alpheios-morph-client'
import {Lexicons} from 'alpheios-lexicon-client'
import { HTMLSelector, LexicalQuery, LanguageOptionDefaults, UIOptionDefaults, DefaultsLoader,
  Options, LocalStorageArea, UIStateAPI } from 'alpheios-components'
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
    document.body.addEventListener('dblclick', this.getSelectedText.bind(this))
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
