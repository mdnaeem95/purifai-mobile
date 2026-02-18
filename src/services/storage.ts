import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_PREFIX = '@purifai:';

export const saveData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(`${STORAGE_PREFIX}${key}`, jsonValue);
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    throw error;
  }
};

export const loadData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return null;
  }
};

export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

export const clearAllData = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const purifaiKeys = keys.filter((key) => key.startsWith(STORAGE_PREFIX));
    await AsyncStorage.multiRemove(purifaiKeys);
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};
