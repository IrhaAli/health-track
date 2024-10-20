export interface WaterDataEntry {
  id?: string;
  date: string | Date;
  intake_amount: number;
  user_id: string;
  waterType: string;
}

export function isWaterDataEntry(obj: any): obj is WaterDataEntry {
  return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'date' in obj &&
      'intake_amount' in obj &&
      'user_id' in obj &&
      'waterType' in obj
  );
}

export interface SleepDataEntry {
  id?: string;
  bed_time: string | Date;
  sleep_duration: number;
  sleep_quality: number;
  user_id: string;
  wakeup_time: string | Date;
}

export function isSleepDataEntry(obj: any): obj is SleepDataEntry {
  return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'bed_time' in obj &&
      'sleep_duration' in obj &&
      'sleep_quality' in obj &&
      'user_id' in obj &&
      'wakeup_time' in obj
  );
}

export interface WeightDataEntry {
  id?: string;
  date: string | Date;
  measurement_unit: string;
  picture: string;
  user_id: string;
  weight: number;
}

export function isWeightDataEntry(obj: any): obj is WeightDataEntry {
  return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'date' in obj &&
      'measurement_unit' in obj &&
      'picture' in obj &&
      'user_id' in obj &&
      'weight' in obj
  );
}

export interface DietDataEntry {
  id?: string;
  date: string | Date;  
  meal_picture: string;
  user_id: string;
}

export function isDietDataEntry(obj: any): obj is DietDataEntry {
  return (
      obj &&
      typeof obj === 'object' &&
      'id' in obj &&
      'date' in obj &&
      'meal_picture' in obj &&
      'user_id' in obj 
  );
}

export type WaterDataState = {
  [key: string]: WaterDataEntry[];
};

export type SleepDataState = {
  [key: string]: SleepDataEntry[];
};

export type WeightDataState = {
  [key: string]: WeightDataEntry[];
};

export type DietDataState = {
  [key: string]: DietDataEntry[];
};

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