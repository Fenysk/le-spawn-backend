export const PROMPTS = {
  GAME: 'Analyze the video game images and return the information in the following JSON format: {"title": "string", "platform": "string", "simpleTitle": "string"}',
  COMPARE_GAMES_LIST: 'Analyze the games list and return the correct game Id with the correct game info in the following JSON format: {"gameId": "string"}. Please retrieve the correct game Id from the list of games. If no game matches, return null. Don\'t return anything else. Just the game Id in JSON format.',
} as const;
