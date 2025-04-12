import { GameCategoryEnum } from "@prisma/client";

export enum GameCategoryEnumInt {
    mainGame = 0,
    dlcAddon = 1,
    expansion = 2,
    bundle = 3,
    standaloneExpansion = 4,
    mod = 5,
    episode = 6,
    season = 7,
    remake = 8,
    remaster = 9,
    expandedGame = 10,
    port = 11,
    fork = 12,
    pack = 13,
    update = 14
}

export function getGameCategoryEnum(value: number): GameCategoryEnum {
    const category = GameCategoryEnumInt[value];
    if (category in GameCategoryEnum)
        return category as GameCategoryEnum;

    return GameCategoryEnum.mainGame;
}