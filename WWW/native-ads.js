
// Native AdMob bridge. Browser preview intentionally uses no fake ads/rewards.
let native=false, ready=false;
const TEST={
 app:'ca-app-pub-3940256099942544~3347511713',
 banner:'ca-app-pub-3940256099942544/6300978111',
 interstitial:'ca-app-pub-3940256099942544/1033173712',
 rewarded:'ca-app-pub-3940256099942544/5224354917'
};
export async function initAds(){
 try{
  const {Capacitor}=await import('@capacitor/core');
  native=Capacitor.isNativePlatform();
  if(!native)return;
  const {AdMob,AdmobConsentStatus}=await import('@capacitor-community/admob');
  let consent=await AdMob.requestConsentInfo();
  if(consent.isConsentFormAvailable&&consent.status===AdmobConsentStatus.REQUIRED)consent=await AdMob.showConsentForm();
  if(!consent.canRequestAds)return;
  await AdMob.initialize();ready=true;
 }catch(e){console.warn('AdMob unavailable',e)}
}
export async function showBanner(){if(!native||!ready)return;try{const {AdMob,BannerAdSize,BannerAdPosition}=await import('@capacitor-community/admob');await AdMob.showBanner({adId:TEST.banner,adSize:BannerAdSize.ADAPTIVE_BANNER,position:BannerAdPosition.BOTTOM_CENTER,margin:0})}catch(e){console.warn(e)}}
export async function hideBanner(){if(!native||!ready)return;try{const {AdMob}=await import('@capacitor-community/admob');await AdMob.hideBanner()}catch(e){}}
export async function showInterstitial(){if(!native||!ready)return;try{const {AdMob}=await import('@capacitor-community/admob');await AdMob.prepareInterstitial({adId:TEST.interstitial});await AdMob.showInterstitial()}catch(e){console.warn('Interstitial unavailable',e)}}
export async function showRewarded(){if(!native||!ready)return false;try{const {AdMob}=await import('@capacitor-community/admob');await AdMob.prepareRewardVideoAd({adId:TEST.rewarded});const reward=await AdMob.showRewardVideoAd();return !!reward}catch(e){console.warn('Rewarded ad unavailable',e);return false}}
export const testAdUnits=TEST;
