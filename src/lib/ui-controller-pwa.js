/* global Node */
import {Lexeme, Feature, Definition, LanguageModelFactory, Constants} from 'alpheios-data-models'
import { ViewSetFactory } from 'alpheios-inflection-tables'
import { HTMLSelector, LexicalQuery, HTMLConsole } from 'alpheios-components'
import {Lexicons} from 'alpheios-lexicon-client'
// import {ObjectMonitor as ExpObjMon} from 'alpheios-experience'
import Vue from 'vue/dist/vue' // Vue in a runtime + compiler configuration

// A panel component
// import Panel from '../../node_modules/alpheios-components/src/vue-components/panel.vue'

import Panel from '../components/panel-pwa.vue'
import TabGroup from './tab-group.js'

import L10n from '../../node_modules/alpheios-components/src/lib/l10n/l10n.js'
import CompL10n from '../../node_modules/alpheios-components/src/locales/locales.js'
import EnUs from '../locales/en-us/messages.json'
import EnGb from '../locales/en-gb/messages.json'
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

export default class UiControllerPwa extends BaseUIController {
  /**
   * @constructor
   * @param {UIStateAPI} state - State object for the parent application
   * @param {Options} options - content options (see `src/setting/content-options-defaults.js`)
   * @param {Options} resourceOptions - resource options (see `src/setting/language-options-defaults.js`)
   * @param {Options} uiOptions - UI options (see `src/setting/ui-options-defaults.js`)
   * @param {Object} pckg - an object representing data from `package.json`
   * @param {Object} template - object with the following properties:
   *                            html: HTML string for the container of the Alpheios components
   *                            panelId: the id of the wrapper for the panel component,
   *                            panelComponent: Vue single file component of a panel element.
   *                              Allows to provide an alternative panel layout
   */
  constructor (state, options, resourceOptions, uiOptions, pckg, template = {}) {
    super()
    this.state = state
    this.options = options
    this.resourceOptions = resourceOptions
    this.uiOptions = uiOptions
    this.settings = UiControllerPwa.settingValues
    this.irregularBaseFontSizeClassName = 'alpheios-irregular-base-font-size'
    this.irregularBaseFontSize = !UiControllerPwa.hasRegularBaseFontSize()

    /**
     * An object that is used by `info` component to display a PWA name and a version
     * @type {{name: string, version: string}}
     */
    this.manifest = {
      name: pckg.alpheios.pwa.name,
      version: pckg.version
    }

    // TODO: this is a very temporary solution of storing tab icons. They can't be imported as text because of a conflict with vue-sv-loader
    const infoIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
    <path stroke-width="0" d="M12.13,11.59 C11.97,12.84 10.35,14.12 9.1,14.16 C6.17,14.2 9.89,9.46 8.74,8.37 C9.3,8.16 10.62,7.83 10.62,8.81 C10.62,9.63 10.12,10.55 9.88,11.32 C8.66,15.16 12.13,11.15 12.14,11.18 C12.16,11.21 12.16,11.35 12.13,11.59 C12.08,11.95 12.16,11.35 12.13,11.59 L12.13,11.59 Z M11.56,5.67 C11.56,6.67 9.36,7.15 9.36,6.03 C9.36,5 11.56,4.54 11.56,5.67 L11.56,5.67 Z"></path>
    <circle fill="none" stroke-width="1.1" cx="10" cy="10" r="9"></circle>
</svg>
    `
    const morphIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg width="20" height="20" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    <path d="M782 1078q-1 3-12.5-.5T738 1066l-20-9q-44-20-87-49-7-5-41-31.5T552 948q-67 103-134 181-81 95-105 110-4 2-19.5 4t-18.5 0q6-4 82-92 21-24 85.5-115T521 918q17-30 51-98.5t36-77.5q-8-1-110 33-8 2-27.5 7.5T436 792t-17 5q-2 2-2 10.5t-1 9.5q-5 10-31 15-23 7-47 0-18-4-28-21-4-6-5-23 6-2 24.5-5t29.5-6q58-16 105-32 100-35 102-35 10-2 43-19.5t44-21.5q9-3 21.5-8t14.5-5.5 6 .5q2 12-1 33 0 2-12.5 27T655 769.5 638 803q-25 50-77 131l64 28q12 6 74.5 32t67.5 28q4 1 10.5 25.5t4.5 30.5zM577 592q3 15-4 28-12 23-50 38-30 12-60 12-26-3-49-26-14-15-18-41l1-3q3 3 19.5 5t26.5 0 58-16q36-12 55-14 17 0 21 17zm698 129l63 227-139-42zM167 1521l694-232V257L167 490v1031zm1241-317l102 31-181-657-100-31-216 536 102 31 45-110 211 65zM905 242l573 184V46zm311 1323l158 13-54 160-40-66q-130 83-276 108-58 12-91 12h-84q-79 0-199.5-39T446 1668q-8-7-8-16 0-8 5-13.5t13-5.5q4 0 18 7.5t30.5 16.5 20.5 11q73 37 159.5 61.5T842 1754q95 0 167-14.5t157-50.5q15-7 30.5-15.5t34-19 28.5-16.5zm448-1079v1079l-774-246q-14 6-375 127.5T147 1568q-13 0-18-13 0-1-1-3V474q3-9 4-10 5-6 20-11 107-36 149-50V19l558 198q2 0 160.5-55t316-108.5T1497 0q20 0 20 21v418z"/>
</svg>
    `
    const definitionsIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
    <path stroke-width="0" d="M6,18.71 L6,14 L1,14 L1,1 L19,1 L19,14 L10.71,14 L6,18.71 L6,18.71 Z M2,13 L7,13 L7,16.29 L10.29,13 L18,13 L18,2 L2,2 L2,13 L2,13 Z"></path>
</svg>
    `
    const inflectionsIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 25 21" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
 <g>
  <rect ry="2.9013" height="20" width="24" y=".5" x=".5" fill="none" />
  <path d="m16.492 5.4785v14.505m-7.9923-14.506v14.505m-7.5063-4.5251h23.005m-23.005-4.9793h23.005m-23.005-4.98h23.005" stroke-width=".79406px" fill="none"/>
 </g>
</svg>
    `
    const grammarIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 24 24">
 <ellipse rx="11.405" ry="11.405" fill="none" cy="12" cx="12"/>
 <path stroke-width="0" d="m19.46 10.145q0 2.4908-1.1782 4.4943-1.4263 2.3554-3.9687 2.7074v-2.1659q1.2092-0.21659 1.9844-1.2454 0.68212-0.94759 0.68212-1.9764-0.43408 0.1083-0.86816 0.1083-1.3022 0-2.1704-0.8393-0.86816-0.8393-0.86816-1.8681 0-1.11 0.89917-1.8952 0.93017-0.81222 2.2014-0.81222 1.5503 0 2.4805 1.11 0.80615 0.97467 0.80615 2.3825zm-8.5336 0q0 2.4908-1.1782 4.4943-1.4263 2.3554-3.9687 2.7074v-2.1659q1.2092-0.21659 1.9844-1.2454 0.68212-0.94759 0.68212-1.9764-0.43408 0.1083-0.86816 0.1083-1.3022 0-2.1704-0.8393-0.86816-0.8393-0.86816-1.8681 0-1.11 0.89916-1.8952 0.93017-0.81222 2.2014-0.81222 1.5503 0 2.4805 1.11 0.80615 0.97467 0.80615 2.3825z"/>
</svg>

    `
    const treebankIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg width="20" height="20" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    <path d="M1792 1248v320q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h96v-192h-512v192h96q40 0 68 28t28 68v320q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h96v-192h-512v192h96q40 0 68 28t28 68v320q0 40-28 68t-68 28h-320q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h96v-192q0-52 38-90t90-38h512v-192h-96q-40 0-68-28t-28-68v-320q0-40 28-68t68-28h320q40 0 68 28t28 68v320q0 40-28 68t-68 28h-96v192h512q52 0 90 38t38 90v192h96q40 0 68 28t28 68z"/>
</svg>
    `
    const optionsIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
    <circle fill="none" cx="9.997" cy="10" r="3.31"></circle>
    <path fill="none" d="M18.488,12.285 L16.205,16.237 C15.322,15.496 14.185,15.281 13.303,15.791 C12.428,16.289 12.047,17.373 12.246,18.5 L7.735,18.5 C7.938,17.374 7.553,16.299 6.684,15.791 C5.801,15.27 4.655,15.492 3.773,16.237 L1.5,12.285 C2.573,11.871 3.317,10.999 3.317,9.991 C3.305,8.98 2.573,8.121 1.5,7.716 L3.765,3.784 C4.645,4.516 5.794,4.738 6.687,4.232 C7.555,3.722 7.939,2.637 7.735,1.5 L12.263,1.5 C12.072,2.637 12.441,3.71 13.314,4.22 C14.206,4.73 15.343,4.516 16.225,3.794 L18.487,7.714 C17.404,8.117 16.661,8.988 16.67,10.009 C16.672,11.018 17.415,11.88 18.488,12.285 L18.488,12.285 Z"></path>
</svg>
    `
    const statusIcon = `
<?xml version="1.0" encoding="utf-8"?>
<svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" xmlns:svg="http://www.w3.org/2000/svg">
    <circle fill="none" stroke-width="1.1" cx="10" cy="10" r="9"></circle>
    <rect stroke-width="0" x="9" y="4" width="1" height="7"></rect>
    <path fill="none" stroke-width="1.1" d="M13.018,14.197 L9.445,10.625"></path>
</svg>
    `

    let tabs = new TabGroup(
      ['info', infoIcon, '', 'info'],
      ['morphology', morphIcon, '', 'morphology', true, true],
      ['definitions', definitionsIcon, '', 'definitions', true],
      ['inflections', inflectionsIcon, '', 'inflections', true, false, false],
      ['grammar', grammarIcon, '', 'grammar', false, false, true],
      ['treebank', treebankIcon, '', 'treebank', false, false, true],
      ['options', optionsIcon, '', 'options'],
      ['status', statusIcon, '', 'status', false, false, true]
    )

    const templateDefaults = {
      html: Template,
      panelId: 'alpheios-panel',
      panelComponents: {
        panel: Panel
      },
      defaultPanelComponent: 'panel',
      draggable: true,
      resizable: true
    }
    this.template = Object.assign(templateDefaults, template)
    this.inflectionsViewSet = null // Holds inflection tables ViewSet

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
      .addMessages(CompL10n.messages.en_US, CompL10n.en_US)
      .addMessages(CompL10n.messages.en_GB, CompL10n.en_GB)
      .addMessages(EnUs, CompL10n.en_US)
      .addMessages(EnGb, CompL10n.en_GB)
      .setLocale(CompL10n.en_US)

    // Inject HTML code of a plugin. Should go in reverse order.
    document.body.classList.add('alpheios')
    let container = document.createElement('div')
    document.body.insertBefore(container, null)
    container.outerHTML = this.template.html
    // Initialize components
    this.panel = new Vue({
      el: `#${this.template.panelId}`,
      components: { panel: Panel },
      data: {
        panelData: {
          state: this.state,
          isOpen: false,
          tabs: tabs,
          verboseMode: this.state.verboseMode,
          grammarAvailable: false,
          grammarRes: {},
          lexemes: [],
          definitions: {},
          defDataReady: false,
          translations: {},
          linkedFeatures: [],
          showProviders: false,
          inflectionComponentData: {
            visible: false,
            inflectionViewSet: false // If no inflection data present, it is set to false
          },
          inflectionsEnabled: false,
          inflectionsWaitState: false,
          inflectionBrowserEnabled: false,
          inflBrowserTablesCollapsed: null,
          lexicalDataContainerID: 'panel-alpheios-lexical-data-container',
          morphComponentID: 'panel-alpheios-morph-component',
          inflDataReady: this.inflDataReady,
          morphDataReady: false, // Whether we have morphological data for a word ready to show
          morphDataNotFound: false, // Whether morphological data exists for a selected word in a morphological analyzer
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
            languageName: UiControllerPwa.getLanguageName(this.state.currentLanguage)
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
          // This object will be passed to the treebank component
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

        clearContent: function () {
          this.panelData.tabs.reset()
          this.panelData.morphDataReady = false
          this.panelData.morphDataNotFound = false
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
            languageName = UiControllerPwa.getLanguageName(homonym.languageID)
          } else if (this.panelData.infoComponentData.languageName) {
            languageName = this.panelData.infoComponentData.languageName
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
          this.panelData.status.languageName = UiControllerPwa.getLanguageName(languageID)
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

        sendFeature: function (feature) {
          this.requestGrammar(feature)
          this.panelData.tabs.select('grammar')
          return this
        },

        componentEvent: function (component, type, data) {
          console.log('Component event', component, type, data)
          if (component === 'inflections') {
            if (type === 'dataUpdate') {
              // Inflections component data has been updated
              console.log(`Inflections data update`)
              if (this.panelData.inflDataReady) {
                console.log('Inflections enabled')
                this.panelData.tabs.enable('inflections')
              } else {
                this.panelData.tabs.disable('inflections')
              }
            }
          }
        },

        newLexicalRequest: function () {
          this.panelData.morphDataReady = false
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
          // TODO we need to refactor handling of boolean options
          if (name === 'enableLemmaTranslations') {
            this.options.items[name].setValue(value)
          } else {
            this.options.items[name].setTextValue(value)
          }
          switch (name) {
            case 'locale':
              if (this.uiController.presenter) {
                this.uiController.presenter.setLocale(this.options.items.locale.currentValue)
              }
              this.uiController.updateLemmaTranslations()
              break
            case 'preferredLanguage':
              this.uiController.updateLanguage(this.options.items.preferredLanguage.currentValue)
              break
            case 'verboseMode':
              this.uiController.updateVerboseMode()
              break
            case 'enableLemmaTranslations':
              this.uiController.updateLemmaTranslations()
              break
          }
        },
        resourceSettingChange: function (name, value) {
          let keyinfo = this.resourceOptions.parseKey(name)
          this.resourceOptions.items[keyinfo.setting].filter((f) => f.name === name).forEach((f) => { f.setTextValue(value) })
        },
        uiOptionChange: function (name, value) {
          this.uiController.uiOptions.items[name].setTextValue(value)
          switch (name) {
            case 'skin':
              this.uiController.changeSkin(this.uiController.uiOptions.items[name].currentValue)
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
        const currentLanguageID = LanguageModelFactory.getLanguageIdFromCode(this.options.items.preferredLanguage.currentValue)
        this.options.items.lookupLangOverride.setValue(false)
        this.updateLanguage(currentLanguageID)
        this.updateVerboseMode()
        this.updateLemmaTranslations()
        this.notifyInflectionBrowser()
      })
    })

    // Set initial values of components
    this.setRootComponentClasses()
  }

  static get defaults () {
    return {
      irregularBaseFontSizeClassName: 'alpheios-irregular-base-font-size'
    }
  }

  static get settingValues () {
    return {
      uiTypePanel: 'panel',
      verboseMode: 'verbose',
      enableLemmaTranslations: false
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
      if (zIndex < Number.POSITIVE_INFINITY) { zIndex++ } // To be one level higher that the highest element on a pag
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
    this.panel.showImportantNotification(message)
  }

  /**
   * Gets language name by either language ID (a symbol) or language code (string)
   * @param {symbol|string} language - Either language ID or language code (see constants in `data-models` for definitions)
   * @return {string} A language name
   */
  static getLanguageName (language) {
    let langID
    let langCode // eslint-disable-line
    // Compatibility code in case method be called with languageCode instead of ID. Remove when not needed
    ;({ languageID: langID, languageCode: langCode } = LanguageModelFactory.getLanguageAttrs(language))
    return languageNames.has(langID) ? languageNames.get(langID) : ''
  }

  showLanguageInfo (homonym) {
    let notFound = !homonym ||
      !homonym.lexemes ||
      homonym.lexemes.length < 1 ||
      homonym.lexemes.filter((l) => l.isPopulated()).length < 1
    this.panel.showLanguageNotification(homonym, notFound)
  }

  showStatusInfo (selectionText, languageID) {
    this.panel.showStatusInfo(selectionText, languageID)
  }

  showErrorInfo (errorText) {
    this.panel.showErrorInformation(errorText)
  }

  showImportantNotification (message) {
    this.panel.showImportantNotification(message)
  }

  setTargetRect (targetRect) {
    console.warn('Empty setTargetRect call')
    return this
  }

  newLexicalRequest (languageID) {
    this.panel.newLexicalRequest()
    this.panel.panelData.inflectionsEnabled = ViewSetFactory.hasInflectionsEnabled(languageID)
    this.panel.panelData.inflectionsWaitState = true // Homonym is retrieved and inflection data is calculated
    this.panel.panelData.grammarAvailable = false
    this.panel.panelData.inflBrowserTablesCollapsed = true // Collapse all inflection tables in a browser
    this.clear().open().panel.panelData.tabs.select('morphology')
    return this
  }

  updateMorphology (homonym) {
    homonym.lexemes.sort(Lexeme.getSortByTwoLemmaFeatures(Feature.types.frequency, Feature.types.part))
    if (homonym.lexemes.length > 0) {
      // TODO we could really move this into the morph component and have it be calculated for each lemma in case languages are multiple
      // this.popup.linkedFeatures = LanguageModelFactory.getLanguageModel(homonym.lexemes[0].lemma.languageID).grammarFeatures()
      this.panel.panelData.linkedFeatures = LanguageModelFactory.getLanguageModel(homonym.lexemes[0].lemma.languageID).grammarFeatures()
    }
    // this.popup.popupData.morphDataReady = true
    this.panel.panelData.morphDataReady = true
    this.panel.panelData.lexemes = homonym.lexemes
    // this.popup.popupData.updates = this.popup.popupData.updates + 1
    this.updateProviders(homonym)
  }

  morphologyDataNotFound (value) {
    this.panel.panelData.morphDataNotFound = value
  }

  updateProviders (homonym) {
    let providers = new Map()
    homonym.lexemes.forEach((l) => {
      if (l.provider) {
        providers.set(l.provider, 1)
      }
      if (l.meaning && l.meaning.shortDefs) {
        l.meaning.shortDefs.forEach((d) => {
          if (d.provider) {
            providers.set(d.provider, 1)
          }
        })
      }
      if (l.lemma && l.lemma.translation && l.lemma.translation.provider) {
        providers.set(l.lemma.translation.provider, 1)
      }
    })
    this.panel.panelData.providers = Array.from(providers.keys())
  }

  updateGrammar (urls) {
    if (urls.length > 0) {
      this.panel.panelData.grammarRes = urls[0]
      this.panel.panelData.grammarAvailable = true
      this.panel.panelData.tabs.enable('grammar')
    } else {
      this.panel.panelData.grammarRes = { provider: this.l10n.messages.TEXT_NOTICE_GRAMMAR_NOTFOUND }
      this.panel.panelData.tabs.disable('grammar')
    }
    // todo show TOC or not found
  }

  updateDefinitions (homonym) {
    this.panel.panelData.fullDefinitions = ''
    this.panel.panelData.shortDefinitions = []
    let definitions = {}
    // let defsList = []
    let hasFullDefs = false
    for (let lexeme of homonym.lexemes) {
      if (lexeme.meaning.shortDefs.length > 0) {
        definitions[lexeme.lemma.ID] = []
        for (let def of lexeme.meaning.shortDefs) {
          // for now, to avoid duplicate showing of the provider we create a new unproxied definitions
          // object without a provider if it has the same provider as the morphology info
          if (def.provider && lexeme.provider && def.provider.uri === lexeme.provider.uri) {
            definitions[lexeme.lemma.ID].push(new Definition(def.text, def.language, def.format, def.lemmaText))
          } else {
            definitions[lexeme.lemma.ID].push(def)
          }
        }
        this.panel.panelData.shortDefinitions.push(...lexeme.meaning.shortDefs)
        this.updateProviders(homonym)
      } else if (Object.entries(lexeme.lemma.features).size > 0) {
        definitions[lexeme.lemma.ID] = [new Definition('No definition found.', 'en-US', 'text/plain', lexeme.lemma.word)]
      }

      if (lexeme.meaning.fullDefs.length > 0) {
        this.panel.panelData.fullDefinitions += this.formatFullDefinitions(lexeme)
        hasFullDefs = true
      }
    }

    this.panel.panelData.definitions = definitions

    this.panel.panelData.defDataReady = hasFullDefs
    // this.popup.popupData.updates = this.popup.popupData.updates + 1
  }

  updateTranslations (homonym) {
    let translations = {}
    for (let lexeme of homonym.lexemes) {
      if (lexeme.lemma.translation !== undefined) {
        translations[lexeme.lemma.ID] = lexeme.lemma.translation
      }
    }
    // this.popup.translations = translations
    // this.popup.popupData.translationsDataReady = true
    // this.popup.popupData.updates = this.popup.popupData.updates + 1
  }

  updatePageAnnotationData (data) {
    console.log('Update page annotation data')
    if (data && data.treebank) {
      this.panel.panelData.treebankComponentData.data.page = data.treebank.page || {}
      this.panel.panelData.tabs.enable('treebank')
    }
  }

  updateWordAnnotationData (data) {
    console.log('Update word annotation data')
    if (data && data.treebank) {
      this.panel.panelData.treebankComponentData.data.word = data.treebank.word || {}
      this.panel.panelData.hasTreebank = data.treebank.word
      this.panel.panelData.tabs.enable('treebank')
    } else {
      this.panel.panelData.treebankComponentData.data.word = {}
      this.panel.panelData.hasTreebank = false
      this.panel.panelData.tabs.disable('treebank')
    }
  }

  /**
   * This method is called every time a selection language changes and once on page initialization
   * @param {string} currentLanguage - A language code
   */
  updateLanguage (currentLanguageID) {
    this.state.setItem('currentLanguage', LanguageModelFactory.getLanguageCodeFromId(currentLanguageID))

    this.panel.requestGrammar({ type: 'table-of-contents', value: '', languageID: currentLanguageID })
    this.panel.panelData.inflDataReady = this.inflDataReady
    this.panel.panelData.infoComponentData.languageName = UiControllerPwa.getLanguageName(currentLanguageID)
    console.log(`Current language is ${this.state.currentLanguage}`)
  }

  updateVerboseMode () {
    this.state.setItem('verboseMode', this.options.items.verboseMode.currentValue === this.settings.verboseMode)
    HTMLConsole.instance.enable(this.options.items.verboseMode.currentValue === this.settings.verboseMode)
    this.panel.panelData.verboseMode = this.state.verboseMode
    if (this.options.items.verboseMode.currentValue === this.settings.verboseMode) {
      this.panel.panelData.tabs.enable('status')
    } else {
      this.panel.panelData.tabs.disable('status')
    }
  }

  updateLemmaTranslations () {
    if (this.options.items.enableLemmaTranslations.currentValue && !this.options.items.locale.currentValue.match(/en-/)) {
      this.state.setItem('lemmaTranslationLang', this.options.items.locale.currentValue)
    } else {
      this.state.setItem('lemmaTranslationLang', null)
    }
  }

  notifyInflectionBrowser () {
    this.panel.panelData.inflectionBrowserEnabled = true
  }

  updateInflections (homonym) {
    this.inflectionsViewSet = ViewSetFactory.create(homonym, this.options.items.locale.currentValue)

    this.panel.panelData.inflectionComponentData.inflectionViewSet = this.inflectionsViewSet
    if (this.inflectionsViewSet.hasMatchingViews) {
      this.addMessage(this.l10n.messages.TEXT_NOTICE_INFLDATA_READY)
    }
    this.panel.panelData.inflectionsWaitState = false
    this.panel.panelData.inflDataReady = this.inflDataReady
  }

  lexicalRequestFailed () {
    this.panel.panelData.inflectionsWaitState = false
  }
  lexicalRequestComplete () {
    this.panel.panelData.inflBrowserTablesCollapsed = null // Reset inflection browser tables state
  }

  lexicalRequestSucceeded () {
    this.panel.panelData.inflectionsWaitState = false
  }

  get inflDataReady () {
    return this.inflectionsViewSet && this.inflectionsViewSet.hasMatchingViews
  }

  clear () {
    this.panel.clearContent()
    return this
  }

  open () {
    this.panel.open()
    return this
  }

  setRootComponentClasses () {
    let classes = []
    if (!UiControllerPwa.hasRegularBaseFontSize()) {
      classes.push(this.constructor.defaults.irregularBaseFontSizeClassName)
    }
    classes.push(`auk--${this.uiOptions.items.skin.currentValue}`)
    this.panel.panelData.classes = classes
  }

  changeSkin () {
    // Update skin name in classes
    this.setRootComponentClasses()
  }

  selectPrevTab () {
    this.panel.panelData.tabs.selectPrev()
  }

  selectNextTab () {
    this.panel.panelData.tabs.selectNext()
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
        uiController: this,
        maAdapter: this.maAdapter,
        lexicons: Lexicons,
        resourceOptions: this.langOptions,
        langOpts: {[Constants.LANG_PERSIAN]: {lookupMorphLast: true}} // TODO this should be externalized
      }).getData()
    }
  }
}
