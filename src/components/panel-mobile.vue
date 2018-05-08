<template>
    <div class="auk alpheios-panel alpheios-panel--mobile" :class="classes" :style="this.data.styles"
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
                <setting :data="data.settings.verboseMode" @change="settingChanged"
                         :classes="['alpheios-panel__options-item']"></setting>
                <setting :data="data.uiOptions.items.skin" @change="uiOptionChanged"
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
  import PanelBase from './panel-base.vue'
  import interact from 'interactjs'

  export default {
    extends: PanelBase,
    mounted () {
      console.log('Mounted a Mobile Panel')

      // Initialize Interact.js: make panel resizable
      interact(this.$el)
        .resizable({
          // resize from all edges and corners
          edges: { left: false, right: false, bottom: false, top: true },

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
          let target = event.target
          // update the element's style
          target.style.height = `${event.rect.height}px`
        })
    }
  }
</script>
<style lang="scss">
    @import "../../node_modules/alpheios-components/src/styles/alpheios";

    .alpheios-panel--mobile {
        width: 100vw;
        height: 50vh;
        bottom: 0;
        top: auto;
        border-top: 1px solid $alpheios-link-color-dark-bg;
        border-left: none;
    }

    .alpheios-panel.alpheios-panel-left {
        left: 0;
        border-right: none;
    }
</style>
