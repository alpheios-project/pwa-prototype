<template>
<!-- There is no need for any template code here as it will be defined in a child component, panel-mobile.vue -->
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
  import TreebankIcon from '../../node_modules/alpheios-components/src/images/inline-icons/sitemap.svg';
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
    /*
    All styles will be defined in a child component, panel-mobile.vue
    */
</style>
