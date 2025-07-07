# 🚗 PINTAR Software

**PINTAR** is a smart parking system available as a **web app**, **iOS**, and **Android** app. This project separates both app and web development for better maintainability and scalability.

---

## 📁 Project Structure

/pintar-platform 
│ 
├── pintar-app → React Native App (iOS and Android) 
├── pintar-backend → Express Backend API 
├── pintar-web → React Native for Web

---

## 📌 Folder Navigation Reminders

Always check your current folder before running commands or adding files. Use the following terminal commands:

| Task                   | Mac/Linux            | Windows           |
|------------------------|----------------------|-------------------|
| Check current folder   | `pwd`                | `cd`              |
| Go back one folder     | `cd ..`              | `cd ..`           |
| Enter a folder         | `cd pintar-app`      | `cd pintar-app`   |
| Check inside folder    | `pwd pintar-app`     | `cd pintar-app`   |


Should there be any errors encounters due to "imports", please run "npm i --force" in Terminal for the project folder.

---

## 📱 Start Mobile/Web App (`pintar-app`)

To run the mobile or web app:

cd pintar-app
npm install       # Only needed on the first run
npm run web       # Run for Web
npx expo start    # Run for Mobile (iOS/Android)

## 🔧 Start Backend Server (pintar-backend)

<!-- SERVER ENDPOIBNT -->
https://server360.i-8ea.com

cd pintar-backend
npm install       # Only needed on the first run
node index.js     # Starts the server
npm run dev       # If using nodemon (optional)

## ✅ Quick Tips

Check your folder before running any command.
Use cd .. to go back a directory.
Always run npm install when opening the project for the first time or after pulling new dependencies.
Use npx expo start for mobile testing, and npm run web for browser-based development.


## You can build APK like this:
Install EAS CLI (Expo Application Services):

npm install -g eas-cli

## Login to Expo:

eas login

## Configure your project:

eas build:configure

## Build an APK:

eas build -p android --profile preview
npx expo run:android
⚡️ After some time, Expo will give you a .apk download link (or .aab for Google Play Store).

## You can even ask for a standalone APK by using this:

eas build -p android --platform=android

---

Let me know if you want this version saved as a file or included in your GitHub repo's root directly!

Changes made as of 26/05/2025 are from changes made by Azizul.