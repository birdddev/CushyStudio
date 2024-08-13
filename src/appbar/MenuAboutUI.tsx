import { observer } from 'mobx-react-lite'

import { Dropdown } from '../csuite/dropdown/Dropdown'
import { MenuItem } from '../csuite/dropdown/MenuItem'
import { JsonViewUI } from '../csuite/json/JsonViewUI'
import { RevealUI } from '../csuite/reveal/RevealUI'

export const MenuAboutUI = observer(function MenuAboutUI_(p: {}) {
    return (
        <Dropdown
            // startIcon={<span className='material-symbols-outlined'>help_center</span>}
            title='About'
            content={() => (
                <>
                    {/* 🔴 */}
                    <MenuItem
                        onClick={() => {
                            void window.require('electron').shell.openExternal('https://github.com/rvion/CushyStudio#readme')
                        }}
                        icon={'mdiGithub'}
                        label='Github'
                    />
                    <MenuItem
                        onClick={() => {
                            void window.require('electron').shell.openExternal('https://www.CushyStudio.com')
                        }}
                        icon={'mdiWeb'}
                        label='Documentation'
                    />
                    <MenuItem
                        onClick={() => {
                            void window.require('electron').shell.openExternal('https://www.CushyStudio.com/blog')
                        }}
                        icon={'mdiPost'}
                        label='Blog'
                    />
                    {/* Github Integration */}
                    {cushy.auth.isConnected ? (
                        <MenuItem //
                            icon='mdiLogout'
                            onClick={() => cushy.auth.logout()}
                            children={'Logout'}
                        />
                    ) : (
                        <MenuItem //
                            icon='mdiLogin'
                            onClick={() => void cushy.auth.startLoginFlowWithGithub()}
                            children={'Login with Github'}
                        />
                    )}
                    {/* // TODO(bird_d): Github integration should be moved inside the CushyStudio "Button" when that's a thing. */}
                    {/* <MenuDivider></MenuDivider> */}
                    <RevealUI content={() => <JsonViewUI value={cushy.auth.user} />}>
                        <MenuItem icon='mdiInformation'>{cushy.auth.user?.email}</MenuItem>
                    </RevealUI>
                </>
            )}
        />
    )
})