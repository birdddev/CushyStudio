/**
 * RULES:
 *
 * any serial modification function must go through
 *  - this.SERMUT(() => { ... }) if not modifying the value
 *  - this.VALMUT(() => { ... }) if modifying the value
 *
 * setOwnSerial:
 *       A. /!\ THIS METHOD MUST BE IDEMPOTENT /!\
 *
 *       B. /!\ THIS METHOD MUST BE CALLED ON INIT AND SET_SERIAL /!\
 *
 *       0. MUST NEVER USE THE serial object provided by default
 *            FIELD MUST ALWAYS CREATE A NEW OBJECT at init time
 *            | always create a new 0
 *
 *       1. MUST KEEP ITS CURRENT SERIAL REFERENCE through setSerial/setValue calls
 *            | goal: make sure we never have stale references
 *            | => allow to abort early if same ref equality check successfull
 *            | => do not replace your serial object, only assign to it
 *            | YES, kinda opposite of #0, but once created, I'd rather  preserve the same
 *            | object
 *
 *       ❌ 2. NEVER CHANGE A SERIAL ID => NO more IDSs.
 *       ❌      | IDs are runtime only (formulas persist paths, and react to field.path changew)
 *       ❌      | => please. be kind. don't
 *
 *       3. MUST ONLY CHANGE own-data, not data belonging to child
 *            | => setSerial should call setSerial on already instanciated children
 *
 *       ❌ 4 IF FIELD HAS CHILD, must do reconciliation based on child ID.
 *       ❌      | => list MUST NOT BLINDLY REPLACE it's children by index
 *
 *       5 CONSTRUCTOR MUST USE THE FUNCTION; logic should not be duplicated if p'ossible
 *
 *       if you override setSerial, make sure rules above are respected.
 *       ideally, add checkmarks near
 *
 *       2024-07-05 precision to document:
 *               | setOwnSerial is expected to somewhat call setSerial
 *               | of every of it's children, and forward the applyEffects flag
 *
 */

import type { Field_shared } from '../fields/shared/WidgetShared'
import type { WidgetLabelContainerProps } from '../form/WidgetLabelContainerUI'
import type { WidgetWithLabelProps } from '../form/WidgetWithLabelUI'
import type { IconName } from '../icons/icons'
import type { TintExt } from '../kolor/Tint'
import type { ITreeElement } from '../tree/TreeEntry'
import type { CovariantFC } from '../variance/CovariantFC'
import type { $FieldTypes } from './$FieldTypes'
import type { Channel, ChannelId } from './Channel'
import type { FieldSerial_CommonProperties } from './FieldSerial'
import type { IBuilder } from './IBuilder'
import type { Instanciable } from './Instanciable'
import type { ISchema } from './ISchema'
import type { Repository } from './Repository'
import type { Problem, Problem_Ext } from './Validation'

import { observer } from 'mobx-react-lite'
import { nanoid } from 'nanoid'
import { createElement, type FC, type ReactNode } from 'react'

import { CSuiteOverride } from '../ctx/CSuiteOverride'
import { isWidgetGroup, isWidgetOptional } from '../fields/WidgetUI.DI'
import { FormAsDropdownConfigUI } from '../form/FormAsDropdownConfigUI'
import { FormUI, type FormUIProps } from '../form/FormUI'
import { getActualWidgetToDisplay } from '../form/getActualWidgetToDisplay'
import { WidgetErrorsUI } from '../form/WidgetErrorsUI'
import { WidgetHeaderContainerUI } from '../form/WidgetHeaderContainerUI'
import { WidgetLabelCaretUI } from '../form/WidgetLabelCaretUI'
import { WidgetLabelContainerUI } from '../form/WidgetLabelContainerUI'
import { WidgetLabelIconUI } from '../form/WidgetLabelIconUI'
import { WidgetToggleUI } from '../form/WidgetToggleUI'
import { WidgetWithLabelUI } from '../form/WidgetWithLabelUI'
import { makeAutoObservableInheritance } from '../mobx/mobx-store-inheritance'
import { $FieldSym } from './$FieldSym'
import { TreeEntry_Field } from './TreeEntry_Field'
import { normalizeProblem } from './Validation'

/** make sure the user-provided function will properly react to any mobx changes */
const ensureObserver = <T extends null | undefined | FC<any>>(fn: T): T => {
    if (fn == null) return null as T
    const isObserver = '$$typeof' in fn && fn.$$typeof === Symbol.for('react.memo')
    const FmtUI = (isObserver ? fn : observer(fn)) as T
    return FmtUI
}

export type KeyedField = { key: string; field: Field }

export interface Field<K extends $FieldTypes = $FieldTypes> {
    $Type: K['$Type'] /** type only properties; do not use directly; used to make typings good and fast */
    $Config: K['$Config'] /** type only properties; do not use directly; used to make typings good and fast */
    $Serial: K['$Serial'] /** type only properties; do not use directly; used to make typings good and fast */
    $Value: K['$Value'] /** type only properties; do not use directly; used to make typings good and fast */
    $Field: K['$Field'] /** type only properties; do not use directly; used to make typings good and fast */
}
//     👆 (merged at type-level here to avoid having extra real properties defined at runtime)

export abstract class Field<out K extends $FieldTypes = $FieldTypes> implements Instanciable<K['$Field']> {
    /**
     * unique Field instance ID;
     * each node in the form tree has one;
     * NOT persisted in serial.
     * change every time the field is instanciated
     */
    readonly id: string

    /** wiget serial is the full serialized representation of that widget  */
    readonly serial: K['$Serial']

    /**
     * singleton repository for the project
     * allow access to global domain, as well as any other live field
     * and other shared resource
     */
    repo: Repository

    /** root of the field tree this field belongs to */
    root: Field

    /** parent field, (null when root) */
    parent: Field | null

    /** schema used to instanciate this widget */
    schema: ISchema<K['$Field']>

    constructor(
        /**
         * singleton repository for the project
         * allow access to global domain, as well as any other live field
         * and other shared resource
         */
        repo: Repository,
        /** root of the field tree this field belongs to */
        root: Field | null,
        /** parent field, (null when root) */
        parent: Field | null,
        /** schema used to instanciate this widget */
        schema: ISchema<K['$Field']>,
        // serial?: K['$Serial'],
    ) {
        this.id = nanoid(8)
        this.repo = repo
        this.root = root ?? this
        this.parent = parent
        this.schema = schema
        this.serial = { type: (this.constructor as any).type }
    }

    static get mobxOverrideds() {
        throw new Error('`mobxOverrideds` should be overridden in subclass')
    }

    static get type(): Field['$Type'] {
        throw new Error('This method should be overridden in subclass')
    }

    get type(): Field['$Type'] {
        return (this.constructor as any).type
    }

    /** shorthand access to some builder */
    get domain(): IBuilder {
        return this.repo.domain
    }

    /** wiget value is the simple/easy-to-use representation of that widget  */
    abstract value: K['$Value']

    /** own errors specific to this widget; must NOT include child errors */
    abstract readonly ownProblems: Problem_Ext

    /**
     * TODO later: make abstract to make sure we
     * have that on every single field + add field config option
     * to customize that. useful for tests.
     */
    randomize(): void {}

    /** field is already instanciated => probably used as a linked */
    instanciate(
        //
        repo: Repository,
        root: Field<any>,
        parent: Field | null,
        serial: any | null,
    ) {
        const builder = repo.domain
        const schema: ISchema<Field_shared<this>> = builder.linked(this)
        return schema.instanciate(repo, root, parent, serial)
    }

    protected abstract setOwnSerial(serial: Maybe<K['$Serial']>): void

    /**
     * list of all functions to run at dispose time
     * allow for instance to register mobx disposers from reactions
     * and other similar stuff that may need to be cleaned up to
     * avoid memory leak.
     */
    protected disposeFns: (() => void)[] = []

    /**
     * lifecycle method, is called
     * TODO: 🔴
     * @since 2024-07-05
     * @status NOT IMPLEMENTED
     */
    dispose() {
        // TODO:
        // disable all publish
        // disable all reactions
        // mark as DELETED;  => makes most function throw an error if used
        for (const disposeFn of this.disposeFns) {
            disposeFn()
        }
        for (const sub of this.subFields) {
            sub.dispose()
        }
    }

    /**
     * will be set to true after the first initialization
     * TODO: also use that to wait for whole tree to be patched before applying effects
     * */
    ready = false

    /** YOU PROBABLY DO NOT WANT TO OVERRIDE THIS */
    setSerial(serial: Maybe<K['$Serial']>) {
        this.VALMUT(() => {
            this.copyCommonSerialFiels(serial)
            this.setOwnSerial(serial)
        })
    }

    private copyCommonSerialFiels(s: Maybe<FieldSerial_CommonProperties>) {
        if (s == null) return
        if (s._creationKey) this.serial._creationKey = s._creationKey
        if (s.collapsed) this.serial.collapsed = s.collapsed
        if (s.custom) this.serial.custom = s.custom
        if (s.lastUpdatedAt) this.serial.lastUpdatedAt = s.lastUpdatedAt
    }
    /** unified api to allow setting serial from value */
    setValue(val: K['$Value']) {
        this.value = val
    }

    RECONCILE<SCHEMA extends ISchema>(p: {
        existingChild: Maybe<Field>
        correctChildSchema: SCHEMA
        /** the target child to clone/apply into child */
        targetChildSerial: Maybe<SCHEMA['$Serial']>
        /** must attach/register both
         *  - child into parent where it belongs
         *  - child.serial into parent.serial where it belongs  */
        attach(child: SCHEMA['$Field']): void
    }) {
        let child = p.existingChild
        if (child != null && child.type === p.correctChildSchema.type) {
            child.setSerial(p.targetChildSerial)
        } else {
            if (child) child.dispose()
            child = p.correctChildSchema.instanciate(
                //
                this.repo,
                this.root,
                this,
                p.targetChildSerial,
            )
            // attach child to current serial
            p.attach(child)
        }
    }

    // ---------------------------------------------------------------------------------------------------
    /** default header UI */
    abstract readonly DefaultHeaderUI: CovariantFC<{ field: K['$Field'] }> | undefined

    /** default body UI */
    abstract readonly DefaultBodyUI: CovariantFC<{ field: K['$Field'] }> | undefined

    UIToggle = (p?: { className?: string }) => <WidgetToggleUI field={this} {...p} />
    UIErrors = () => <WidgetErrorsUI field={this} />
    UILabelCaret = () => <WidgetLabelCaretUI field={this} />
    UILabelIcon = () => <WidgetLabelIconUI widget={this} />
    UILabelContainer = (p: WidgetLabelContainerProps) => <WidgetLabelContainerUI {...p} />
    UIHeaderContainer = (p: { children: ReactNode }) => (
        <WidgetHeaderContainerUI field={this}>{p.children}</WidgetHeaderContainerUI>
    )

    get indentChildren(): number {
        return 1
    }

    get justifyLabel(): boolean {
        if (this.config.justifyLabel != null) return this.config.justifyLabel
        if (this.DefaultBodyUI) return false // 🔴 <-- probably a mistake here
        return true
    }

    get depth(): number {
        if (this.parent == null) return 0
        return this.parent.depth + this.parent.indentChildren
    }

    // abstract readonly id: string
    asTreeElement(key: string): ITreeElement<{ widget: Field; key: string }> {
        return {
            key: (this as any).id,
            ctor: TreeEntry_Field as any,
            props: { key, widget: this as any },
        }
    }

    /** shorthand access to schema.config */
    get config(): this['$Config'] {
        return this.schema.config
    }

    get animateResize(): boolean {
        return true
    }

    /**
     * return true when widget has no child
     * return flase when widget has one or more child
     * */
    get hasNoChild(): boolean {
        return this.subFields.length === 0
    }

    /**
     * @status NOT IMPLEMENTED
     * @deprecated
     * return a short summary of changes from last snapshot
     * */
    get diffSummaryFromSnapshot(): string {
        throw new Error('❌ not implemented')
    }

    /**
     * @since 2024-06-20
     * @status broken
     * return a short summary of changes from default
     */
    get diffSummaryFromDefault(): string {
        return [
            this.hasChanges //
                ? `${this.path}(${this.value?.toString?.() ?? '.'})`
                : null,
            ...this.subFields.map((w) => w.diffSummaryFromDefault),
        ]
            .filter(Boolean)
            .join('\n')
    }

    /** path within the model */
    get path(): string {
        const p = this.parent
        if (p == null) return '$'
        return p.path + '.' + this.mountKey
    }

    get mountKey(): string {
        if (this.parent == null) return '$'
        return this.parent.subFieldsWithKeys.find(({ field }) => field === this)?.key ?? '<error>'
    }

    /** collapse all children that can be collapsed */
    collapseAllChildren(): void {
        for (const _item of this.subFields) {
            // this allow to make sure we fold though optionals and similar constructs
            const item = getActualWidgetToDisplay(_item)
            if (item.serial.collapsed) continue
            const isCollapsible = item.isCollapsible
            if (isCollapsible) item.setCollapsed(true)
        }
    }

    /** expand all children that can are collapsed */
    expandAllChildren(): void {
        for (const _item of this.subFields) {
            // this allow to make sure we fold though optionals and similar constructs
            const item = getActualWidgetToDisplay(_item)
            item.setCollapsed(undefined)
        }
    }

    // change management ------------------------------------------------
    /**
     *
     * RULES:
     * - every component should be able to be restet and must implement
     *   the reset function
     * - Reset MUST NEVER be called fromt the constructor
     * - RESET WILL TRIGGER VALUE/SERIAL update events.
     *
     * 2024-05-24 rvion: we could have some generic reset function that
     * | simply do a this.setValue(this.defaultValue)
     * | but it feels like a wrong implementation 🤔
     * | it's simpler  though
     * 🔶 some widget like `WidgetPrompt` would not work with such logic
     * */
    reset(): void {
        this.setSerial(null)
    }

    /**  */
    abstract readonly hasChanges: boolean

    /**
     * 2024-05-24 rvion: do we want some abstract defaultValue() too ?
     * feels like it's going to be PITA to use for higher level objects 🤔
     * but also... why not...
     * 🔶 some widget like `WidgetPrompt` would not work with such logic
     * 🔶 some widget like `Optional` have no simple way to retrieve the default value
     */
    // abstract readonly defaultValue: this['schema']['$Value'] |

    $FieldSym: typeof $FieldSym = $FieldSym

    /**
     * when this widget or one of its descendant publishes a value,
     * it will be stored here and possibly consumed by other descendants
     */
    _advertisedValues: Record<ChannelId, any> = {}

    /**
     * when consuming an advertised value, walk upward the parent chain, and look for
     * a value stored in the advsertised values
     */
    // 🚴🏠 -> consume / pull / receive / fetch / ... ?
    consume<T extends any>(chan: Channel<T> | ChannelId): Maybe<T> /* 🔸: T | $EmptyChannel */ {
        const channelId = typeof chan === 'string' ? chan : chan.id
        let at = this as any as Field | null
        while (at != null) {
            if (channelId in at._advertisedValues) return at._advertisedValues[channelId]
            at = at.parent
        }
        return null // $EmptyChannel
    }

    /** true if errors.length > 0 */
    get hasErrors(): boolean {
        const errors = this.errors
        return errors.length > 0
    }

    /**
     * return a short string summary that display the value in a simple way.
     * This method is expected to be overriden in most child classes
     */
    get summary(): string {
        return JSON.stringify(this.value)
    }

    /**
     * Retrive the config custom data.
     * 🔶: NOT TO BE CONFUSED WITH `getFieldCustom`
     * Config custom data is NOT persisted anywhere,
     * You can set config.custom when defining your schema.
     * This data is completely unused internally by CSuite.
     * It is READONLY.
     */
    getConfigCustom<T = unknown>(): Readonly<T> {
        return this.config.custom ?? {}
    }

    /**
     * Retrive the field custom data.
     * 🔶: NOT TO BE CONFUSED WITH `getConfigCustom`
     * Field custom data are persisted in the serial.custom.
     * This data is completely unused internally by CSuite.
     * You can use them however you want provided you keep them serializable.
     * It's just a quick/hacky place to store stuff
     */
    getFieldCustom<T = unknown>(): T {
        return this.serial.custom
    }

    /**
     * update
     * You can either return a new value, or patch the initial value
     * use `deleteFieldCustomData` instead to replace the value by null or undefined.
     */
    updateFieldCustom<T = unknown>(fn: (x: Maybe<T>) => T): this {
        const prev = this.value
        const next = fn(prev) ?? prev
        this.serial.custom = JSON.parse(JSON.stringify(next))
        this.applySerialUpdateEffects()
        return this
    }

    /** delete field custom data (delete this.serial.custom)  */
    deleteFieldCustomData(): this {
        delete this.serial.custom
        this.applySerialUpdateEffects()
        return this
    }

    /** all errors: base (built-in widget) + custom (user-defined in config) */
    get errors(): Problem[] {
        const baseErrors = normalizeProblem(this.ownProblems)
        return [...baseErrors, ...this.customErrors]
    }

    get customErrors(): Problem[] {
        if (this.config.check == null)
            return [
                /* { message: 'No check function provided' } */
            ]
        const res = this.config.check(this)
        return normalizeProblem(res)
        // return [...normalizeProblem(res), { message: 'foo' }]
    }

    // BUMP ----------------------------------------------------
    /**
     * everytime a field serial is udpated, we should call this function.
     * this function is called recursivelu upwards.
     * persistance will usually be done at the root field reacting to this event.
     */
    applySerialUpdateEffects(): void {
        this.config.onSerialChange?.(this)
        this.parent?.applySerialUpdateEffects()
    }

    // 💬 2024-03-15 rvion: use this regexp to quickly review manual serial set patterns
    // | `serial\.[a-zA-Z_]+(\[[a-zA-Z_]+\])? = `
    applyValueUpdateEffects(): void {
        this.serial.lastUpdatedAt = Date.now() as Timestamp
        this.parent?.applyValueUpdateEffects_OF_CHILD(this)
        /** in case the widget config contains a custom callback, call this one too */
        this.config.onValueChange?.(this)
        this.publishValue() // 🔴  should probably be a reaction rather than this
        // TODO: -----------------------------------------------
        this.applySerialUpdateEffects()
    }

    /** recursively walk upwards on any field change  */
    private applyValueUpdateEffects_OF_CHILD(child: Field): void {
        this.serial.lastUpdatedAt = Date.now() as Timestamp
        this.parent?.applyValueUpdateEffects_OF_CHILD(child)
        this.config.onValueChange?.(this /* TODO: add extra param here:, child  */)
        this.publishValue() // 🔴  should probably be a reaction rather than this
    }

    /**
     * this method can be heavilly optimized
     * todo:
     *  - by storing the published value locally
     *  - by defining a getter on the _advertisedValues object of all parents
     *  - by only setting this getter up once.
     * */
    publishValue(this: Field) {
        const producers = this.schema.producers
        if (producers.length === 0) return

        // Create and store values for every producer
        const producedValues: Record<ChannelId, any> = {}
        for (const producer of producers) {
            const channelId = typeof producer.chan === 'string' ? producer.chan : producer.chan.id
            producedValues[channelId] = producer.produce(this)
        }
        // Assign values to every parent widget in the hierarchy
        let at = this as any as Field | null
        while (at != null) {
            Object.assign(at._advertisedValues, producedValues)
            at = at.parent
        }
    }

    get isHidden(): boolean {
        if (this.config.hidden != null) return this.config.hidden
        if (isWidgetGroup(this) && Object.keys(this.fields).length === 0) return true
        return false
    }

    /** whether the widget should be considered inactive */
    get isDisabled(): boolean {
        return isWidgetOptional(this) && !this.serial.active
    }

    get isCollapsed(): boolean {
        if (!this.isCollapsible) return false
        if (this.serial.collapsed != null) return this.serial.collapsed
        if (this.parent?.isDisabled) return true
        return false
    }

    /** if specified, override the default algorithm to decide if the widget should have borders */
    get isCollapsible(): boolean {
        // top level widget is not collapsible; we may want to revisit this decision
        // if (widget.parent == null) return false
        if (this.config.collapsed != null) return this.config.collapsed //
        if (!this.DefaultBodyUI) return false // 🔴 <-- probably a mistake here
        if (this.config.label === false) return false
        return true
    }

    get background(): TintExt | undefined {
        return this.config.background
    }

    /** if provided, override the default logic to decide if the widget need to be bordered */
    get border(): TintExt {
        // avoif borders for the top level form
        if (this.parent == null) return false
        // if (this.parent.subWidgets.length === 0) return false
        // if app author manually specify they want no border, then we respect that
        if (this.config.border != null) return this.config.border
        // if the widget do NOT have a body => we do not show the border
        if (this.DefaultBodyUI == null) return false // 🔴 <-- probably a mistake here
        // default case when we have a body => we show the border
        return false
        // return 8
    }

    // FOLD ----------------------------------------------------
    setCollapsed(val?: boolean) {
        if (this.serial.collapsed === val) return
        this.serial.collapsed = val
        this.applySerialUpdateEffects()
    }

    toggleCollapsed(this: Field) {
        this.serial.collapsed = !this.serial.collapsed
        this.applySerialUpdateEffects()
    }

    // UI ----------------------------------------------------

    /**
     * allow to quickly render the model as a react form
     * without having to import any component; usage:
     * | <div>{x.render()}</div>
     */
    render(p: Omit<FormUIProps, 'field'> = {}): ReactNode {
        return createElement(FormUI, { field: this, ...p })
    }

    /**
     * allow to quickly render the form in a dropdown button
     * without having to import any component; usage:
     * | <div>{x.renderAsConfigBtn()}</div>
     */
    renderAsConfigBtn(p?: {
        // 1. anchor option
        // ...TODO
        // 2. popup options
        title?: string
        className?: string
        maxWidth?: string
        minWidth?: string
        width?: string
    }): ReactNode {
        return createElement(FormAsDropdownConfigUI, { form: this, ...p })
    }

    renderSimple(this: Field, p?: Omit<WidgetWithLabelProps, 'field' | 'fieldName'>): JSX.Element {
        return (
            <WidgetWithLabelUI //
                key={this.id}
                field={this}
                showWidgetMenu={false}
                showWidgetExtra={false}
                showWidgetUndo={false}
                justifyLabel={false}
                fieldName='_'
                {...p}
            />
        )
    }

    renderSimpleAll(this: Field, p?: Omit<WidgetWithLabelProps, 'field' | 'fieldName'>): JSX.Element {
        return (
            <CSuiteOverride
                config={{
                    showWidgetMenu: false,
                    showWidgetExtra: false,
                    showWidgetUndo: false,
                }}
            >
                <WidgetWithLabelUI key={this.id} field={this} fieldName='_' {...p} />
            </CSuiteOverride>
        )
    }

    renderWithLabel(this: Field, p?: Omit<WidgetWithLabelProps, 'field' | 'fieldName'>): JSX.Element {
        return (
            <WidgetWithLabelUI //
                key={this.id}
                field={this}
                fieldName='_'
                {...p}
            />
        )
    }

    defaultHeader(this: Field): JSX.Element | undefined {
        if (this.DefaultHeaderUI == null) return
        return <this.DefaultHeaderUI field={this} />
    }

    defaultBody(this: Field): JSX.Element | undefined {
        if (this.DefaultBodyUI == null) return
        return <this.DefaultBodyUI field={this} />
    }

    header(this: Field): JSX.Element | undefined {
        const HeaderUI =
            'header' in this.config //
                ? ensureObserver(this.config.header)
                : this.DefaultHeaderUI
        if (HeaderUI == null) return
        return <HeaderUI field={this} />
    }

    body(this: Field): JSX.Element | undefined {
        const BodyUI =
            'body' in this.config //
                ? ensureObserver(this.config.body)
                : this.DefaultBodyUI
        if (BodyUI == null) return
        return <BodyUI field={this} />
    }

    /** list of all subwidgets, without named keys */
    get subFields(): Field[] {
        return []
    }

    /** list of all subwidgets, without named keys */
    get subFieldsWithKeys(): KeyedField[] {
        return []
    }

    /**
     * proxy this.repo.action
     * defined to shorted call and allow per-field override
     */
    VALMUT(fn: () => any, mode: 'value' | 'serial' = 'value') {
        return this.repo.VALMUT(fn, this, mode)
    }

    // --------------------------------------------------------------------------------
    // 🔶 the 5 getters bellow are temporary hacks to make shared keep working
    // until every shared usage has been migrated

    /** getter that resolve to `this.schema.producers` */
    get producers() {
        return this.schema.producers
    }
    /** getter that resolve to `this.schema.publish` */
    get publish() {
        return this.schema.publish
    }
    /** getter that resolve to `this.schema.subscribe` */
    get subscribe() {
        return this.schema.subscribe
    }
    /** getter that resolve to `this.schema.reactions` */
    get reactions() {
        return this.schema.reactions
    }
    /** getter that resolve to `this.schema.addReaction` */
    get addReaction() {
        return this.schema.addReaction
    }

    get icon(): Maybe<IconName> {
        const x = this.schema.config.icon as any // 🔴 TS BUG / PERF
        if (x == null) return null
        if (typeof x === 'string') return x as any // 🔴 TS BUG / PERF
        return x(this)
    }

    /** this function MUST be called at the end of every widget constructor */
    init(serial_?: K['$Serial'], mobxOverrides?: any) {
        this.copyCommonSerialFiels(serial_)
        this.setOwnSerial(serial_)

        // make the object deeply observable including this base class
        makeAutoObservableInheritance(this, mobxOverrides)

        // eslint-disable-next-line consistent-this
        const config = this.config
        const serial = this.serial

        // run the config.onCreation if needed
        if (config.onCreate) {
            const oldKey = serial._creationKey
            const newKey = config.onCreateKey ?? 'default'
            if (oldKey !== newKey) {
                config.onCreate(this)
                serial._creationKey = newKey
            }
        }

        // run the config.onInit if needed
        if (config.onInit) {
            config.onInit(this)
        }

        // register self in  `manager._allWidgets
        this.repo._allFields.set(this.id, this)

        // register self in `manager._allWidgetsByType(<type>)
        const prev = this.repo._allFieldsByType.get(this.type)
        if (prev == null) {
            this.repo._allFieldsByType.set(this.type, new Map([[this.id, this]]))
        } else {
            prev.set(this.id, this)
        }

        this.ready = true
    }

    /** update current field snapshot */
    saveSnapshot() {
        this.serial.snapshot = JSON.parse(JSON.stringify(this.serial))
        this.applySerialUpdateEffects()
    }

    /** rever to the last snapshot */
    revertToSnapshot() {
        if (this.serial.snapshot == null) return this.reset()
        this.setSerial(this.serial.snapshot)
    }
}
