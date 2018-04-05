<template>
    <div class="example">{{ msg }}</div>
</template>

<script>
  export default {
    data () {
      return {
        msg: 'Hello world!'
      }
    }
  }
</script>

<style lang="scss">
    @import '../../node_modules/alpheios-components/src/styles/alpheios';

    .example {
        color: lemonchiffon;
        background-color: $alpheios-toolbar-color;
    }
</style>