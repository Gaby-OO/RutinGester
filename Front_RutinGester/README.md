# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Auth0 / Expo AuthSession Setup

This project uses Auth0 with Expo AuthSession (Authorization Code + PKCE) on the login screen.

1. In `app.json` set (already present):
    ```jsonc
    "extra": {
       "EXPO_PUBLIC_AUTH0_DOMAIN": "YOUR_DOMAIN.auth0.com",
       "EXPO_PUBLIC_AUTH0_CLIENT_ID": "YOUR_CLIENT_ID"
    },
    "scheme": "rutingester"
    ```
2. Auth0 Application (Regular Web App):
    - Allowed Callback URLs:
       - `rutingester://` (Expo Go / Dev)
    - Allowed Logout URLs:
       - `rutingester://`
    - Allowed Web Origins (if using Universal Login):
       - `https://YOUR_DOMAIN.auth0.com`
3. (Optional native builds) Add platform specific schemes:
    - iOS: ensure Bundle Identifier matches `com.rutingester` (already set) and add `com.rutingester://` to callbacks if needed.
    - Android: package name `com.rutingester`; add `com.rutingester://` to callbacks if you later customize the scheme.
4. If you change the scheme in `app.json`, update Allowed Callback / Logout URLs accordingly.

Token exchange happens client-side; ID token is decoded for basic profile. Role selected in UI is local-only (consider a custom claim like `https://rutingester.app/role` in Auth0 Rules/Actions for persistence later).

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
