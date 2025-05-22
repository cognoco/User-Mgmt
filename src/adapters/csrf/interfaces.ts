export interface CsrfDataProvider {
  generateToken(): Promise<string>;
}
