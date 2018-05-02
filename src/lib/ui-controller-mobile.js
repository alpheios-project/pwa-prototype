import { UIController } from 'alpheios-components'

export default class UIControllerMobile extends UIController {
  constructor (
    state,
    options,
    resourceOptions,
    uiOptions,
    manifest = {},
    template = {
      draggable: false, resizable: false
    }) {
    super(state, options, resourceOptions, uiOptions, manifest, template)
  }
}
