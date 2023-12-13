import { _createTable } from './_createTable'

export const _checkAllMigrationsHaveDifferentIds = () => {
    // check all migrations have different IDS
    const ids = new Set()
    for (const migration of migrations) {
        if (ids.has(migration.id)) throw new Error(`duplicate migration id: ${migration.id}`)
        ids.add(migration.id)
    }
}

// ------------------------------------------------------------------------------------
export const migrations: {
    id: string
    name: string
    up: string | string[] // | (() => void)
}[] = [
    {
        id: '1b5eb947',
        name: 'create users table',
        up: `--sql
            create table users (
                id           integer primary key,
                firstName    text    not null,
                lastName     text    not null,
                email        text    not null unique,
                passwordHash text    not null
            );`,
    },
    {
        id: 'UA2XmUXnK9',
        name: 'create graph table',
        up: _createTable('graph', [`comfyPromptJSON json not null`]),
    },
    {
        id: 'lRtCJxvumg',
        name: 'create misc tables',
        up: [
            _createTable('draft', [
                //
                `title          text`,
                `appPath        text                           not null`,
                `appParams      json                           not null`,
                // `graphID        text                           not null`,
            ]),
            _createTable('project', [
                //
                `name           text`,
                `rootGraphID    text    references graph(id)   not null`,
                `currentApp     text`,
                `currentDraftID text    references draft(id)`,
            ]),
            _createTable('step', [
                //
                `name           text`,
                `appPath        text                           not null`,
                `formResult     json                           not null`,
                `formSerial     json                           not null`,
                // `parentGraphID  text     references graph(id)  not null`,
                `outputGraphID  text     references graph(id)  not null`,
                'status         text                           not null',
            ]),
            _createTable('comfy_prompt', [
                //
                `stepID         text     references step(id)   not null`,
                `graphID        text     references graph(id)  not null`,
                'executed       int                            not null default 0',
                'error          json', // execution error
            ]),
            _createTable('comfy_schema', [
                //
                'spec           json                             not null',
                'embeddings     json                             not null',
            ]),
        ],
    },
    {
        id: 'OHwk_shY_c',
        name: 'create misc tables',
        up: [
            //
            // markdown / html / text
            _createTable('media_text', [
                //
                `kind text not null`,
                `content text not null`,
                `stepID text references step(id)`,
            ]),
            _createTable('media_video', [
                //
                `absPath text`,
            ]),
            _createTable('media_image', [
                //
                `base64URL text`,
            ]),
            _createTable('media_3d_displacement', [
                `width     int`,
                `height    int`,
                `image     text`,
                `depthMap  text`,
                `normalMap text`,
                //
                // `base64URL text`,
            ]),
        ],
    },
    {
        id: 'whR8E1Uh05',
        name: 'fix image',
        up: [
            `alter table media_image add column width int`,
            `alter table media_image add column height int`,
            `alter table media_image add column star int`,
            `alter table media_image add column infos json`,
        ],
    },
    {
        id: 'PONTSFSpA_',
        name: 'fix image2',
        up: [`alter table media_image drop column base64URL`],
    },
    {
        id: 'R1lQ0YLIqO',
        name: 'add promptID to image',
        up: [
            //
            `alter table media_image add column promptID text references comfy_prompt(id)`,
            `alter table media_image add column stepID   text references step(id)`,
        ],
    },
    {
        id: 'x8cqAoMEvu',
        name: 'add runtime error',
        up: [
            _createTable('runtime_error', [
                'message text not null',
                'infos json not null',
                'promptID text references comfy_prompt(id)',
                'graphID text references graph(id)',
            ]),
        ],
    },
    {
        id: '0D1XHSH0Dk',
        name: 'add runtime error',
        up: ['alter table runtime_error add column stepID text references step(id)'],
    },
    {
        id: 'oOzhdq3rM2',
        name: 'add step and prompt to video',
        up: [
            //
            'alter table media_video add column stepID text references step(id)',
            'alter table media_video add column promptID text references comfy_prompt(id)',
        ],
    },
    {
        id: 'isTECbxy71',
        name: 'add step and prompt to video',
        up: [
            //
            'alter table media_3d_displacement add column stepID text references step(id)',
            'alter table media_3d_displacement add column promptID text references comfy_prompt(id)',
        ],
    },
    {
        id: 'XXDvvMf4Eu',
        name: 'add step and graph',
        up: ['alter table graph add column stepID text references step(id)'],
    },
    {
        id: '4cjq8_0hGP',
        name: 'add gaussian splat support',
        up: [_createTable('media_splat', [`stepID text references step(id)`])],
    },
    {
        id: '-apJ3x9uB4',
        name: 'add gaussian splat support',
        up: [`alter table media_splat add column url text not null`],
    },
    {
        id: 'kIoMnNKcix',
        name: 'add non nullable title field to MediaText',
        up: [
            //
            `alter table media_text add column title text not null default ''`,
        ],
    },
    {
        id: '5Ka1ddK8ma',
        name: 'add filePath and url to MediaVideo',
        up: [
            //
            `alter table media_video add column filePath text`,
            `alter table media_video add column url text not null`,
        ],
    },
    {
        id: 'sS4mA__Ofg',
        name: 'add isOpened to drafts',
        up: [`alter table draft add column isOpened int not null default 1`],
    },
    {
        id: 'M2uSmJqhbF',
        name: 'new runtime datastore',
        up: [
            //
            _createTable('custom_data', [
                //
                "data json not null default '{}'",
            ]),
        ],
    },
    {
        id: '9e3b92c6-8a71-4a51-af90-03b2f0d48ec8',
        name: 'new runtime datastore',
        up: ['alter table custom_data rename column data to json'],
    },
    {
        id: 'UI2LFUl9Lq',
        name: 'step.isExpanded',
        up: ['alter table step add column isExpanded int not null default 1'],
    },
    {
        id: 'V_WM75Ppn3',
        name: 'prompt.status',
        up: ['alter table comfy_prompt add column status text'],
    },
    {
        id: 'JIf9D18H7R',
        name: 'create cushy_script table',
        up: [_createTable('cushy_script', ['path text not null', 'code text not null'])],
    },
    {
        id: 'hG9xjiZn4I',
        name: 'create cushy_app table',
        up: [
            _createTable('cushy_app', [
                //
                'guid text unique',
                'scripID text references graph(id) not null',
            ]),
        ],
    },
    {
        id: 'kn8M4lrSlB',
        name: 'create cushy_app table',
        up: [`alter table cushy_app rename column scripID to scriptID`],
    },
    {
        id: 'H2wy77-Rvx',
        name: 'create cushy_app table',
        up: [
            `alter table cushy_app drop column scriptID`,
            `alter table cushy_app add column scriptID text references cushy_script(id) not null`,
        ],
    },
    {
        id: 'baWamSPnwf',
        name: 'create drafts now based on cushy_app table',
        up: [
            `alter table draft drop column appPath`,
            `alter table draft add column appID text references cushy_app(id) not null`,
        ],
    },
    {
        id: 'D9nJFXN2t0',
        name: 'idem for step',
        up: [`alter table step drop column appPath`, `alter table step add column appID text references cushy_app(id) not null`],
    },
    {
        id: 'ZVMqRs0ogh',
        name: 'add user table',
        up: [
            _createTable('auth', [
                'expires_at text',
                'expires_in text',
                'provider_token text',
                'refresh_token text',
                'token_type text',
                'access_token text',
            ]),
            'alter table cushy_app add column name text',
            'alter table cushy_app add column illustration text',
        ],
    },
    {
        id: '-U4fPEdWdv',
        name: 'provider_refresh_token',
        up: [`alter table auth add column provider_refresh_token text`],
    },
    {
        id: '3ZOHzNx4CL',
        name: 'auth.expires_at & auth.expires_in are numbers',
        up: [
            `alter table auth drop column expires_at`,
            `alter table auth drop column expires_in`,
            `alter table auth add column expires_at int `,
            `alter table auth add column expires_in int `,
        ],
    },
    {
        id: 'SKEO1Da-aa',
        name: 'add app description and tags',
        up: [
            //
            'alter table cushy_app add column description text',
            'alter table cushy_app add column tags text',
        ],
    },
    // {
    //     id: 'e574c006-daca-4fd0-a51b-73a66b4fbd79',
    //     name: 'create cushy_app table',
    //     up: ['drop table cushy_app'],
    // },
]