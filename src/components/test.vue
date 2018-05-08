<template>
    <button :class="type" @click="clicked">Some text: <slot /></button>
</template>
<script>
  export default {
    name: 'Button',
    props: [ 'type', 'uiController' ],
    methods: {
      clicked () {
        console.log('A button is clicked')
        this.uiController.buttonClicked(55)
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