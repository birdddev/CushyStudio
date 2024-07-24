import type { NO_PROPS } from '../types/NO_PROPS'
import type { RevealHideTrigger, RevealHideTriggers, RevealProps, RevealShowTrigger } from './RevealProps'
import type { RevealContentProps } from './shells/ShellProps'
import type { CSSProperties, FC, ReactNode } from 'react'

import { makeAutoObservable, observable } from 'mobx'

import { exhaust } from '../utils/exhaust'
import { computePlacement, type RevealComputedPosition, type RevealPlacement } from './RevealPlacement'
import { DEBUG_REVEAL } from './RevealProps'

export const defaultShowDelay_whenRoot = 100
export const defaultHideDelay_whenRoot = 300

export const defaultShowDelay_whenNested = 0
export const defaultHideDelay_whenNested = 0

export class RevealState {
    static nextUID: number = 1

    static shared: { current: Maybe<RevealState> } = observable({ current: null }, { current: observable.ref })

    uid = RevealState.nextUID++

    onMiddleClickAnchor = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        this.log(`_ onMiddleClickAnchor`)
        // this.onLeftClick(ev)
    }

    onRightClickAnchor = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        this.log(`_ onRightClickAnchor`)
        this.onLeftClickAnchor(ev)
    }

    onLeftClickAnchor = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        this.log(`_ onLeftClickAnchor (visible: ${this.isVisible ? '🟢' : '🔴'})`)
        const closed = !this.isVisible
        if (closed) {
            if (this.shouldRevealOnAnchorClick) {
                this.open()
                ev.stopPropagation()
            }
        } else {
            if (this.shouldHideOnAnchorClick) {
                this.close()
                ev.stopPropagation()
            }
        }
    }

    _mouseDown = false
    onMouseDownAnchor = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        this.log(`_ onMouseDownAnchor`)
        this._mouseDown = true
    }

    onMouseUpAnchor = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        this.log(`_ onMouseUpAnchor`)
        this._mouseDown = false
    }

    /**
     * manuall assigned here on init so it can be made observable
     * on its own, without the need to make the entire props observable
     * so we can then hot-reload it nicely and have a nicer dev experience
     */
    // contentFn: () => ReactNode
    contentFn: FC<NO_PROPS>

    /** props to pass  */
    get revealContentProps(): RevealContentProps {
        return { reveal: this }
    }

    constructor(
        //
        public p: RevealProps,
        public parents: RevealState[],
    ) {
        // see comment above
        this.contentFn = (): ReactNode => p.content({ reveal: this })

        // 💬 2024-03-06 YIKES !!
        // | Reveal UI was causing
        // |
        // | 📈 const stop = spy((ev) => {
        // | 📈     console.log(`[🤠] ev`, ev)
        // | 📈 })
        makeAutoObservable(this, { uid: false, p: false })
        // | 📈 stop()
    }

    // ------------------------------------------------
    inAnchor = false
    inTooltip = false
    subRevealsCurrentlyVisible = new Set<number>()

    /** how deep in the reveal stack we are */
    get ix(): number {
        return this.parents.length
    }

    get debugColor(): CSSProperties {
        return {
            borderLeft: this.inAnchor ? `3px solid red` : undefined,
            borderTop: this.inTooltip ? `3px solid cyan` : undefined,
            borderBottom: this.subRevealsCurrentlyVisible.size > 0 ? `3px solid orange` : undefined,
        }
    }

    /** toolip is visible if either inAnchor or inTooltip */
    get isVisible(): boolean {
        if (this._lock) return true
        return this.inAnchor || this.inTooltip || this.subRevealsCurrentlyVisible.size > 0
    }

    // ????? -------------------------------------------------------------
    get shouldHideOtherRevealWhenRevealed(): boolean {
        const current = RevealState.shared.current
        if (current == null) return false
        if (current === this) return false
        if (this.parents.includes(current)) return false
        if (current.p.defaultVisible) return false
        return true
    }

    // HIDE triggers ------------------------------------------------------
    get hideTriggers(): RevealHideTriggers {
        if (this.p.hideTriggers) return this.p.hideTriggers
        if (this.revealTrigger === 'none') return { none: true }
        if (this.revealTrigger === 'click') return { clickAnchor: true, clickOutside: true, escapeKey: true, blurAnchor: true }
        if (this.revealTrigger === 'clickAndHover') return { clickAnchor: true, clickOutside: true, clickAndMouseOutside: true, escapeKey: true, blurAnchor: true } // prettier-ignore
        if (this.revealTrigger === 'hover') return { mouseOutside: true }
        if (this.revealTrigger === 'pseudofocus') return { clickAnchor: true, clickOutside: true, escapeKey: true }
        exhaust(this.revealTrigger)
    }

    // 🔶 not sure when we need this one?
    // get shouldHideOnTooltipBlur(): boolean {
    //     return false
    // }

    get shouldHideOnAnchorBlur(): boolean {
        return this.hideTriggers.blurAnchor ?? false
    }

    get shouldHideOnKeyboardEscape(): boolean {
        return this.hideTriggers.escapeKey ?? false
    }

    get shouldHideOnAnchorClick(): boolean {
        return this.hideTriggers.clickAnchor ?? false
    }

    get shouldHideOnAnchorOrTooltipMouseLeave(): boolean {
        return this.hideTriggers.mouseOutside ?? this.hideTriggers.clickAndMouseOutside ?? false
    }

    get shouldHideOnClickOutside(): boolean {
        return this.hideTriggers.clickOutside ?? this.hideTriggers.clickAndMouseOutside ?? false
    }

    // REVEAL triggers ------------------------------------------------------
    get revealTrigger(): RevealShowTrigger {
        return this.p.trigger ?? 'click'
    }

    get shouldRevealOnAnchorFocus(): boolean {
        if (this.revealTrigger == 'none') return false
        if (this.shouldRevealOnAnchorClick) return true
        if (this.revealTrigger === 'pseudofocus') return true
        return false
    }

    get shouldRevealOnKeyboardEnterOrLetterWhenAnchorFocused(): boolean {
        if (this.revealTrigger == 'none') return false
        if (this.revealTrigger === 'pseudofocus') return true
        return false
    }

    get shouldRevealOnAnchorClick(): boolean {
        if (this.revealTrigger == 'none') return false
        return (
            this.revealTrigger == 'pseudofocus' ||
            this.revealTrigger == 'click' || //
            this.revealTrigger == 'clickAndHover'
        )
    }

    get shouldRevealOnAnchorHover(): boolean {
        if (this.revealTrigger == 'none') return false
        return (
            this.revealTrigger == 'hover' || //
            this.revealTrigger == 'clickAndHover'
        )
    }

    // possible triggers ------------------------------------------------------
    get showDelay(): number {
        return this.p.showDelay ?? (this.ix ? defaultShowDelay_whenNested : defaultShowDelay_whenRoot)
    }

    get hideDelay(): number {
        return this.p.hideDelay ?? (this.ix ? defaultHideDelay_whenNested : defaultHideDelay_whenRoot)
    }

    get placement(): RevealPlacement {
        return this.p.placement ?? 'auto'
    }

    // position --------------------------------------------
    /** alias for this.tooltipPosition */
    get pos(): RevealComputedPosition {
        return this.tooltipPosition
    }

    get posCSS(): CSSProperties {
        const pos = this.pos
        return {
            position: 'absolute',
            zIndex: 99999999,
            top: pos.top != null ? toCss(pos.top) : undefined,
            left: pos.left != null ? toCss(pos.left) : undefined,
            bottom: pos.bottom != null ? toCss(pos.bottom) : undefined,
            right: pos.right != null ? toCss(pos.right) : undefined,
            width: pos.width != null ? toCss(pos.width) : undefined,
            height: pos.height != null ? toCss(pos.height) : undefined,
            overflow: 'auto',
            transform: pos.transform,
        }
    }
    tooltipPosition: RevealComputedPosition = { top: 0, left: 0 }
    setPosition = (rect: DOMRect): void => {
        this.tooltipPosition = computePlacement(this.placement, rect)
    }

    // lock --------------------------------------------
    _lock = false
    toggleLock = (): void => {
        this._lock = !this._lock
    }

    // UI --------------------------------------------
    get defaultCursor(): string {
        if (!this.shouldRevealOnAnchorHover) return 'cursor-pointer'
        return 'cursor-help'
    }

    // anchor --------------------------------------------
    enterAnchorTimeoutId: NodeJS.Timeout | null = null
    leaveAnchorTimeoutId: NodeJS.Timeout | null = null

    onMouseEnterAnchor = (): void => {
        this.log(`_ onMouseEnterAnchor`)
        /* 🔥 */ if (!this.shouldRevealOnAnchorHover) return
        /* 🔥 */ if (this.isVisible) return
        /* 🔥 */ if (RevealState.shared.current) return this.open()
        this._resetAllAnchorTimouts()
        this.enterAnchorTimeoutId = setTimeout(this.open, this.showDelay)
    }

    onMouseLeaveAnchor = (): void => {
        this.log(`_ onMouseLeaveAnchor`)
        if (!this.shouldHideOnAnchorOrTooltipMouseLeave) return
        this._resetAllAnchorTimouts()
        this.leaveAnchorTimeoutId = setTimeout(this.close, this.hideDelay)
    }

    // ---
    open = (): void => {
        this.log(`🚨 open`)
        const wasVisible = this.isVisible
        /* 🔥 🔴 */ if (this.shouldHideOtherRevealWhenRevealed) RevealState.shared.current?.close()
        /* 🔥 */ RevealState.shared.current = this
        this._resetAllAnchorTimouts()
        this.inAnchor = true

        if (!wasVisible) this.p.onRevealed?.()
    }

    close = (): void => {
        this.log(`🚨 close`)
        const wasVisible = this.isVisible
        /* 🔥 */ if (RevealState.shared.current == this) RevealState.shared.current = null
        this._resetAllAnchorTimouts()
        this._resetAllTooltipTimouts()
        this.inAnchor = false
        this.inTooltip = false

        // if we're closing, all our children also are closed.
        // so we can safely clean the state and forget about previous
        this.subRevealsCurrentlyVisible.clear()

        // 🔴 are children closed properly?

        if (wasVisible) this.p.onHidden?.()
    }

    // ---
    private _resetAllAnchorTimouts = (): void => {
        this._resetAnchorEnterTimeout()
        this._resetAnchorLeaveTimeout()
    }

    private _resetAnchorEnterTimeout = (): void => {
        if (this.enterAnchorTimeoutId) {
            clearTimeout(this.enterAnchorTimeoutId)
            this.enterAnchorTimeoutId = null
        }
    }

    private _resetAnchorLeaveTimeout = (): void => {
        if (this.leaveAnchorTimeoutId) {
            clearTimeout(this.leaveAnchorTimeoutId)
            this.leaveAnchorTimeoutId = null
        }
    }

    // tooltip --------------------------------------------
    enterTooltipTimeoutId: NodeJS.Timeout | null = null
    leaveTooltipTimeoutId: NodeJS.Timeout | null = null

    onMouseEnterTooltip = (): void => {
        this.log(`_ onMouseEnterTooltip`)
        this._resetAllTooltipTimouts()
        this.enterTooltipTimeoutId = setTimeout(this.enterTooltip, this.showDelay)
    }

    onMouseLeaveTooltip = (): void => {
        this.log(`_ onMouseLeaveTooltip`)
        if (!this.shouldHideOnAnchorOrTooltipMouseLeave) return
        this._resetAllTooltipTimouts()
        this.leaveTooltipTimeoutId = setTimeout(this.leaveTooltip, this.hideDelay)
    }

    // ---
    enterTooltip = (): void => {
        this._resetAllTooltipTimouts()
        for (const [ix, p] of this.parents.entries()) p.enterChildren(ix)
        this.log(`🔶 enterTooltip`)
        this.inTooltip = true
    }

    leaveTooltip = (): void => {
        this._resetAllTooltipTimouts()
        for (const [ix, p] of this.parents.entries()) p.leaveChildren(ix)
        this.log(`🔶 leaveTooltip`)
        this.inTooltip = false
    }

    // ---
    private _resetAllTooltipTimouts = (): void => {
        this._resetTooltipEnterTimeout()
        this._resetTooltipLeaveTimeout()
    }

    private _resetTooltipEnterTimeout = (): void => {
        if (this.enterTooltipTimeoutId) {
            clearTimeout(this.enterTooltipTimeoutId)
            this.enterTooltipTimeoutId = null
        }
    }

    private _resetTooltipLeaveTimeout = (): void => {
        if (this.leaveTooltipTimeoutId) {
            clearTimeout(this.leaveTooltipTimeoutId)
            this.leaveTooltipTimeoutId = null
        }
    }

    // STACK RELATED STUFF --------------------
    enterChildren = (depth: number): void => {
        // this._resetAllChildrenTimouts()
        this.log(`[🤠] entering children (of ${this.ix}) ${depth}`)
        this.subRevealsCurrentlyVisible.add(depth)
    }

    leaveChildren = (depth: number): void => {
        this.log(`[🤠] leaving children (of ${this.ix}) ${depth}`)
        // this._resetAllChildrenTimouts()
        this.subRevealsCurrentlyVisible.delete(depth)
    }

    onFocusAnchor = (ev: React.FocusEvent<unknown>): void => {
        this.log(`_ onFocusAnchor (neutralized: ${this._mouseDown})`)

        // 🔶 when we click, we get
        // focus event -> menu opens -> left click event -> visible is already true -> left click goes into the wrong branch
        // so we prevent the conflict by disabling focus triggers when mouse is down
        if (this._mouseDown) return

        if (!this.shouldRevealOnAnchorFocus) return

        // if (ev.relatedTarget != null && !(ev.relatedTarget instanceof Window)) // 🔶 not needed anymore?
        this.open()
        ev.stopPropagation()
        ev.preventDefault()
    }

    onBlurAnchor = (): void => {
        this.log(`_ onBlurAnchor`)
        if (!this.shouldHideOnAnchorBlur) return
        this.close()
    }

    onAnchorKeyDown = (ev: React.KeyboardEvent): void => {
        this.log(`_ onAnchorOrShellKeyDown`)

        // 🔴🔴  WE MAY GET A SIMILAR RACE CONDITION WITH FOCUS/BLUR & this.isVisible HERE (but it probably doesn't matter)
        // 🔴🔴🔴 Actually we get one and it's annoying:
        // enter in option list => toggle => close => calls onAnchorKeyDown with visible now false => re-opens :(
        if (this.shouldRevealOnKeyboardEnterOrLetterWhenAnchorFocused && !this.isVisible) {
            this.log(`_ onAnchorOrShellKeyDown: maybe open (visible: ${this.isVisible})`)
            const letterCode = ev.keyCode
            const isLetter = letterCode >= 65 && letterCode <= 90
            const isEnter = ev.key === 'Enter'
            if (isLetter || isEnter) {
                this.open()
                ev.preventDefault()
                ev.stopPropagation()
                return
            }
        }

        // 🔴🔴  WE MAY GET A SIMILAR RACE CONDITION WITH FOCUS/BLUR & this.isVisible HERE (but it probably doesn't matter)
        if (ev.key === 'Escape' && this.isVisible && this.shouldHideOnKeyboardEscape) {
            this.log(`_ onAnchorOrShellKeyDown: close via Escape (visible: ${this.isVisible})`)
            this.close()
            // this.anchorRef.current?.focus()
            ev.preventDefault()
            ev.stopPropagation()
            return
        }
    }

    onBackdropClick = (ev: React.MouseEvent<unknown> | MouseEvent): void => {
        this.log(`_ onBackdropClick`)
        if (this.shouldHideOnClickOutside) this.close()
    }

    log(msg: string): void {
        if (!DEBUG_REVEAL) return
        console.log(`🌑`, this.ix, msg)
    }

    // 🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴🔴
    // Close pop-up if too far outside
    // 💬 2024-02-29 rvion:
    // | this code was a good idea; but it's really
    // | not pleasant when working mostly with keyboard and using tab to open selects.
    // | as soon as the moouse move just one pixel, popup close.
    // |  =>  commenting it out until we find a solution confortable in all cases

    // window.addEventListener('mousemove', this.MouseMoveTooFar, true)

    // selectUI state:
    //   - hasMouseEntered: boolean = false
    //   - onRootMouseDown: this.hasMouseEntered = true
    //   - closeMenu:

    // MouseMoveTooFar = (event: MouseEvent): void => {
    //     const popup = this.popupRef?.current
    //     const anchor = this.anchorRef?.current

    //     if (!popup || !anchor || !this.hasMouseEntered) {
    //         return
    //     }

    //     const x = event.clientX
    //     const y = event.clientY

    //     // XXX: Should probably be scaled by UI scale
    //     const maxDistance = 75

    //     if (
    //         // left
    //         popup.offsetLeft - x > maxDistance ||
    //         // top
    //         popup.offsetTop - y > maxDistance ||
    //         // right
    //         x - (popup.offsetLeft + popup.offsetWidth) > maxDistance ||
    //         // bottom
    //         y - (popup.offsetTop + popup.offsetHeight) > maxDistance
    //     ) {
    //         this.closeMenu()
    //     }
    // }
}

function toCss(x: number | string): string {
    return typeof x == 'number' ? `${Math.round(x)}px` : x
}
