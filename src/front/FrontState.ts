import type { ComfyStatus } from '../types/ComfyWsPayloads'

import { Graph } from '../core/Graph'
import { Schema } from '../core/Schema'
import { makeAutoObservable } from 'mobx'
import {
    FromExtension_CushyStatus,
    FromExtension_ask,
    MessageFromExtensionToWebview,
    MessageFromWebviewToExtension,
} from '../types/MessageFromExtensionToWebview'
import { logger } from '../logger/logger'
import { exhaust } from '../utils/ComfyUtils'
import { Maybe } from '../utils/types'
import { ResilientSocketToExtension } from './ResilientCushySocket'
import { nanoid } from 'nanoid'
import { KnownWorkflow } from '../core/KnownWorkflow'
import { ImageInfos } from 'src/core/GeneratedImageSummary'

export class FrontState {
    uid = nanoid()
    received: MessageFromExtensionToWebview[] = []

    expandNodes: boolean = false
    flowDirection: 'down' | 'up' = 'up'
    showAllMessageReceived: boolean = true

    get itemsToShow() {
        // return this.received
        const max = 200
        const len = this.received.length
        const start = this.showAllMessageReceived ? 0 : Math.max(0, len - max)
        const items = this.received.slice(start)
        const ordered = this.flowDirection === 'up' ? items.reverse() : items
        return ordered
    }
    // group sequential items with similar types together
    get groupItemsToShow(): MessageFromExtensionToWebview[][] {
        const ordered = this.itemsToShow
        const grouped: MessageFromExtensionToWebview[][] = []
        let currentGroup: MessageFromExtensionToWebview[] = []
        let currentType: string | null = null
        for (const item of ordered) {
            let itemType = item.type
            if (itemType === 'executing') itemType = 'progress'
            if (itemType === 'executed') itemType = 'progress'
            if (itemType !== currentType) {
                if (currentGroup.length) grouped.push(currentGroup)
                currentGroup = []
                currentType = itemType
            }
            currentGroup.push(item)
        }
        if (currentGroup.length) grouped.push(currentGroup)
        return grouped
    }

    activeTab: 'view' | 'segment' | 'import' | 'paint' = 'view'
    setActiveTab = (tab: 'view' | 'segment' | 'import' | 'paint') => {
        this.activeTab = tab
    }

    // this is the new way
    answerInfo = (value: any) => this.sendMessageToExtension({ type: 'answer', value })

    gallerySize: number = 256
    cushySocket: ResilientSocketToExtension
    constructor() {
        // if (typeof acquireVsCodeApi === 'function') this.vsCodeApi = acquireVsCodeApi()
        // console.log('a')
        this.cushySocket = new ResilientSocketToExtension({
            url: () => 'ws://localhost:8288',
            onConnectOrReconnect: () => {
                this.sendMessageToExtension({ type: 'say-ready', frontID: this.uid })
                // toaster.push('Connected to CushyStudio')
            },
            onMessage: (msg) => {
                // console.log('received', msg.data)
                const json = JSON.parse(msg.data)
                this.onMessageFromExtension(json)
            },
        })
        // console.log('b')

        makeAutoObservable(this)
        // window.addEventListener('message', this.onMessageFromExtension)
        // this.sendMessageToExtension({ type: 'say-ready', frontID: this.uid })
    }

    graph: Maybe<Graph> = null
    schema: Maybe<Schema> = null
    images: ImageInfos[] = []
    sid: Maybe<string> = null
    comfyStatus: Maybe<ComfyStatus> = null
    cushyStatus: Maybe<FromExtension_CushyStatus> = null
    knownWorkflows: KnownWorkflow[] = []
    selectedWorkflowID: Maybe<KnownWorkflow['id']> = null
    runningFlowId: Maybe<string> = null

    // runs: { flowRunId: string; graph: Graph }[]
    XXXX = new Map<MessageFromExtensionToWebview['uid'], Graph>()

    pendingAsk: FromExtension_ask[] = []

    /** this is for the UI only; process should be very thin / small */
    onMessageFromExtension = (message: MessageFromExtensionToWebview) => {
        // 1. enqueue the message
        const msg: MessageFromExtensionToWebview =
            typeof message === 'string' //
                ? JSON.parse(message)
                : message

        console.log('💬', msg.type) //, { message })

        this.received.push(msg)

        // 2. process the info
        if (msg.type === 'flow-code') return
        if (msg.type === 'ask') {
            this.pendingAsk.push(msg)
            return
        }
        if (msg.type === 'show-html') return
        if (msg.type === 'print') return
        if (msg.type === 'flow-start') {
            this.runningFlowId = msg.flowRunID
            return
        }
        if (msg.type === 'flow-end') {
            this.runningFlowId = null
            return
        }

        if (msg.type === 'schema') {
            this.schema = new Schema(msg.schema, msg.embeddings)
            return
        }

        if (msg.type === 'status') {
            if (msg.data.sid) this.sid = msg.data.sid
            this.comfyStatus = msg.data.status
            return
        }

        if (msg.type === 'prompt') {
            if (this.schema == null) throw new Error('missing schema')
            this.graph = new Graph(this.schema, msg.graph)
            return
        }

        if (msg.type === 'images') {
            this.images.push(...msg.images)
            return
        }

        if (msg.type === 'ls') {
            this.knownWorkflows = msg.workflowNames

            if (this.selectedWorkflowID == null && this.knownWorkflows.length > 0)
                this.selectedWorkflowID = this.knownWorkflows[0].id

            return
        }

        if (msg.type === 'cushy_status') {
            this.cushyStatus = msg
            return
        }

        const graph = this.graph
        if (graph == null) throw new Error('missing graph')

        // defer accumulation to ScriptStep_prompt
        if (msg.type === 'progress') {
            logger().debug(`🐰 ${msg.type} ${JSON.stringify(msg.data)}`)
            return graph.onProgress(msg)
        }

        if (msg.type === 'executing') {
            if (graph == null) throw new Error('missing graph')
            this.XXXX.set(msg.uid, graph)
            if (msg.data.node == null) this.graph = null // done
            logger().debug(`🐰 ${msg.type} ${JSON.stringify(msg.data)}`)
            return graph.onExecuting(msg)
        }

        if (msg.type === 'executed') {
            logger().info(`${msg.type} ${JSON.stringify(msg.data)}`)
            // return graph.onExecuted(msg)
            return
        }

        exhaust(msg)
    }

    /** Post a message (i.e. send arbitrary data) to the owner of the webview (the extension).
     * @remarks When running webview code inside a web browser, postMessage will instead log the given message to the console.
     */
    public sendMessageToExtension(message: MessageFromWebviewToExtension) {
        this.cushySocket.send(JSON.stringify(message))
        // else console.log(message)
    }
}