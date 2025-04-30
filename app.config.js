const appJson = require("./app.json");

export default ({ config }) => {
  return {
    ...config,
    ...appJson,
    android: {
      ...appJson.expo.android,
      googleServicesFile: "./google-services.json",
    },
    ios: {
      ...appJson.expo.ios,
    },
  };
};
