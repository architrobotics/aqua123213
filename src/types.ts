export type UserProfile = {
  id: string;
  weight: number;
  height: number;
  age: number;
  activity_level: 'Low' | 'Moderate' | 'High' | 'Very High';
  climate: 'Cold' | 'Temperate' | 'Hot' | 'Humid';
  skin_goal: 'Acne reduction' | 'Clear skin' | 'Hydration' | 'General wellness';
  water_goal: number;
  name?: string;
};

export type HydrationLog = {
  id: string;
  user_id: string;
  amount_ml: number;
  timestamp: string;
  source: 'manual' | 'bottle' | 'meal_adjustment' | 'sweat_mode';
};

export type Bottle = {
  id: string;
  user_id: string;
  name: string;
  volume_ml: number;
  image_url?: string;
};

export type Meal = {
  id: string;
  user_id: string;
  image_url?: string;
  ai_analysis: string;
  timestamp: string;
  water_adjustment_ml: number;
};

export type SkinLog = {
  id: string;
  user_id: string;
  skin_status: 'Clear' | 'Dry' | 'Acne breakout' | 'Irritated';
  notes?: string;
  timestamp: string;
};
