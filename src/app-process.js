import {Constants} from 'alpheios-data-models'
import {AlpheiosTuftsAdapter} from 'alpheios-morph-client'
import {Lexicons} from 'alpheios-lexicon-client'
import { HTMLSelector, LexicalQuery, ContentOptions, ResourceOptions,
  LocalStorageArea, UIController, UIStateAPI } from 'alpheios-components'

export default class AppProcess {
  constructor () {
    this.state = new UIStateAPI()
    this.state.status = UIStateAPI.statuses.script.PENDING
    this.state.panelStatus = UIStateAPI.statuses.panel.CLOSED
    this.options = new ContentOptions(
      LocalStorageArea.get.bind(this, ContentOptions.storageDomian),
      LocalStorageArea.set.bind(this, ContentOptions.storageDomian)
    )
    this.maAdapter = new AlpheiosTuftsAdapter() // Morphological analyzer adapter, with default arguments
    this.resourceOptions = new ResourceOptions(
      LocalStorageArea.get.bind(this, ResourceOptions.storageDomian),
      LocalStorageArea.set.bind(this, ResourceOptions.storageDomian)
    )
    this.ui = new UIController(this.state, this.options, this.resourceOptions)
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
        resourceOptions: this.resourceOptions,
        langOpts: {[Constants.LANG_PERSIAN]: {lookupMorphLast: true}} // TODO this should be externalized
      }).getData()
    }
  }
}
