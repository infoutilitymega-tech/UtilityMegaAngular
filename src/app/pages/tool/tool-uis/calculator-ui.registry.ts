import { Type } from '@angular/core';
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

/**
 * Tool UI Registry — maps tool slug → standalone component
 * Used by tool.component.ts to dynamically render the correct UI
 */
export const CALCULATOR_UI_REGISTRY: Record<string, Type<any>> = {
  'sip-calculator':              SipCalculatorComponent,
  'emi-calculator':              EmiCalculatorComponent,
  'compound-interest-calculator': CompoundInterestCalculatorComponent,
  'bmi-calculator':              BmiCalculatorComponent,
  'age-calculator':              AgeCalculatorComponent,
  'percentage-calculator':       PercentageCalculatorComponent,
  'gst-calculator':              GstCalculatorComponent,
  'calorie-calculator':          CalorieCalculatorComponent,
  'discount-calculator':         DiscountCalculatorComponent,
  'retirement-calculator':       RetirementCalculatorComponent,
};
