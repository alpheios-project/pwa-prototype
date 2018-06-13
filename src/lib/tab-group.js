import TabItem from './tab-item.js'

export default class TabGroup {
  constructor (...items) {
    this._items = new Map()
    this.add(...items)

    this.vueDM = {}
    for (const item of this.items) {
      this.vueDM[item.name] = item
    }
  }

  get items () {
    return Array.from(this._items.values())
  }

  get list () {
    return Array.from(this._items.keys()).filter(key => this._items.get(key).enabled)
  }

  get nextItem () {

  }

  get selectedItem () {
    return this.items.find(item => item.selected)
  }

  add (...items) {
    for (const item of items) {
      let tabItem = new TabItem(...item)
      this._items.set(tabItem.name, tabItem)
    }
    return this
  }

  enable (...itemNames) {
    for (const itemName of itemNames) {
      if (this._items.has(itemName)) {
        this._items.get(itemName).enable()
      }
    }
    return this
  }

  disable (...itemNames) {
    for (const itemName of itemNames) {
      if (this._items.has(itemName)) {
        this._items.get(itemName).disable()
      }
    }
    return this
  }

  select (itemName) {
    if (this._items.has(itemName)) {
      // Deselect a currently selected item
      const selectedItem = this.selectedItem
      if (selectedItem) { this.selectedItem.deselect() }
      this._items.get(itemName).select()
    }
  }

  selectPrev () {
    const selectedItem = this.selectedItem
    const list = this.list
    if (selectedItem) {
      // There is one item selected
      const currentIndex = list.findIndex(name => name === selectedItem.name)
      const prevIndex = (currentIndex - 1 < 0) ? list.length - 1 : currentIndex - 1
      this._items.get(list[prevIndex]).select()
      selectedItem.deselect()
    } else {
      // No items are currently selected. Select the first item
      this._items.get(list[0]).select()
    }
  }

  selectNext () {
    const selectedItem = this.selectedItem
    const list = this.list
    if (selectedItem) {
      // There is one item selected
      const currentIndex = list.findIndex(name => name === selectedItem.name)
      const nextIndex = (currentIndex + 1 > list.length - 1) ? 0 : currentIndex + 1
      this._items.get(list[nextIndex]).select()
      selectedItem.deselect()
    } else {
      // No items are currently selected. Select the first item
      this._items.get(list[0]).select()
    }
  }

  deselect (itemName = undefined) {
    if (itemName && this._items.has(itemName)) {
      this._items.get(itemName).deselect()
    } else {
      let selectedItem = this.selectedItem
      if (selectedItem) { this.selectedItem.deselect() }
    }
  }
}
