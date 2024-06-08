import type { CompiledQuery } from 'kysely'

/** micro bench */
export const microbench = async (title: string, cb: () => Promise<void>) => {
    const A = process.hrtime.bigint() // TIMER start
    let x = await cb()
    const B = process.hrtime.bigint() // TIMER end
    const ms = Number(B - A) / 1_000_000
    console.log(`[🏎️] ${title} [${ms.toFixed(1)}ms]`) // debug
}

/** SQL bench */
export const sqlbench = <A>(
    //
    query: CompiledQuery<any>,
    cb: () => A,
): A => {
    const A = process.hrtime.bigint() // TIMER start
    let x = cb()
    const B = process.hrtime.bigint() // TIMER end
    const ms = Number(B - A) / 1_000_000
    const emoji = ms > 4 ? '🔴' : ms > 1 ? '🔶' : ''
    if (ms > 4) console.log(`[🚧] SQL [${ms.toFixed(1)}ms] ${emoji}`, query.sql, query.parameters) // debug
    return x
}
