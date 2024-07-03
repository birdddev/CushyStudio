import type { Field } from './Field'

export interface Instanciable<T extends Field = Field> {
    $Type: T['$Type']
    $Config: T['$Config']
    $Serial: T['$Serial']
    $Value: T['$Value']
    $Field: T['$Field']

    type: T['type']
    config: T['$Config']

    instanciate(
        //
        entity: Field<any>,
        parent: Field | null,
        serial: any | null,
    ): T
}
