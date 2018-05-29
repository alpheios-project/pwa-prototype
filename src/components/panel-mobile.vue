<template>
    <div class="auk alpheios-panel-mobile" :class="classes" :style="this.data.styles"
         data-component="alpheios-panel" data-resizable="true" v-show="data.isOpen"
         :data-notification-visible="data.notification.important"> <!-- Show only important notifications for now -->

        <div id="panel-header" class="alpheios-panel-mobile__header">
            <span @click="mobileMenuOpen = !mobileMenuOpen"
                  class="alpheios-panel-mobile__header-nav-btn alpheios-panel-mobile__header-nav-btn--mobile-menu">
              <menu-icon class="icon"></menu-icon>
            </span>

            <div class="alpheios-panel-mobile__header-logo">
                <img class="alpheios-panel-mobile__header-logo-img" src="../images/icon.png">
            </div>

            <div class="alpheios-panel-mobile__header-btn-group--center" v-bind:class="{ open: mobileMenuOpen }">
                <div class="alpheios-panel-mobile__header-nav-item" v-bind:class="{ active: data.tabs.info }"
                     @click="changeTabFromMenu('info')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_HELP">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <info-icon class="icon"></info-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_HELP }}</span>
                </div>


                <div class="alpheios-panel-mobile__header-nav-item" v-bind:class="{ active: data.tabs.morphology }"
                     @click="changeTabFromMenu('morphology')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_MORPHOLOGY">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <morphology-icon class="icon"></morphology-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_MORPHOLOGY }}</span>
                </div>

                <div class="alpheios-panel-mobile__header-nav-item" :class="{ active: data.tabs.definitions }"
                     @click="changeTabFromMenu('definitions')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_DEFINITIONS">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <definitions-icon class="icon"></definitions-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_DEFINITIONS }}</span>
                </div>

                <div class="alpheios-panel-mobile__header-nav-item" v-bind:class="{ active: data.tabs.inflections }"
                     @click="changeTabFromMenu('inflections')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_INFLECT">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <inflections-icon class="icon"></inflections-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_INFLECT }}</span>
                </div>

                <div class="alpheios-panel-mobile__header-nav-item" v-bind:class="{ active: data.tabs.grammar }"
                     @click="changeTabFromMenu('grammar')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_GRAMMAR">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <grammar-icon class="icon"></grammar-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_GRAMMAR }}</span>
                </div>

                <div class="alpheios-panel-mobile__header-nav-item" v-bind:class="{ active: data.tabs.treebank }"
                     @click="changeTabFromMenu('treebank')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_TREEBANK">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <treebank-icon class="icon"></treebank-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_TREEBANK }}</span>
                </div>

                <div class="alpheios-panel-mobile__header-nav-item" v-bind:class="{ active: data.tabs.options }"
                     @click="changeTabFromMenu('options')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_OPTIONS">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <options-icon class="icon"></options-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_OPTIONS }}</span>
                </div>

                <div class="alpheios-panel-mobile__header-nav-item" v-show="data.verboseMode"
                     v-bind:class="{ active: data.tabs.status }" @click="changeTabFromMenu('status')">
                    <alph-tooltip tooltipDirection="top" :tooltipText="data.l10n.messages.TOOLTIP_STATUS">
                        <span class="alpheios-panel-mobile__header-nav-btn">
                          <status-icon class="icon"></status-icon>
                        </span>
                    </alph-tooltip>
                    <span class="alpheios-panel-mobile__header-nav-btn-text">{{ data.l10n.messages.TOOLTIP_STATUS }}</span>
                </div>
            </div>


            <div class="alpheios-panel-mobile__header-btn-group--end">
                <span @click="closePanelAndMenu" class="alpheios-panel-mobile__header-action-btn">
                    <close-icon></close-icon>
                </span>
            </div>

        </div>

        <div class="alpheios-panel-mobile__content">
            <div v-show="data.tabs.info" class="alpheios-panel-mobile__tab-panel">
                <info :data="data.infoComponentData" :messages="data.l10n.messages"></info>
            </div>

            <div v-show="data.tabs.morphology" class="alpheios-panel-mobile__tab-panel">
                <div v-show="!morphDataReady && !noLanguage">
                    <p class="alpheios-panel-mobile__progress-message">
                        Getting information on a
                        <span class="alpheios-panel-mobile__progress-message-accent">{{data.status.languageName}}</span>
                        word <span class="alpheios-panel-mobile__progress-message-accent">{{data.status.selectedText}}</span></p>
                    <div class="alpheios-panel-mobile__progress-wrapper">
                        <div class="alpheios-panel-mobile__progress-border">
                            <div class="alpheios-panel-mobile__progress-whitespace">
                                <div class="alpheios-panel-mobile__progress-line"></div>
                                <!-- No lexical data is available yet -->
                                <div class="alpheios-panel-mobile__progress-text">{{data.l10n.messages.PLACEHOLDER_POPUP_DATA}}</div>
                            </div>
                        </div>
                    </div>
                </div>


                <div v-show="noLanguage && !morphDataReady"
                     class="alpheios-popup__morph-cont alpheios-popup__definitions--placeholder uk-text-small">
                    <!-- Lexical data couldn't be populated because page language is not defined -->
                    {{data.l10n.messages.PLACEHOLDER_NO_LANGUAGE_POPUP_DATA}}
                </div>

                <div v-show="data.morphDataNotFound"
                     class="alpheios-popup__morph-cont alpheios-popup__definitions--placeholder uk-text-small">
                    <!-- No morphological data is found in a morphological analyzer -->
                    {{data.l10n.messages.MORPHOLOGICAL_DATA_NOT_FOUND}}
                </div>

                <!-- Morphological data -->
                <div v-show="morphDataReady" :id="data.lexicalDataContainerID"
                     class="alpheios-popup__morph-cont">
                    <morph :id="data.morphComponentID" :lexemes="data.lexemes" :definitions="data.definitions"
                           :translations="data.translations"
                           :linkedfeatures="data.linkedFeatures" @sendfeature="sendFeature">
                    </morph>

                    <div class="alpheios-popup__morph-cont-providers">
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
            <div v-html="data.notification.text" class="alpheios-panel-mobile__notifications-text"></div>
            <setting :data="data.settings.preferredLanguage" :show-title="false"
                     :classes="['alpheios-panel-mobile__notifications--lang-switcher']" @change="settingChanged"
                     v-show="data.notification.showLanguageSwitcher"></setting>
            <div @click="closeNotifications" class="alpheios-panel-mobile__notifications-close-btn">
                <close-icon></close-icon>
            </div>
        </div>
    </div>
</template>
<script>
  import PanelBase from './panel-base.vue'
  // import interact from 'interactjs'

  // Embeddable SVG icons
  import MorphologyIcon from '../images/inline-icons/language.svg'
  import MenuIcon from '../images/inline-icons/ellipsis-v.svg'

  export default {
    extends: PanelBase,
    components: {
      morphologyIcon: MorphologyIcon,
      menuIcon: MenuIcon
    },
    data: function() {
      return {
        mobileMenuOpen: false // Stores a mobile menu open state, is closed by default
      }
    },
    computed: {
      morphDataReady: function () {
        return this.data.morphDataReady
      },

      currentLanguageName: function() {
        return this.data.currentLanguageName
      },

      noLanguage: function () {
        return this.data.currentLanguageName === undefined
      },
    },
    methods: {
      sendFeature (data) {
        this.$emit('sendfeature', data)
      },

      // Closes a mobile menu and calls a standard `changeTab()` function
      changeTabFromMenu(name) {
        this.mobileMenuOpen = false
        this.changeTab(name)
      },

      /*
      If menu is open at the moment of panel closing, it will be reopened next time with the panel.
      To prevent this, we need to make sure menu is closed every time we close a panel.
       */
      closePanelAndMenu() {
        this.mobileMenuOpen = false
        this.close()
      }
    }
  }
</script>
<style lang="scss">
    @import "../../node_modules/alpheios-components/src/styles/alpheios";

    $alpheios-panel-height: 50vh;
    $alpheios-panel-header-height: 40px;
    $alpheios-panel-title-height: 20px;
    $alpheios-mobile-breakpoint: 600px;

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
        grid-template-rows: #{$alpheios-panel-header-height} 60px auto;
        grid-template-areas:
                "header"
                "content"
                "content"
    }

    .alpheios-panel-mobile[data-notification-visible="true"] {
        grid-template-areas:
                "header"
                "notifications"
                "content"
    }

    .alpheios-panel-mobile__header {
        position: relative;
        box-sizing: border-box;
        grid-area: header;
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
        width: 20px;
        height: 20px;
        position: relative;
        top: 5px;
        right: 10px;
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
        padding: 10px;
        background: $alpheios-logo-color;
        grid-area: notifications;
        overflow: hidden;
        justify-content: space-between;
    }

    @media (min-width: $alpheios-mobile-breakpoint) {
        .alpheios-panel-mobile__notifications {
            padding: 10px 20px;
        }
    }

    .alpheios-panel-mobile__notifications-text {
        flex-grow: 1;
    }

    .alpheios-panel-mobile__notifications-close-btn {
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
        margin-right: 10px;
    }

    .alpheios-panel-mobile__notifications--lang-switcher .uk-select {
        width: 120px;
        height: 25px;
    }

    .alpheios-panel-mobile__notifications--important {
        background: $alpheios-icon-color;
    }

    [data-notification-visible="true"] .alpheios-panel-mobile__notifications {
        display: flex;
    }

    .alpheios-panel-mobile__tab-panel {
        display: flex;
        flex-grow: 1;
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

    .alpheios-panel-mobile__header-nav-item {
        cursor: pointer;
    }

    .alpheios-panel-mobile__header-nav-btn {
        display: block;
        position: relative;
        top: -2px;
        width: 20px;
        height: 20px;
        margin: 0 15px;
        text-align: center;
        cursor: pointer;
        background: transparent no-repeat center center;
        background-size: contain;
    }

    .alpheios-panel-mobile__header-nav-btn.alpheios-panel-mobile__header-nav-btn--short {
        margin: -10px 5px 20px;
    }

    .alpheios-panel-mobile__header-nav-btn,
    .alpheios-panel-mobile__header-nav-item.active:hover .alpheios-panel-mobile__header-nav-btn,
    .alpheios-panel-mobile__header-nav-item.active:focus .alpheios-panel-mobile__header-nav-btn {
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alpheios-panel-mobile__header-nav-item:hover .alpheios-panel-mobile__header-nav-btn,
    .alpheios-panel-mobile__header-nav-item:focus .alpheios-panel-mobile__header-nav-btn,
    .alpheios-panel-mobile__header-nav-item.active .alpheios-panel-mobile__header-nav-btn {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    @media (hover: none) {
        .alpheios-panel-mobile__header-nav-btn,
        .alpheios-panel-mobile__header-nav-item:hover .alpheios-panel-mobile__header-nav-btn,
        .alpheios-panel-mobile__header-nav-item:focus .alpheios-panel-mobile__header-nav-btn {
            display: block;
            width: 20px;
            height: 20px;
            margin: 0 15px;
            text-align: center;
            cursor: pointer;
            fill: $alpheios-link-color-dark-bg;
            stroke: $alpheios-link-color-dark-bg;
        }

        .alpheios-panel-mobile__header-nav-item.active .alpheios-panel-mobile__header-nav-btn,
        .alpheios-panel-mobile__header-nav-item.active:hover .alpheios-panel-mobile__header-nav-btn,
        .alpheios-panel-mobile__header-nav-item.active:focus .alpheios-panel-mobile__header-nav-btn {
            fill: $alpheios-link-hover-color;
            stroke: $alpheios-link-hover-color;
        }
    }

    // region Styles of nested components
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
    // endregion Styles of nested components

    // region Mobile menu styles
    .alpheios-panel-mobile__header-nav-btn--mobile-menu {
        position: absolute;
        left: 10px;
        top: 7px;
    }

    .alpheios-panel-mobile__header-logo {
        display: none;
    }

    .alpheios-panel-mobile__header-btn-group--center {
        position: absolute;
        top: $alpheios-panel-header-height;
        left: 0;
        right: 0;
        display: none;
        flex-wrap: nowrap;
        box-sizing: border-box;
        flex-direction: column;
        justify-content: flex-start;
        width: 100%;
        height: calc(#{$alpheios-panel-height} - #{$alpheios-panel-header-height});
        background: #FFF;
        direction: ltr;
    }

    .alpheios-panel-mobile__header-btn-group--center.open {
        display: flex;
        justify-content: space-evenly;
    }

    .alpheios-panel-mobile__header-btn-group--center.open .tooltiptext {
        display: none;
    }

    .alpheios-panel-mobile__header-btn-group--end {
        position: absolute;
        top: 2px;
        right: 0;
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        justify-content: flex-start;
        box-sizing: border-box;
    }

    .alpheios-panel-mobile__header-nav-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid $alpheios-link-color-dark-bg;
        flex-grow: 1;
    }

    @media (min-width: $alpheios-mobile-breakpoint) {
        .alpheios-panel-mobile__header {
            display: flex;
            justify-content: space-between;
            padding: 0 10px;
        }

        .alpheios-panel-mobile__header-nav-btn--mobile-menu {
            display: none;
        }

        .alpheios-panel-mobile__header-logo {
            display: block;
        }

        .alpheios-panel-mobile__header-btn-group--center {
            position: static;
            width: auto;
            height: auto;
            display: flex;
            justify-content: center;
            flex-direction: row;
            background-color: transparent;
        }

        .alpheios-panel-mobile__header-btn-group--center.open {
            justify-content: center;
        }

        .alpheios-panel-mobile__header-btn-group--center.open .tooltiptext {
            display: block;
        }

        .alpheios-panel-mobile__header-btn-group--end {
            position: static;
            flex-direction: row;
            justify-content: flex-end;
        }

        .alpheios-panel-mobile__header-nav-item {
            padding: 0;
            border: none;
        }

        .alpheios-panel-mobile__header-nav-btn {

        }

        .alpheios-panel-mobile__header-nav-btn-text {
            display: none;
        }
    }
    // endregion Mobile menu styles

    // region Tooltip fix
    .alph_tooltip-top {
        margin-left: initial;
        transform: translateX(-50%)
    }
    // endregion Tooltip fix

    p.alpheios-panel-mobile__progress-message {
        padding: 0 1rem;
        margin-bottom: 10px;
    }

    .alpheios-panel-mobile__progress-message-accent {
        color: $alpheios-toolbar-color;
        font-weight: 700;
    }

    // region Wait animation
    .alpheios-panel-mobile__progress-wrapper {
        height: 1.2rem;
        margin: 0 1rem 2rem;
        font-size: 0.875rem;
    }

    .alpheios-panel-mobile__progress-border {
        border: 2px solid $alpheios-icon-color;
        height: 100%;
        padding: 2px;
    }

    .alpheios-panel-mobile__progress-whitespace {
        overflow: hidden;
        height: 100%;
        margin: 0 auto;
        position: relative;
    }

    .alpheios-panel-mobile__progress-line {
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: $alpheios-icon-color;
        animation: cssload-slide 5.75s steps(40) infinite;
    }

    .alpheios-panel-mobile__progress-text {
        text-transform: uppercase;
        color: $alpheios-copy-color;
        position: absolute;
        width: 100%;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @keyframes cssload-slide {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    @-o-keyframes cssload-slide {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    @-ms-keyframes cssload-slide {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    @-webkit-keyframes cssload-slide {
        0% { left: -100%; }
        100% { left: 100%; }
    }

    @-moz-keyframes cssload-slide {
        0% { left: -100%; }
        100% { left: 100%; }
    }
    // endregion Wait animation
</style>
