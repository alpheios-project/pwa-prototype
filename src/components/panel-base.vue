<template>
    <div class="alpheios-panel auk" :class="classes" :style="this.data.styles"
         data-component="alpheios-panel" data-resizable="true" v-show="data.isOpen"
        :data-notification-visible="data.notification.important"> <!-- Show only important notifications for now -->

        <div class="alpheios-panel__header">
            <div class="alpheios-panel__header-logo">
                <img class="alpheios-panel__header-logo-img" src="../images/icon.png">
            </div>
            <span class="alpheios-panel__header-btn-group--center">

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_HELP">
                <span v-bind:class="{ active: data.tabs.info }" @click="changeTab('info')"
                  class="alpheios-panel__header-nav-btn">
                  <info-icon class="icon"></info-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_DEFINITIONS">
                <span :class="{ active: data.tabs.definitions }" @click="changeTab('definitions')"
                  class="alpheios-panel__header-nav-btn">
                  <definitions-icon class="icon"></definitions-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_INFLECT">
                <span v-bind:class="{ active: data.tabs.inflections }" @click="changeTab('inflections')"
                  class="alpheios-panel__header-nav-btn">
                  <inflections-icon class="icon"></inflections-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_GRAMMAR">
                <span v-bind:class="{ active: data.tabs.grammar }" @click="changeTab('grammar')"
                  class="alpheios-panel__header-nav-btn">
                  <grammar-icon class="icon"></grammar-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_TREEBANK">
                <span v-bind:class="{ active: data.tabs.treebank }" @click="changeTab('treebank')"
                      class="alpheios-panel__header-nav-btn">
                  <treebank-icon class="icon"></treebank-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_OPTIONS">
                <span v-bind:class="{ active: data.tabs.options }" @click="changeTab('options')"
                  class="alpheios-panel__header-nav-btn">
                  <options-icon class="icon"></options-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_STATUS">
                <span v-show="data.verboseMode" v-bind:class="{ active: data.tabs.status }" @click="changeTab('status')"
                  class="alpheios-panel__header-nav-btn">
                  <status-icon class="icon"></status-icon>
                </span>
              </alph-tooltip>
            </span>
            <span class="alpheios-panel__header-btn-group--end">

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_MOVE_PANEL_LEFT" v-show="attachToLeftVisible">
                <span @click="setPosition('left')" v-show="attachToLeftVisible"
                      class="alpheios-panel__header-action-btn alpheios-panel__header-action-btn--narrow">
                    <attach-left-icon></attach-left-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip tooltipDirection="bottom" :tooltipText="data.l10n.messages.TOOLTIP_MOVE_PANEL_RIGHT" v-show="attachToRightVisible">
                <span @click="setPosition('right')" v-show="attachToRightVisible"
                      class="alpheios-panel__header-action-btn alpheios-panel__header-action-btn--narrow">
                    <attach-right-icon></attach-right-icon>
                </span>
              </alph-tooltip>

              <alph-tooltip
                tooltipDirection = "bottom-right"
                :tooltipText = "data.l10n.messages.TOOLTIP_CLOSE_PANEL">
                <span @click="close" class="alpheios-panel__header-action-btn" >
                    <close-icon></close-icon>
                </span>
              </alph-tooltip>
            </span>
        </div>

        <div class="alpheios-panel__content">
            <div v-show="data.tabs.definitions" class="alpheios-panel__tab-panel">
                <div v-show="data.shortDefinitions.length < 1 && data.fullDefinitions.length < 1">
                  {{data.l10n.messages.PLACEHOLDER_DEFINITIONS}}</div>
                <div class="alpheios-panel__contentitem" v-for="definition in data.shortDefinitions">
                    <shortdef :definition="definition"></shortdef>
                </div>
                <div class="alpheios-panel__contentitem" v-html="data.fullDefinitions"></div>
            </div>
            <div v-show="inflectionsTabVisible" :id="inflectionsPanelID" class="alpheios-panel__tab-panel">
                <inflections class="alpheios-panel-inflections"
                             :data="data.inflectionComponentData" :locale="data.settings.locale.currentValue"
                             :messages="data.l10n.messages" @contentwidth="setContentWidth">
                </inflections>
            </div>
            <div v-show="data.tabs.grammar" class="alpheios-panel__tab-panel
            alpheios-panel__tab-panel--no-padding alpheios-panel__tab-panel--fw">
                  <grammar :res="data.grammarRes"></grammar>
              </div>
            <div v-show="treebankTabVisible" class="alpheios-panel__tab-panel
            alpheios-panel__tab-panel--no-padding alpheios-panel__tab-panel--fw">
                  <treebank :res="data.treebankComponentData.data"
                    :locale="data.settings.locale.currentValue" :visible="data.treebankComponentData.visible"
                    :messages="data.l10n.messages" @treebankcontentwidth="setTreebankContentWidth">
                  </treebank>
              </div>
            <div v-show="data.tabs.status" class="alpheios-panel__tab-panel">
                <div v-for="message in data.messages">
                    <div class="alpheios-panel__message">{{message}}</div>
                </div>
            </div>
            <div v-show="data.tabs.options" class="alpheios-panel__tab-panel">
                <setting :data="data.settings.preferredLanguage" @change="settingChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="data.settings.panelPosition" @change="settingChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="data.settings.popupPosition" @change="settingChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="data.settings.uiType" @change="settingChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="data.settings.verboseMode" @change="settingChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="data.uiOptions.items.skin" @change="uiOptionChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="data.uiOptions.items.popup" @change="uiOptionChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="languageSetting" @change="resourceSettingChanged" :classes="['alpheios-panel__options-item']"
                  :key="languageSetting.name"
                  v-if="languageSetting.values.length > 1"
                  v-for="languageSetting in data.resourceSettings.lexicons"></setting>
            </div>
            <div v-show="data.tabs.info" class="alpheios-panel__tab-panel">
                <info :data="data.infoComponentData" :messages="data.l10n.messages"></info>
            </div>
        </div>
        <div class="alpheios-panel__notifications uk-text-small" :class="notificationClasses"
          v-show="data.notification.important">
            <span @click="closeNotifications" class="alpheios-panel__notifications-close-btn">
                <close-icon></close-icon>
            </span>
            <span v-html="data.notification.text"></span>
            <setting :data="data.settings.preferredLanguage" :show-title="false"
                     :classes="['alpheios-panel__notifications--lang-switcher']" @change="settingChanged"
                     v-show="data.notification.showLanguageSwitcher"></setting>
        </div>
    </div>
</template>
<script>
  import Inflections from '../../node_modules/alpheios-components/src/vue-components/inflections.vue'
  import Setting from '../../node_modules/alpheios-components/src/vue-components/setting.vue'
  import ShortDef from '../../node_modules/alpheios-components/src/vue-components/shortdef.vue'
  import Morph from '../../node_modules/alpheios-components/src/vue-components/morph.vue'
  import Grammar from '../../node_modules/alpheios-components/src/vue-components/grammar.vue'
  import Treebank from '../../node_modules/alpheios-components/src/vue-components/treebank.vue'
  import Info from '../../node_modules/alpheios-components/src/vue-components/info.vue'

  import Tooltip from '../../node_modules/alpheios-components/src/vue-components/tooltip.vue'

  // Embeddable SVG icons
  import AttachLeftIcon from '../../node_modules/alpheios-components/src/images/inline-icons/attach-left.svg';
  import AttachRightIcon from '../../node_modules/alpheios-components/src/images/inline-icons/attach-right.svg';
  import CloseIcon from '../../node_modules/alpheios-components/src/images/inline-icons/close.svg';
  import DefinitionsIcon from '../../node_modules/alpheios-components/src/images/inline-icons/definitions.svg';
  import InflectionsIcon from '../../node_modules/alpheios-components/src/images/inline-icons/inflections.svg';
  import StatusIcon from '../../node_modules/alpheios-components/src/images/inline-icons/status.svg';
  import OptionsIcon from '../../node_modules/alpheios-components/src/images/inline-icons/options.svg';
  import GrammarIcon from '../../node_modules/alpheios-components/src/images/inline-icons/resources.svg';
  import TreebankIcon from '../../node_modules/alpheios-components/src/images/inline-icons/tree.svg';
  import InfoIcon from '../../node_modules/alpheios-components/src/images/inline-icons/info.svg';

  export default {
    name: 'Panel',
    components: {
      inflections: Inflections,
      setting: Setting,
      shortdef: ShortDef,
      morph: Morph,
      info: Info,
      grammar: Grammar,
      treebank: Treebank,
      attachLeftIcon: AttachLeftIcon,
      attachRightIcon: AttachRightIcon,
      closeIcon: CloseIcon,
      definitionsIcon: DefinitionsIcon,
      inflectionsIcon: InflectionsIcon,
      statusIcon: StatusIcon,
      optionsIcon: OptionsIcon,
      infoIcon: InfoIcon,
      grammarIcon: GrammarIcon,
      treebankIcon: TreebankIcon,
      alphTooltip: Tooltip
    },
    data: function () {
      return {
        inflectionsPanelID: 'alpheios-panel__inflections-panel',
        positionLeftClassName: 'alpheios-panel-left',
        positionRightClassName: 'alpheios-panel-right',
      }
    },
    props: {
      data: {
        type: Object,
        required: true
      }
    },

    computed: {
      classes: function () {
        // Find index of an existing position class and replace it with an updated value
        const positionLeftIndex = this.data.classes.findIndex(v => v === this.positionLeftClassName)
        const positionRightIndex = this.data.classes.findIndex(v => v === this.positionRightClassName)
        if (this.data.settings.panelPosition.currentValue === 'left') {
          if (positionRightIndex >= 0) {
            // Replace an existing value
            this.data.classes[positionRightIndex] = this.positionLeftClassName
          } else {
            // Add an initial value
            this.data.classes.push(this.positionLeftClassName)
          }

        } else if (this.data.settings.panelPosition.currentValue === 'right') {
          if (positionLeftIndex >= 0) {
            // Replace an existing value
            this.data.classes[positionLeftIndex] = this.positionRightClassName
          } else {
            // Add an initial value
            this.data.classes.push(this.positionRightClassName)
          }
        }
        return this.data.classes
      },

      notificationClasses: function () {
        return {
          'alpheios-panel__notifications--important': this.data.notification.important
        }
      },

      attachToLeftVisible: function () {
        return this.data.settings.panelPosition.currentValue === 'right'
      },

      attachToRightVisible: function () {
        return this.data.settings.panelPosition.currentValue === 'left'
      },

      // Need this to watch when inflections tab becomes active and adjust panel width to fully fit an inflection table in
      inflectionsTabVisible: function () {
        // Inform an inflection component about its visibility state change
        this.data.inflectionComponentData.visible = this.data.tabs.inflections
        return this.data.tabs.inflections
      },

      treebankTabPossible: function() {
        // treebank data is possible if we have it for the word or the page
        return this.data.treebankComponentData.data.page.src || this.data.treebankComponentData.data.word.src ? true : false
      },

      treebankTabVisible: function() {
        // Inform treebank component about visibility state change
        this.data.treebankComponentData.visible = this.data.tabs.treebank
        return this.data.tabs.treebank
      },

      additionalStylesTootipCloseIcon: function () {
        return {
          top: '2px',
          right: '50px'
        }
      }
    },
    methods: {
      updateZIndex: function (zIndexMax) {
        if (zIndexMax >= this.zIndex) {
          this.zIndex = zIndexMax
          if (this.zIndex < Number.POSITIVE_INFINITY) { this.zIndex++ } // To be one level higher that the highest element on a page
          this.self.element.style.zIndex = this.zIndex
        }
      },

      close () {
        this.$emit('close')
      },

      closeNotifications () {
        this.$emit('closenotifications')
      },

      setPosition (position) {
        this.$emit('setposition', position)
      },

      changeTab (name) {
        this.$emit('changetab', name)
      },

      clearContent: function () {
        for (let contentArea in this.contentAreas) {
          if (this.contentAreas.hasOwnProperty(contentArea)) {
            this.contentAreas[contentArea].clearContent()
          }
        }
        return this
      },

      showMessage: function (messageHTML) {
        this.contentAreas.messages.setContent(messageHTML)
        this.tabGroups.contentTabs.activate('statusTab')
      },

      appendMessage: function (messageHTML) {
        this.contentAreas.messages.appendContent(messageHTML)
      },

      clearMessages: function () {
        this.contentAreas.messages.setContent('')
      },

      settingChanged: function (name, value) {
        this.$emit('settingchange', name, value) // Re-emit for a Vue instance to catch
      },

      resourceSettingChanged: function (name, value) {
        this.$emit('resourcesettingchange', name, value) // Re-emit for a Vue instance to catch
      },

      uiOptionChanged: function (name, value) {
        this.$emit('ui-option-change', name, value) // Re-emit for a Vue instance to catch
      },

      setContentWidth: function (width) {
        /*let widthDelta = parseInt(this.navbarWidth, 10)
          + parseInt(this.inflPanelLeftPadding, 10)
          + parseInt(this.inflPanelRightPadding, 10)
        if (width > this.data.minWidth + widthDelta) {
          let adjustedWidth = width + widthDelta
          // Max viewport width less some space to display page content
          let maxWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0) - 20
          if (adjustedWidth > maxWidth) { adjustedWidth = maxWidth }
          this.$el.style.width = `${adjustedWidth}px`
        }*/
      console.log(`setContentWidth is disabled`)
      },

      setTreebankContentWidth: function(width) {
          // console.log(`Set width to ${width}`)
          // this.$el.style.width = width
        console.log(`setTreebankContentWidth is disabled`)
      }
    },

    mounted: function () {
      console.log(`Panel base is mounted`)
      // Determine paddings and sidebar width for calculation of a panel width to fit content
      let navbar = this.$el.querySelector(`#${this.navbarID}`)
      let inflectionsPanel = this.$el.querySelector(`#${this.inflectionsPanelID}`)
      this.navbarWidth = 0
      if (navbar) {
        let width = window.getComputedStyle(navbar).getPropertyValue('width').match(/\d+/)
        if (width && Array.isArray(width) && width.length > 0) { this.navbarWidth = width[0] }
      }
      this.inflPanelLeftPadding = inflectionsPanel ? window.getComputedStyle(inflectionsPanel).getPropertyValue('padding-left').match(/\d+/)[0] : 0
      this.inflPanelRightPadding = inflectionsPanel ? window.getComputedStyle(inflectionsPanel).getPropertyValue('padding-right').match(/\d+/)[0] : 0
    }
  }
</script>
<style lang="scss">
    @import "../../node_modules/alpheios-components/src/styles/alpheios";
    $alpheios-panel-header-height: 40px;
    $alpheios-panel-title-height: 20px;

    .alpheios-panel {
        width: 400px; // Initial width
        height: 100vh;
        top: 0;
        z-index: 2000;
        position: fixed;
        background: #FFF;
        resize: both;
        opacity: 0.95;
        direction: ltr;
        display: grid;
        grid-template-columns: auto;
        grid-template-rows: #{$alpheios-panel-header-height} #{$alpheios-panel-title-height} auto 60px;
        grid-template-areas:
            "header"
            "title"
            "content"
            "content"
    }

    .alpheios-panel[data-notification-visible="true"] {
        grid-template-areas:
                "header"
                "title"
                "content"
                "notifications"
    }

    .alpheios-panel.alpheios-panel-left {
        left: 0;
        border-right: 1px solid $alpheios-link-color-dark-bg;
    }

    .alpheios-panel.alpheios-panel-right {
        right: 0;
        border-left: 1px solid $alpheios-link-color-dark-bg;
        grid-template-columns: auto;
        grid-template-areas:
                "header"
                "title"
                "content"
                "content"

    }

    .alpheios-panel.alpheios-panel-right[data-notification-visible="true"] {
        grid-template-areas:
                "header"
                "title"
                "content"
                "notifications"

    }

    .alpheios-panel__header {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        box-sizing: border-box;
        grid-area: header;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: 1px solid $alpheios-link-color-dark-bg;
    }

    .alpheios-panel-left .alpheios-panel__header {
        direction: ltr;
        padding: 0 0 0 10px;
    }

    .alpheios-panel-right .alpheios-panel__header {
        direction: rtl;
        padding: 0 10px 0 0;
    }

    .alpheios-panel__header-logo {
        flex-grow: 0;
        justify-content: flex-start;
    }

    .alpheios-panel__header-selection {
        font-size: 16px;
        font-weight: 700;
        color: $alpheios-toolbar-color;
    }

    .alpheios-panel__header-word {
        font-size: 14px;
        position: relative;
        top: -1px;
    }

    .#{$alpheios-uikit-namespace} .alpheios-panel__header-logo-img {
        width: auto;
        height: 30px;
        padding-top: 5px;
    }

    .alpheios-panel__header-action-btn,
    .alpheios-panel__header-action-btn.active:hover,
    .alpheios-panel__header-action-btn.active:focus {
        display: block;
        width: 40px;
        height: 40px;
        margin: 0 5px;
        padding-top: 5px;
        text-align: center;
        cursor: pointer;
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alpheios-panel__header-action-btn:hover,
    .alpheios-panel__header-action-btn:focus,
    .alpheios-panel__header-action-btn.active {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    .alpheios-panel__header-action-btn.alpheios-panel__header-action-btn--narrow {
        margin: 0;
    }

    .alpheios-panel__body {
        display: flex;
        height: calc(100vh - #{$alpheios-panel-header-height});
    }

    .alpheios-panel-left .alpheios-panel__body {
        flex-direction: row;
    }

    .alpheios-panel-right .alpheios-panel__body {
        flex-direction: row-reverse;
    }

    .alpheios-panel__content {
        overflow: auto;
        grid-area: content;
        direction: ltr;
        box-sizing: border-box;
        display: flex;
    }

    .alpheios-panel__notifications {
        display: none;
        position: relative;
        padding: 10px 20px;
        background: $alpheios-logo-color;
        grid-area: notifications;
        overflow: hidden;
    }

    .alpheios-panel__notifications-close-btn {
        position: absolute;
        right: 5px;
        top: 5px;
        display: block;
        width: 20px;
        height: 20px;
        margin: 0;
        cursor: pointer;
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alpheios-panel__notifications-close-btn:hover,
    .alpheios-panel__notifications-close-btn:focus {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    .alpheios-panel__notifications--lang-switcher {
        font-size: 12px;
        float: right;
        margin: -20px 10px 0 0;
        display: inline-block;
    }

    .alpheios-panel__notifications--lang-switcher .uk-select {
        width: 120px;
        height: 25px;
    }

    .alpheios-panel__notifications--important {
        background: $alpheios-icon-color;
    }

    [data-notification-visible="true"] .alpheios-panel__notifications {
        display: block;
    }

    .alpheios-panel__tab-panel {
        display: flex;
        flex-direction: column;
        padding: 20px;
    }

    .alpheios-panel__tab-panel--fw {
        width: 100%;
    }

    .alpheios-panel__tab-panel--no-padding {
        padding: 0;
    }

    .alpheios-panel__message {
        margin-bottom: 0.5rem;
    }

    .alpheios-panel__options-item {
        margin-bottom: 0.5rem;
        max-width: 300px;
    }

    .alpheios-panel__contentitem {
        margin-bottom: 1em;
    }

    .alpheios-panel__header-btn-group--center {
        direction: ltr;
        display: flex;
        flex-wrap: nowrap;
        box-sizing: border-box;
    }
    .alpheios-panel__header-btn-group--end {
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-end;
        box-sizing: border-box;
    }

    .alpheios-panel__header-nav-btn {
        display: block;
        width: 40px;
        height: 40px;
        margin: 0 5px;
        padding-top: 5px;
        text-align: center;
        cursor: pointer;
        background: transparent no-repeat center center;
        background-size: contain;
    }

    .alpheios-panel__header-nav-btn.alpheios-panel__header-nav-btn--short {
        margin: -10px 5px 20px;
    }

    .alpheios-panel__header-nav-btn,
    .alpheios-panel__header-nav-btn.active:hover,
    .alpheios-panel__header-nav-btn.active:focus {
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alpheios-panel__header-nav-btn:hover,
    .alpheios-panel__header-nav-btn:focus,
    .alpheios-panel__header-nav-btn.active {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }
</style>