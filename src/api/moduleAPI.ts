
const NUSMODS_API_URL = "https://api.nusmods.com/v2";

// Temporary assignment
const acadYear = "2019-2020"


export const fetchModuleInfo = async (moduleCode: string) => {
  const res = await fetch(NUSMODS_API_URL + "/" + acadYear + "/" + moduleCode + ".json");
  
  
};