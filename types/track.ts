export interface WaterDataEntry {
  id?: string;
  date: string | Date;
  intake_amount: number;
  user_id: string;
  waterType: string;
}

export type WaterDataState = {
  [key: string]: WaterDataEntry[];
};

export interface TrackState {
  currentDate: string;
  currentMonth: { month: string; year: string; };
  waterData: WaterDataState;
  loadingTrackWaterData: boolean;
  loadingTrackDietData: boolean;
  loadingTrackSleepData: boolean;
  loadingTrackWeightData: boolean;
}