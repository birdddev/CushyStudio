import { observer } from 'mobx-react-lite'
import { useSt } from '../../FrontStateCtx'
import { GalleryHoveredPreviewUI } from '../galleries/GalleryHoveredPreviewUI'
import { VerticalGalleryUI } from '../galleries/VerticalGalleryUI'
import { ScrollablePaneUI } from '../scrollableArea'
import { WorkspaceUI } from '../workspace/WorkspaceUI'
import { AppBarUI } from './AppBarUI'

export const CushyUI = observer(function CushyUI_() {
    const st = useSt()
    const action = st.currentAction
    return (
        <div className='col grow h100'>
            <AppBarUI />
            <div className='flex flex-grow'>
                <VerticalGalleryUI />
                <ScrollablePaneUI className='shrink-0 flex-grow'>
                    <GalleryHoveredPreviewUI />
                    {action == null ? ( //
                        <WorkspaceUI />
                    ) : action.type === 'paint' ? null : (
                        // <WidgetPaintUI uri={action.img.localURL ?? action.img.comfyURL ?? '🔴'} />
                        <WorkspaceUI />
                    )}
                </ScrollablePaneUI>
            </div>
            {/* {st.showAllMessageReceived ? <DebugMessagesUI /> : null} */}
            {/* <pre>{JSON.stringify(st.db.store)}</pre> */}
        </div>
    )
})

// export const DebugMessagesUI = observer(function DebugMessagesUI_(p: {}) {
//     const st = useSt()
//     return (
//         <div className='shadow-xl' style={{ height: '10rem', resize: 'horizontal', overflow: 'auto' }}>
//             {st.msgGroupper.itemsToShow.map((msg, ix) => (
//                 <div key={msg.uid} className='w-full flex gap-2' id={msg.uid.toString()}>
//                     <div style={{ width: '1rem' }}>{renderMessageFromExtensionAsEmoji(msg)}</div>
//                     <div className='shrink-0' style={{ width: '5rem' }}>
//                         {msg.type}
//                     </div>
//                     <div style={{ color: 'gray', textOverflow: 'ellipsis' }}>
//                         {/*  */}
//                         {JSON.stringify(msg)}
//                     </div>
//                 </div>
//             ))}
//         </div>
//     )
// })
