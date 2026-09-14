import config from "constants/config";

const resolveAssetUrl = (path) => {
  if (!path) return path;
  if (/^(https?:)?\/\//i.test(path) || path.startsWith("data:")) return path;
  return `${config.assetBaseUrl}${path}`;
};

export default resolveAssetUrl;
