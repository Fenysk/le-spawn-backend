export interface IGDBGameResponse {
  id: number;
  category: number;
  cover: Cover;
  first_release_date: number;
  franchises: Franchise[];
  genres: Genre[];
  name: string;
  platforms: Platform[];
  release_dates: ReleaseDate[];
  screenshots: Screenshot[];
  slug: string;
  storyline: string;
  summary: string;
  themes: Theme[];
  url: string;
  videos: Video[];
}

interface Cover {
  id: number;
  alpha_channel: boolean;
  animated: boolean;
  game: number;
  height: number;
  image_id: string;
  url: string;
  width: number;
  checksum: string;
}

interface Franchise {
  id: number;
  created_at: number;
  games: number[];
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
}

interface Genre {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
}

interface Platform {
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

interface ReleaseDate {
  id: number;
  category: number;
  created_at: number;
  date: number;
  game: number;
  human: string;
  m: number;
  platform: number;
  region: number;
  updated_at: number;
  y: number;
  checksum: string;
  status: number;
}

interface Screenshot {
  id: number;
  alpha_channel: boolean;
  animated: boolean;
  game: number;
  height: number;
  image_id: string;
  url: string;
  width: number;
  checksum: string;
}

interface Theme {
  id: number;
  created_at: number;
  name: string;
  slug: string;
  updated_at: number;
  url: string;
  checksum: string;
}

interface Video {
  id: number;
  game: number;
  name: string;
  video_id: string;
  checksum: string;
}
