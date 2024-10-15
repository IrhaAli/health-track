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

export type WaterDataState = {
  [key: string]: WaterDataEntry[];
};

export type SleepDataState = {
  [key: string]: SleepDataEntry[];
};

export interface TrackState {
  currentDate: string;
  currentMonth: { month: string; year: string; };
  waterData: WaterDataState;
  sleepData: SleepDataState;
  loadingTrackWaterData: boolean;
  loadingTrackDietData: boolean;
  loadingTrackSleepData: boolean;
  loadingTrackWeightData: boolean;
}