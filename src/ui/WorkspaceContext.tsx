import { createContext, useContext } from 'react'
import { Workspace } from '../core-back/Workspace'

export const workspaceContext = createContext<Workspace | null>(null)

export const useWorkspace = () => {
    const st = useContext(workspaceContext)
    if (st == null) throw new Error('no st in context')
    return st
}
