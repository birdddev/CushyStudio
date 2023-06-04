import type { STATE } from '../front/state'
import type { Maybe } from '../utils/types'

import { makeAutoObservable } from 'mobx'
import { LiveTable } from './LiveTable'

// models
import { existsSync, readFileSync, writeFileSync } from 'fs'
import { AbsolutePath, RelativePath } from 'src/utils/fs/BrandedPaths'
import { ToolL, ToolT } from '../models/Tool'
import { ConfigL, ConfigT } from '../models/Config'
import { FolderL, FolderT } from '../models/Folder'
import { Foo } from '../models/Foo'
import { GraphL, GraphT } from '../models/Graph'
import { ImageL, ImageT } from '../models/Image'
import { ProjectL, ProjectT } from '../models/Project'
import { PromptL, PromptT } from '../models/Prompt'
import { SchemaL, SchemaT } from '../models/Schema'
import { StepL, StepT } from '../models/Step'
import { asRelativePath } from '../utils/fs/pathUtils'
import { LiveStore } from './LiveStore'
import { readableStringify } from '../utils/stringifyReadable'
import { ActionT, ActionL } from '../models/Action'

export type Indexed<T> = { [id: string]: T }

export class LiveDB {
    // live tables are expected to self register in this array
    // leave this lien at the top of the file
    _tables: LiveTable<any, any>[] = []

    relPath: RelativePath
    absPath: AbsolutePath

    // store ---------------------------------------------------------
    store: LiveStore = {}
    toJSON = (): LiveStore => this.store

    // tables ---------------------------------------------------------
    configs: LiveTable<ConfigT, ConfigL>
    schemas: LiveTable<SchemaT, SchemaL>
    tools: LiveTable<ToolT, ToolL>
    folders: LiveTable<FolderT, FolderL>
    images: LiveTable<ImageT, ImageL>
    projects: LiveTable<ProjectT, ProjectL>
    steps: LiveTable<StepT, StepL>
    prompts: LiveTable<PromptT, PromptL>
    graphs: LiveTable<GraphT, GraphL>
    actions: LiveTable<ActionT, ActionL>

    constructor(public st: STATE) {
        // 1. restore store if  it exists
        this.relPath = asRelativePath('./cushy.db')
        console.log('relpath:', this.relPath)
        this.absPath = this.st.resolveFromRoot(this.relPath)
        console.log('abspath:', this.absPath)
        const exists = existsSync(this.absPath)
        try {
            if (exists) this.store = JSON.parse(readFileSync(this.absPath, 'utf8'))
        } catch (error) {
            console.log(readFileSync(this.absPath, 'utf8'))
            console.log(error)
        }

        // 2. make it observable
        makeAutoObservable(this)

        // 3. create tables (after the store has benn made already observable)
        this.configs = new LiveTable(this, 'configs', ConfigL)
        this.schemas = new LiveTable(this, 'schemas', SchemaL)
        this.tools = new LiveTable(this, 'tools', ToolL)
        this.folders = new LiveTable(this, 'folders', FolderL)
        this.images = new LiveTable(this, 'images', ImageL)
        this.projects = new LiveTable(this, 'projects', ProjectL)
        this.steps = new LiveTable(this, 'steps', StepL)
        this.prompts = new LiveTable(this, 'prompts', PromptL)
        this.graphs = new LiveTable(this, 'graphs', GraphL)
        this.actions = new LiveTable(this, 'actions', ActionL)
        // this.msgs = new LiveTable(this, 'msgs', Foo)
    }

    saveTimeout: Maybe<NodeJS.Timeout> = null
    markDirty = () => {
        if (this.saveTimeout != null) return

        this.saveTimeout = setTimeout(() => {
            console.log('saving...')
            const data = this.store
            console.log('saving', data)
            writeFileSync(this.absPath, readableStringify(data, 3))
            this.saveTimeout = null
        }, 400)
    }

    // misc ---------------------------------------------------------
    get config(): ConfigL {
        return this.configs.getOrCreate('main-config', () => ({ id: 'main-config' }))
    }
    get schema(): SchemaL {
        return this.schemas.getOrCreate('main-schema', () => ({ id: 'main-schema', embeddings: [], spec: {} }))
    }

    /* reset the whole DB (🔴?) */
    reset = () => {
        for (const table of this._tables) table.clear()
        this.markDirty()
    }
}
