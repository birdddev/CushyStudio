import type { ImageAnswerForm } from 'src/controls/misc/InfoAnswer'
import type { SQLWhere } from 'src/db/SQLWhere'
import type { MediaImageT } from 'src/db/TYPES.gen'
import type { FormBuilder } from '../../FormBuilder'
import type { IWidget_OLD, WidgetConfigFields, WidgetSerialFields, WidgetTypeHelpers_OLD } from '../../IWidget'
import type { MediaImageL } from 'src/models/MediaImage'

import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { WidgetDI } from '../WidgetUI.DI'

// CONFIG
export type Widget_image_config = WidgetConfigFields<{
    defaultActive?: boolean
    suggestionWhere?: SQLWhere<MediaImageT>
    assetSuggested?: RelativePath
}>

// SERIAL
export type Widget_image_serial = WidgetSerialFields<ImageAnswerForm<'image', true>>

// OUT
export type Widget_image_output = MediaImageL

// TYPES
// ...

// STATE
export interface Widget_image extends WidgetTypeHelpers_OLD<'image', Widget_image_config, Widget_image_serial, 0, Widget_image_output> {} // prettier-ignore
export class Widget_image implements IWidget_OLD<'image', Widget_image_config, Widget_image_serial, 0, Widget_image_output> {
    readonly isVerticalByDefault = false
    readonly isCollapsible = true
    readonly id: string
    readonly type: 'image' = 'image'
    readonly serial: Widget_image_serial

    constructor(public form: FormBuilder, public config: Widget_image_config, serial?: Widget_image_serial) {
        this.id = serial?.id ?? nanoid()
        this.serial = serial ?? {
            type: 'image',
            id: this.id,
            active: true,
            imageID: form.schema.st.defaultImage.id,
        }
        makeAutoObservable(this)
    }
    get result(): Widget_image_output {
        return this.form.schema.st.db.media_images.get(this.serial.imageID)!
    }
}

// DI
WidgetDI.Widget_image = Widget_image