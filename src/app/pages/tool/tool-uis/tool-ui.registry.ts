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
  
  // Developer Tools
  'json-formatter': JsonFormatterComponent,
  'base64-encoder': Base64EncoderComponent,
  'hash-generator': HashGeneratorComponent,

  // Text Tools
  'word-counter': WordCounterComponent,
  'text-case-converter': TextCaseConverterComponent,

  // Security Tools
  'password-generator': PasswordGeneratorComponent,

  // SEO Tools
  'meta-tag-generator': MetaTagGeneratorComponent,
  'keyword-density-checker': KeywordDensityCheckerComponent,

  // Unit Converters
  'length-converter': LengthConverterComponent,
  'temperature-converter': TemperatureConverterComponent,

  // Utility Tools
  'qr-code-generator': QrGeneratorComponent,

  // Farmers Tools
  'crop-yield-calculator': CropYieldCalculatorComponent,
  'fertilizer-calculator': FertilizerCalculatorComponent,
};
