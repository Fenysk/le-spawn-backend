import { IGDBMetadata } from "./igdb-metadata.interface";
import { ScandexApiResponse } from "./scandex-api.response";

export interface LookupResponse extends ScandexApiResponse {
  id?: number;
  is_suggestion?: boolean;
  name?: string;
  platform?: string;
  igdb_metadata?: IGDBMetadata | null;
}
