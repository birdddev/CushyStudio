import type { NO_PROPS } from '../../csuite/types/NO_PROPS'
import type { FC } from 'react'

import { observer } from 'mobx-react-lite'

import { InputBoolToggleButtonUI } from '../../csuite/checkbox/InputBoolToggleButtonUI'
import { FormUI } from '../../csuite/form/FormUI'
import { Frame } from '../../csuite/frame/Frame'
import { BasicShelfUI } from '../../csuite/shelf/ShelfUI'
import { Panel, type PanelHeader } from '../../router/Panel'
import { usePanel } from '../../router/usePanel'
import { PanelComfyHostsUI } from '../PanelComfyHosts/Panel_ComfyUIHosts'
import { LegacyOptions } from './LegacyOptions'

export type ConfigMode = 'hosts' | 'input' | 'interface' | 'legacy' | 'system' | 'theme' | 'TEMP'

export const PanelConfig = new Panel({
    name: 'Config',
    widget: (): FC<NO_PROPS> => PanelConfigUI,
    header: (p): PanelHeader => ({ title: 'Config', icon: undefined }),
    def: (): PanelConfigProps => ({}),
})

export type PanelConfigProps = NO_PROPS

const configTabs: ConfigMode[] = ['hosts', 'input', 'interface', 'legacy', 'system', 'theme', 'TEMP']

export const PanelConfigUI = observer(function Panel_Config_(p: PanelConfigProps) {
    const panel = usePanel()

    const panelState = panel.usePersistentModel('abcd', (ui) =>
        ui.fields({
            configMode: ui.selectOneV2(configTabs),
            shelfSize: ui.int(),
        }),
    )
    const modeField = panelState.fields.configMode
    const configMode = modeField.value.id
    const page: JSX.Element = ((): JSX.Element => {
        const mode = configMode
        if (mode === 'hosts') return <PanelComfyHostsUI />
        if (mode === 'input')
            return cushy.theme.show(({ fields: f }) => [f.inputBorder, f.inputContrast], { className: 'w-full' })
        if (mode === 'TEMP') return <div>{panelState.render()}</div>
        if (mode === 'interface') return <FormUI tw='flex-1' field={cushy.preferences.interface} />
        if (mode === 'legacy') return <LegacyOptions />
        if (mode === 'system') return <FormUI tw='flex-1' field={cushy.preferences.system} />
        if (mode === 'theme') return <FormUI tw='flex-1' field={cushy.theme} />
        return <>❌ unknown tab</>
    })()

    return (
        <Frame>
            <Frame expand row>
                {/* <PanelHeaderUI></PanelHeaderUI> */}
                <BasicShelfUI anchor='left'>
                    <BasicShelfUI.Column /* 🌶️👋 < components can now be nested */>
                        <ConfigTabButtonUI field={modeField} mode='legacy' />
                        <BasicShelfUI.Group hueShift={100} /* 🌶️👋 */>
                            <ConfigTabButtonUI field={modeField} mode='interface' />
                            <ConfigTabButtonUI field={modeField} mode='input' />
                            <ConfigTabButtonUI field={modeField} mode='theme' />
                        </BasicShelfUI.Group>
                        <BasicShelfUI.Group hueShift={200}>
                            <ConfigTabButtonUI field={modeField} mode='system' />
                            <ConfigTabButtonUI field={modeField} mode='hosts' />
                        </BasicShelfUI.Group>
                        <BasicShelfUI.Group hueShift={300}>
                            <ConfigTabButtonUI field={modeField} mode='TEMP' />
                        </BasicShelfUI.Group>
                    </BasicShelfUI.Column>
                </BasicShelfUI>
                <div tw='flex flex-1 p-2 overflow-scroll'>{page}</div>
            </Frame>
        </Frame>
    )
})

const ConfigTabButtonUI = observer(function ConfigTabButtonUI_(p: {
    //
    mode: ConfigMode
    field: X.SelectOne_<ConfigMode>
}) {
    return (
        <InputBoolToggleButtonUI //
            tw='capitalize h-10'
            value={p.field.is(p.mode)}
            text={p.mode}
            onValueChange={(_) => p.field.setId(p.mode)}
        />
    )
})
