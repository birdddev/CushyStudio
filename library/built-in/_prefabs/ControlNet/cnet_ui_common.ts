import type { FormBuilder } from '../../../../src/controls/FormBuilder'

// 🅿️ CNET COMMON FORM ===================================================

export const cnet_ui_common = (form: FormBuilder) => ({
    strength: form.float({ default: 1, min: 0, max: 2, step: 0.1 }),
    advanced: form.group({
        startCollapsed: true,
        label: 'Settings',
        items: () => ({
            startAtStepPercent: form.float({ default: 0, min: 0, max: 1, step: 0.1 }),
            endAtStepPercent: form.float({ default: 1, min: 0, max: 1, step: 0.1 }),
            crop: form.enum.Enum_LatentUpscale_crop({ label: 'Image Prep Crop mode', default: 'disabled' }),
            upscale_method: form.enum.Enum_ImageScale_upscale_method({ label: 'Scale method', default: 'lanczos' }),
        }),
    }),
})

export const cnet_preprocessor_ui_common = (form: FormBuilder) => ({
    //preview: form.inlineRun({ text: 'Preview', kind: 'special' }),
    saveProcessedImage: form.bool({ default: false, expand: true, label: 'Save image' }),
    //resolution: form.int({ default: 512, min: 512, max: 1024, step: 512 }),
})
