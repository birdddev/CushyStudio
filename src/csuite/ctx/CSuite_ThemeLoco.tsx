import type { Tint } from '../kolor/Tint'
import type { CSuiteConfig } from './CSuiteConfig'

import { makeAutoObservable } from 'mobx'

import { formatOKLCH } from '../kolor/formatOKLCH'
import { OKLCH } from '../kolor/OKLCH'

export class CSuite_ThemeLoco implements CSuiteConfig {
    constructor() {
        makeAutoObservable(this)
    }
    // form behaviour
    clickAndSlideMultiplicator = 1
    showWidgetUndo = true
    showWidgetMenu = true
    showWidgetDiff = true
    showToggleButtonBox = false
    // theme
    base: OKLCH = new OKLCH(0.9999, 0, 240)
    get baseStr() {
        return formatOKLCH(this.base)
    }
    get shiftDirection() {
        return this.base.lightness > 0.5 ? -1 : 1
    }
    text: Tint = { contrast: 0.824 }

    inputBorder = 0.08
    labelText = { contrast: 0.48, chroma: 0.035 }
    inputHeight: number = 1.6
    showWidgetExtra: boolean = true
    truncateLabels?: boolean | undefined = false
}
