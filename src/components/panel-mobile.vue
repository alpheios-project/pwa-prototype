<template>
    <div class="auk alpheios-panel-mobile" :class="classes" :style="this.data.styles"
         data-component="alpheios-panel" data-resizable="true" v-show="data.isOpen"
         :data-notification-visible="data.notification.important"> <!-- Show only important notifications for now -->

        <div id="panel-header" class="alpheios-panel-mobile__header">
            <div class="alpheios-panel-mobile__header-logo">
                <img class="alpheios-panel-mobile__header-logo-img" src="../images/icon.png">
            </div>
            <div class="alpheios-panel-mobile__header-btn-group--center">

                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_HELP">
                    <span v-bind:class="{ active: data.tabs.info }" @click="changeTab('info')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <info-icon class="icon"></info-icon>
                    </span>
                </alph-tooltip>

                <!-- TODO: Add a translatable message for a tooltip -->
                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_MORPHOLOGY">
                    <span v-bind:class="{ active: data.tabs.morphology }" @click="changeTab('morphology')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <morphology-icon class="icon"></morphology-icon>
                    </span>
                </alph-tooltip>

                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_DEFINITIONS">
                    <span :class="{ active: data.tabs.definitions }" @click="changeTab('definitions')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <definitions-icon class="icon"></definitions-icon>
                    </span>
                </alph-tooltip>

                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_INFLECT">
                    <span v-bind:class="{ active: data.tabs.inflections }" @click="changeTab('inflections')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <inflections-icon class="icon"></inflections-icon>
                    </span>
                </alph-tooltip>

                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_GRAMMAR">
                    <span v-bind:class="{ active: data.tabs.grammar }" @click="changeTab('grammar')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <grammar-icon class="icon"></grammar-icon>
                    </span>
                </alph-tooltip>

                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_TREEBANK">
                    <span v-bind:class="{ active: data.tabs.treebank }" @click="changeTab('treebank')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <treebank-icon class="icon"></treebank-icon>
                    </span>
                </alph-tooltip>

                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_OPTIONS">
                    <span v-bind:class="{ active: data.tabs.options }" @click="changeTab('options')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <options-icon class="icon"></options-icon>
                    </span>
                </alph-tooltip>

                <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_STATUS">
                    <span v-show="data.verboseMode" v-bind:class="{ active: data.tabs.status }" @click="changeTab('status')"
                          class="alpheios-panel-mobile__header-nav-btn">
                      <status-icon class="icon"></status-icon>
                    </span>
                </alph-tooltip>
            </div>

            <div class="alpheios-panel-mobile__header-btn-group--end">
                <alph-tooltip tooltipDirection="bottom-right" :tooltipText="data.l10n.messages.TOOLTIP_CLOSE_PANEL">
                    <span @click="close" class="alpheios-panel-mobile__header-action-btn">
                        <close-icon></close-icon>
                    </span>
                </alph-tooltip>
            </div>
        </div>

        <div class="alpheios-panel-mobile__content">
            <div v-show="data.tabs.info" class="alpheios-panel-mobile__tab-panel">
                <info :data="data.infoComponentData" :messages="data.l10n.messages"></info>
            </div>

            <div v-show="data.tabs.morphology" class="alpheios-panel-mobile__tab-panel">
                <!-- Morphological data -->
                <div v-show="morphDataReady" :id="data.lexicalDataContainerID"
                     class="alpheios-popup__morph-cont">
                    <morph :id="data.morphComponentID" :lexemes="data.lexemes" :definitions="data.definitions"
                           :translations="data.translations"
                           :linkedfeatures="data.linkedFeatures" @sendfeature="sendFeature">
                    </morph>

                    <div class="alpheios-popup__morph-cont-providers">
                        <div class="alpheios-popup__morph-cont-providers-header">Credits:</div>
                        <div class="alpheios-popup__morph-cont-providers-source" v-for="p in data.providers">
                            {{ p.toString() }}
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="data.tabs.definitions" class="alpheios-panel-mobile__tab-panel">

                <!-- Short definitions -->
                <div v-show="data.shortDefinitions.length < 1 && data.fullDefinitions.length < 1">
                    {{data.l10n.messages.PLACEHOLDER_DEFINITIONS}}
                </div>
                <div class="alpheios-panel-mobile__contentitem" v-for="definition in data.shortDefinitions">
                    <shortdef :definition="definition"></shortdef>
                </div>

                <!-- Full definitions -->
                <div class="alpheios-panel-mobile__contentitem" v-html="data.fullDefinitions"></div>
            </div>

            <div v-show="inflectionsTabVisible" :id="inflectionsPanelID" class="alpheios-panel-mobile__tab-panel">
                <inflections class="alpheios-panel-mobile-inflections"
                             :data="data.inflectionComponentData" :locale="data.settings.locale.currentValue"
                             :messages="data.l10n.messages" @contentwidth="setContentWidth">
                </inflections>
            </div>

            <div v-show="data.tabs.grammar" class="alpheios-panel-mobile__tab-panel
                alpheios-panel-mobile__tab-panel--no-padding alpheios-panel-mobile__tab-panel--fw">
                <grammar :res="data.grammarRes"></grammar>
            </div>

            <div v-show="treebankTabVisible" class="alpheios-panel-mobile__tab-panel
                alpheios-panel-mobile__tab-panel--no-padding alpheios-panel-mobile__tab-panel--fw">
                <treebank :res="data.treebankComponentData.data"
                          :locale="data.settings.locale.currentValue" :visible="data.treebankComponentData.visible"
                          :messages="data.l10n.messages" @treebankcontentwidth="setTreebankContentWidth">
                </treebank>
            </div>

            <div v-show="data.tabs.status" class="alpheios-panel-mobile__tab-panel">
                <div v-for="message in data.messages">
                    <div class="alpheios-panel-mobile__message">{{message}}</div>
                </div>
            </div>

            <div v-show="data.tabs.options" class="alpheios-panel-mobile__tab-panel">
                <setting :data="data.settings.preferredLanguage" @change="settingChanged"
                         :classes="['alpheios-panel-mobile__options-item']"></setting>
                <setting :data="data.settings.verboseMode" @change="settingChanged"
                         :classes="['alpheios-panel-mobile__options-item']"></setting>
                <setting :data="data.uiOptions.items.skin" @change="uiOptionChanged"
                         :classes="['alpheios-panel-mobile__options-item']"></setting>
                <setting :data="languageSetting" @change="resourceSettingChanged"
                         :classes="['alpheios-panel-mobile__options-item']"
                         :key="languageSetting.name"
                         v-if="languageSetting.values.length > 1"
                         v-for="languageSetting in data.resourceSettings.lexicons"></setting>
            </div>
        </div>
        <div class="alpheios-panel-mobile__notifications uk-text-small" :class="notificationClasses"
             v-show="data.notification.important">
                <span @click="closeNotifications" class="alpheios-panel-mobile__notifications-close-btn">
                    <close-icon></close-icon>
                </span>
            <span v-html="data.notification.text"></span>
            <setting :data="data.settings.preferredLanguage" :show-title="false"
                     :classes="['alpheios-panel-mobile__notifications--lang-switcher']" @change="settingChanged"
                     v-show="data.notification.showLanguageSwitcher"></setting>
        </div>
    </div>
</template>
<script>
  import PanelBase from './panel-base.vue'
  // import interact from 'interactjs'

  // Embeddable SVG icons
  import MorphologyIcon from '../images/inline-icons/language.svg'

  export default {
    extends: PanelBase,
    components: {
      morphologyIcon: MorphologyIcon
    },
    computed: {
      morphDataReady: function () {
        return this.data.morphDataReady
      }
    },
    methods: {
      sendFeature (data) {
        this.$emit('sendfeature', data)
      }
    },
    created () {
      console.log(`Component is created`)
    },
    mounted () {
      console.log('Mounted a Mobile Panel')

      // Initialize Interact.js: make panel resizable
      /*interact(this.$el)
        .resizable({
          // resize from all edges and corners
          edges: {left: false, right: false, bottom: false, top: true},

          // keep the edges inside the parent
          restrictEdges: {
            outer: document.body,
            endOnly: true
          },

          // minimum size
          restrictSize: {
            // min: { width: this.data.minWidth }
          },

          inertia: true
        })
        .on('resizemove', event => {
          console.log('resizemove')
          let target = event.target
          // update the element's style
          target.style.height = `${event.rect.height}px`
        })*/
    }
  }
</script>
<style lang="scss">
    @import "../../node_modules/alpheios-components/src/styles/alpheios";

    $alpheios-panel-height: 50vh;
    $alpheios-panel-header-height: 40px;
    $alpheios-panel-title-height: 20px;

    .alpheios-panel-mobile {
        z-index: 2000;
        position: fixed;
        background: #FFF;
        resize: both;
        left: 0;
        width: 100vw;
        height: #{$alpheios-panel-height};
        bottom: 0;
        border-top: 1px solid $alpheios-link-color-dark-bg;
        border-left: none;
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

    .alpheios-panel-mobile[data-notification-visible="true"] {
        grid-template-areas:
                "header"
                "title"
                "content"
                "notifications"
    }

    .alpheios-panel-mobile__header {
        position: relative;
        display: flex;
        flex-wrap: nowrap;
        box-sizing: border-box;
        padding: 0 10px;
        grid-area: header;
        flex-direction: row;
        justify-content: space-between;
        border-bottom: 1px solid $alpheios-link-color-dark-bg;
        touch-action: none; /* Required to support touch actions such as swipe by the panel */
    }

    .alpheios-panel-mobile__header-logo {
        flex-grow: 0;
        justify-content: flex-start;
    }

    .alpheios-panel-mobile__header-selection {
        font-size: 16px;
        font-weight: 700;
        color: $alpheios-toolbar-color;
    }

    .alpheios-panel-mobile__header-word {
        font-size: 14px;
        position: relative;
        top: -1px;
    }

    .#{$alpheios-uikit-namespace} .alpheios-panel-mobile__header-logo-img {
        width: auto;
        height: 30px;
        padding-top: 5px;
    }

    .alpheios-panel-mobile__header-action-btn,
    .alpheios-panel-mobile__header-action-btn.active:hover,
    .alpheios-panel-mobile__header-action-btn.active:focus {
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

    .alpheios-panel-mobile__header-action-btn:hover,
    .alpheios-panel-mobile__header-action-btn:focus,
    .alpheios-panel-mobile__header-action-btn.active {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    .alpheios-panel-mobile__header-action-btn.alpheios-panel-mobile__header-action-btn--narrow {
        margin: 0;
    }

    .alpheios-panel-mobile__body {
        display: flex;
        height: calc(#{$alpheios-panel-height} - #{$alpheios-panel-header-height});
    }

    .alpheios-panel-mobile__content {
        overflow: auto;
        grid-area: content;
        direction: ltr;
        box-sizing: border-box;
        display: flex;
        width: 100vw;
    }

    .alpheios-panel-mobile__notifications {
        display: none;
        position: relative;
        padding: 10px 20px;
        background: $alpheios-logo-color;
        grid-area: notifications;
        overflow: hidden;
    }

    .alpheios-panel-mobile__notifications-close-btn {
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

    .alpheios-panel-mobile__notifications-close-btn:hover,
    .alpheios-panel-mobile__notifications-close-btn:focus {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    .alpheios-panel-mobile__notifications--lang-switcher {
        font-size: 12px;
        float: right;
        margin: -20px 10px 0 0;
        display: inline-block;
    }

    .alpheios-panel-mobile__notifications--lang-switcher .uk-select {
        width: 120px;
        height: 25px;
    }

    .alpheios-panel-mobile__notifications--important {
        background: $alpheios-icon-color;
    }

    [data-notification-visible="true"] .alpheios-panel-mobile__notifications {
        display: block;
    }

    .alpheios-panel-mobile__tab-panel {
        display: flex;
        flex-direction: column;
        padding: 20px;
    }

    .alpheios-panel-mobile__tab-panel--fw {
        width: 100%;
    }

    .alpheios-panel-mobile__tab-panel--no-padding {
        padding: 0;
    }

    .alpheios-panel-mobile__message {
        margin-bottom: 0.5rem;
    }

    .alpheios-panel-mobile__options-item {
        margin-bottom: 0.5rem;
        max-width: 300px;
    }

    .alpheios-panel-mobile__contentitem {
        margin-bottom: 1em;
    }

    .alpheios-panel-mobile__header-btn-group--center {
        direction: ltr;
        display: flex;
        flex-wrap: nowrap;
        box-sizing: border-box;
    }
    .alpheios-panel-mobile__header-btn-group--end {
        display: flex;
        flex-wrap: nowrap;
        justify-content: flex-end;
        box-sizing: border-box;
    }

    .alpheios-panel-mobile__header-nav-btn {
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

    .alpheios-panel-mobile__header-nav-btn.alpheios-panel-mobile__header-nav-btn--short {
        margin: -10px 5px 20px;
    }

    .alpheios-panel-mobile__header-nav-btn,
    .alpheios-panel-mobile__header-nav-btn.active:hover,
    .alpheios-panel-mobile__header-nav-btn.active:focus {
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alpheios-panel-mobile__header-nav-btn:hover,
    .alpheios-panel-mobile__header-nav-btn:focus,
    .alpheios-panel-mobile__header-nav-btn.active {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    @media (hover: none) {
        .alpheios-panel-mobile__header-nav-btn,
        .alpheios-panel-mobile__header-nav-btn:hover,
        .alpheios-panel-mobile__header-nav-btn:focus {
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

        .alpheios-panel-mobile__header-nav-btn.active,
        .alpheios-panel-mobile__header-nav-btn.active:hover,
        .alpheios-panel-mobile__header-nav-btn.active:focus {
            fill: $alpheios-link-hover-color;
            stroke: $alpheios-link-hover-color;
        }
    }

    /* styles of nested components */
    .alpheios-panel-mobile .alpheios-popup__morph-cont {
        overflow: visible;
        margin: 0 0 2rem;
        padding: 0;
        border: none;
    }

    .alpheios-panel-mobile .alpheios-morph__lexemes {
        font-size: 0.875rem;
    }

    .alpheios-panel-mobile .alpheios-popup__morph-cont-providers-header {
        font-size: 0.875rem;
        margin-top: 1.5rem;
    }
</style>
