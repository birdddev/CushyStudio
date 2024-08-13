import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { Frame, type FrameProps } from '../frame/Frame'
import { hashStringToNumber } from '../hashUtils/hash'

export const BadgeUI = observer(function BadgeUI_({
    hue,
    autoHue,
    chroma,
    contrast,
    children,
    ...rest
}: {
    /** oklch hue */
    chroma?: number
    contrast?: number
    hue?: number
    /**
     * practical way to enforce consistent hue for a given string
     * pass anything you want to this prop, it will be hashed to a hue
     */
    autoHue?: string | boolean
    children?: ReactNode
    className?: string
} & FrameProps) {
    const hasAction = Boolean(rest.onClick)
    return (
        <Frame
            // [line-height:1.1rem]
            tw={[
                //
                'leading-normal',
                'rounded px-2 whitespace-nowrap',
                hasAction && 'cursor-pointer',
                'w-fit',
                'lh-inside h-inside',
            ]}
            hover={hasAction}
            base={{
                contrast: contrast ?? 0.1,
                chroma: chroma ?? 0.05,
                hue:
                    hue ??
                    (autoHue != null
                        ? typeof autoHue === 'boolean'
                            ? typeof children === 'string'
                                ? hashStringToNumber(children)
                                : undefined
                            : hashStringToNumber(autoHue)
                        : undefined),
            }}
            {...rest}
        >
            {children}
        </Frame>
    )
})
