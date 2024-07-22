import type { NO_PROPS } from '../../csuite/types/NO_PROPS'
import type { FC } from 'react'

import { observer } from 'mobx-react-lite'

import { KEYS } from '../../app/shortcuts/shorcutKeys'
import { ComboUI } from '../../csuite/accelerators/ComboUI'
import { Button } from '../../csuite/button/Button'
import { InputBoolCheckboxUI } from '../../csuite/checkbox/InputBoolCheckboxUI'
import { InputBoolToggleButtonUI } from '../../csuite/checkbox/InputBoolToggleButtonUI'
import { FormUI } from '../../csuite/form/FormUI'
import { WidgetLabelContainerUI } from '../../csuite/form/WidgetLabelContainerUI'
import { Frame } from '../../csuite/frame/Frame'
import { InputNumberUI } from '../../csuite/input-number/InputNumberUI'
import { InputStringUI } from '../../csuite/input-string/InputStringUI'
import { FormHelpTextUI } from '../../csuite/inputs/shims'
import { BasicShelfUI } from '../../csuite/shelf/ShelfUI'
import { parseFloatNoRoundingErr } from '../../csuite/utils/parseFloatNoRoundingErr'
import { PanelHeaderUI } from '../../csuite/wrappers/PanelHeader'
import { Panel, type PanelHeader } from '../../router/Panel'
import { useSt } from '../../state/stateContext'
import { openInVSCode } from '../../utils/electron/openInVsCode'
import { PanelComfyHostsUI } from '../PanelComfyHosts/Panel_ComfyUIHosts'

export type ConfigMode = 'hosts' | 'input' | 'interface' | 'legacy' | 'system' | 'theme'

export const PanelConfig = new Panel({
    name: 'Config',
    widget: (): FC<NO_PROPS> => PanelConfigUI,
    header: (p): PanelHeader => ({ title: 'Config', icon: undefined }),
    def: (): PanelConfigProps => ({}),
})

export type PanelConfigProps = NO_PROPS

export const PanelConfigUI = observer(function Panel_Config_(p: PanelConfigProps) {
    let page
    switch (cushy.configMode) {
        case 'hosts':
            page = <PanelComfyHostsUI />
            break
        case 'input':
            page = <>Not implemented</>
            break
        case 'interface':
            page = <FormUI tw='flex-1' field={cushy.preferences.interface} />
            break
        case 'legacy':
            page = <LegacyOptions />
            break
        case 'system':
            page = <FormUI tw='flex-1' field={cushy.preferences.system} />
            break
        case 'theme':
            page = <FormUI tw='flex-1' field={cushy.theme} />
            break
    }

    const ConfigModeButton = (p: { mode: ConfigMode }): JSX.Element => {
        return (
            <InputBoolToggleButtonUI //
                tw='capitalize h-10'
                value={cushy.configMode == p.mode}
                text={p.mode}
                onValueChange={(_) => {
                    cushy.configMode = p.mode
                }}
            />
        )
    }

    return (
        <div className='flex flex-1 flex-col h-full'>
            <PanelHeaderUI></PanelHeaderUI>
            <div tw='flex flex-1 flex-row overflow-clip'>
                <BasicShelfUI anchor='left'>
                    <div tw='flex flex-col p-2 gap'>
                        <ConfigModeButton mode='legacy' />
                        <Frame
                            tw={[
                                // 'overflow-auto',
                                // Join stuff and remove borders, can probably be a component or tw macro
                                '[&>*]:!border-none',
                            ]}
                            border
                            // style={{ overflow: ' !important' }}
                        >
                            <ConfigModeButton mode='interface' />
                            <ConfigModeButton mode='input' />
                            <ConfigModeButton mode='theme' />
                        </Frame>
                        <Frame
                            tw={[
                                // 'overflow-auto',
                                // Join stuff and remove borders, can probably be a component or tw macro
                                '[&>*]:!border-none',
                            ]}
                            border
                        >
                            <ConfigModeButton mode='system' />
                            <ConfigModeButton mode='hosts' />
                        </Frame>
                    </div>
                </BasicShelfUI>

                <div tw='flex flex-1 p-2 overflow-scroll'>{page}</div>
            </div>

            {/* <Panel_ComfyUIHosts /> */}
        </div>
    )
})

export const FieldUI = observer(function FieldUI_(p: {
    required?: boolean
    label?: string
    help?: string
    className?: string
    children: React.ReactNode
}) {
    return (
        <div className={p.className} tw='flex gap-2 items-center'>
            <WidgetLabelContainerUI justify>
                <label tw='whitespace-nowrap'>{p.label}</label>
            </WidgetLabelContainerUI>
            {p.children}
            {p.required && <FormHelpTextUI tw='join-item'>Required</FormHelpTextUI>}
        </div>
    )
})

const LegacyOptions = observer(function LegacyOptions_() {
    const st = useSt()
    const config = cushy.configFile

    return (
        <div tw='flex flex-col'>
            <div className='divider'>Legacy config fields to migrate 👇:</div>
            <div tw='flex flex-col gap-1'>
                <FieldUI label='Config file path'>
                    <Button look='link' icon='mdiOpenInNew' expand onClick={() => openInVSCode(st, config.path)}>
                        {config.path}
                    </Button>
                </FieldUI>
                <FieldUI label='Set tags file'>
                    <input
                        tw='csuite-basic-input w-full'
                        name='tagFile'
                        value={config.get('tagFile') ?? 'completions/danbooru.csv'}
                        onChange={(ev) => config.update({ tagFile: ev.target.value })}
                    />
                </FieldUI>
                <FieldUI label='Your github username'>
                    <input //
                        tw='csuite-basic-input w-full'
                        value={config.value.githubUsername}
                        onChange={(ev) => config.update({ githubUsername: ev.target.value })}
                        name='githubUsername'
                    />
                </FieldUI>
                <FieldUI label='Number slider speed multiplier'>
                    <InputNumberUI //
                        placeholder='Number slider speed multiplier'
                        softMin={0.3}
                        softMax={3}
                        step={0.1}
                        value={config.value.numberSliderSpeed ?? 1}
                        mode='float'
                        onValueChange={(val) => config.update({ numberSliderSpeed: val })}
                    />
                </FieldUI>
                <FieldUI label='Enable TypeChecking Default Apps'>
                    <InputBoolCheckboxUI
                        onValueChange={(next) => config.update({ enableTypeCheckingBuiltInApps: next })}
                        value={config.value.enableTypeCheckingBuiltInApps ?? false}
                    />
                </FieldUI>
                <FieldUI label='Check update every X minutes'>
                    <input //
                        tw='csuite-basic-input w-full'
                        type='number'
                        placeholder='48'
                        name='galleryImageSize'
                        value={config.value.checkUpdateEveryMinutes ?? 5}
                        min={0.5}
                        onChange={(ev) => {
                            const next = ev.target.value
                            config.update({
                                checkUpdateEveryMinutes:
                                    typeof next === 'string' //
                                        ? parseFloatNoRoundingErr(next, 2)
                                        : typeof next === 'number'
                                          ? next
                                          : 5,
                            })
                        }}
                    />
                </FieldUI>
                <FieldUI label='OpenRouter API KEY'>
                    <InputStringUI
                        icon='mdiKey'
                        type='password'
                        getValue={() => config.value.OPENROUTER_API_KEY ?? ''}
                        setValue={(next) => config.update({ OPENROUTER_API_KEY: next })}
                    />
                </FieldUI>
                <FieldUI label='Configure hosts:'>
                    <Button icon={'mdiOpenInNew'} onClick={() => st.layout.FOCUS_OR_CREATE('Hosts', {})}>
                        Open Hosts page
                        <ComboUI combo={KEYS.openPage_Hosts} />
                    </Button>
                </FieldUI>
                <FieldUI label='Local folder to save favorites:'>
                    <InputStringUI
                        icon='mdiFolderStar'
                        getValue={() => config.value.favoriteLocalFolderPath ?? ''}
                        setValue={(next) => config.update({ favoriteLocalFolderPath: next })}
                    />
                </FieldUI>
            </div>
        </div>
    )
})
