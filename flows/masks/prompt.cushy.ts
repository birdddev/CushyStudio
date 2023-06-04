action('💬 Prompt', {
    priority: 2,
    help: 'extract a mak for the given clothes',
    ui: (form) => ({
        positive: form.str({ textarea: true }),
        negative: form.strOpt({ textarea: true }),
        batchSize: form.int({ default: 1 }),
    }),
    run: async (flow, deps) => {
        flow.print(deps.batchSize)
        flow.nodes.SaveImage({
            images: flow.nodes.VAEDecode({
                samples: flow.nodes.KSampler({
                    seed: flow.randomSeed(),
                    latent_image: flow.nodes.EmptyLatentImage({
                        batch_size: deps.batchSize,
                    }),
                    model: flow.AUTO,
                    positive: flow.nodes.CLIPTextEncode({ clip: flow.AUTO, text: deps.positive }),
                    negative: flow.nodes.CLIPTextEncode({ clip: flow.AUTO, text: deps.negative ?? '' }),
                    sampler_name: 'ddim',
                    scheduler: 'karras',
                    steps: 20,
                }),
                vae: flow.AUTO,
            }),
        })
        await flow.PROMPT()
    },
})
