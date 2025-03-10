export interface IGDBGameLocalizationResponse {
    checksum: string;
    cover?: IGDBGameLocalizationCover;
    createdAt: Date;
    game: number;
    id: number;
    name?: string;
    region: IGDBGameLocalizationRegion;
    updatedAt: Date;
}

export interface IGDBGameLocalizationCover {
    id: number;
    alpha_channel: boolean;
    animated: boolean;
    height: number;
    image_id: string;
    url: string;
    width: number;
    checksum: string;
    game_localization: number;
}

export interface IGDBGameLocalizationRegion {
    id: number;
    name: string;
    category: string;
    identifier: string;
    created_at: number;
    updated_at: number;
    checksum: string;
}