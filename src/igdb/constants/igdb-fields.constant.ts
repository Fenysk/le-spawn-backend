export const GAME_FIELDS = [
  'alternative_names.*',
  'category',
  'cover.*',
  'first_release_date',
  'franchise.*',
  'franchises.*',
  'game_localizations.*',
  'genres.*',
  'keywords.*',
  'name',
  'platforms.*',
  'release_dates.*',
  'screenshots.*',
  'slug',
  'storyline',
  'summary',
  'themes.*',
  'url',
  'videos.*',
] as const;

export const PLATFORM_FIELDS = ['*'] as const;

export const GAME_LOCALIZATION_FIELDS = [
  'checksum',
  'cover.*',
  'created_at',
  'game',
  'name',
  'region.*',
  'updated_at',
] as const;
