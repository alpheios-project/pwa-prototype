import {Constants} from 'alpheios-data-models'
import {AlpheiosTuftsAdapter} from 'alpheios-morph-client'
import {Lexicons} from 'alpheios-lexicon-client'
import { HTMLSelector, LexicalQuery, ContentOptionDefaults, LanguageOptionDefaults, Options,
  LocalStorageArea, UIController, UIStateAPI, PopupMod } from 'alpheios-components'

export default class AppProcess {
  constructor () {
    this.state = new UIStateAPI()
    this.state.status = UIStateAPI.statuses.script.PENDING
    this.state.panelStatus = UIStateAPI.statuses.panel.CLOSED
    const contentOptionsDefaults = new ContentOptionDefaults()
    this.options = new Options(
      contentOptionsDefaults,
      LocalStorageArea.get.bind(this, contentOptionsDefaults.storageDomain),
      LocalStorageArea.set.bind(this, contentOptionsDefaults.storageDomain)
    )
    this.maAdapter = new AlpheiosTuftsAdapter() // Morphological analyzer adapter, with default arguments
    const languageOptionsDefaults = new LanguageOptionDefaults()
    this.langOptions = new Options(
      languageOptionsDefaults,
      LocalStorageArea.get.bind(this, languageOptionsDefaults.storageDomain),
      LocalStorageArea.set.bind(this, languageOptionsDefaults.storageDomain)
    )
    this.ui = new UIController(this.state, this.options, this.langOptions, {}, { popupComponent: PopupMod })
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
