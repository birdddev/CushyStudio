import type { BoolButtonMode, BoolButtonProps } from '../checkbox/InputBoolUI'
import type { AutoCompleteSelectState } from './SelectState'
import type { CSSProperties } from 'react'

import { observer } from 'mobx-react-lite'
import { type ListChildComponentProps } from 'react-window'

import { InputBoolToggleButtonUI } from '../checkbox/InputBoolToggleButtonUI'

export type SelectOptionProps<T> = {
    index: number
    style?: CSSProperties
    option: T
    state: AutoCompleteSelectState<T>
    isScrolling?: boolean
    boolButtonProps?: BoolButtonProps
}

export const SelectOptionUI = observer(function SelectOptionUI_<T>(p: SelectOptionProps<T>) {
    const state = p.state
    const isSelected = state.values.find((v) => state.isEqual(v, p.option)) != null
    const mode: BoolButtonMode = state.isMultiSelect ? 'checkbox' : 'radio'
    return (
        <InputBoolToggleButtonUI
            style={p.style}
            expand
            mode={mode}
            preventDefault
            showToggleButtonBox
            hovered={(b) => b || state.selectedIndex === p.index}
            value={isSelected}
            onValueChange={(value) => {
                if (value != isSelected) state.toggleOptionFromFilteredOptionsAtIndex(p.index)
            }}
            {...p.boolButtonProps}
        >
            <div tw='w-full'>
                {state.p.getLabelUI //
                    ? state.p.getLabelUI(p.option)
                    : state.p.getLabelText(p.option)}
            </div>
        </InputBoolToggleButtonUI>
    )
})

export const SelectOptionUI_FixedList = observer(function SelectOptionUI_<T>({
    data,
    index,
    style,
    isScrolling,
}: ListChildComponentProps<{ s: AutoCompleteSelectState<T> }>) {
    const s = data.s
    const option = s.filteredOptions[index]!
    return (
        <SelectOptionUI //
            option={option}
            state={s}
            index={index}
            style={style}
            isScrolling={isScrolling}
        />
    )
})
