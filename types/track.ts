// Base interface for common fields
interface BaseDataEntry {
  id?: string;
  user_id: string;
  date?: string | Date;
}

// Type guard for base fields
const hasBaseFields = (obj: any): obj is BaseDataEntry => (
  obj && 
  typeof obj === 'object' &&
  'id' in obj &&
  'user_id' in obj
);

export interface WaterDataEntry extends BaseDataEntry {
  date: string | Date;
  intake_amount: number;
  waterType: string;
}

export const isWaterDataEntry = (obj: any): obj is WaterDataEntry => (
  hasBaseFields(obj) &&
  'date' in obj &&
  'intake_amount' in obj && 
  'waterType' in obj
);

export interface SleepDataEntry extends BaseDataEntry {
  bed_time: string | Date;
  wakeup_time: string | Date;
  sleep_duration: number;
  sleep_quality: number;
}

export const isSleepDataEntry = (obj: any): obj is SleepDataEntry => (
  hasBaseFields(obj) &&
  'bed_time' in obj &&
  'wakeup_time' in obj &&
  'sleep_duration' in obj &&
  'sleep_quality' in obj
);

export interface WeightDataEntry extends BaseDataEntry {
  date: string | Date;
  weight: number;
  measurement_unit: string;
  picture: string;
}

export const isWeightDataEntry = (obj: any): obj is WeightDataEntry => (
  hasBaseFields(obj) &&
  'date' in obj &&
  'weight' in obj &&
  'measurement_unit' in obj &&
  'picture' in obj
);

export interface DietDataEntry extends BaseDataEntry {
  date: string | Date;
  meal_picture: string;
}

export const isDietDataEntry = (obj: any): obj is DietDataEntry => (
  hasBaseFields(obj) &&
  'date' in obj &&
  'meal_picture' in obj
);

// Generic type for data states
type DataState<T> = {
  [key: string]: T[];
};

export type WaterDataState = DataState<WaterDataEntry>;
export type SleepDataState = DataState<SleepDataEntry>;
export type WeightDataState = DataState<WeightDataEntry>;
export type DietDataState = DataState<DietDataEntry>;

export interface TrackState {
  currentDate: string;
  currentMonth: { month: string; year: string; };
  waterData: WaterDataState;
  sleepData: SleepDataState;
  weightData: WeightDataState;
  dietData: DietDataState;
  loadingTrackWaterData: boolean;
  loadingTrackDietData: boolean;
  loadingTrackSleepData: boolean;
  loadingTrackWeightData: boolean;
}