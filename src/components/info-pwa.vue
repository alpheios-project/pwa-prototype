<template>
    <div class="alpheios-info uk-margin">
        <div class="alpheios-info__versiontext">{{ data.manifest.name }} {{ data.manifest.version }}</div>
        <div class="alpheios-info__currentlanguage">{{ messages.LABEL_INFO_CURRENTLANGUAGE }} {{ data.languageName }}
        </div>
        <div class="alpheios-info__helptext">
            <h3>{{ messages.TEXT_INFO_READER_TITLE }}</h3>
            <p>{{ messages.TEXT_INFO_READER_DESCRIPTION }}</p>
            <h3>{{ messages.TEXT_INFO_TIPS_TITLE }}</h3>
            <ul>
                <li v-html="messages.TEXT_INFO_TIPS_SELECTION"></li>
                <li v-html="messages.TEXT_INFO_TIPS_TOUCH"></li>
                <li v-html="messages.TEXT_INFO_LANGDETECT"></li>
                <li v-html="messages.TEXT_INFO_TIPS_MENU_BUTTON"></li>
                <li v-html="messages.TEXT_INFO_SETTINGS"></li>
                <li v-html="messages.TEXT_INFO_TIPS_HOME_SCREEN"></li>
            </ul>
            <h3>{{ messages.TEXT_INFO_FEEDBACK_TITLE }}</h3>
            <p v-html="messages.TEXT_INFO_FEEDBACK.get('https://github.com/alpheios-project/pwa-prototype/labels/user-feedback-requested', 'support@alpheios.net')"></p>
        </div>
    </div>
</template>
<script>
  import infoComponent from '../../node_modules/alpheios-components/src/vue-components/info.vue'

  export default {
    extends: infoComponent
  }
</script>
