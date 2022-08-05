export const getDataFromStorage = (key: string) => {
  const dataStorageInString = localStorage.getItem(key)
  if (dataStorageInString !== null) {
    const dataStorage = JSON.parse(dataStorageInString)
    return dataStorage
  }
  return null
}
