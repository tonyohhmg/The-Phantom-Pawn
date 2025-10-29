import { PlayerProfile } from '../types';
import { LEVEL_THRESHOLDS, generateAvatarUrl } from '../constants';

const PROFILE_KEY = 'phantomPawnPlayerProfile';

const getLevelForWins = (wins: number): number => {
  // Find the highest level the player has achieved
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (wins >= LEVEL_THRESHOLDS[i]) {
      return i + 1; // Levels are 1-based
    }
  }
  return 1;
};

export const getProfile = (): PlayerProfile => {
  try {
    const profileJson = localStorage.getItem(PROFILE_KEY);
    if (profileJson) {
      const profile: PlayerProfile = JSON.parse(profileJson);
      // Ensure level is correctly calculated in case logic changes
      profile.level = getLevelForWins(profile.wins);
      // Backwards compatibility: add avatar if it doesn't exist
      if (!profile.avatarUrl) {
        profile.avatarUrl = generateAvatarUrl(profile.name);
      }
      // Backwards compatibility: add draws if it doesn't exist
      if (profile.draws === undefined) {
        profile.draws = 0;
      }
      return profile;
    }
  } catch (error) {
    console.error("Failed to load player profile:", error);
  }
  
  // Return a default profile if none exists or loading fails
  const defaultName = 'Player';
  return {
    name: defaultName,
    wins: 0,
    level: 1,
    avatarUrl: generateAvatarUrl(defaultName),
    draws: 0,
  };
};

export const saveProfile = (profile: PlayerProfile): void => {
  try {
    // Recalculate level before saving to ensure consistency
    const profileToSave: PlayerProfile = {
        ...profile,
        level: getLevelForWins(profile.wins),
    };
    // Ensure avatar exists before saving
    if (!profileToSave.avatarUrl) {
        profileToSave.avatarUrl = generateAvatarUrl(profileToSave.name);
    }
    // Ensure draws exists before saving
    if (profileToSave.draws === undefined) {
        profileToSave.draws = 0;
    }
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profileToSave));
  } catch (error) {
    console.error("Failed to save player profile:", error);
  }
};
