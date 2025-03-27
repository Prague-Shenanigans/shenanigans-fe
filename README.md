after you clone repo:
npm i
quasar build

run locally:
quasar dev

Android:
quasar build -m capacitor -T android (only first time needed)
quasar dev -m capacitor -T android

iOS:
quasar build -m capacitor -T ios (only first time needed)
quasar dev -m capacitor -T ios



To build for production:

Make sure you have this:
npm install @capacitor/core
npm install @capacitor/android

Add android platform (takes a while):
npx cap add android

Then (root):
quasar build
npx cap sync android
npx cap open android

This opens android studio with built app that points to local static files that are no more hosted on the dev server.

Then in android studio build the apk.