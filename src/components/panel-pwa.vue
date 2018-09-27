<template>
    <div class="auk alph-panel-pwa" :class="classes" :style="this.data.styles"
         data-component="alpheios-panel" data-resizable="true" data-alph-exclude-long-tap-cpe="true"
         v-show="data.isOpen"
         :data-notification-visible="data.notification.important"> <!-- Show only important notifications for now -->

        <div id="panel-header" class="alph-panel-pwa__hdr">
            <span @click="mobileMenuOpen = !mobileMenuOpen" data-alph-exclude-all-cpe="true"
                  class="alph-panel-pwa__hdr-nav-btn alph-panel-pwa__hdr-nav-btn--mobile-menu">
              <menu-icon class="icon"></menu-icon>
            </span>

            <div class="alph-panel-pwa__hdr-logo">
                <img class="alph-panel-pwa__hdr-logo-img" src="../images/icon.png">
            </div>

            <div class="alph-panel-pwa__hdr-toolbar-mini">
                <div v-for="tabItem in data.tabs.vueDM" v-show="!tabItem.disabled && tabItem.favorite"
                     class="alph-panel-pwa__hdr-nav-item"
                     v-bind:class="{ active: tabItem.selected }" @click="selectTabItem(tabItem.tabName)">
                    <span class="alph-panel-pwa__hdr-nav-btn" v-html="tabItem.icon"></span>
                </div>
            </div>

            <div class="alph-panel-pwa__hdr-menu" v-bind:class="{ open: mobileMenuOpen }"
                 data-alph-exclude-all-cpe="true">
                <div v-for="tabItem in data.tabs.vueDM" v-show="!tabItem.disabled"
                     class="alph-panel-pwa__hdr-nav-item"
                     v-bind:class="{ active: tabItem.selected }" @click="selectTabItem(tabItem.tabName)">
                    <span class="alph-panel-pwa__hdr-nav-btn" v-html="tabItem.icon"></span>
                    <span class="alph-panel-pwa__hdr-nav-btn-text">{{ tabItem.tabName }}</span>
                </div>
            </div>


            <div class="alph-panel-pwa__hdr-btn-group--end" data-alph-exclude-all-cpe="true">
                <span @click="closePanelAndMenu" class="alph-panel-pwa__hdr-action-btn">
                    <close-icon></close-icon>
                </span>
            </div>

        </div>

        <div class="alph-panel-pwa__content">
            <div v-show="data.tabs.vueDM.info.selected" class="alph-panel-pwa__tab-panel">
                <info :data="data.infoComponentData" :messages="data.l10n.messages"></info>
            </div>

            <div v-show="data.tabs.vueDM.morphology.selected" class="alph-panel-pwa__tab-panel">
                <div v-show="!morphDataReady && !noLanguage">
                    <p class="alph-panel-pwa__progress-message">
                        Getting information on a
                        <span class="alph-panel-pwa__progress-message-accent">{{data.status.languageName}}</span>
                        word <span
                            class="alph-panel-pwa__progress-message-accent">{{data.status.selectedText}}</span>
                    </p>
                    <div class="alph-panel-pwa__progress-wrapper">
                        <div class="alph-panel-pwa__progress-border">
                            <div class="alph-panel-pwa__progress-whitespace">
                                <div class="alph-panel-pwa__progress-line"></div>
                                <!-- No lexical data is available yet -->
                                <div class="alph-panel-pwa__progress-text">
                                    {{data.l10n.messages.PLACEHOLDER_POPUP_DATA}}
                                </div>
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
                           :translations="data.translations" :linkedfeatures="data.linkedFeatures"
                           :morphDataReady="morphDataReady" @sendfeature="sendFeature">
                    </morph>

                    <div class="alpheios-popup__morph-cont-providers">
                        <div class="alpheios-popup__morph-cont-providers-source" v-for="p in data.providers">
                            {{ p.toString() }}
                        </div>
                    </div>
                </div>
            </div>

            <div v-show="data.tabs.vueDM.definitions.selected" class="alph-panel-pwa__tab-panel">

                <!-- Short definitions -->
                <div v-show="data.shortDefinitions.length < 1 && data.fullDefinitions.length < 1">
                    {{data.l10n.messages.PLACEHOLDER_DEFINITIONS}}
                </div>
                <div class="alph-panel-pwa__contentitem" v-for="definition in data.shortDefinitions">
                    <shortdef :definition="definition"></shortdef>
                </div>

                <!-- Full definitions -->
                <div class="alph-panel-pwa__contentitem" v-html="data.fullDefinitions"></div>
            </div>

            <!-- v-show="inflectionsTabVisible" -->
            <div v-show="data.tabs.vueDM.inflections.selected" :id="inflectionsPanelID" class="alph-panel-pwa__tab-panel">
                <inflections class="alpheios-panel-pwa-inflections"
                             :inflections-enabled="data.inflectionsEnabled" :inflection-browser-enabled="data.inflectionBrowserEnabled"
                             :infl-browser-tables-collapsed="data.inflBrowserTablesCollapsed"
                             :data="data.inflectionComponentData" :locale="data.settings.locale.currentValue"
                             :messages="data.l10n.messages" :wait-state="data.inflectionsWaitState" @contentwidth="setContentWidth">
                </inflections>
            </div>

            <div v-show="data.tabs.vueDM.grammar.selected" class="alph-panel-pwa__tab-panel
                alph-panel-pwa__tab-panel--no-padding alph-panel-pwa__tab-panel--fw">
                <grammar :res="data.grammarRes"></grammar>
            </div>

            <div v-show="data.tabs.vueDM.treebank.selected" class="alph-panel-pwa__tab-panel
                alph-panel-pwa__tab-panel--no-padding alph-panel-pwa__tab-panel--fw">
                <treebank :res="data.treebankComponentData.data"
                          :locale="data.settings.locale.currentValue" :visible="data.treebankComponentData.visible"
                          :messages="data.l10n.messages" @treebankcontentwidth="setTreebankContentWidth">
                </treebank>
            </div>

            <div v-show="data.tabs.vueDM.status.selected" class="alph-panel-pwa__tab-panel">
                <div v-for="message in data.messages">
                    <div class="alph-panel-pwa__message">{{message}}</div>
                </div>
            </div>

            <div v-show="data.tabs.vueDM.options.selected" class="alph-panel-pwa__tab-panel">
                <setting :data="data.settings.preferredLanguage" @change="settingChanged"
                         :classes="['alph-panel-pwa__options-item']"></setting>
                <setting :data="data.settings.verboseMode" @change="settingChanged"
                         :classes="['alph-panel-pwa__options-item']"></setting>
                <setting :data="data.uiOptions.items.skin" @change="uiOptionChanged"
                         :classes="['alph-panel-pwa__options-item']"></setting>
                <setting :data="languageSetting" @change="resourceSettingChanged"
                         :classes="['alph-panel-pwa__options-item']"
                         :key="languageSetting.name"
                         v-if="languageSetting.values.length > 1"
                         v-for="languageSetting in data.resourceSettings.lexicons"></setting>
            </div>
        </div>
        <div class="alph-panel-pwa__notifications uk-text-small" :class="notificationClasses"
             v-show="data.notification.important">
            <div v-html="data.notification.text" class="alph-panel-pwa__notifications-text"></div>
            <setting :data="data.settings.preferredLanguage" :show-title="false"
                     :classes="['alph-panel-pwa__notifications--lang-switcher']" @change="settingChanged"
                     v-show="data.notification.showLanguageSwitcher"></setting>
            <div @click="closeNotifications" class="alph-panel-pwa__notifications-close-btn">
                <close-icon></close-icon>
            </div>
        </div>
    </div>
</template>
<script>
  import PanelBase from './panel-base.vue'
  import InfoPWA from './info-pwa.vue'
  // import interact from 'interactjs'

  // Embeddable SVG icons
  import MenuIcon from '../images/inline-icons/menu.svg'

  export default {
    extends: PanelBase,
    components: {
      info: InfoPWA,
      menuIcon: MenuIcon
    },
    data: function () {
      return {
        mobileMenuOpen: false // Stores a mobile menu open state, is closed by default,
      }
    },
    computed: {
      morphDataReady: function () {
        return this.data.morphDataReady
      },

      currentLanguageName: function () {
        return this.data.currentLanguageName
      },

      noLanguage: function () {
        return this.data.currentLanguageName === undefined
      }
    },
    methods: {
      sendFeature (data) {
        this.$emit('sendfeature', data)
      },

      inflectionsEvent: function (type, data) {
        // Re-throw event to a UI controller
        this.$emit('componentevent', 'inflections', type, data)
      },

      selectTabItem (name) {
        this.mobileMenuOpen = false
        this.data.tabs.select(name)
      },

      /*
      If menu is open at the moment of panel closing, it will be reopened next time with the panel.
      To prevent this, we need to make sure menu is closed every time we close a panel.
       */
      closePanelAndMenu () {
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
    $alpheios-mobile-breakpoint: 480px;

    .alph-panel-pwa {
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
        grid-template-areas: "header" "content" "content"
    }

    .alph-panel-pwa[data-notification-visible="true"] {
        grid-template-areas: "header" "notifications" "content"
    }

    .alph-panel-pwa__hdr {
        position: relative;
        box-sizing: border-box;
        grid-area: header;
        border-bottom: 1px solid $alpheios-link-color-dark-bg;
        touch-action: none; /* Required to support touch actions such as swipe by the panel */
    }

    .alph-panel-pwa__hdr-logo {
        flex-grow: 0;
        justify-content: flex-start;
    }

    .alph-panel-pwa__hdr-selection {
        font-size: 16px;
        font-weight: 700;
        color: $alpheios-toolbar-color;
    }

    .alph-panel-pwa__hdr-word {
        font-size: 14px;
        position: relative;
        top: -1px;
    }

    .#{$alpheios-uikit-namespace} .alph-panel-pwa__hdr-logo-img {
        width: auto;
        height: 30px;
        padding-top: 5px;
    }

    .alph-panel-pwa__hdr-action-btn,
    .alph-panel-pwa__hdr-action-btn.active:hover,
    .alph-panel-pwa__hdr-action-btn.active:focus {
        display: block;
        width: 20px;
        height: 20px;
        position: relative;
        top: 5px;
        text-align: center;
        cursor: pointer;
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alph-panel-pwa__hdr-action-btn:hover,
    .alph-panel-pwa__hdr-action-btn:focus,
    .alph-panel-pwa__hdr-action-btn.active {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    .alph-panel-pwa__hdr-action-btn.alph-panel-pwa__hdr-action-btn--narrow {
        margin: 0;
    }

    .alph-panel-pwa__body {
        display: flex;
        height: calc(#{$alpheios-panel-height} - #{$alpheios-panel-header-height});
    }

    .alph-panel-pwa__content {
        overflow: auto;
        grid-area: content;
        direction: ltr;
        box-sizing: border-box;
        display: flex;
        width: 100vw;
        position: relative; // Need to set element as an offset parent for panel content items
    }

    .alph-panel-pwa__notifications {
        display: none;
        position: relative;
        padding: 10px;
        background: $alpheios-logo-color;
        grid-area: notifications;
        overflow: hidden;
        justify-content: space-between;
    }

    .alph-panel-pwa__notifications-text {
        flex-grow: 1;
    }

    .alph-panel-pwa__notifications-close-btn {
        width: 20px;
        height: 20px;
        margin: 0;
        cursor: pointer;
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alph-panel-pwa__notifications-close-btn:hover,
    .alph-panel-pwa__notifications-close-btn:focus {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    .alph-panel-pwa__notifications--lang-switcher {
        font-size: 12px;
        margin-right: 10px;
    }

    .alph-panel-pwa__notifications--lang-switcher .uk-select {
        width: 120px;
        height: 25px;
    }

    .alph-panel-pwa__notifications--important {
        background: $alpheios-icon-color;
    }

    [data-notification-visible="true"] .alph-panel-pwa__notifications {
        display: flex;
    }

    .alph-panel-pwa__tab-panel {
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        padding: 20px;
    }

    .alph-panel-pwa__tab-panel--fw {
        width: 100%;
    }

    .alph-panel-pwa__tab-panel--no-padding {
        padding: 0;
    }

    .alph-panel-pwa__message {
        margin-bottom: 0.5rem;
    }

    .alph-panel-pwa__options-item {
        margin-bottom: 0.5rem;
        max-width: 300px;
    }

    .alph-panel-pwa__contentitem {
        margin-bottom: 1em;
    }

    .alph-panel-pwa__hdr-nav-item {
        cursor: pointer;
        text-transform: capitalize;
    }

    .alph-panel-pwa__hdr-nav-btn {
        display: block;
        position: relative;
        width: 20px;
        height: 20px;
        margin: 0 15px 0 5px;
        text-align: center;
        cursor: pointer;
        background: transparent no-repeat center center;
        background-size: contain;
    }

    .alph-panel-pwa__hdr-menu .alph-panel-pwa__hdr-nav-btn {
        top: -4px;
        left: 3px;
    }

    .alph-panel-pwa__hdr-nav-btn.alph-panel-pwa__hdr-nav-btn--short {
        margin: -10px 5px 20px;
    }

    .alph-panel-pwa__hdr-nav-btn,
    .alph-panel-pwa__hdr-nav-item.active:hover .alph-panel-pwa__hdr-nav-btn,
    .alph-panel-pwa__hdr-nav-item.active:focus .alph-panel-pwa__hdr-nav-btn {
        fill: $alpheios-link-color-dark-bg;
        stroke: $alpheios-link-color-dark-bg;
    }

    .alph-panel-pwa__hdr-nav-item:hover .alph-panel-pwa__hdr-nav-btn,
    .alph-panel-pwa__hdr-nav-item:focus .alph-panel-pwa__hdr-nav-btn,
    .alph-panel-pwa__hdr-nav-item.active .alph-panel-pwa__hdr-nav-btn {
        fill: $alpheios-link-hover-color;
        stroke: $alpheios-link-hover-color;
    }

    @media (hover: none) {
        .alph-panel-pwa__hdr-nav-btn,
        .alph-panel-pwa__hdr-nav-item:hover .alph-panel-pwa__hdr-nav-btn,
        .alph-panel-pwa__hdr-nav-item:focus .alph-panel-pwa__hdr-nav-btn {
            fill: $alpheios-link-color-dark-bg;
            stroke: $alpheios-link-color-dark-bg;
        }

        .alph-panel-pwa__hdr-nav-item.active .alph-panel-pwa__hdr-nav-btn,
        .alph-panel-pwa__hdr-nav-item.active:hover .alph-panel-pwa__hdr-nav-btn,
        .alph-panel-pwa__hdr-nav-item.active:focus .alph-panel-pwa__hdr-nav-btn {
            fill: $alpheios-link-hover-color;
            stroke: $alpheios-link-hover-color;
        }
    }

    // region Styles of nested components
    .alph-panel-pwa .alpheios-popup__morph-cont {
        overflow: visible;
        margin: 0 0 2rem;
        padding: 0;
        border: none;
    }

    .alph-panel-pwa .alpheios-morph__lexemes {
        font-size: 0.875rem;
    }

    .alph-panel-pwa .alpheios-popup__morph-cont-providers-header {
        font-size: 0.875rem;
        margin-top: 1.5rem;
    }
    // endregion Styles of nested components

    // region Mobile menu styles
    .alph-panel-pwa__hdr {
        display: flex;
        justify-content: space-between;
        padding: 0 15px;
    }

    .alph-panel-pwa__hdr-nav-btn--mobile-menu {
        position: relative;
        top: 5px;
        margin: 0;
    }

    .alph-panel-pwa__hdr-logo {
        display: none;
    }

    .alph-panel-pwa__hdr-toolbar-mini {
        flex-grow: 1;
        text-transform: capitalize;
        text-align: center;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: stretch;
    }

    .alph-panel-pwa__hdr-toolbar-mini .alph-panel-pwa__hdr-nav-item {
        padding: 0 15px;
    }

    .alph-panel-pwa__hdr-toolbar-mini .alph-panel-pwa__hdr-nav-btn {
        margin: 0;
        position: relative;
        top: 6px;
    }

    .alph-panel-pwa__hdr-menu {
        position: absolute;
        top: $alpheios-panel-header-height;
        left: 0;
        right: 0;
        width: 100%;
        display: none;
        flex-wrap: nowrap;
        box-sizing: border-box;
        flex-direction: column;
        justify-content: flex-start;
        height: calc(#{$alpheios-panel-height} - #{$alpheios-panel-header-height});
        background: #FFF;
        direction: ltr;
    }

    .alph-panel-pwa__hdr-menu.open {
        display: flex;
        justify-content: space-evenly;
        z-index: 10;
    }

    .alph-panel-pwa__hdr-menu .tooltiptext {
        display: none;
    }

    .alph-panel-pwa__hdr-btn-group--end {
        display: flex;
        flex-wrap: nowrap;
        flex-direction: column;
        justify-content: flex-start;
        box-sizing: border-box;
    }

    .alph-panel-pwa__hdr-menu .alph-panel-pwa__hdr-nav-item {
        display: flex;
        align-items: center;
        padding: 10px;
        border-bottom: 1px solid $alpheios-link-color-dark-bg;
        flex-grow: 1;
    }

    @media (min-width: $alpheios-mobile-breakpoint) {
        .alph-panel-pwa__hdr-toolbar-mini,
        .alph-panel-pwa__hdr-nav-btn--mobile-menu {
            display: none;
        }

        .alph-panel-pwa__hdr-logo {
            display: block;
        }

        .alph-panel-pwa__hdr-menu {
            position: static;
            width: auto;
            height: auto;
            background-color: transparent;
            display: flex;
            justify-content: center;
            flex-direction: row;
        }

        .alph-panel-pwa__hdr-menu .alph-panel-pwa__hdr-nav-item {
            padding: 0;
            border-bottom: none;
            flex-grow: 0;
        }

        .alph-panel-pwa__hdr-menu.open {
            justify-content: center;
        }

        .alph-panel-pwa__hdr-btn-group--end {
            position: static;
            flex-direction: row;
            justify-content: flex-end;
        }

        .alph-panel-pwa__hdr-nav-item {
            padding: 0;
            border: none;
        }

        .alph-panel-pwa__hdr-nav-btn {
            margin: 0 15px;
        }

        .alph-panel-pwa__hdr-nav-btn-text {
            display: none;
        }

        .alph-panel-pwa__notifications {
            padding: 10px 20px;
        }
    }
    // endregion Mobile menu styles

    // region Tooltip fix
    .alph_tooltip-top {
        margin-left: initial;
        transform: translateX(-50%)
    }
    // endregion Tooltip fix

    p.alph-panel-pwa__progress-message {
        padding: 0 1rem;
        margin-bottom: 10px;
    }

    .alph-panel-pwa__progress-message-accent {
        color: $alpheios-toolbar-color;
        font-weight: 700;
    }

    // region Wait animation
    .alph-panel-pwa__progress-wrapper {
        height: 1.2rem;
        margin: 0 1rem 2rem;
        font-size: 0.875rem;
    }

    .alph-panel-pwa__progress-border {
        border: 2px solid $alpheios-icon-color;
        height: 100%;
        padding: 2px;
    }

    .alph-panel-pwa__progress-whitespace {
        overflow: hidden;
        height: 100%;
        margin: 0 auto;
        position: relative;
    }

    .alph-panel-pwa__progress-line {
        position: absolute;
        height: 100%;
        width: 100%;
        background-color: $alpheios-icon-color;
        animation: cssload-slide 5.75s steps(40) infinite;
    }

    .alph-panel-pwa__progress-text {
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
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    @-o-keyframes cssload-slide {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    @-ms-keyframes cssload-slide {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    @-webkit-keyframes cssload-slide {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    @-moz-keyframes cssload-slide {
        0% {
            left: -100%;
        }
        100% {
            left: 100%;
        }
    }

    // endregion Wait animation
</style>
