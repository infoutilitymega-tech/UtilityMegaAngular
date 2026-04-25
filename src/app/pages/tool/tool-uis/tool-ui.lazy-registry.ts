import { Type } from '@angular/core';

export type ToolUiLoader = () => Promise<Type<unknown>>;

export const TOOL_UI_LAZY_REGISTRY: Record<string, ToolUiLoader> = {
  // Image-heavy tools
  'image-compressor': () => import('./image-compressor.component').then(m => m.ImageCompressorComponent),
  'image-resizer': () => import('./image-resizer.component').then(m => m.ImageResizerComponent),
  'image-converter': () => import('./image-converter.component').then(m => m.ImageConverterComponent),
  'image-cropper': () => import('./image-cropper.component').then(m => m.ImageCropperComponent),
  'image-flip-rotate': () => import('./image-flip-rotate.component').then(m => m.ImageFlipRotateComponent),
  'image-watermark': () => import('./image-watermark.component').then(m => m.ImageWatermarkComponent),
  'png-to-jpg': () => import('./image-misc-components').then(m => m.PngToJpgComponent),
  'jpg-to-png': () => import('./image-misc-components').then(m => m.JpgToPngComponent),
  'image-color-picker': () => import('./image-misc-components').then(m => m.ImageColorPickerComponent),
  'image-to-base64': () => import('./image-misc-components').then(m => m.ImageToBase64Component),

  // Video-heavy tools
  'video-compressor': () => import('./video-compressor-converter.component').then(m => m.VideoCompressorComponent),
  'video-converter': () => import('./video-compressor-converter.component').then(m => m.VideoConverterComponent),
  'video-trimmer': () => import('./video-trimmer-gif.component').then(m => m.VideoTrimmerComponent),
  'gif-maker': () => import('./video-trimmer-gif.component').then(m => m.GifMakerComponent),
  'video-to-mp3': () => import('./video-mp3-speed.component').then(m => m.VideoToMp3Component),
  'video-merger': () => import('./video-rotate-recorder-subtitle-merger.component').then(m => m.VideoMergerComponent),
  'screen-recorder': () => import('./video-rotate-recorder-subtitle-merger.component').then(m => m.ScreenRecorderComponent),
  'video-speed-changer': () => import('./video-mp3-speed.component').then(m => m.VideoSpeedChangerComponent),
  'video-rotate': () => import('./video-rotate-recorder-subtitle-merger.component').then(m => m.VideoRotateComponent),
  'video-subtitle-adder': () => import('./video-rotate-recorder-subtitle-merger.component').then(m => m.VideoSubtitleAdderComponent),

  // Generator suites that can be delayed until tool pages
  'backlink-checker': () => import('./url-encoder-backlink.component').then(m => m.BacklinkCheckerComponent),
  'jsonld-generator': () => import('./seo-tools-all.component').then(m => m.JsonLdGeneratorComponent),
  'schema-markup-generator': () => import('./seo-tools-all.component').then(m => m.SchemaMarkupGeneratorComponent),
  'page-speed-analyzer': () => import('./seo-tools-all.component').then(m => m.PageSpeedAnalyzerComponent),
};
