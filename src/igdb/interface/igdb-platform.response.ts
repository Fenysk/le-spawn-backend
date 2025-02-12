export interface IGDBPlatformResponse {
    id: number;
    abbreviation: string;
    alternative_name?: string;
    category: number;
    created_at: number;
    name: string;
    platform_logo: number;
    platform_family?: number;
    slug: string;
    updated_at: number;
    url: string;
    versions: number[];
    websites: number[];
    checksum: string;
    generation?: number;
}