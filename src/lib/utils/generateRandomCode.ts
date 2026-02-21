export const generateRandomCode = (length: number = 6): string => {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // On retire 0,O,1,I pour éviter les confusions
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}