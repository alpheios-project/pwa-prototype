/* global Node */
import {Lexeme, Feature, Definition, LanguageModelFactory, Constants} from 'alpheios-data-models'
// import {ObjectMonitor as ExpObjMon} from 'alpheios-experience'
import Vue from 'vue/dist/vue' // Vue in a runtime + compiler configuration

// A panel componentrequestGrammar
// import Panel from '../../node_modules/alpheios-components/src/vue-components/panel.vue'
// A popup component
import Popup from '../../node_modules/alpheios-components/src/vue-components/popup.vue'

// import TestComponent from '../components/test.vue'
import PanelMobile from '../components/panel-mobile.vue'

import L10n from '../../node_modules/alpheios-components/src/lib/l10n/l10n.js'
import Locales from '../../node_modules/alpheios-components/src/locales/locales.js'
import enUS from '../../node_modules/alpheios-components/src/locales/en-us/messages.json'
import enGB from '../../node_modules/alpheios-components/src/locales/en-gb/messages.json'
import Template from '../templates/template.htmlf'
import { Grammars } from 'alpheios-res-client'
import ResourceQuery from '../../node_modules/alpheios-components/src/lib/queries/resource-query.js'

import BaseUIController from '../lib/base-ui-controller.js'

const languageNames = new Map([
  [Constants.LANG_LATIN, 'Latin'],
  [Constants.LANG_GREEK, 'Greek'],
  [Constants.LANG_ARABIC, 'Arabic'],
  [Constants.LANG_PERSIAN, 'Persian']
])

export default class UIControllerMobile extends BaseUIController {
  /**
   * @constructor
   * @param {UIStateAPI} state - State object for the parent application
   * @param {Options} options - content options (see `src/setting/content-options-defaults.js`)
   * @param {Options} resourceOptions - resource options (see `src/setting/language-options-defaults.js`)
   * @param {Options} uiOptions - UI options (see `src/setting/ui-options-defaults.js`)
   * @param {Object} manifest - parent application info details  (API definition pending)
   * In some environments manifest data may not be available. Then a `{}` default value
   * will be used.
   * @param {Object} template - object with the following properties:
   *                            html: HTML string for the container of the Alpheios components
   *                            panelId: the id of the wrapper for the panel component,
   *                            panelComponent: Vue single file component of a panel element.
   *                              Allows to provide an alternative panel layout
   *                            popupId: the id of the wrapper for the popup component
   *                            popupComponent: Vue single file component of a panel element.
   *                              Allows to provide an alternative popup layout
   */
  constructor (state, options, resourceOptions, uiOptions, manifest = {}, template = {}) {
    super()
    this.state = state
    this.options = options
    this.resourceOptions = resourceOptions
    this.uiOptions = uiOptions
    this.settings = UIControllerMobile.settingValues
    this.irregularBaseFontSizeClassName = 'alpheios-irregular-base-font-size'
    this.irregularBaseFontSize = !UIControllerMobile.hasRegularBaseFontSize()
    this.manifest = manifest
    const templateDefaults = {
      html: Template,
      panelId: 'alpheios-panel',
      panelComponents: {
        panel: PanelMobile
      },
      defaultPanelComponent: 'panel',
      popupId: 'alpheios-popup',
      popupComponents: {
        popup: Popup
      },
      defaultPopupComponent: 'popup',
      draggable: true,
      resizable: true
    }
    this.template = Object.assign(templateDefaults, template)

    /* let ComponentClass = Vue.extend(TestComponent)
    let componentProps = {
      type: 'primary',
      uiController: this
    }
    let instance = new ComponentClass({
      propsData: componentProps
    })
    instance.$mount()
    console.log(`instance:`, instance.$el)
    let body = document.querySelector('body')
    body.appendChild(instance.$el) */

    this.zIndex = this.getZIndexMax()

    this.l10n = new L10n()
      .addMessages(enUS, Locales.en_US)
      .addMessages(enGB, Locales.en_GB)
      .setLocale(Locales.en_US)

    // Inject HTML code of a plugin. Should go in reverse order.
    document.body.classList.add('alpheios')
    let container = document.createElement('div')
    document.body.insertBefore(container, null)
    container.outerHTML = this.template.html
    // Initialize components
    this.panel = new Vue({
      el: `#${this.template.panelId}`,
      components: { panel: PanelMobile },
      data: {
        panelData: {
          isOpen: false,
          tabs: {
            definitions: false,
            morphology: false,
            inflections: false,
            status: false,
            options: false,
            grammar: false,
            info: true,
            treebank: false,
            tabOrder: ['info', 'morphology', 'definitions', 'inflections', 'grammar', 'treebank', 'options']
          },
          verboseMode: this.state.verboseMode,
          grammarRes: {},
          lexemes: [],
          definitions: {},
          translations: {},
          linkedFeatures: [],
          showProviders: false,
          inflectionComponentData: {
            visible: false,
            enabled: false,
            inflectionData: false // If no inflection data present, it is set to false
          },
          lexicalDataContainerID: 'panel-alpheios-lexical-data-container',
          morphComponentID: 'panel-alpheios-morph-component',
          morphDataReady: false,
          shortDefinitions: [],
          fullDefinitions: '',
          inflections: {
            localeSwitcher: undefined,
            viewSelector: undefined,
            tableBody: undefined
          },
          inflectionIDs: {
            localeSwitcher: 'alpheios-panel-content-infl-table-locale-switcher',
            viewSelector: 'alpheios-panel-content-infl-table-view-selector',
            tableBody: 'alpheios-panel-content-infl-table-body'
          },
          infoComponentData: {
            manifest: this.manifest,
            languageName: UIControllerMobile.getLanguageName(this.state.currentLanguage)
          },
          messages: [],
          notification: {
            visible: false,
            important: false,
            showLanguageSwitcher: false,
            text: ''
          },
          status: {
            selectedText: '',
            languageName: ''
          },
          settings: this.options.items,
          treebankComponentData: {
            data: {
              word: {},
              page: {}

            },
            visible: false
          },
          resourceSettings: this.resourceOptions.items,
          uiOptions: this.uiOptions,
          classes: [], // Will be set later by `setRootComponentClasses()`
          styles: {
            zIndex: this.zIndex
          },
          minWidth: 400,
          l10n: this.l10n
        },
        state: this.state,
        options: this.options,
        resourceOptions: this.resourceOptions,
        currentPanelComponent: this.template.defaultPanelComponent,
        uiController: this
      },
      methods: {
        isOpen: function () {
          return this.state.isPanelOpen()
        },

        open: function () {
          if (!this.state.isPanelOpen()) {
            this.panelData.isOpen = true
            this.state.setPanelOpen()
          }
          return this
        },

        close: function () {
          if (!this.state.isPanelClosed()) {
            this.panelData.isOpen = false
            this.state.setPanelClosed()
          }
          return this
        },

        setPositionTo: function (position) {
          this.options.items.panelPosition.setValue(position)
        },

        attachToLeft: function () {
          this.setPositionTo('left')
        },

        attachToRight: function () {
          this.setPositionTo('right')
        },

        currentTabName () {
          for (const key of Object.keys(this.panelData.tabs)) {
            if (this.panelData.tabs[key]) { return key }
          }
        },

        currentTabIndex () {
          const currentTab = this.currentTabName()
          return this.panelData.tabs.tabOrder.indexOf(currentTab)
        },

        prevTabName () {
          const currentTabIndex = this.currentTabIndex()
          if (currentTabIndex > -1) {
            const prevTabIndex = (currentTabIndex > 0) ? currentTabIndex - 1 : this.panelData.tabs.tabOrder.length - 1
            return this.panelData.tabs.tabOrder[prevTabIndex]
          }
        },

        nextTabName () {
          const currentTabIndex = this.currentTabIndex()
          if (currentTabIndex > -1) {
            const nextTabIndex = (currentTabIndex < this.panelData.tabs.tabOrder.length - 1) ? currentTabIndex + 1 : 0
            return this.panelData.tabs.tabOrder[nextTabIndex]
          }
        },

        changeTab (name) {
          const currentTab = this.currentTabName()
          if (currentTab) {
            this.panelData.tabs[currentTab] = false
          }
          this.panelData.tabs[name] = true
          this.state.changeTab(name) // Reflect a tab change in a state
          return this
        },

        clearContent: function () {
          this.panelData.shortDefinitions = []
          this.panelData.fullDefinitions = ''
          this.panelData.messages = ''
          this.panelData.treebankComponentData.data.word = {}
          this.panelData.treebankComponentData.visible = false
          this.clearNotifications()
          this.clearStatus()
          return this
        },

        showMessage: function (message) {
          this.panelData.messages = [message]
        },

        appendMessage: function (message) {
          this.panelData.messages.push(message)
        },

        clearMessages: function () {
          this.panelData.messages = []
        },

        showNotification: function (text, important = false) {
          this.panelData.notification.visible = true
          this.panelData.notification.important = important
          this.panelData.notification.showLanguageSwitcher = false
          this.panelData.notification.text = text
        },

        showImportantNotification: function (text) {
          this.showNotification(text, true)
        },

        showLanguageNotification: function (homonym, notFound = false) {
          this.panelData.notification.visible = true
          let languageName
          if (homonym) {
            languageName = UIControllerMobile.getLanguageName(homonym.languageID)
          } else {
            languageName = this.panelData.l10n.messages.TEXT_NOTICE_LANGUAGE_UNKNOWN // TODO this wil be unnecessary when the morphological adapter returns a consistent response for erors
          }
          if (notFound) {
            this.panelData.notification.important = true
            this.panelData.notification.showLanguageSwitcher = true
            this.panelData.notification.text = this.panelData.l10n.messages.TEXT_NOTICE_CHANGE_LANGUAGE.get(languageName)
          } else {
            this.panelData.notification.visible = true
            this.panelData.notification.important = false
            this.panelData.notification.showLanguageSwitcher = false
          }
        },

        showStatusInfo: function (selectionText, languageID) {
          this.panelData.status.languageName = UIControllerMobile.getLanguageName(languageID)
          this.panelData.status.selectedText = selectionText
        },

        showErrorInformation: function (errorText) {
          this.panelData.notification.visible = true
          this.panelData.notification.important = true
          this.panelData.notification.showLanguageSwitcher = false
          this.panelData.notification.text = errorText
        },

        clearNotifications: function () {
          this.panelData.notification.visible = false
          this.panelData.notification.important = false
          this.panelData.notification.showLanguageSwitcher = false
          this.panelData.notification.text = ''
        },

        clearStatus: function () {
          this.panelData.status.languageName = ''
          this.panelData.status.selectedText = ''
        },

        toggle: function () {
          if (this.state.isPanelOpen()) {
            this.close()
          } else {
            this.open()
          }
          return this
        },

        updateInflections: function (inflectionData) {
          this.panelData.inflectionComponentData.inflectionData = inflectionData
        },

        enableInflections: function (enabled) {
          this.panelData.inflectionComponentData.enabled = enabled
        },

        sendFeature: function (feature) {
          this.requestGrammar(feature)
          this.changeTab('grammar')
          return this
        },

        requestGrammar: function (feature) {
          // ExpObjMon.track(
          ResourceQuery.create(feature, {
            uiController: this.uiController,
            grammars: Grammars
          }).getData()
          //, {
          // experience: 'Get resource',
          //  actions: [
          //    { name: 'getData', action: ExpObjMon.actions.START, event: ExpObjMon.events.GET },
          //    { name: 'finalize', action: ExpObjMon.actions.STOP, event: ExpObjMon.events.GET }
          // ]
          // }).getData()
        },

        settingChange: function (name, value) {
          console.log('Change inside instance', name, value)
          this.options.items[name].setTextValue(value)
          switch (name) {
            case 'locale':
              if (this.uiController.presenter) {
                this.uiController.presenter.setLocale(this.options.items.locale.currentValue)
              }
              break
            case 'preferredLanguage':
              this.uiController.updateLanguage(this.options.items.preferredLanguage.currentValue)
              break
            case 'verboseMode':
              this.uiController.updateVerboseMode()
              break
          }
        },
        resourceSettingChange: function (name, value) {
          let keyinfo = this.resourceOptions.parseKey(name)
          console.log('Change inside instance', keyinfo.setting, keyinfo.language, value)
          this.resourceOptions.items[keyinfo.setting].filter((f) => f.name === name).forEach((f) => { f.setTextValue(value) })
        },
        uiOptionChange: function (name, value) {
          this.uiController.uiOptions.items[name].setTextValue(value)
          switch (name) {
            case 'skin':
              this.uiController.changeSkin(this.uiController.uiOptions.items[name].currentValue)
              break
            case 'popup':
              this.uiController.popup.close() // Close an old popup
              this.uiController.popup.currentPopupComponent = this.uiController.uiOptions.items[name].currentValue
              this.uiController.popup.open() // Will trigger an initialisation of popup dimensions
              break
          }
        }
      },
      mounted: function () {
        this.panelData.inflections.localeSwitcher = document.querySelector(`#${this.panelData.inflectionIDs.localeSwitcher}`)
        this.panelData.inflections.viewSelector = document.querySelector(`#${this.panelData.inflectionIDs.viewSelector}`)
        this.panelData.inflections.tableBody = document.querySelector(`#${this.panelData.inflectionIDs.tableBody}`)
      }
    })

    this.options.load(() => {
      this.resourceOptions.load(() => {
        this.state.activateUI()
        console.log('UI options are loaded')
        this.updateLanguage(this.options.items.preferredLanguage.currentValue)
        this.updateVerboseMode()
      })
    })

    // Create a Vue instance for a popup
    this.popup = new Vue({
      el: `#${this.template.popupId}`,
      components: this.template.popupComponents,
      data: {
        messages: [],
        lexemes: [],
        definitions: {},

        translations: {},

        linkedFeatures: [],
        visible: false,
        popupData: {
          fixedPosition: true, // Whether to put popup into a fixed position or calculate that position dynamically
          // Default popup position, with units
          top: '10vh',
          left: '10vw',

          draggable: this.template.draggable,
          resizable: this.template.resizable,
          // Default popup dimensions, in pixels, without units. These values will override CSS rules.
          // Can be scaled down on small screens automatically.
          width: 210,
          /*
          `fixedElementsHeight` is a sum of heights of all elements of a popup, including a top bar, a button area,
          and a bottom bar. A height of all letiable elements (i.e. morphological data container) will be
          a height of a popup less this value.
           */
          fixedElementsHeight: 120,
          heightMin: 150, // Initially, popup height will be set to this value
          heightMax: 400, // If a morphological content height is greater than `contentHeightLimit`, a popup height will be increased to this value
          // A margin between a popup and a selection
          placementMargin: 15,
          // A minimal margin between a popup and a viewport border, in pixels. In effect when popup is scaled down.
          viewportMargin: 5,

          // A position of a word selection
          targetRect: {},

          /*
          A date and time when a new request was started, in milliseconds since 1970-01-01. It is used within a
          component to identify a new request coming in and to distinguish it from data updates of the current request.
           */
          requestStartTime: 0,
          settings: this.options.items,
          verboseMode: this.state.verboseMode,
          defDataReady: false,
          hasTreebank: false,
          inflDataReady: false,
          morphDataReady: false,

          translationsDataReady: false,

          showProviders: false,
          updates: 0,
          classes: [], // Will be set later by `setRootComponentClasses()`
          l10n: this.l10n,
          notification: {
            visible: false,
            important: false,
            showLanguageSwitcher: false,
            text: ''
          },
          providers: [],
          status: {
            selectedText: '',
            languageName: ''
          }
        },
        panel: this.panel,
        options: this.options,
        currentPopupComponent: this.template.defaultPopupComponent,
        uiController: this
      },
      methods: {
        setTargetRect: function (targetRect) {
          this.popupData.targetRect = targetRect
        },

        showMessage: function (message) {
          this.messages = [message]
          return this
        },

        appendMessage: function (message) {
          this.messages.push(message)
          return this
        },

        clearMessages: function () {
          while (this.messages.length > 0) {
            this.messages.pop()
          }
          return this
        },

        showNotification: function (text, important = false) {
          this.popupData.notification.visible = true
          this.popupData.notification.important = important
          this.popupData.notification.showLanguageSwitcher = false
          this.popupData.notification.text = text
        },

        showImportantNotification: function (text) {
          this.showNotification(text, true)
        },

        showLanguageNotification: function (homonym, notFound = false) {
          this.popupData.notification.visible = true
          let languageName
          if (homonym) {
            languageName = UIControllerMobile.getLanguageName(homonym.languageID)
          } else {
            languageName = this.popupData.l10n.messages.TEXT_NOTICE_LANGUAGE_UNKNOWN // TODO this wil be unnecessary when the morphological adapter returns a consistent response for erors
          }
          if (notFound) {
            this.popupData.notification.important = true
            this.popupData.notification.showLanguageSwitcher = true
            this.popupData.notification.text = this.popupData.l10n.messages.TEXT_NOTICE_CHANGE_LANGUAGE.get(languageName)
          } else {
            this.popupData.notification.important = false
            this.popupData.notification.showLanguageSwitcher = false
          }
        },

        showStatusInfo: function (selectionText, languageID) {
          this.popupData.status.languageName = UIControllerMobile.getLanguageName(languageID)
          this.popupData.status.selectedText = selectionText
        },

        showErrorInformation: function (errorText) {
          this.popupData.notification.visible = true
          this.popupData.notification.important = true
          this.popupData.notification.showLanguageSwitcher = false
          this.popupData.notification.text = errorText
        },

        newLexicalRequest: function () {
          console.log('Starting a new lexical request within a popup')
          this.popupData.requestStartTime = new Date().getTime()
        },

        clearContent: function () {
          this.definitions = {}
          this.translations = {}

          this.lexemes = []
          this.popupData.providers = []
          this.popupData.defDataReady = false
          this.popupData.inflDataReady = false
          this.popupData.morphDataReady = false

          this.popupData.translationsDataReady = false

          this.popupData.showProviders = false
          this.popupData.hasTreebank = false
          this.clearNotifications()
          this.clearStatus()
          return this
        },

        clearNotifications: function () {
          this.popupData.notification.visible = false
          this.popupData.notification.important = false
          this.popupData.notification.showLanguageSwitcher = false
          this.popupData.notification.text = ''
        },

        clearStatus: function () {
          this.popupData.status.languageName = ''
          this.popupData.status.selectedText = ''
        },

        open: function () {
          this.visible = true
          return this
        },

        close: function () {
          this.visible = false
          return this
        },

        showPanelTab: function (tabName) {
          this.panel.changeTab(tabName)
          this.panel.open()
          return this
        },

        sendFeature: function (feature) {
          this.panel.requestGrammar(feature)
          this.panel.changeTab('grammar')
          this.panel.open()
          return this
        },

        settingChange: function (name, value) {
          console.log('Change inside instance', name, value)
          this.options.items[name].setTextValue(value)
          switch (name) {
            case 'locale':
              if (this.uiController.presenter) {
                this.uiController.presenter.setLocale(this.options.items.locale.currentValue)
              }
              break
            case 'preferredLanguage':
              this.uiController.updateLanguage(this.options.items.preferredLanguage.currentValue)
              break
          }
        }
      }
    })

    // Set initial values of components
    this.setRootComponentClasses()

    // Enable swipe support
    this.touchSurface('output', this.touchCallbackTest.bind(this), {
      thresholdTime: 800,
      thresholdDistance: 100
    })

    this.touchSurface('.alpheios-panel__header', this.tabsSwipe.bind(this), {
      thresholdTime: 800,
      thresholdDistance: 100
    })
  }

  /**
   * This is a test method. TODO: remove when finished with testing
   * @param param
   */
  buttonClicked (param) {
    console.log(`Component button clicked, param is ${param}`)
  }

  static get defaults () {
    return {
      irregularBaseFontSizeClassName: 'alpheios-irregular-base-font-size'
    }
  }

  static get settingValues () {
    return {
      uiTypePanel: 'panel',
      uiTypePopup: 'popup',
      verboseMode: 'verbose'
    }
  }

  /**
   * Finds a maximal z-index value of elements on a page.
   * @return {Number}
   */
  getZIndexMax (zIndexDefualt = 2000) {
    let startTime = new Date().getTime()
    let zIndex = this.zIndexRecursion(document.querySelector('body'), Number.NEGATIVE_INFINITY)
    let timeDiff = new Date().getTime() - startTime
    console.log(`Z-index max value is ${zIndex}, calculation time is ${timeDiff} ms`)

    if (zIndex >= zIndexDefualt) {
      if (zIndex < Number.POSITIVE_INFINITY) { zIndex++ } // To be one level higher that the highest element on a page
    } else {
      zIndex = zIndexDefualt
    }

    return zIndex
  }

  /**
   * A recursive function that iterates over all elements on a page searching for a highest z-index.
   * @param {Node} element - A root page element to start scan with (usually `body`).
   * @param {Number} zIndexMax - A current highest z-index value found.
   * @return {Number} - A current highest z-index value.
   */
  zIndexRecursion (element, zIndexMax) {
    if (element) {
      let zIndexValues = [
        window.getComputedStyle(element).getPropertyValue('z-index'), // If z-index defined in CSS rules
        element.style.getPropertyValue('z-index') // If z-index is defined in an inline style
      ]
      for (const zIndex of zIndexValues) {
        if (zIndex && zIndex !== 'auto') {
          // Value has some numerical z-index value
          zIndexMax = Math.max(zIndexMax, zIndex)
        }
      }
      for (let node of element.childNodes) {
        let nodeType = node.nodeType
        if (nodeType === Node.ELEMENT_NODE || nodeType === Node.DOCUMENT_NODE || nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
          zIndexMax = this.zIndexRecursion(node, zIndexMax)
        }
      }
    }
    return zIndexMax
  }

  static hasRegularBaseFontSize () {
    let htmlElement = document.querySelector('html')
    return window.getComputedStyle(htmlElement, null).getPropertyValue('font-size') === '16px'
  }

  formatFullDefinitions (lexeme) {
    let content = `<h3>${lexeme.lemma.word}</h3>\n`
    for (let fullDef of lexeme.meaning.fullDefs) {
      content += `${fullDef.text}<br>\n`
    }
    return content
  }

  message (message) {
    this.panel.showMessage(message)
    return this
  }

  addMessage (message) {
    this.panel.appendMessage(message)
  }

  addImportantMessage (message) {
    this.panel.appendMessage(message)
    this.popup.appendMessage(message)
    this.panel.showImportantNotification(message)
    this.popup.showImportantNotification(message)
  }

  static getLanguageName (languageID) {
    return languageNames.has(languageID) ? languageNames.get(languageID) : ''
  }

  showLanguageInfo (homonym) {
    let notFound = !homonym ||
      !homonym.lexemes ||
      homonym.lexemes.length < 1 ||
      homonym.lexemes.filter((l) => l.isPopulated()).length < 1
    this.panel.showLanguageNotification(homonym, notFound)
    this.popup.showLanguageNotification(homonym, notFound)
  }

  showStatusInfo (selectionText, languageID) {
    this.panel.showStatusInfo(selectionText, languageID)
    this.popup.showStatusInfo(selectionText, languageID)
  }

  showErrorInfo (errorText) {
    this.panel.showErrorInformation(errorText)
  }

  showImportantNotification (message) {
    this.panel.showImportantNotification(message)
    this.popup.showImportantNotification(message)
  }

  changeTab (tabName) {
    this.panel.changeTab(tabName)
    return this
  }

  setTargetRect (targetRect) {
    this.popup.setTargetRect(targetRect)
    return this
  }

  newLexicalRequest () {
    this.popup.newLexicalRequest()
    this.clear().open().changeTab('morphology')
    return this
  }

  updateMorphology (homonym) {
    homonym.lexemes.sort(Lexeme.getSortByTwoLemmaFeatures(Feature.types.frequency, Feature.types.part))
    this.popup.lexemes = homonym.lexemes
    if (homonym.lexemes.length > 0) {
      // TODO we could really move this into the morph component and have it be calculated for each lemma in case languages are multiple
      // this.popup.linkedFeatures = LanguageModelFactory.getLanguageModel(homonym.lexemes[0].lemma.languageID).grammarFeatures()
      this.panel.panelData.linkedFeatures = LanguageModelFactory.getLanguageModel(homonym.lexemes[0].lemma.languageID).grammarFeatures()
    }
    this.popup.popupData.morphDataReady = true
    this.panel.panelData.morphDataReady = true
    this.panel.panelData.lexemes = homonym.lexemes
    this.popup.popupData.updates = this.popup.popupData.updates + 1
    this.updateProviders(homonym)
  }

  updateProviders (homonym) {
    let providers = new Map()
    homonym.lexemes.forEach((l) => {
      if (l.provider) {
        providers.set(l.provider, 1)
      }
      l.meaning.shortDefs.forEach((d) => {
        if (d.provider) {
          providers.set(d.provider, 1)
        }
      })
    })
    this.popup.popupData.providers = Array.from(providers.keys())
    this.panel.panelData.providers = Array.from(providers.keys())
  }

  updateGrammar (urls) {
    if (urls.length > 0) {
      this.panel.panelData.grammarRes = urls[0]
    } else {
      this.panel.panelData.grammarRes = { provider: this.l10n.messages.TEXT_NOTICE_GRAMMAR_NOTFOUND }
    }
    // todo show TOC or not found
  }

  updateDefinitions (homonym) {
    console.log(`update definitions`)
    this.panel.panelData.fullDefinitions = ''
    this.panel.panelData.shortDefinitions = []
    let definitions = {}
    // let defsList = []
    let hasFullDefs = false
    for (let lexeme of homonym.lexemes) {
      if (lexeme.meaning.shortDefs.length > 0) {
        definitions[lexeme.lemma.key] = []
        for (let def of lexeme.meaning.shortDefs) {
          // for now, to avoid duplicate showing of the provider we create a new unproxied definitions
          // object without a provider if it has the same provider as the morphology info
          if (def.provider && lexeme.provider && def.provider.uri === lexeme.provider.uri) {
            definitions[lexeme.lemma.key].push(new Definition(def.text, def.language, def.format, def.lemmaText))
          } else {
            definitions[lexeme.lemma.key].push(def)
          }
        }
        this.panel.panelData.shortDefinitions.push(...lexeme.meaning.shortDefs)
        this.updateProviders(homonym)
      } else if (Object.entries(lexeme.lemma.features).size > 0) {
        definitions[lexeme.lemma.key] = [new Definition('No definition found.', 'en-US', 'text/plain', lexeme.lemma.word)]
      }

      if (lexeme.meaning.fullDefs.length > 0) {
        this.panel.panelData.fullDefinitions += this.formatFullDefinitions(lexeme)
        hasFullDefs = true
      }
    }

    // Populate a popup
    this.popup.definitions = definitions
    this.panel.panelData.definitions = definitions

    this.popup.popupData.defDataReady = hasFullDefs
    this.panel.panelData.defDataReady = hasFullDefs
    this.popup.popupData.updates = this.popup.popupData.updates + 1
  }

  updateTranslations (homonym) {
    let translations = {}
    for (let lexeme of homonym.lexemes) {
      if (lexeme.lemma.translation !== undefined) {
        translations[lexeme.lemma.key] = lexeme.lemma.translation
      }
    }
    this.popup.translations = translations
    this.popup.popupData.translationsDataReady = true
    this.popup.popupData.updates = this.popup.popupData.updates + 1
  }

  updatePageAnnotationData (data) {
    this.panel.panelData.treebankComponentData.data.page = data.treebank.page || {}
  }

  updateWordAnnotationData (data) {
    if (data && data.treebank) {
      this.panel.panelData.treebankComponentData.data.word = data.treebank.word || {}
      this.popup.popupData.hasTreebank = data.treebank.word
    } else {
      this.panel.panelData.treebankComponentData.data.word = {}
      this.popup.popupData.hasTreebank = false
    }
  }

  updateLanguage (currentLanguage) {
    this.state.setItem('currentLanguage', currentLanguage)
    let languageID = LanguageModelFactory.getLanguageIdFromCode(currentLanguage)
    this.panel.requestGrammar({ type: 'table-of-contents', value: '', languageID: languageID })
    this.panel.enableInflections(LanguageModelFactory.getLanguageModel(languageID).canInflect())
    this.panel.panelData.infoComponentData.languageName = UIControllerMobile.getLanguageName(languageID)
    console.log(`Current language is ${this.state.currentLanguage}`)
  }

  updateVerboseMode () {
    this.state.setItem('verboseMode', this.options.items.verboseMode.currentValue === this.settings.verboseMode)
    this.state.setItem('verboseMode', this.options.items.verboseMode.currentValue === this.settings.verboseMode)
    this.panel.panelData.verboseMode = this.state.verboseMode
    this.popup.popupData.verboseMode = this.state.verboseMode
  }

  updateInflections (inflectionData, homonym) {
    let enabled = LanguageModelFactory.getLanguageModel(homonym.languageID).canInflect()
    this.panel.enableInflections(enabled)
    this.panel.updateInflections(inflectionData, homonym)
    this.popup.popupData.inflDataReady = enabled && inflectionData.hasInflectionSets
  }

  clear () {
    this.panel.clearContent()
    this.popup.clearContent()
    return this
  }

  open () {
    if (this.options.items.uiType.currentValue === this.settings.uiTypePanel) {
      this.panel.open()
    } else {
      if (this.panel.isOpen) { this.panel.close() }
      this.popup.open()
    }
    return this
  }

  setRootComponentClasses () {
    let classes = []
    if (!UIControllerMobile.hasRegularBaseFontSize()) {
      classes.push(this.constructor.defaults.irregularBaseFontSizeClassName)
    }
    classes.push(`auk--${this.uiOptions.items.skin.currentValue}`)
    this.panel.panelData.classes = classes
    this.popup.popupData.classes = classes
  }

  changeSkin () {
    // Update skin name in classes
    this.setRootComponentClasses()
  }

  touchSurface (selector, callback, options) {
    if (!selector) {
      throw new Error(`Touch surface selector cannot be empty`)
    }

    let touchSurface = {
      start: {},
      end: {},
      tracking: false,
      surface: document.querySelector(selector),
      options: options
    }

    if (touchSurface.surface) {
      touchSurface.surface.addEventListener('pointerdown', this.gestureStart.bind(this, touchSurface), false)
      touchSurface.surface.addEventListener('pointermove', this.gestureMove.bind(this, touchSurface), false)
      touchSurface.surface.addEventListener('pointerup', this.gestureEnd.bind(this, touchSurface, callback), false)
      touchSurface.surface.addEventListener('pointerleave', this.gestureEnd.bind(this, touchSurface, callback), false)
      touchSurface.surface.addEventListener('pointercancel', this.gestureEnd.bind(this, touchSurface, callback), false)
    } else {
      throw new Error(`Touch surface "${selector}" does not exist`)
    }
  }

  touchCallbackTest (target, touchEvent) {
    target.surface.innerHTML = `${touchEvent.type || ''} ${touchEvent.direction || ''} ${touchEvent.event || ''} ${touchEvent.debug || ''}`
    if (touchEvent.type === 'swipe') {
      if (touchEvent.direction === 'left') {
        const prevTabName = this.panel.prevTabName()
        if (prevTabName) {
          this.panel.changeTab(prevTabName)
        } else {
          console.warn(`Cannot determine the previous tab`)
        }
      } else if (touchEvent.direction === 'right') {
        const nextTabName = this.panel.nextTabName()
        if (nextTabName) {
          this.panel.changeTab(nextTabName)
        } else {
          console.warn(`Cannot determine the next tab`)
        }
      }
    }
  }

  gestureStart (target, ev) {
    target.tracking = true
    // Hack - would normally use e.timeStamp but it's whack in Fx/Android
    target.start.t = new Date().getTime()
    target.start.x = ev.clientX
    target.start.y = ev.clientY
  }

  gestureMove (target, ev) {
    if (target.tracking) {
      ev.preventDefault()
      target.end.x = ev.clientX
      target.end.y = ev.clientY
    }
  }

  gestureEnd (target, callback, ev) {
    if (target.tracking) {
      target.tracking = false
      const now = new Date().getTime()
      const deltaTime = now - target.start.t
      const deltaX = target.end.x - target.start.x
      const deltaY = target.end.y - target.start.y
      /* work out what the movement was */
      if (deltaTime > target.thresholdTime) {
        /* gesture too slow */
        callback(target, {debug: `not a swipe: too slow, event: ${ev.type}`})
      } else {
        if ((deltaX > target.options.thresholdDistance) && (Math.abs(deltaY) < target.options.thresholdDistance)) {
          callback(target, {type: 'swipe', direction: 'right', event: ev.type})
        } else if ((-deltaX > target.options.thresholdDistance) && (Math.abs(deltaY) < target.options.thresholdDistance)) {
          callback(target, {type: 'swipe', direction: 'left', event: ev.type})
        } else if ((deltaY > target.options.thresholdDistance) && (Math.abs(deltaX) < target.options.thresholdDistance)) {
          callback(target, {type: 'swipe', direction: 'down', event: ev.type})
        } else if ((-deltaY > target.options.thresholdDistance) && (Math.abs(deltaX) < target.options.thresholdDistance)) {
          callback(target, {type: 'swipe', direction: 'up', event: ev.type})
        } else {
          callback(target, {debug: `not a swipe: too short, event: ${ev.type}, duration: ${deltaTime}`})
        }
      }
    }
  }

  tabsSwipe (target, touchEvent) {
    console.log(`${touchEvent.type || ''} ${touchEvent.direction || ''} ${touchEvent.event || ''} ${touchEvent.debug || ''}`)
    if (touchEvent.type === 'swipe') {
      if (touchEvent.direction === 'left') {
        const prevTabName = this.panel.prevTabName()
        if (prevTabName) {
          this.panel.changeTab(prevTabName)
        } else {
          console.warn(`Cannot determine the previous tab`)
        }
      } else if (touchEvent.direction === 'right') {
        const nextTabName = this.panel.nextTabName()
        if (nextTabName) {
          this.panel.changeTab(nextTabName)
        } else {
          console.warn(`Cannot determine the next tab`)
        }
      }
    }
  }
}