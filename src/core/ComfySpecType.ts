/** type of the file sent by the backend at /object_info */
export type ComfySpec = { [nodeTypeName: string]: ComfyNodeSpec }

export type ComfyNodeSpec = {
    input: {
        required: { [inputName: string]: ComfyInputSpec }
    }
    output: string[]
    name: string
    description: string
    category: string
}

export type ComfyInputSpec = [ComfyInputType] | [ComfyInputType, ComfyInputOpts]

export type ComfyInputType =
    /** node name or primitive */
    | string
    /** enum */
    | string[]

export type ComfyInputOpts = {
    [key: string]: any
}

const x: ComfySpec = {
    KSampler: {
        input: {
            required: {
                model: ['MODEL'],
                seed: [
                    'INT',
                    {
                        default: 0,
                        min: 0,
                        max: 18446744073709552000,
                    },
                ],
                steps: [
                    'INT',
                    {
                        default: 20,
                        min: 1,
                        max: 10000,
                    },
                ],
                cfg: [
                    'FLOAT',
                    {
                        default: 8,
                        min: 0,
                        max: 100,
                    },
                ],
                sampler_name: [
                    [
                        'euler',
                        'euler_ancestral',
                        'heun',
                        'dpm_2',
                        'dpm_2_ancestral',
                        'lms',
                        'dpm_fast',
                        'dpm_adaptive',
                        'dpmpp_2s_ancestral',
                        'dpmpp_sde',
                        'dpmpp_2m',
                        'ddim',
                        'uni_pc',
                        'uni_pc_bh2',
                    ],
                ],
                scheduler: [['karras', 'normal', 'simple', 'ddim_uniform']],
                positive: ['CONDITIONING'],
                negative: ['CONDITIONING'],
                latent_image: ['LATENT'],
                denoise: [
                    'FLOAT',
                    {
                        default: 1,
                        min: 0,
                        max: 1,
                        step: 0.01,
                    },
                ],
            },
        },
        output: ['LATENT'],
        name: 'KSampler',
        description: '',
        category: 'sampling',
    },
}
