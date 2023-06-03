import { observer } from 'mobx-react-lite'
import { useDrag } from 'react-dnd'
import { ImageL } from 'src/models/Image'
import { useSt } from '../../FrontStateCtx'
import { ItemTypes } from './DnDItemTypes'

export const GalleryImageUI = observer(function ImageUI_(p: { img: ImageL }) {
    const image = p.img
    const st = useSt()
    const [{ opacity }, dragRef] = useDrag(
        () => ({
            type: ItemTypes.Image,
            item: { image },
            collect: (monitor) => ({
                opacity: monitor.isDragging() ? 0.5 : 1,
            }),
        }),
        [],
    )
    return (
        <>
            <img
                className='scale-in-center'
                ref={dragRef}
                loading='lazy'
                onMouseEnter={() => (st.hovered = image)}
                onMouseLeave={() => {
                    if (st.hovered === image) st.hovered = null
                }}
                style={{ objectFit: 'contain', width: '64px', height: '64px', opacity, padding: '0.2rem', borderRadius: '.5rem' }}
                onClick={() => (st.lightBox.opened = true)}
                src={image.comfyURL}
            />
        </>
    )
})
