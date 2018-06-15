export default class TabItem {
  constructor (name, icon = '', descr = '', tabName = name, favorite = false, selected = false, disabled = false) {
    this.name = name
    this.tabName = tabName
    this.descr = descr
    this.icon = icon
    this.selected = selected
    this.disabled = disabled
    this.favorite = favorite
  }

  reset (name, icon = '', descr = '', tabName = name, favorite = false, selected = false, disabled = false) {
    this.disabled = disabled
  }

  get enabled () {
    return !this.disabled
  }

  enable () {
    this.disabled = false
  }

  disable () {
    this.disabled = true
    if (this.selected) { this.deselect() } // Disabled item cannot be selected
  }

  select () {
    this.selected = true
    if (this.disabled) { this.disabled = false } // Enable an item if selected
  }

  deselect () {
    this.selected = false
  }
}
