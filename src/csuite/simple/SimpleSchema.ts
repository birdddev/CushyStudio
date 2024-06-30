import type { BaseField } from '../model/BaseField'
import type { Channel, ChannelId, Producer } from '../model/Channel'
import type { Entity } from '../model/Entity'
import type { EntitySerial } from '../model/EntitySerial'
import type { Instanciable } from '../model/Instanciable'
import type { ISchema } from '../model/ISchema'
import type { CovariantFn } from '../variance/BivariantHack'

import { makeObservable, reaction } from 'mobx'

import { simpleRepo } from '../'
import { Widget_link, type Widget_link_config } from '../fields/link/WidgetLink'
import { Widget_list, Widget_list_config } from '../fields/list/WidgetList'
import { Widget_optional } from '../fields/optional/WidgetOptional'
import { objectAssignTsEfficient_t_pt } from '../utils/objectAssignTsEfficient'

export interface SimpleSchema<out Field extends BaseField = BaseField> {
    $Field: Field
    $Type: Field['type']
    $Config: Field['$Config']
    $Serial: Field['$Serial']
    $Value: Field['$Value']
}
export class SimpleSchema<out Field extends BaseField = BaseField> implements ISchema<Field>, Instanciable<Field> {
    FieldClass_UNSAFE: any

    constructor(
        FieldClass: {
            new (
                //
                entity: Entity,
                parent: BaseField | null,
                spec: ISchema<Field>,
                serial?: Field['$Serial'],
            ): Field
        },
        public readonly type: Field['type'],
        public readonly config: Field['$Config'],
    ) {
        this.FieldClass_UNSAFE = FieldClass
        makeObservable(this, { config: true })
    }

    create(serial?: () => Maybe<EntitySerial>) {
        return simpleRepo.entity(this, { serial })
    }

    instanciate(
        //
        entity: Entity<any>,
        parent: BaseField | null,
        serial: any | null,
    ) {
        // ensure the serial is compatible
        if (serial != null && serial.type !== this.type) {
            console.log(`[🔶] INVALID SERIAL (expected: ${this.type}, got: ${serial.type})`)
            serial = null
        }
        const field = new this.FieldClass_UNSAFE(entity, parent, this, serial)
        field.publishValue()
        for (const { expr, effect } of this.reactions) {
            // 🔴 Need to dispose later
            reaction(
                () => expr(field),
                (arg) => effect(arg, field),
                { fireImmediately: true },
            )
        }
        return field
    }

    LabelExtraUI() {
        return null
    }

    // PubSub -----------------------------------------------------
    producers: Producer<any, Field['$Field']>[] = []
    publish<T>(chan: Channel<T> | ChannelId, produce: (self: Field['$Field']) => T): this {
        this.producers.push({ chan, produce })
        return this
    }

    subscribe<T>(chan: Channel<T> | ChannelId, effect: (arg: T, self: Field['$Field']) => void): this {
        return this.addReaction(
            (self) => self.consume(chan),
            (arg, self) => {
                if (arg == null) return
                effect(arg, self)
            },
        )
    }

    reactions: {
        expr(self: Field['$Field']): any
        effect(arg: any, self: Field['$Field']): void
    }[] = []
    addReaction<T>(
        //
        expr: (self: Field['$Field']) => T,
        effect: (arg: T, self: Field['$Field']) => void,
    ): this {
        this.reactions.push({ expr, effect })
        return this
    }

    /**
     * chain construction
     * @since 2024-06-30
     * TODO: WRITE MORE DOC
     */
    useIn<BP extends ISchema>(fn: CovariantFn<[field: Field], BP>): S.SLink<this, BP> {
        const linkConf: Widget_link_config<this, BP> = { share: this, children: fn }
        return new SimpleSchema(Widget_link, 'link', linkConf)
    }

    // -----------------------------------------------------
    // Make<X extends BaseField>(type: X['type'], config: X['$Config']) {
    //     return new SimpleSchema(this.builder, type, config)
    // }

    /** wrap widget spec to list stuff */
    list(config: Omit<Widget_list_config<this>, 'element'> = {}): S.SList<this> {
        return new SimpleSchema<Widget_list<this>>(Widget_list, 'list', {
            ...config,
            element: this,
        })
    }

    optional(startActive: boolean = false): S.SOptional<this> {
        return new SimpleSchema<Widget_optional<this>>(Widget_optional, 'optional', {
            widget: this,
            startActive: startActive,
            label: this.config.label,
            // requirements: this.config.requirements,
            startCollapsed: this.config.startCollapsed,
            collapsed: this.config.collapsed,
            border: this.config.border,
        })
    }

    /** clone the spec, and patch the cloned config */
    withConfig(config: Partial<Field['$Config']>): SimpleSchema<Field> {
        const mergedConfig = objectAssignTsEfficient_t_pt(this.config, config)
        const cloned = new SimpleSchema<Field>(this.FieldClass_UNSAFE, this.type, mergedConfig)
        // 🔴 Keep producers and reactions -> could probably be part of the ctor
        cloned.producers = this.producers
        cloned.reactions = this.reactions
        return cloned
    }

    /** clone the spec, and patch the cloned config to make it hidden */
    hidden(): SimpleSchema<Field> {
        return this.withConfig({ hidden: true })
    }
}
