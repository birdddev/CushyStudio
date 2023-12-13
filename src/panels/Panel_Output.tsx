import { observer } from 'mobx-react-lite'
import { AppIllustrationUI } from 'src/cards/fancycard/AppIllustrationUI'
import { OutputPreviewUI, OutputUI } from 'src/outputs/OutputUI'
import { InputNumberUI } from 'src/rsuite/InputNumberUI'
import { RevealUI } from 'src/rsuite/RevealUI'
import { FieldAndLabelUI } from 'src/widgets/misc/FieldAndLabelUI'
import { useSt } from '../state/stateContext'
import { StepOutputsHeaderV2UI } from 'src/outputs/StepOutputsV2UI'

const mode: 'H' | 'V' = 1 - 1 == 0 ? 'V' : 'H'
const dir = mode === 'H' ? 'flex-col' : 'flex-row'

export const LatentIfLastUI = observer(function LatentIfLastUI_(p: {}) {
    const st = useSt()
    const lastImage = st.db.media_images.last()
    const latent = st.latentPreview
    if (latent == null) return null
    if (lastImage == null || latent.receivedAt > lastImage.createdAt)
        return (
            <img //
                tw='absolute bottom-0 right-0 shadow-xl z-50'
                style={{ width: st.latentSizeStr, height: st.latentSizeStr, objectFit: 'contain' }}
                src={latent.url}
                alt='last generated image'
            />
        )
})

export const Panel_Output = observer(function Panel_Output_(p: {}) {
    const st = useSt()
    const selectedStep = st.focusedStepL
    if (selectedStep == null) return null
    const out1 = st.hovered ?? st.focusedStepOutput ?? selectedStep.lastMediaOutput ?? st.db.media_images.last()
    const out2 = null
    const out3 = selectedStep.currentlyExecutingOutput
    return (
        <>
            <div
                tw={[
                    //
                    'flex flex-col',
                    'flex-grow h-full w-full',
                ]}
            >
                <SideOutputListUI />
                {/* <MainOutputHistoryUI /> */}
                {/* <div tw='flex-grow flex flex-row relative'> */}
                <div tw={['animate-in zoom-in-75', 'flex flex-grow overflow-auto']}>
                    {/*  */}
                    {out1 && <OutputUI output={out1} />}
                </div>
                <div tw={['flex flex-grow overflow-auto absolute pointer-events-none inset-0 z-30']}>
                    {out2 && <OutputUI output={out2} />}
                </div>
                {out3 && (
                    <div tw={['flex flex-grow overflow-auto top-20 absolute z-20 bg-base-100 bg-opacity-80']}>
                        <OutputUI output={out3} />
                    </div>
                )}
                <LatentIfLastUI />
                {/* </div> */}
            </div>
        </>
    )
})

export const SideOutputListUI = observer(function SideOutputListUI_(p: {}) {
    const st = useSt()
    const step = st.focusedStepL
    const size = st.historySizeStr
    return (
        <div tw={'flex flex-wrap gap-0.5 p-1 overflow-auto flex-shrink-0 bg-base-300 items-center'}>
            <RevealUI tw='self-start' disableHover>
                <div style={{ width: size, height: size, lineHeight: size }} tw='btn h-full'>
                    <span className='material-symbols-outlined'>settings</span>
                </div>
                <div tw='flex flex-col gap-1 p-2 shadow-xl'>
                    <FieldAndLabelUI label='Output Preview Size (px)'>
                        <InputNumberUI
                            style={{ width: '5rem' }}
                            mode={'int'}
                            min={32}
                            max={200}
                            onValueChange={(next) => (st.historySize = next)}
                            value={st.historySize}
                        />
                    </FieldAndLabelUI>
                    <FieldAndLabelUI label='Latent Size (%)'>
                        <InputNumberUI
                            style={{ width: '5rem' }}
                            mode={'int'}
                            min={3}
                            max={100}
                            onValueChange={(next) => (st.latentSize = next)}
                            value={st.latentSize}
                        />
                    </FieldAndLabelUI>
                </div>
            </RevealUI>
            {step && <StepOutputsHeaderV2UI step={step} />}
            {step?.outputs?.map((output, ix) => (
                <OutputPreviewUI key={ix} step={step} output={output} />
            ))}
        </div>
    )
})

// export const MainOutputHistoryUI = observer(function MainOutputHistoryUI_(p: {}) {
//     const st = useSt()
//     const steps = st.db.steps.getLastN(st.__TEMPT__maxStepsToShow)
//     const selectedStep = st.focusedStepL
//     const size = st.historySizeStr
//     return (
//         <div tw={[dir, 'flex gap-0.5 overflow-auto flex-shrink-0 bg-base-200 items-center']}>
//             <RevealUI disableHover>
//                 <div style={{ width: size, height: size, lineHeight: size }} tw='btn-accent btn h-full'>
//                     <span className='material-symbols-outlined'>history</span>
//                 </div>
//                 <div>
//                     <FieldAndLabelUI label='Size'>
//                         <InputNumberUI
//                             style={{ width: '5rem' }}
//                             mode={'int'}
//                             min={32}
//                             max={200}
//                             onValueChange={(next) => (st.historySize = next)}
//                             value={st.historySize}
//                         />
//                     </FieldAndLabelUI>
//                 </div>
//             </RevealUI>
//             <div tw={[dir, 'flex gap-1 overflow-auto']}>
//                 {steps.map((step) => {
//                     const selected = selectedStep === step
//                     return (
//                         <div
//                             tw={['cursor-pointer', selectedStep === step ? 'border-2 border-primary' : '']}
//                             onClick={() => (st.focusedStepID = step.id)}
//                             style={{
//                                 // 🔴
//                                 border: selected ? '4px solid white' : undefined,
//                                 width: size,
//                                 height: st.historySizeStr,
//                                 flexShrink: 0,
//                             }}
//                         >
//                             {step.appFile ? (
//                                 <AppIllustrationUI size={st.historySizeStr} card={step.appFile} />
//                             ) : (
//                                 <div style={{ width: st.historySizeStr, height: st.historySizeStr }}></div>
//                             )}
//                         </div>
//                     )
//                 })}
//             </div>
//         </div>
//     )
// })