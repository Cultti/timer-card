import { ActionConfig } from 'custom-card-helpers';

// TODO Add your configuration elements here for type-checking
export interface TimerCardConfig {
  type: string;
  name?: string;
  inputDatetimeEntity?: string;
  inputBooleanEntity?: string;
}
