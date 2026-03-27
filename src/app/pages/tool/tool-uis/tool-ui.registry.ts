import { Type } from '@angular/core';

// ── Calculators ──────────────────────────────────────────────────────────────
import { SipCalculatorComponent } from './sip-calculator.component';
import { EmiCalculatorComponent } from './emi-calculator.component';
import { CompoundInterestCalculatorComponent } from './compound-interest-calculator.component';
import { BmiCalculatorComponent } from './bmi-calculator.component';
import { AgeCalculatorComponent } from './age-calculator.component';
import { PercentageCalculatorComponent } from './percentage-calculator.component';
import { GstCalculatorComponent } from './gst-calculator.component';
import { CalorieCalculatorComponent } from './calorie-calculator.component';
import { DiscountCalculatorComponent } from './discount-calculator.component';
import { RetirementCalculatorComponent } from './retirement-calculator.component';


// ── Image Tools ───────────────────────────────────────────────────────────────
import { ImageCompressorComponent } from './image-compressor.component';
import { ImageResizerComponent } from './image-resizer.component';

// ── Developer Tools ───────────────────────────────────────────────────────────
import { JsonFormatterComponent } from './json-formatter.component';
import { Base64EncoderComponent } from './base64-encoder.component';
import { HashGeneratorComponent } from './hash-generator.component';

// ── Text Tools ────────────────────────────────────────────────────────────────
import { WordCounterComponent } from './word-counter.component';
import { TextCaseConverterComponent } from './text-case-converter.component';

// ── Security Tools ────────────────────────────────────────────────────────────
import { PasswordGeneratorComponent } from './password-generator.component';

// ── SEO Tools ─────────────────────────────────────────────────────────────────
import { MetaTagGeneratorComponent } from './meta-tag-generator.component';
import { KeywordDensityCheckerComponent } from './keyword-density-checker.component';

// ── Unit Converters ───────────────────────────────────────────────────────────
import { LengthConverterComponent } from './length-converter.component';
import { TemperatureConverterComponent } from './temperature-converter.component';
import { AreaConverterComponent } from './area-converter.component';
import { VolumeConverterComponent } from './volume-converter.component';
import { SpeedConverterComponent } from './speed-converter.component';
import { TimeConverterComponent } from './time-converter.component';
import { PressureConverterComponent } from './pressure-converter.component';
import { EnergyConverterComponent } from './energy-converter.component';
import { DataConverterComponent } from './data-converter.component';
import { FuelConverterComponent } from './fuel-converter.component';
import { AspectRatioCalculatorComponent } from './aspect-ratio-calculator.component';
import { BitrateCalculatorComponent } from './bitrate-calculator.component';
import { CodecComparisonComponent } from './codec-comparison.component';
import { ColorSpaceConverterComponent } from './color-space-converter.component';
import { CompressionCalculatorComponent } from './compression-calculator.component';
import { DurationCalculatorComponent } from './duration-calculator.component';
import { FrameRateConverterComponent } from './frame-rate-converter.component';
import { ResolutionConverterComponent } from './resolution-converter.component';
import { ScreenRecordingCalculatorComponent } from './screen-recording-calculator.component';
import { SubtitleTimingCalculatorComponent } from './subtitle-timing-calculator.component';


// ── Utility Tools ─────────────────────────────────────────────────────────────
import { QrGeneratorComponent } from './qr-generator.component';

// ── Farmers Tools ─────────────────────────────────────────────────────────────
import { CropYieldCalculatorComponent } from './crop-yield-calculator.component';
import { FertilizerCalculatorComponent } from './fertilizer-calculator.component';
import { ImageConverterComponent } from './image-converter.component';
import { ImageCropperComponent } from './image-cropper.component';
import { ImageFlipRotateComponent } from './image-flip-rotate.component';
import { ImageWatermarkComponent } from './image-watermark.component';
import { ImageColorPickerComponent, ImageToBase64Component, JpgToPngComponent, PngToJpgComponent } from './image-misc-components';
import { BarcodeGeneratorComponent, ColorPickerToolComponent, IpLookupComponent, RomanNumeralConverterComponent, TimestampConverterComponent, UrlEncoderComponent } from './utility-tools-1.component';
import { JsonLdGeneratorComponent, OgGeneratorComponent, OpenGraphTesterComponent, PageSpeedAnalyzerComponent, ReadabilityCheckerComponent, RobotsTxtGeneratorComponent, SchemaMarkupGeneratorComponent, SitemapGeneratorComponent, TitleDescriptionAnalyzerComponent, TwitterCardGeneratorComponent } from './seo-tools-all.component';
import { StopwatchTimerComponent, ScreenRulerComponent, PomodoroComponent, TextToSpeechComponent, BaseConverterComponent, MorseCodeConverterComponent } from './utility-tools-2.component';
import { CronGeneratorComponent, ColorConverterComponent, DiffCheckerComponent } from './cron-color-diff.component';
import { MarkdownEditorComponent, JwtDecoderComponent } from './markdown-jwt.component';
import { RegexTesterComponent, UuidGeneratorComponent } from './url-encoder-regex-uuid.component';
import { PasswordStrengthCheckerComponent } from './hash-password-strength.component';
import { CorsTesterComponent, CspGeneratorComponent, BcryptGeneratorComponent } from './cors-csp-bcrypt.component';
import { HmacGeneratorComponent, SslCheckerComponent } from './hmac-ssl-ip.component';
import { IrrigationCalculatorComponent, SoilPhCalculatorComponent } from './irrigation-soilph.component';
import { SeedRateCalculatorComponent, PesticideCalculatorComponent, FarmIncomeCalculatorComponent, LivestockFeedCalculatorComponent } from './seed-pesticide-income-livestock.component';
import { WeatherCropAdvisorComponent, MspCalculatorComponent } from './weather-msp.component';
import { LoremIpsumGeneratorComponent, DuplicateLineRemoverComponent, FindReplaceComponent } from './lorem-duplicate-findreplace.component';
import { TextToSlugComponent, TextReverserComponent, LineSorterComponent, StringEncoderComponent, TextDiffHighlighterComponent } from './slug-reverser-sorter-encoder-diff.component';
import { CagrCalculatorComponent, CurrencyConverterComponent, FdCalculatorComponent, FuelCostCalculatorComponent, LoanComparisonComponent, PpfCalculatorComponent, RdCalculatorComponent, TipCalculatorComponent, VatCalculatorComponent } from './calculator-all.component';
import { VideoCompressorComponent, VideoConverterComponent } from './video-compressor-converter.component';
import { GifMakerComponent, VideoTrimmerComponent } from './video-trimmer-gif.component';
import { ScreenRecorderComponent, VideoMergerComponent, VideoRotateComponent, VideoSubtitleAdderComponent } from './video-rotate-recorder-subtitle-merger.component';
import { VideoSpeedChangerComponent, VideoToMp3Component } from './video-mp3-speed.component';
import { BacklinkCheckerComponent } from './url-encoder-backlink.component';


/**
 * TOOL_UI_REGISTRY
 * Maps tool slug → Angular standalone component
 *
 * Usage in tool.component.ts:
 *   const comp = TOOL_UI_REGISTRY[tool.slug];
 *   if (comp) this.vcr.createComponent(comp);
 */
export const TOOL_UI_REGISTRY: Record<string, Type<any>> = {
  // Calculators
  'sip-calculator': SipCalculatorComponent,
  'emi-calculator': EmiCalculatorComponent,
  'compound-interest-calculator': CompoundInterestCalculatorComponent,
  'bmi-calculator': BmiCalculatorComponent,
  'age-calculator': AgeCalculatorComponent,
  'percentage-calculator': PercentageCalculatorComponent,
  'gst-calculator': GstCalculatorComponent,
  'calorie-calculator': CalorieCalculatorComponent,
  'discount-calculator': DiscountCalculatorComponent,
  'retirement-calculator': RetirementCalculatorComponent,
  'ppf-calculator': PpfCalculatorComponent,
  'fd-calculator': FdCalculatorComponent,
  'rd-calculator': RdCalculatorComponent,
  'cagr-calculator': CagrCalculatorComponent,
  'loan-comparison': LoanComparisonComponent,
  'vat-calculator': VatCalculatorComponent,
  'tip-calculator': TipCalculatorComponent,
  'currency-converter': CurrencyConverterComponent,
  'fuel-cost-calculator': FuelCostCalculatorComponent,
  // Image Tools
  'image-compressor': ImageCompressorComponent,
  'image-resizer': ImageResizerComponent,
  'image-converter': ImageConverterComponent,
  'image-cropper': ImageCropperComponent,
  'image-flip-rotate': ImageFlipRotateComponent,
  'image-watermark': ImageWatermarkComponent,
  'png-to-jpg': PngToJpgComponent,
  'jpg-to-png': JpgToPngComponent,
  'image-color-picker': ImageColorPickerComponent,
  'image-to-base64': ImageToBase64Component,

  // Video Tools
  'video-compressor': VideoCompressorComponent,
  'video-converter': VideoConverterComponent,
  'video-trimmer': VideoTrimmerComponent,
  'gif-maker': GifMakerComponent,
  'video-to-mp3': VideoToMp3Component,
  'video-merger': VideoMergerComponent,
  'screen-recorder': ScreenRecorderComponent,
  'video-speed-changer': VideoSpeedChangerComponent,
  'video-rotate': VideoRotateComponent,
  'video-subtitle-adder': VideoSubtitleAdderComponent,

  // Developer Tools
  'json-formatter': JsonFormatterComponent,
  'base64-encoder': Base64EncoderComponent,
  'hash-generator': HashGeneratorComponent,
  'regex-tester': RegexTesterComponent,
  'uuid-generator': UuidGeneratorComponent,
  'cron-generator': CronGeneratorComponent,
  'color-converter': ColorConverterComponent,
  'diff-checker': DiffCheckerComponent,
  'markdown-editor': MarkdownEditorComponent,
  'jwt-decoder': JwtDecoderComponent,

  // Text Tools
  //'word-counter': WordCounterComponent,
  //'text-case-converter': TextCaseConverterComponent,
  'word-counter': WordCounterComponent,
  'text-case-converter': TextCaseConverterComponent,
  'lorem-ipsum-generator': LoremIpsumGeneratorComponent,
  'duplicate-line-remover': DuplicateLineRemoverComponent,
  'find-and-replace': FindReplaceComponent,
  'text-to-slug': TextToSlugComponent,
  'text-reverser': TextReverserComponent,
  'line-sorter': LineSorterComponent,
  'string-encoder': StringEncoderComponent,
  'text-diff-highlighter': TextDiffHighlighterComponent,

  // Security Tools
  'password-generator': PasswordGeneratorComponent,
  'password-strength-checker': PasswordStrengthCheckerComponent,
  'hmac-generator': HmacGeneratorComponent,
  'ssl-checker': SslCheckerComponent,
  'cors-tester': CorsTesterComponent,
  'csp-generator': CspGeneratorComponent,
  'bcrypt-generator': BcryptGeneratorComponent,
  //

  // SEO Tools
  //'meta-tag-generator': MetaTagGeneratorComponent,
  //'keyword-density-checker': KeywordDensityCheckerComponent,
  'meta-tag-generator': MetaTagGeneratorComponent,
  'keyword-density-checker': KeywordDensityCheckerComponent,
  'readability-checker': ReadabilityCheckerComponent,
  'robots-txt-generator': RobotsTxtGeneratorComponent,
  'sitemap-generator': SitemapGeneratorComponent,
  'og-generator': OgGeneratorComponent,
  'twitter-card-generator': TwitterCardGeneratorComponent,
  'page-speed-analyzer': PageSpeedAnalyzerComponent,
  'jsonld-generator': JsonLdGeneratorComponent,
  'title-description-analyzer': TitleDescriptionAnalyzerComponent,
  'schema-markup-generator': SchemaMarkupGeneratorComponent,
  'open-graph-tester': OpenGraphTesterComponent,
  'backlink-checker': BacklinkCheckerComponent,
  // Unit Converters
  'length-converter': LengthConverterComponent,
  'temperature-converter': TemperatureConverterComponent,
  'area-converter': AreaConverterComponent,
  'volume-converter': VolumeConverterComponent,
  'speed-converter': SpeedConverterComponent,
  'time-converter': TimeConverterComponent,
  'pressure-converter': PressureConverterComponent,
  'energy-converter': EnergyConverterComponent,
  'data-converter': DataConverterComponent,
  'fuel-converter': FuelConverterComponent,

  // Utility Tools
  'qr-code-generator': QrGeneratorComponent,
  'url-encoder': UrlEncoderComponent,
  'color-picker': ColorPickerToolComponent,
  'ip-lookup': IpLookupComponent,
  'barcode-generator': BarcodeGeneratorComponent,
  'stopwatch-timer': StopwatchTimerComponent,
  'screen-ruler': ScreenRulerComponent,
  'pomodoro-timer': PomodoroComponent,
  'text-to-speech': TextToSpeechComponent,
  'timestamp-converter': TimestampConverterComponent,
  'base-converter': BaseConverterComponent,
  'roman-numeral-converter': RomanNumeralConverterComponent,
  'morse-code-converter': MorseCodeConverterComponent,
  'aspect-ratio-calculator': AspectRatioCalculatorComponent,
  'bitrate-calculator': BitrateCalculatorComponent,
  'codec-comparison': CodecComparisonComponent,
  'color-space-converter': ColorSpaceConverterComponent,
  'compression-calculator': CompressionCalculatorComponent,
  'duration-calculator': DurationCalculatorComponent,
  'frame-rate-converter': FrameRateConverterComponent,
  'resolution-converter': ResolutionConverterComponent,
  'screen-recording-calculator': ScreenRecordingCalculatorComponent,
  'subtitle-timing-calculator': SubtitleTimingCalculatorComponent,


  // Farmers Tools
  // 'crop-yield-calculator': CropYieldCalculatorComponent,
  // 'fertilizer-calculator': FertilizerCalculatorComponent,
  'crop-yield-calculator': CropYieldCalculatorComponent,
  'fertilizer-calculator': FertilizerCalculatorComponent,
  'irrigation-calculator': IrrigationCalculatorComponent,
  'soil-ph-calculator': SoilPhCalculatorComponent,
  'seed-rate-calculator': SeedRateCalculatorComponent,
  'pesticide-calculator': PesticideCalculatorComponent,
  'farm-income-calculator': FarmIncomeCalculatorComponent,
  'livestock-feed-calculator': LivestockFeedCalculatorComponent,
  'weather-crop-advisor': WeatherCropAdvisorComponent,
  'msp-calculator': MspCalculatorComponent,
};
