import type { UnifiedCanvas } from '../states/UnifiedCanvas'

import { snap } from '../utils/snap'
import { Tool } from './Tool'

export class ToolGenerate extends Tool {
    constructor(public uc: UnifiedCanvas) {
        super()
    }

    onMouseMove() {
        const uc = this.uc
        const sel = uc.activeSelection
        Object.assign(sel.stableData, {
            x: snap(uc.infos.viewPointerX - sel.stableData.width / 2, uc.snapSize),
            y: snap(uc.infos.viewPointerY - sel.stableData.height / 2, uc.snapSize),
        })
        sel.applyStableData()
    }
}
