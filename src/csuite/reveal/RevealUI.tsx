import type { RevealProps } from './RevealProps'
import type { RevealState } from './RevealState'
import type { RevealShellProps } from './shells/ShellProps'
import type { FC, ForwardedRef, ReactPortal } from 'react'

import { observer } from 'mobx-react-lite'
import React, { cloneElement, createElement, forwardRef, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'

import { cls } from '../../widgets/misc/cls'
import { regionMonitor } from '../regions/RegionMonitor'
import { objectAssignTsEfficient_t_t } from '../utils/objectAssignTsEfficient'
import { VirtualDomRect } from './misc/VirtualDomRect'
import { RevealBackdropUI } from './RevealBackdropUI'
import { whitelistedClonableComponents } from './RevealCloneWhitelist'
import { RevealCtx, useRevealOrNull } from './RevealCtx'
import { RevealStateLazy } from './RevealStateLazy'
import { ShellNoneUI } from './shells/ShellNone'
import { ShellPopoverUI } from './shells/ShellPopover'
import { ShellPopupLGUI, ShellPopupSMUI, ShellPopupUI } from './shells/ShellPopupUI'

export const RevealUI = observer(
    forwardRef(function RevealUI_(p: RevealProps, ref2?: ForwardedRef<RevealStateLazy>) {
        const ref = p.sharedAnchorRef ?? useRef<HTMLDivElement>(null) // 🔴
        const parents: RevealStateLazy[] = useRevealOrNull()?.tower ?? []

        // Eagerly retreiving parents is OK here cause as a children, we expects our parents to exist.
        const lazyState = useMemo(() => new RevealStateLazy(p, parents.map((p) => p.getRevealState())), []) // prettier-ignore
        const { state: reveal } = lazyState
        const nextTower = useMemo(() => ({ tower: [...parents, lazyState] }), [])

        useEffect(() => {
            if (ref2 == null) return
            if (typeof ref2 === 'function') ref2(lazyState)
            else ref2.current = lazyState
        }, [])

        // once updated, make sure to keep props in sync so hot reload work well enough.
        useEffect(() => {
            if (reveal == null) return
            if (p.content !== reveal.p.content)
                reveal.contentFn = (): JSX.Element => createElement(p.content, reveal.revealContentProps)
            if (p.trigger !== reveal.p.trigger) reveal.p.trigger = p.trigger
            if (p.placement !== reveal.p.placement) reveal.p.placement = p.placement
            if (p.showDelay !== reveal.p.showDelay) reveal.p.showDelay = p.showDelay
            if (p.hideDelay !== reveal.p.hideDelay) reveal.p.hideDelay = p.hideDelay
            if (p.shell !== reveal.p.shell) reveal.p.shell = p.shell
            if (p.relativeTo !== reveal.p.relativeTo) reveal.p.relativeTo = p.relativeTo
        }, [p.content, p.trigger, p.placement, p.showDelay, p.hideDelay, p.shell, p.relativeTo])

        useEffect(() => {
            if (p.defaultVisible) lazyState.getRevealState().open()
        }, [p.defaultVisible])

        // update position in case something moved or scrolled
        useEffect(() => {
            if (reveal == null) return
            if (!reveal.isVisible) return

            // find element to attach to
            const relTo = reveal.p.relativeTo

            // 1. place around mouse cursor
            if (relTo === 'mouse') {
                const x = regionMonitor.mouseX
                const y = regionMonitor.mouseY
                const vDomRect = new VirtualDomRect({ x, y, width: 1, height: 1 })
                reveal.setPosition(vDomRect)
            }

            // 2. place around anchor
            else if (relTo == null || relTo === 'anchor') {
                const element = ref.current
                if (!element) return
                const rect = element.getBoundingClientRect()
                reveal.setPosition(rect)
            }

            // 3. place somewhere else
            else if (relTo?.startsWith('#')) {
                const element = document.getElementById(relTo.slice(1))!
                // do we want to throw HERE ?
                // or defer to anchor instead ?
                // we could move this block above 2.
                // and use 2 as a fallback case.
                if (!element) return
                const rect = element.getBoundingClientRect()
                reveal.setPosition(rect)
                // in that case, let's add a return here
            }
        }, [reveal?.isVisible])

        // check if we can clone the child element instead of adding a div in the DOM
        // this is a micro-optimisation hack; it's probably worth it long-term, but
        // if having two code paths prooves a bad idea, we may want to revert that decision
        const shouldClone = ((): boolean => {
            if (p.UNSAFE_cloned != null) return p.UNSAFE_cloned
            const children = React.Children.toArray(p.children)
            if (children.length !== 1) return false
            const child0 = children[0]!
            const isValidElement = React.isValidElement(child0)
            if (!isValidElement) return false
            if (whitelistedClonableComponents.has(child0.type)) return true
            return false
        })()

        if (shouldClone) {
            // if (p.style != null) return <>❌ UNSAFE CLONE FAILED (p.style != null)</>
            // if (p.className != null) return <>❌ UNSAFE CLONE FAILED (p.className != null)</>
            if (!React.isValidElement(p.children)) return <>❌ UNSAFE CLONE FAILED (!React.isValidElement(p.children))</>
            // 2024-07-23: trying to remove the outer div
            // mostly working but edge cases (multiple children, forwarding props & ref by children)
            // makes it slightly unsafe / we're not sure what to do with it yet
            const child = p.children
            // prettier-ignore
            const clonedChildren = cloneElement(
                child,
                {
                    // @ts-ignore
                    ref: ref, // 🔴🔴 I guess we're overriding the Frame's ref={s.anchorRef} here?
                    style: objectAssignTsEfficient_t_t(p.style ?? {}, child.props?.style),
                    className: cls(child.props?.className, p.className),
                    onContextMenu: (ev: any) => { lazyState.onContextMenu(ev); child.props?.onContextMenu?.(ev) },
                    onClick: (ev: any)       => { lazyState.onClick(ev)      ; child.props?.onClick?.(ev) },
                    onAuxClick: (ev: any)    => { lazyState.onAuxClick(ev)   ; child.props?.onAuxClick?.(ev) },
                    onMouseEnter: (ev: any)  => { lazyState.onMouseEnter(ev) ; child.props?.onMouseEnter?.(ev) },
                    onMouseLeave: (ev: any)  => { lazyState.onMouseLeave(ev) ; child.props?.onMouseLeave?.(ev) },
                    // 🧑‍🎤 onMouseDown: (ev: any)   => { lazyState.onMouseDown(ev)  ; child.props?.onMouseDown?.(ev) },
                    // 🧑‍🎤 onMouseUp: (ev: any)     => { lazyState.onMouseUp(ev)    ; child.props?.onMouseUp?.(ev) },
                    onFocus: (ev: any)       => { lazyState.onFocus(ev)      ; child.props?.onFocus?.(ev) },
                    onBlur: (ev: any)        => { lazyState.onBlur(ev)       ; child.props?.onBlur?.(ev) },
                },
                <>
                    {child.props.children}
                    {mkTooltip(reveal)}
                    {/* // 🔶 add the tooltip at the end of the children list */}
                </>
            )
            return (
                <RevealCtx.Provider //
                    value={nextTower}
                >
                    {clonedChildren}
                </RevealCtx.Provider>
            )
        }

        // this span could be bypassed by cloning the child element and injecting props,
        // assuming the child will mount them
        return (
            <RevealCtx.Provider value={nextTower}>
                <div //
                    tw={['UI-Reveal', 'inline-flex', reveal?.defaultCursor ?? 'cursor-pointer']}
                    className={p.className}
                    ref={ref}
                    style={p.style}
                    onContextMenu={lazyState.onContextMenu}
                    onClick={lazyState.onClick}
                    onAuxClick={lazyState.onAuxClick}
                    onMouseEnter={lazyState.onMouseEnter}
                    onMouseLeave={lazyState.onMouseLeave}
                    onFocus={lazyState.onFocus}
                    onBlur={lazyState.onBlur}
                    // 🧑‍🎤 onMouseDown={lazyState.onMouseDown}
                    // 🧑‍🎤 onMouseUp={lazyState.onMouseUp}
                >
                    {p.children /* anchor */}
                    {mkTooltip(reveal) /* tooltip */}
                </div>
            </RevealCtx.Provider>
        )
    }),
)

const mkTooltip = (select: Maybe<RevealState>): Maybe<ReactPortal> => {
    // ensure uist initialized
    if (select == null) return null

    // ensure uist visible
    if (!select?.isVisible) return null

    // find element to attach to
    const element = document.getElementById('tooltip-root')!

    const pos = select.tooltipPosition
    const p = select.p
    const hiddenContent = createElement(select.contentFn)

    const ShellUI: React.FC<RevealShellProps> = ((): FC<RevealShellProps> => {
        const shell = p.shell
        if (shell === 'popover') return ShellPopoverUI
        if (shell === 'none') return ShellNoneUI
        //
        if (shell === 'popup') return ShellPopupUI
        if (shell === 'popup-xs') return ShellPopupLGUI
        if (shell === 'popup-sm') return ShellPopupSMUI
        if (shell === 'popup-lg') return ShellPopupLGUI
        if (shell === 'popup-xl') return ShellPopupLGUI

        return shell ?? ShellPopoverUI
    })()

    let revealedContent = (
        <ShellUI pos={pos} reveal={select}>
            {hiddenContent}
        </ShellUI>
    )

    // wrap with backdrop
    if (select.hasBackdrop) {
        revealedContent = <RevealBackdropUI reveal={select}>{revealedContent}</RevealBackdropUI>
    }

    return createPortal(revealedContent, element)
}
