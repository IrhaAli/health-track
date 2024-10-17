export interface WaterDataEntry {
  id?: string;
  date: string | Date;
  intake_amount: number;
  user_id: string;
  waterType: string;
}

export interface SleepDataEntry {
  id?: string;
  bed_time: string | Date;
  sleep_duration: number;
  sleep_quality: number;
  user_id: string;
  wakeup_time: string | Date;
}

export interface WeightDataEntry {
  id?: string;
  date: string | Date;
  measurement_unit: string;
  picture: string;
  user_id: string;
  weight: number;
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

export interface TrackState {
  currentDate: string;
  currentMonth: { month: string; year: string; };
  waterData: WaterDataState;
  sleepData: SleepDataState;
  weightData: WeightDataState;
  loadingTrackWaterData: boolean;
  loadingTrackDietData: boolean;
  loadingTrackSleepData: boolean;
  loadingTrackWeightData: boolean;
}