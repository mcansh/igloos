export interface APIResponse {
  date_str: string;
  end_date: string;
  start_date: string;
  local_start_date: string;
  local_end_date: string;
  inventory: string;
  calendar: string;
  calendar_data: { [key: string]: number };
}
