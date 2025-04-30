const appJson = require("./app.json");

export default ({ config }) => {
  return {
    ...config,
    android: {
      ...appJson.expo.android,
      googleServicesFile: "./google-services.json",
    },
    ios: {
      ...appJson.expo.ios,
    },
  };
};
