import { Maybe } from 'src/utils/types'
import { LiveInstance } from './LiveInstance'
import type { LiveTable } from './LiveTable'

export class LiveRef<L extends LiveInstance<any, any>> {
    constructor(
        //
        public owner: LiveInstance<any, any>,
        public key: string,
        public tableName: string,
    ) {}

    get id(): L['data']['id'] {
        return this.owner.data[this.key]
    }

    /** debug string for pretty printing */
    get debugStr() {
        return `LiveRef: ${this.owner.table.name}->${this.tableName}(${this.id}) not found`
    }

    get item(): L {
        const db = this.owner.db
        const taretTable = (db.store as any)[this.tableName] as LiveTable<any, any>
        const targetID = this.id
        const targetInst = taretTable.getOrThrow(targetID)
        return targetInst
    }
}

export class LiveRefOpt<L extends LiveInstance<any, any>> {
    constructor(
        //
        public owner: LiveInstance<any, any>,
        public key: string,
        public tableName: string,
    ) {}

    get id(): Maybe<L['data']['id']> {
        return this.owner.data[this.key]
    }

    /** debug string for pretty printing */
    get debugStr() {
        return `LiveRefOpt: ${this.owner.table.name}->${this.tableName}(${this.id}) not found`
    }

    /** unsafe version of item, that crashes if item not found */
    get itemOrCrash(): L {
        const db = this.owner.db
        const taretTable = (db.store as any)[this.tableName] as LiveTable<any, any>
        const targetID = this.id
        if (targetID == null) throw new Error(`1-${this.debugStr}`)
        const targetInst = taretTable.get(targetID)
        if (targetInst == null) {
            console.log(JSON.stringify(this.owner.data))
            throw new Error(`2-${this.debugStr}`)
        }
        return targetInst
    }

    get item(): Maybe<L> {
        const db = this.owner.db
        const taretTable = (db.store as any)[this.tableName] as LiveTable<any, any>
        const targetID = this.id
        if (targetID == null) return null
        const targetInst = taretTable.get(targetID)
        if (targetInst == null) {
            console.log(`🔴`, JSON.stringify(this.owner.data))
            throw new Error(`3-${this.debugStr}`)
        }
        return targetInst
    }
}