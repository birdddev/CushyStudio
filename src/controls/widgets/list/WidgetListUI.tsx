import type { ISpec } from '../../ISpec'
import type { IWidget } from '../../IWidget'
import type { Widget_list } from './WidgetList'

import { observer } from 'mobx-react-lite'
import { forwardRef } from 'react'
// import SortableList, { SortableItem, SortableKnob } from 'react-easy-sort'
import { ErrorBoundary } from 'react-error-boundary'

import { RevealUI } from '../../../rsuite/reveal/RevealUI'
import { ErrorBoundaryFallback } from '../../../widgets/misc/ErrorBoundary'
import { getBorderStatusForWidget } from '../../shared/getBorderStatusForWidget'
import { menu_widgetActions } from '../../shared/WidgetMenu'
import { ListControlsUI } from './ListControlsUI'
import { Button } from '../../../rsuite/button/Button'
import { Ikon } from '../../../icons/iconHelpers'
import { SpacerUI } from '../spacer/SpacerUI'

const { default: SortableList, SortableItem, SortableKnob } = await import('react-easy-sort')

// TODO (bird_d): Make collapse button on left, probably just re-use a "Group" component in this widget.

export const WidgetList_LineUI = observer(function WidgetList_LineUI_(p: { widget: Widget_list<any> }) {
    return (
        <div tw='flex flex-1 items-center COLLAPSE-PASSTHROUGH'>
            <div tw='text-sm text-gray-500 italic'>{p.widget.length} items</div>
            {p.widget.isAuto ? null : (
                <div tw='ml-auto'>
                    <ListControlsUI widget={p.widget} />
                </div>
            )}
        </div>
    )
})

export const WidgetList_BodyUI = observer(function WidgetList_BodyUI_<T extends ISpec>(p: { widget: Widget_list<T> }) {
    const widget = p.widget
    const subWidgets = widget.items
    const min = widget.config.min
    return (
        <div className='_WidgetListUI' tw='flex-grow w-full'>
            <SortableList onSortEnd={p.widget.moveItem} className='list' draggedItemClassName='dragged'>
                <div tw='flex flex-col gap-0.5'>
                    {subWidgets.map((subWidget, ix) => {
                        const widgetHeader = subWidget.header()
                        const widgetBody = subWidget.body()
                        // const { DefaultHeaderUI: WidgetHeaderUI, DefaultBodyUI: WidgetBodyUI } = subWidget // WidgetDI.WidgetUI(widget)
                        const collapsed = subWidget.serial.collapsed ?? false
                        return (
                            <SortableItem key={subWidget.id}>
                                <div tw={['flex flex-col', getBorderStatusForWidget(subWidget) && 'WIDGET-GROUP-BORDERED']}>
                                    {/* collapse indicator */}
                                    {/* <InputBoolUI onValueChange={subWidget.setCollapsed()}>Test</InputBoolUI> */}
                                    <div tw='flex items-center'>
                                        <Button
                                            ghost
                                            icon='mdiChevronRight'
                                            onClick={() => {
                                                subWidget.toggleCollapsed()
                                            }}
                                            square
                                        ></Button>
                                        {/* drag and fold knob */}
                                        {/* debug id */}
                                        <SpacerUI />
                                        {p.widget.config.showID ? (
                                            <div className='divider flex-1 border-top'>
                                                <div id={subWidget.id} tw='opacity-20 italic'>
                                                    #{ix}:{subWidget.id}
                                                </div>
                                            </div>
                                        ) : null}
                                        {/* inline header part */}
                                        {widgetHeader && (
                                            <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onReset={(details) => {}}>
                                                {/* <WidgetHeaderUI widget={subWidget} /> */}
                                                {widgetHeader}
                                            </ErrorBoundary>
                                        )}
                                        {subWidget.config.presets && (
                                            <RevealUI //
                                                content={() => <menu_widgetActions.UI props={subWidget} />}
                                            >
                                                <span className='material-symbols-outlined'>more_vert</span>
                                            </RevealUI>
                                        )}
                                        {/* delete btn */}
                                        {p.widget.isAuto ? null : (
                                            <Button
                                                disabled={min != null && widget.items.length <= min}
                                                ghost
                                                icon='mdiDelete'
                                                onClick={() => widget.removeItem(subWidget)}
                                                square
                                            />
                                        )}
                                        <div tw='w-2' />
                                        <SortableKnob>
                                            <ListDragHandleUI widget={subWidget} ix={ix} />
                                        </SortableKnob>
                                    </div>
                                    {widgetBody && !collapsed && subWidget != null && (
                                        <ErrorBoundary FallbackComponent={ErrorBoundaryFallback} onReset={(details) => {}}>
                                            <div tw='ml-2 pl-2'>
                                                {/* <WidgetBodyUI widget={subWidget} /> */}
                                                {widgetBody}
                                            </div>
                                        </ErrorBoundary>
                                    )}
                                </div>
                            </SortableItem>
                        )
                    })}
                </div>
            </SortableList>
        </div>
    )
})

const ListDragHandleUI = forwardRef<HTMLDivElement, { ix: number; widget: IWidget }>((p, ref) => {
    return (
        //TODO (bird_d): FIX UI - Needs to be Button when ref is implemented.
        <div ref={ref} onClick={() => p.widget.toggleCollapsed()}>
            <Button ghost square icon='mdiDragHorizontalVariant' />
        </div>
    )
})

export const ListItemCollapseBtnUI = observer(function ListItemCollapseBtnUI_(p: { widget: IWidget }) {
    const widget = p.widget
    const isCollapsible = widget.DefaultBodyUI
    if (!isCollapsible) return null
    return (
        <div
            tw='btn btn-ghost btn-square btn-sm'
            // style={{ width: `${indexWidth}rem` }}
            onClick={() => widget.toggleCollapsed()}
        >
            {widget.serial.collapsed ? ( //
                <span className='material-symbols-outlined'>keyboard_arrow_right</span>
            ) : (
                <span className='material-symbols-outlined'>keyboard_arrow_down</span>
            )}
            {/* {ix} */}
        </div>
    )
})
