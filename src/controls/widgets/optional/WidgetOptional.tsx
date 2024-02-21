import type { Form } from 'src/controls/Form'
import type { Unmounted } from 'src/controls/Prop'
import type { IWidget, WidgetConfigFields, WidgetSerialFields, WidgetTypeHelpers } from '../../IWidget'

import { computed, makeObservable, observable } from 'mobx'
import { nanoid } from 'nanoid'
import { WidgetDI } from '../WidgetUI.DI'

// CONFIG
export type Widget_optional_config<T extends Unmounted> = WidgetConfigFields<{
    startActive?: boolean
    widget: T
}>

// SERIAL
export type Widget_optional_serial<T extends Unmounted> = WidgetSerialFields<{
    type: 'optional'
    child?: Maybe<T['$Serial']>
    active: boolean
}>

// OUT
export type Widget_optional_output<T extends Unmounted> = Maybe<T['$Output']>

// TYPES
export type Widget_optional_types<T extends Unmounted> = {
    $Type: 'optional'
    $Input: Widget_optional_config<T>
    $Serial: Widget_optional_serial<T>
    $Output: Widget_optional_output<T>
}

// STATE
export interface Widget_optional<T extends Unmounted> extends WidgetTypeHelpers<Widget_optional_types<T>> {}
export class Widget_optional<T extends Unmounted> implements IWidget<Widget_optional_types<T>> {
    get serialHash(): string {
        if (this.serial.active) return this.childOrThrow.serialHash
        return 'x'
    }
    readonly isVerticalByDefault = true
    readonly isCollapsible = true
    readonly id: string
    readonly type: 'optional' = 'optional'

    serial: Widget_optional_serial<T>
    child?: T['$Widget']

    get childOrThrow(): T['$Widget'] {
        if (this.child == null) throw new Error('❌ optional active but child is null')
        return this.child
    }

    toggle = () => {
        if (this.serial.active) this.setOff()
        else this.setOn()
    }

    setOn = () => {
        this.serial.active = true
        const unmounted = this.config.widget
        const prevSerial = this.serial.child
        if (prevSerial && unmounted.type === prevSerial.type) {
            this.child = this.form.builder._HYDRATE(unmounted, prevSerial)
        } else {
            this.child = this.form.builder._HYDRATE(unmounted, null)
        }
    }

    setOff = () => {
        this.serial.active = false
        this.child = undefined
        // this.serial.child = undefined
    }

    constructor(public form: Form<any>, public config: Widget_optional_config<T>, serial?: Widget_optional_serial<T>) {
        this.id = serial?.id ?? nanoid()
        const defaultActive = config.startActive
        this.serial = serial ?? {
            id: this.id,
            type: 'optional',
            active: defaultActive ?? false,
            collapsed: config.startCollapsed,
        }
        const isActive = serial?.active ?? defaultActive
        if (isActive) this.setOn()
        makeObservable(this, {
            serial: observable,
            value: computed,
        })
    }

    get value(): Widget_optional_output<T> {
        if (!this.serial.active) return null
        return this.childOrThrow.value
    }
}

// DI
WidgetDI.Widget_optional = Widget_optional
