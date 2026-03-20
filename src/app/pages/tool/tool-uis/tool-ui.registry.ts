import { Type } from '@angular/core';
import { SipCalculatorComponent } from './sip-calculator.component';
import { EmiCalculatorComponent } from './emi-calculator.component';
import { JsonFormatterComponent } from './json-formatter.component';
import { QrGeneratorComponent } from './qr-generator.component';
import { PasswordGeneratorComponent } from './password-generator.component';
import { BmiCalculatorComponent } from './bmi-calculator.component';
import { WordCounterComponent } from './word-counter.component';
import { Base64EncoderComponent } from './base64-encoder.component';

export const TOOL_UI_REGISTRY: Record<string, Type<any>> = {
  'sip-calculator':     SipCalculatorComponent,
  'emi-calculator':     EmiCalculatorComponent,
  'json-formatter':     JsonFormatterComponent,
  'qr-code-generator':  QrGeneratorComponent,
  'password-generator': PasswordGeneratorComponent,
  'bmi-calculator':     BmiCalculatorComponent,
  'word-counter':       WordCounterComponent,
  'base64-encoder':     Base64EncoderComponent,
};
