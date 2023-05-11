import { FlowDefinitionID } from 'src/back/FlowDefinition'
import { ImageInfos } from 'src/core/GeneratedImageSummary'

export type UIAction =
    | { type: 'paint'; img: ImageInfos }
    | { type: 'form'; form: any }
    | { type: 'any'; form: any }
    | { type: 'flow'; flowID: FlowDefinitionID }