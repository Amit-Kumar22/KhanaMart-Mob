
// On Android emulator, localhost = 10.0.2.2
// On physical Android device or iOS, use your actual server IP
const getBaseURL = () => {
  // Your actual backend server IP — change this to your server's public IP
  return "http://76.13.245.49:8081";
};

export const ENV = {
  API_BASE_URL: getBaseURL(),
  API_VERSION: "v1",
} as const;
