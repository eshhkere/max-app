// Интерфейсы для API
export interface StartSessionRequest {
  comment: string;
  tag: string;
  planned_minutes: number;
}

export interface StartSessionResponse {
  data: {
    session_id: string;
  };
}

export interface CancelSessionRequest {
  session_id: string;
  reason_code?: string;
}

export interface CompleteSessionResponse {
  data: {
    current_coins: number;
    current_level: number;
    current_xp: number;
    earned_coins: number;
    earned_xp: number;
    max_level_xp: number;
  };
}

export interface HeartbeatRequest {
  session_id: string;
}

// Опции тега (для UI)
export interface TagOption {
  id: string;
  label: string;
  emoji: string;
  icon?: string; // ← Добавь это (опционально)
}


// Состояния сессии
export enum SessionState {
  IDLE = 'idle',           // До начала
  CANCEL_PERIOD = 'cancel', // 0-15 сек
  FOCUS = 'focus',         // После 15 сек
  COMPLETED = 'completed', // Завершена
  CANCELLED = 'cancelled'  // Отменена
}

export type ReasonCode = 
  | 'distraction' 
  | 'потерял мотивацию' 
  | 'устал' 
  | 'другое';

