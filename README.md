# OIDA

## Install locally

```shell script
npm install -g cordova
cordova create oida
cd oida
cordova platform add browser
cordova platform add ios
cordova plugin add https://github.com/apache/cordova-plugin-camera.git
```
 
Then clone this repo into `oida/www`

### Launch the server


```shell script
cordova run browser
# cordova run ios # Does not work.
```    

 **Hosting**
 
 To do
 ~~You can test the app here : https://www.screen-club.com/oidaindex/index.html~~
 
 **TO DO**
- Récupérer fichier models.json + bin initiaux issus du workshop
- Renommer dans train.js, les libellés des boutons pour savoir ce que l'on entraine
- refaire une release
- faire un entrainement de l'ia
- faire la doc d'installation de a à z
- faire la doc d'utilisation (chgt des paramètres de Chrome par ex)
