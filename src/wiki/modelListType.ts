export type ComfyUIManagerKnownModelTypes =
    | "TAESD"              // x   4
    | "upscale"            // x   9
    | "checkpoints"        // x  19
    | "insightface"        // x   2
    | "deepbump"           // x   1
    | "face_restore"       // x   3
    | "zero123"            // x   1
    | "embeddings"         // x   4
    | "unet"               // x   2
    | "lora"               // x  13
    | "unclip"             // x   2
    | "VAE"                // x   4
    | "T2I-Adapter"        // x   7
    | "T2I-Style"          // x   1
    | "controlnet"         // x  33
    | "clip_vision"        // x   4
    | "gligen"             // x   1
    | "sam"                // x   3
    | "seecoder"           // x   3
    | "Ultralytics"        // x  16
    | "animatediff"        // x  13
    | "motion lora"        // x   8
    | "IP-Adapter"         // x  16
    | "PFG"                // x   3
    | "GFPGAN"             // x   1
    | "CodeFormer"         // x   1
    | "facexlib"           // x   4
    | "photomaker"         // x   1

export type ComfyUIManagerKnownModelNames =
    | "4x_foolhardy_Remacri"
    | "4x_NMKD-Siax_200k"
    | "4x-AnimeSharp"
    | "4x-UltraSharp"
    | "8x_NMKD-Superscale_150000_G"
    | "AbyssOrangeMix2 (hard)"
    | "AbyssOrangeMix3 A1"
    | "AbyssOrangeMix3 A3"
    | "AD_Stabilized_Motion/mm-Stabilized_high.pth (ComfyUI-AnimateDiff-Evolved)"
    | "AD_Stabilized_Motion/mm-Stabilized_mid.pth (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/mm_sd_v15_v2.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/mm_sd_v15.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/mm_sd_v15.ckpt (comfyui-animatediff)"
    | "animatediff/mm_sdxl_v10_beta.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/mmd_sd_v14.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/mmd_sd_v14.ckpt (comfyui-animatediff)"
    | "animatediff/v2_lora_PanLeft.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v2_lora_PanRight.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v2_lora_RollingAnticlockwise.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v2_lora_RollingClockwise.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v2_lora_TiltDown.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v2_lora_TiltUp.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v2_lora_ZoomIn.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v2_lora_ZoomOut.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v3_sd15_adapter.ckpt"
    | "animatediff/v3_sd15_mm.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v3_sd15_sparsectrl_rgb.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "animatediff/v3_sd15_sparsectrl_scribble.ckpt"
    | "Anything v3 (fp16; pruned)"
    | "bad_prompt Negative Embedding"
    | "CiaraRowles/temporaldiff-v1-animatediff.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "CiaraRowles/TemporalNet1XL (1.0)"
    | "CiaraRowles/TemporalNet2"
    | "CLIPVision model (IP-Adapter) CLIP-ViT-bigG-14-laion2B-39B-b160k"
    | "CLIPVision model (IP-Adapter) CLIP-ViT-H-14-laion2B-s32B-b79K"
    | "CLIPVision model (openai/clip-vit-large)"
    | "CLIPVision model (stabilityai/clip_vision_g)"
    | "codeformer.pth"
    | "control_boxdepth_LooseControlfp16 (fp16)"
    | "ControlNet-HandRefiner-pruned (inpaint-depth-hand; fp16)"
    | "controlnet-SargeZT/controlnet-sd-xl-1.0-depth-16bit-zoe"
    | "controlnet-SargeZT/controlnet-sd-xl-1.0-softedge-dexined"
    | "ControlNet-v1-1 (anime; fp16)"
    | "ControlNet-v1-1 (canny; fp16)"
    | "ControlNet-v1-1 (depth; fp16)"
    | "ControlNet-v1-1 (inpaint; fp16)"
    | "ControlNet-v1-1 (ip2p; fp16)"
    | "ControlNet-v1-1 (lineart; fp16)"
    | "ControlNet-v1-1 (mlsd; fp16)"
    | "ControlNet-v1-1 (normalbae; fp16)"
    | "ControlNet-v1-1 (openpose; fp16)"
    | "ControlNet-v1-1 (scribble; fp16)"
    | "ControlNet-v1-1 (seg; fp16)"
    | "ControlNet-v1-1 (shuffle; fp16)"
    | "ControlNet-v1-1 (softedge; fp16)"
    | "ControlNet-v1-1 (tile; fp16; v11f1e)"
    | "ControlNet-v1-1 (tile; fp16; v11u)"
    | "Deep Negative V1.75"
    | "Deepbump"
    | "deepfashion2_yolov8s (segm)"
    | "detection_mobilenet0.25_Final.pth"
    | "detection_Resnet50_Final.pth"
    | "diffusers/stable-diffusion-xl-1.0-inpainting-0.1 (UNET)"
    | "diffusers/stable-diffusion-xl-1.0-inpainting-0.1 (UNET/fp16)"
    | "EasyNegative"
    | "ESRGAN x4"
    | "face_yolov8m (bbox)"
    | "face_yolov8m-seg_60.pt (segm)"
    | "face_yolov8n (bbox)"
    | "face_yolov8n_v2 (bbox)"
    | "face_yolov8n-seg2_60.pt (segm)"
    | "face_yolov8s (bbox)"
    | "GFPGAN 1.3"
    | "GFPGAN 1.4"
    | "GFPGANv1.4.pth"
    | "GLIGEN textbox (fp16; pruned)"
    | "hair_yolov8n-seg_60.pt (segm)"
    | "hand_yolov8n (bbox)"
    | "hand_yolov8s (bbox)"
    | "illuminatiDiffusionV1_v11 unCLIP model"
    | "Inswapper (face swap)"
    | "Inswapper-fp16 (face swap)"
    | "ip-adapter_sd15_light.safetensors"
    | "ip-adapter_sd15_vit-G.safetensors"
    | "ip-adapter_sd15.safetensors"
    | "ip-adapter_sdxl_vit-h.safetensors"
    | "ip-adapter_sdxl.safetensors"
    | "ip-adapter-faceid_sd15_lora.safetensors"
    | "ip-adapter-faceid_sd15.bin"
    | "ip-adapter-faceid_sdxl_lora.safetensors"
    | "ip-adapter-faceid_sdxl.bin"
    | "ip-adapter-faceid-plus_sd15_lora.safetensors"
    | "ip-adapter-faceid-plus_sd15.bin"
    | "ip-adapter-faceid-plusv2_sd15_lora.safetensors"
    | "ip-adapter-faceid-plusv2_sd15.bin"
    | "ip-adapter-faceid-plusv2_sdxl_lora.safetensors"
    | "ip-adapter-faceid-plusv2_sdxl.bin"
    | "ip-adapter-faceid-portrait_sd15.bin"
    | "ip-adapter-full-face_sd15.safetensors"
    | "ip-adapter-plus_sd15.safetensors"
    | "ip-adapter-plus_sdxl_vit-h.safetensors"
    | "ip-adapter-plus-face_sd15.safetensors"
    | "ip-adapter-plus-face_sdxl_vit-h.safetensors"
    | "kl-f8-anime2"
    | "kohya-ss/ControlNet-LLLite: SDXL Canny Anime"
    | "LCM LoRA SD1.5"
    | "LCM LoRA SDXL"
    | "LCM LoRA SSD-1B"
    | "LDSR(Latent Diffusion Super Resolution)"
    | "LongAnimatediff/lt_long_mm_16_64_frames_v1.1.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "LongAnimatediff/lt_long_mm_16_64_frames.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "LongAnimatediff/lt_long_mm_32_frames.ckpt (ComfyUI-AnimateDiff-Evolved)"
    | "negative_hand Negative Embedding"
    | "orangemix.vae"
    | "person_yolov8m (segm)"
    | "person_yolov8n (segm)"
    | "person_yolov8s (segm)"
    | "pfg-novel-n10.pt"
    | "pfg-wd14-n10.pt"
    | "pfg-wd15beta2-n10.pt"
    | "photomaker-v1.bin"
    | "RealESRGAN x2"
    | "RealESRGAN x4"
    | "RestoreFormer"
    | "sd_xl_base_1.0_0.9vae.safetensors"
    | "sd_xl_base_1.0.safetensors"
    | "sd_xl_offset_example-lora_1.0.safetensors"
    | "sd_xl_refiner_1.0_0.9vae.safetensors"
    | "sdxl_vae.safetensors"
    | "SDXL-controlnet: OpenPose (v2)"
    | "SDXL-Turbo 1.0"
    | "SDXL-Turbo 1.0 (fp16)"
    | "seecoder anime v1.0"
    | "seecoder pa v1.0"
    | "seecoder v1.0"
    | "Segmind-Vega"
    | "Segmind-VegaRT - Latent Consistency Model (LCM) LoRA of Segmind-Vega"
    | "skin_yolov8m-seg_400.pt (segm)"
    | "skin_yolov8n-seg_400.pt (segm)"
    | "skin_yolov8n-seg_800.pt (segm)"
    | "stabilityai/control-lora-canny-rank128.safetensors"
    | "stabilityai/control-lora-canny-rank256.safetensors"
    | "stabilityai/control-lora-depth-rank128.safetensors"
    | "stabilityai/control-lora-depth-rank256.safetensors"
    | "stabilityai/control-lora-recolor-rank128.safetensors"
    | "stabilityai/control-lora-recolor-rank256.safetensors"
    | "stabilityai/control-lora-sketch-rank128-metadata.safetensors"
    | "stabilityai/control-lora-sketch-rank256.safetensors"
    | "stabilityai/Stable Zero123"
    | "stabilityai/stable-diffusion-x4-upscaler"
    | "Stable Video Diffusion Image-to-Video"
    | "Stable Video Diffusion Image-to-Video (XT)"
    | "stable-diffusion-xl-refiner-1.0"
    | "T2I-Adapter (canny)"
    | "T2I-Adapter (color)"
    | "T2I-Adapter (depth)"
    | "T2I-Adapter (keypose)"
    | "T2I-Adapter (openpose)"
    | "T2I-Adapter (seg)"
    | "T2I-Adapter (sketch)"
    | "T2I-Style model"
    | "TAESD Decoder"
    | "TAESD Encoder"
    | "TAESDXL Decoder"
    | "TAESDXL Encoder"
    | "TencentARC/motionctrl.pth"
    | "Theovercomer8's Contrast Fix (SD1.5)"
    | "Theovercomer8's Contrast Fix (SD2.1)"
    | "v1-5-pruned-emaonly.ckpt"
    | "v2-1_512-ema-pruned.safetensors"
    | "v2-1_768-ema-pruned.safetensors"
    | "vae-ft-mse-840000-ema-pruned"
    | "ViT-B SAM model"
    | "ViT-H SAM model"
    | "ViT-L SAM model"
    | "Waifu Diffusion 1.5 Beta3 (fp16)"
    | "Waifu Diffusion 1.5 unCLIP model"
    | "yolov5l-face.pth"
    | "yolov5n-face.pth"


