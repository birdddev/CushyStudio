import type { RevealContentProps } from '../shells/ShellProps'
import type { ReactNode } from 'react'

import { observer } from 'mobx-react-lite'

import { simpleFactory } from '../../'
import { Frame, type FrameProps } from '../../frame/Frame'
import { RevealUI } from '../RevealUI'

export const RevealTestUI = observer(function RevealTestUI_(p: {}) {
    const anchor = (where: string, props?: FrameProps): JSX.Element => (
        <Frame border={20} base={20} tw='flex-1 text-center' {...props}>
            {where}
        </Frame>
    )

    const conf = simpleFactory.useLocalstorage(
        (ui) =>
            ui.fields({
                trigger: ui.selectOneV3(['hover', 'click', 'clickAndHover'], { default: { id: 'hover' } }),
                width: ui.pixel({ default: 200, step: 50 }),
                height: ui.pixel({ default: 120, step: 50 }),
                defaultVisible: ui.bool({ default: false }),
            }),
        '18nnMJ5aY',
    )

    const Content2 = observer(
        (p: { content: () => string }): JSX.Element => (
            <pre //
                style={{
                    width: `${conf.value.width}px`,
                    height: `${conf.value.height}px`,
                }}
                tw='bg-blue-500 text-black'
            >
                ({p.content()})
            </pre>
        ),
    )
    const Content = (p: RevealContentProps): JSX.Element => (
        <Content2 content={() => /* JSON.stringify(p.reveal.pos, null, 3) */ '🟢'} />
    )

    const NotForwardingProps: React.FC = () => anchor('NOT FORWARDING PROPS')

    return (
        <div tw='flex-1 flex flex-col m-24 gap-3'>
            {conf.render()}
            {conf.value.defaultVisible && (
                <RevealUI trigger='click' placement='bottomStart' content={Content} defaultVisible={conf.value.defaultVisible}>
                    {anchor('defaultVisible')}
                </RevealUI>
            )}
            {/* AUTO -------------------------- */}
            <Frame border base={5} tw='relative' style={{ height: '200px' }}>
                <RevealUI trigger={conf.value.trigger.id} placement='auto' tw='absolute top-8 left-8' content={Content}>
                    {anchor('auto')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} placement='auto' tw='absolute bottom-8 right-8' content={Content}>
                    {anchor('auto')}
                </RevealUI>
            </Frame>
            {/* AUTO -------------------------- */}
            <div tw='grid grid-cols-5 gap-0'>
                {/* top ---------------------------------------------- */}
                <div></div>
                <RevealUI trigger={conf.value.trigger.id} placement='topStart' content={Content}>
                    {anchor('topStart')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} placement='top' content={Content}>
                    {anchor('top')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} placement='topEnd' content={Content}>
                    {anchor('topEnd')}
                </RevealUI>
                <div></div>

                {/* ---------------------------------------------- */}
                <RevealUI trigger={conf.value.trigger.id} placement='leftStart' content={Content}>
                    {anchor('leftStart')}
                </RevealUI>
                <div></div>
                <div></div>
                <div></div>
                <RevealUI trigger={conf.value.trigger.id} placement='rightStart' content={Content}>
                    {anchor('rightStart')}
                </RevealUI>
                {/* ---------------------------------------------- */}
                <RevealUI trigger={conf.value.trigger.id} placement='left' content={Content}>
                    {anchor('left')}
                </RevealUI>
                <div></div>
                <RevealUI trigger={conf.value.trigger.id} relativeTo='#foo' placement='above' content={Content}>
                    {anchor('#foo')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} relativeTo='#bar' placement='above' content={Content}>
                    {anchor('#bar')}
                </RevealUI>
                <RevealUI
                    //
                    trigger={conf.value.trigger.id}
                    relativeTo='#bar'
                    placement='above'
                    shell='popup-lg'
                    content={Content}
                >
                    {anchor('#bar in popup')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} placement='right' content={Content}>
                    {anchor('right')}
                </RevealUI>
                {/* ---------------------------------------------- */}
                <RevealUI trigger={conf.value.trigger.id} placement='leftEnd' content={Content}>
                    {anchor('leftEnd')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} shell='popup-sm' placement='screen-top' content={Content}>
                    {anchor('popup-sm')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} shell='popup-lg' placement='screen-top' content={Content}>
                    {anchor('popup-lg')}
                </RevealUI>
                <div></div>
                <RevealUI trigger={conf.value.trigger.id} placement='rightEnd' content={Content}>
                    {anchor('rightEnd')}
                </RevealUI>
                {/* ---------------------------------------------- */}
                {/* bottom */}
                <div></div>
                <RevealUI trigger={conf.value.trigger.id} placement='bottomStart' content={Content}>
                    {anchor('bottomStart')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} placement='bottom' content={Content}>
                    {anchor('bottom')}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} placement='bottomEnd' content={Content}>
                    {anchor('bottomEnd')}
                </RevealUI>
                <div></div>
            </div>
            <RevealUI trigger={conf.value.trigger.id} placement='topStart' content={Content}>
                <NotForwardingProps />
            </RevealUI>
            <Frame row>
                <RevealUI trigger={conf.value.trigger.id} placement='top' content={Content}>
                    {anchor('focusable 1', { tabIndex: 1 })}
                </RevealUI>
                <RevealUI trigger={conf.value.trigger.id} placement='top' content={Content}>
                    {anchor('focusable 2', { tabIndex: 1 })}
                </RevealUI>
            </Frame>
            <RevealUI trigger={conf.value.trigger.id} placement='topStart' content={Content}>
                Text only
            </RevealUI>
            <RevealUI //
                trigger='click'
                shell='none'
                placement='mouse'
                content={Content}
                tw='h-52 w-52 bg-blue-300'
            >
                Mouse
            </RevealUI>
            <Frame id='foo' base={{ hueShift: 100, contrast: 0.1 }} style={{ height: '150px' }}>
                #foo
            </Frame>
            <Frame id='bar' base={{ hueShift: 200, contrast: 0.1 }} style={{ height: '150px' }}>
                #bar
            </Frame>
        </div>
    )
})
