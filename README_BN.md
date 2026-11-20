# GRAVITY FLIP — বাংলা সেটআপ গাইড

## এখন কী তৈরি হয়েছে
- HTML5 Canvas-এ playable endless runner prototype
- এক ট্যাপে gravity flip
- Neon Dark visual, obstacles, score, coins, local best score
- Skin shop, pause, revive/double-coin UI
- Capacitor Android scaffold
- AdMob bridge: Google TEST ad unit IDs দিয়ে native Android-এ banner/interstitial/rewarded

**গুরুত্বপূর্ণ:** Browser preview-তে আসল AdMob চলে না। Rewarded revive/bonus শুধু Android native build-এ ad সফলভাবে reward দিলে দেওয়া হয়। Android project তৈরি ও SDK build না হওয়া পর্যন্ত APK/AAB তৈরি হয়নি।

## প্রয়োজন
কম্পিউটারে Node.js LTS, Android Studio এবং Android SDK লাগবে। শুধু Android ফোন দিয়ে পুরো native APK/AAB build করা সুবিধাজনক নয়।

## কম্পিউটারে চালানো
1. ZIP extract করুন।
2. Project folder-এ Terminal খুলুন।
3. `npm install`
4. `npm run start`
5. Terminal-এর local URL browser-এ খুলুন।

## Android project তৈরি
1. `npm run build`
2. `npx cap add android`
3. `npx cap sync android`
4. `npx cap open android`
5. Android Studio-তে Gradle sync শেষ হলে Emulator/USB device-এ Run করুন।

## AdMob App ID বসানো
1. AdMob account-এ app add করে Android App ID নিন (ফরম্যাট `ca-app-pub-...~...`)।
2. `android/app/src/main/AndroidManifest.xml`-এর `<application>`-এর মধ্যে বসান:
   `<meta-data android:name="com.google.android.gms.ads.APPLICATION_ID" android:value="@string/admob_app_id" />`
3. `android/app/src/main/res/values/strings.xml`-এ যোগ করুন:
   `<string name="admob_app_id">আপনার_ADMOB_APP_ID</string>`
4. প্রথমে কোডে থাকা Google TEST ad unit IDs-ই রাখুন। Live ads দিয়ে নিজের বিজ্ঞাপনে ক্লিক করবেন না।
5. Test সফল হলে `www/native-ads.js`-এ নিজের Banner, Interstitial, Rewarded Ad Unit IDs বসান।
6. `npm run build` এবং `npx cap sync android` আবার চালান।

## Release AAB
Android Studio > Build > Generate Signed Bundle / APK > Android App Bundle > Create/select keystore > release > Finish.
Keystore নিরাপদে ব্যাকআপ রাখুন; হারালে একই signing identity-তে update প্রকাশ কঠিন/অসম্ভব হতে পারে।

## Play Store-এর আগে
- App icon, splash screen, privacy policy URL, Data safety form, content rating, ads declaration সম্পূর্ণ করুন।
- Consent flow ও target audience নীতিমালা যাচাই করুন।
- Interstitial কেবল natural break-এ; gameplay-এর মাঝখানে নয়।
- Google test IDs release-এর আগে নিজের ad unit IDs দিয়ে বদলান।
- বিভিন্ন Android screen size, airplane mode, ad unavailable, pause/resume পরীক্ষা করুন।

## শুধু Android ফোন দিয়ে Cloud Build (GitHub Actions)

এই ZIP-এ `.github/workflows/android-apk.yml` যোগ করা হয়েছে। এটি GitHub Actions দিয়ে Debug APK তৈরি করার চেষ্টা করবে। প্রথমে GitHub-এ ZIP-এর ভেতরের ফাইলগুলো repository-র root-এ upload করুন (ZIP ফাইলটিকে সরাসরি repository-তে রেখে দেবেন না; extract করে ফাইলগুলো upload করতে হবে)।

1. GitHub-এ `gravity-flip-game` repository খুলুন।
2. Add file → Upload files নির্বাচন করুন।
3. ZIP extract করে সব ফাইল ও `.github` folder-সহ upload/commit করুন।
4. Actions tab খুলুন। `Build Gravity Flip Android APK` workflow নির্বাচন করুন।
5. Run workflow চাপুন, অথবা main branch-এ commit করলে workflow নিজে চলবে।
6. সফল হলে workflow run-এর নিচে Artifacts থেকে `gravity-flip-debug-apk` ডাউনলোড করুন।
7. ZIP extract করে `app-debug.apk` ফোনে install করুন। Android যদি অনুমতি চায়, ওই browser/file manager-এর জন্য Install unknown apps অনুমতি দিন।

**নোট:** এটি unsigned/debug APK—নিজের ফোনে পরীক্ষার জন্য। Play Store release-এর জন্য আলাদা signed AAB এবং নিরাপদ upload keystore প্রয়োজন। এই workflow এখনো এখানে GitHub-এ চালিয়ে যাচাই করা হয়নি। Build fail করলে Actions-এর error log/screenshot পাঠান।
