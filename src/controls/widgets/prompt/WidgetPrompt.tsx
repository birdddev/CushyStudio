import type { IWidget, WidgetConfigFields, WidgetSerialFields } from '../../IWidget'
import type { Tree } from '@lezer/common'
import type { Timestamp } from 'src/cards/Timestamp'
import type { Form } from 'src/controls/Form'

import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { hash } from 'ohash'

import { WidgetDI } from '../WidgetUI.DI'
import { compilePrompt } from './_compile'
import { parser } from './grammar/grammar.parser'
import { WidgetPrompt_LineUI, WidgetPromptUI } from './WidgetPromptUI'

export type CompiledPrompt = {
    /** e.g. "score_9 score_8 BREAK foo bar baz" */
    promptIncludingBreaks: string
    /**
     * only filled when prompt has `break`s
     * will return list of break-separated subprompts
     * e.g. ["score_9 score_8"], ["foo bar baz"]" */
    subPrompts: string[]
    debugText: string[]
}

// CONFIG
export type Widget_prompt_config = WidgetConfigFields<{
    default?: string
    placeHolder?: string
}>

// SERIAL
export type Widget_prompt_serial = WidgetSerialFields<{
    type: 'prompt'
    val?: string
}>

// OUT
export type Widget_prompt_output = Widget_prompt // { text: string; tree: Tree }

// TYPES
export type Widget_prompt_types = {
    $Type: 'prompt'
    $Input: Widget_prompt_config
    $Serial: Widget_prompt_serial
    $Output: Widget_prompt_output
    $Widget: Widget_prompt
}

// STATE
export interface Widget_prompt extends Widget_prompt_types {}
export class Widget_prompt implements IWidget<Widget_prompt_types> {
    HeaderUI = WidgetPrompt_LineUI
    BodyUI = WidgetPromptUI
    get serialHash () { return hash(this.serial.val) } // prettier-ignore
    readonly id: string
    readonly type: 'prompt' = 'prompt'

    serial: Widget_prompt_serial

    constructor(
        //
        public readonly form: Form<any>,
        public readonly config: Widget_prompt_config,
        serial?: Widget_prompt_serial,
    ) {
        this.id = serial?.id ?? nanoid()
        this.serial = serial ?? {
            type: 'prompt',
            val: config.default,
            collapsed: config.startCollapsed,
            id: this.id,
        }
        makeAutoObservable(this)
    }

    // sentinel value so we know when to trigger update effect in the UI to update
    // codemirror uncontrolled component
    _valueUpdatedViaAPIAt: Maybe<Timestamp> = null

    set text(next: string) {
        // widget prompt uses codemirror, and codemirror manage its internal state itsef.
        // making the widget "uncontrolled". Usual automagical mobx-reactivity may not always apply.
        // To allow CodeMirror editor to react to external value changes, we need to use an effect in the UI.
        // To know when to run the effect, we update `valueUpdatedViaAPIAt` here to trigger the effect.
        this._valueUpdatedViaAPIAt = Date.now() as Timestamp
        this.serial.val = next
    }

    // the raw unparsed text
    get text() {
        return this.serial.val ?? ''
    }
    // the parsed tree
    get ast(): Tree {
        return parser.parse(this.serial.val ?? '')
    }
    get value(): Widget_prompt_output {
        return this
        // return {
        //     text: this.serial.val ?? this.config.default ?? '',
        //     tree: this.ast,
        // }
    }

    compile = (p: {
        /** for wildcard */
        seed?: number
        onLora: (lora: Enum_Load_Lora_lora_name) => void
        /** @default true */
        printWildcards?: boolean
    }): CompiledPrompt =>
        compilePrompt({
            st: cushy,
            text: this.text,
            //
            onLora: p.onLora,
            seed: p.seed,
            printWildcards: p.printWildcards,
        })
}

// DI
WidgetDI.Widget_prompt = Widget_prompt
