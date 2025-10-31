import { InjectionToken } from '@angular/core';
export interface FeatureToggles {
  weatherWidget: boolean;
  sseLiveUpdates: boolean;
}
export const FEATURE_TOGGLES = new InjectionToken<FeatureToggles>('FEATURE_TOGGLES');
