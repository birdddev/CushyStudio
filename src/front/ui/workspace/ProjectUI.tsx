import * as I from '@rsuite/icons'
import { observer } from 'mobx-react-lite'
import { Divider, IconButton, Input, Panel } from 'rsuite'
import { useProject } from '../../ProjectCtx'
import { GraphUI } from './GraphUI'

export const ProjectUI = observer(function ProjectUI_(p: {}) {
    const project = useProject()
    return (
        <Panel>
            <div className='row'>
                <Input
                    value={project.data.name}
                    onChange={(next) => project.update({ name: next })}
                    placeholder='Project name'
                    name='title'
                />
                <IconButton appearance='subtle' onClick={() => project.delete()} icon={<I.Trash />} />
            </div>
            <Divider />
            <div className='row'>
                <div className='flex flex-col items-start'>
                    {/* <EmptyGraphUI /> */}
                    <GraphUI graph={project.rootGraph.item} depth={1} />
                    {/* {project.steps.map((step) => i(
                        <StepUI step={step} key={step.id} />
                    ))} */}
                    {/* {project.groupper.msgGroups.map((group, groupIx) => {
                    return (
                        <div
                        //
                        key={groupIx}
                        className={`relative [width:100%] group-of-${group.groupType}`}
                        style={{
                            overflowX: 'auto',
                        }}
                        >
                        <div style={{ flexWrap: group.wrap ? 'wrap' : undefined }} className='flex row gap-2'>
                        {group.uis}
                            </div>
                        </div>
                    )
                })} */}
                </div>
            </div>
        </Panel>
    )
})
