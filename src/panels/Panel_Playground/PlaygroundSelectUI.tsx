import { observer } from 'mobx-react-lite'

import { BadgeUI } from '../../csuite/badge/BadgeUI'
import { ErrorBoundaryUI } from '../../csuite/errors/ErrorBoundaryUI'
import { Frame } from '../../csuite/frame/Frame'
import { RevealTestUI } from '../../csuite/reveal/demo/RevealTest'
import { SelectUI } from '../../csuite/select/SelectUI'

/** Freely modify this as you like, then pick the "Scratch Pad" option in the top left. Do not commit changes made to this. */
export const PlaygroundSelectUI = observer(function PlaygroundSelectUI_(p: {}) {
    const uist2 = cushy.forms.useLocalstorage((ui) => ui.fields({ selected: ui.string() }), 'lyxiTdJYiN')
    return (
        <ErrorBoundaryUI>
            <div tw='flex flex-col gap-1'>
                <Frame line tw='m-1'>
                    <Frame expand base={{ chroma: 0.1, hue: 40 }}>
                        <SelectUI<string>
                            value={() => 'test'}
                            options={() => ['test', 'test2', 'test3']}
                            getLabelText={(t) => t}
                            onOptionToggled={() => {}}
                        />
                    </Frame>
                    <Frame expand base={{ chroma: 0.1, hue: 80 }}>
                        <SelectUI<string>
                            //
                            value={() => uist2.value.selected}
                            options={() => [ 'test', 'test2', 'test3', 'test4', 'test5', 'test6', 'test7', 'test8', 'test9', 'test10', 'test11', 'test12', 'test13', 'test14', 'test15', 'test16', 'test17', 'test18', 'test19', 'test20', 'test21', 'test22', 'test23', 'test24', 'test25', 'test26', 'test27', 'test28', 'test29', ]} // prettier-ignore
                            onOptionToggled={(v) => (uist2.value.selected = v)}
                            getLabelText={(v) => `🔶 ${v}`}
                            getLabelUI={(v) => <BadgeUI autoHue>{v}</BadgeUI>}
                            // disableLocalFiltering={false}
                            // equalityCheck={(a, b) => a.id === b.id}
                            // getSearchQuery={() => field.serial.query ?? ''}
                            // setSearchQuery={(query) => (field.serial.query = query)}
                        />
                    </Frame>
                </Frame>
                {cushy.forms
                    .fields((ui) => ({
                        test2: ui.selectMany({
                            // showPickedListInBody: true,
                            appearance: 'select',
                            choices: [
                                { label: 'a', id: 'a' },
                                { label: 'b', id: 'b' },
                                { label: 'c', id: 'c' },
                                { label: 'ddddddd', id: 'ddddddd' },
                                { label: 'eeeeeee', id: 'eeeeeee' },
                                { label: 'ffffffff', id: 'ffffffff' },
                                { label: 'gggggggg', id: 'gggggggg' },
                                { label: 'hhhhhhhh', id: 'hhhhhh' },
                            ],
                        }),
                        test: ui.selectMany({
                            // showPickedListInBody: true,
                            choices: [
                                { label: 'a', id: 'a' },
                                { label: 'b', id: 'b' },
                                { label: 'c', id: 'c' },
                                { label: 'ddddddd', id: 'ddddddd' },
                                { label: 'eeeeeee', id: 'eeeeeee' },
                                { label: 'ffffffff', id: 'ffffffff' },
                                { label: 'gggggggg', id: 'gggggggg' },
                                { label: 'hhhhhhhh', id: 'hhhhhh' },
                            ],
                        }),
                    }))
                    .render()}
                {/*  */}
                {/*  */}
                <RevealTestUI />
            </div>
        </ErrorBoundaryUI>
    )
})
