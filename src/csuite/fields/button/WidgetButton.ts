import type { FrameAppearance } from '../../frame/FrameTemplates'
import type { Field } from '../../model/Field'
import type { FieldConfig } from '../../model/FieldConfig'
import type { FieldSerial } from '../../model/FieldSerial'
import type { ISchema } from '../../model/ISchema'
import type { Problem_Ext } from '../../model/Validation'

import { runInAction } from 'mobx'

import { Field } from '../../model/Field'
import { registerWidgetClass } from '../WidgetUI.DI'
import { WidgetButtonUI } from './WidgetButtonUI'

export type Field_button_context<K> = {
    context: K
    widget: Field_button<K>
}

// CONFIG
export type Field_button_config<K = any> = FieldConfig<
    {
        text?: string
        /** @default false */
        default?: boolean
        look?: FrameAppearance
        expand?: boolean
        useContext?: () => K
        onClick?: (ctx: Field_button_context<K>) => void
    },
    Field_button_types<K>
>

// SERIAL
export type Field_button_serial = FieldSerial<{
    type: 'button'
    val?: boolean
}>

// VALUE
export type Field_button_value = boolean

// TYPES
export type Field_button_types<K> = {
    $Type: 'button'
    $Config: Field_button_config<K>
    $Serial: Field_button_serial
    $Value: Field_button_value
    $Field: Field_button<K>
}

// STATE
export class Field_button<K> extends Field<Field_button_types<K>> {
    static readonly type: 'button' = 'button'

    constructor(
        //
        root: Field | null,
        parent: Field | null,
        schema: ISchema<Field_button<K>>,
        serial?: Field_button_serial,
    ) {
        super(root, parent, schema)
        const config = schema.config
        if (config.text) config.label = config.label ?? ` `
        this.initSerial(serial)
        this.init({
            DefaultHeaderUI: false,
            DefaultBodyUI: false,
        })
    }

    readonly DefaultHeaderUI = WidgetButtonUI
    readonly DefaultBodyUI = undefined

    get baseErrors(): Problem_Ext {
        return null
    }

    /** set the value to true */
    setOn() {
        return (this.value = true)
    }

    /** set the value to false */
    setOff() {
        return (this.value = false)
    }

    /** set value to true if false, and to false if true */
    toggle() {
        return (this.value = !this.value)
    }

    protected setOwnSerial(serial: Maybe<Field_button_serial>): void {
        if (serial == null) return void delete this.serial.val
        if (serial.val != null) this.serial.val = serial.val
    }

    get defaultValue(): boolean {
        return this.config.default ?? false
    }

    get hasChanges(): boolean {
        return this.value !== this.defaultValue
    }

    reset() {
        return (this.value = this.defaultValue)
    }

    get value(): Field_button_value {
        return this.serial.val ?? this.defaultValue
    }

    set value(next: boolean) {
        if (this.serial.val === next) return
        runInAction(() => {
            this.serial.val = next
            this.applyValueUpdateEffects()
        })
    }
}

// DI
registerWidgetClass('button', Field_button)
