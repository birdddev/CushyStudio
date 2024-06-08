import { observer } from 'mobx-react-lite'

import { SpacerUI } from '../../controls/widgets/spacer/SpacerUI'
import { useSt } from '../../state/stateContext'
import { PanelHeaderUI } from '../PanelHeader'
import { FormAsDropdownConfigUI } from './FormAsDropdownConfigUI'
import { GalleryImageGridUI } from './GalleryImageGridUI'
import { GallerySearchControlsUI } from './GallerySearchControlsUI'

export const Panel_Gallery = observer(function VerticalGalleryUI_(p: { uid?: number }) {
    const st = useSt()

    return (
        <div //
            className='flex flex-col h-full'
            style={{ background: st.galleryConf.value.galleryBgColor ?? undefined }}
        >
            <PanelHeaderUI>
                <GalleryPreferencesUI />
                <GallerySearchControlsUI />
                <SpacerUI />
            </PanelHeaderUI>
            <GalleryImageGridUI />
        </div>
    )
})

export const GalleryPreferencesUI = observer(function GalleryPreferencesUI_(p: {}) {
    return <FormAsDropdownConfigUI title='Gallery Options' form={cushy.galleryConf} />
})
