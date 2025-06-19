export interface IResponse<T = null> {
  success: boolean;
  message: string;
  data?: T | null;
}
