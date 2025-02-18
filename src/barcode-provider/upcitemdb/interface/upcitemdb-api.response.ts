import { UpcitemdbLookupResponse } from "./upcitemdb-lookup.response";

export interface UpcitemdbApiResponse {
    code: string;
    message?: string;
    error?: string;
    total?: number;
    offset?: number;
    items?: UpcitemdbLookupResponse[];
}