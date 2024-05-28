import type { SchemaDict } from '../../ISpec'
import type { Widget_group } from './WidgetGroup'

import { observer } from 'mobx-react-lite'

import { Box, BoxSubtle } from '../../../theme/colorEngine/Box'
import { bang } from '../../../utils/misc/bang'
import { WidgetWithLabelUI } from '../../shared/WidgetWithLabelUI'

// UI
export const WidgetGroup_LineUI = observer(function WidgetGroup_LineUI_(p: {
    //
    widget: Widget_group<any>
}) {
    if (!p.widget.serial.collapsed) return null
    return (
        <BoxSubtle className='COLLAPSE-PASSTHROUGH' tw='line-clamp-1 italic'>
            {p.widget.summary}
        </BoxSubtle>
    )
})

export const WidgetGroup_BlockUI = observer(function WidgetGroup_BlockUI_<T extends SchemaDict>(p: {
    //
    className?: string
    widget: Widget_group<T>
}) {
    const widget = p.widget
    const isTopLevel = widget.config.topLevel
    // Alt
    // | const groupKeys = widget.childKeys
    // | const groupFields = groupKeys.map((k) => [k, widget.values[k]])
    const groupFields = Object.entries(widget.fields)
    const isHorizontal = widget.config.layout === 'H'

    return (
        <div
            // base={4}
            // {...widget.config.box}
            className={p.className}
            tw={['WIDGET-GROUP', 'flex items-start w-full text-base-content']}
            // style={color.styles}
            // style={{ position: 'relative' }}
        >
            {widget.serial.collapsed ? null : (
                <div
                    className={widget.config.className}
                    tw={[
                        '_WidgetGroupUI w-full',
                        isHorizontal //
                            ? `GROUP-HORIZONTAL flex gap-1 flex-wrap`
                            : `GROUP-VERTICAL   flex gap-1 flex-col`,
                    ]}
                >
                    {groupFields.map(([rootKey, sub], ix) => (
                        <WidgetWithLabelUI //
                            isTopLevel={isTopLevel}
                            key={rootKey}
                            rootKey={rootKey}
                            alignLabel={isHorizontal ? false : widget.config.alignLabel}
                            widget={bang(sub)}
                        />
                    ))}
                </div>
            )}
        </div>
    )
})
