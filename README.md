# Easy Forms

This project uses the [Ionic](https://ionicframework.com/docs/intro) Framework components for apps Android .

## Quick start


**Installation prerequisites**

Please make sure latest [Node](https://nodejs.org/es/), [Git](https://git-scm.com/downloads) and [Yarn](https://yarnpkg.com/lang/en/docs/install/) package are installed


**Install Framework**

Install or rebuild last component to Node, IONIC and Cordova.
```
npm install -g npm
npm install -g ionic
npm install -g cordova
```

You can verify your installation with the command.
```
ionic --version 
```

**GitHub Versioning Tools**

For clone the easy-form repository, you can using the git-Cli.

```
git clone https://github.com/EstrategicaEasyForm/easy-forms.git
```

or you can clone repository in Github Client.

```
Create your personal account on [Github](https://github.com/)
Download for Windows (msi): [https://desktop.github.com/](https://desktop.github.com/)
```

**Install dependencies package**
```
cd easy-forms/
```
```
yarn install
```

To test server use. In this mode the Cordova plugins doesn't work
```
ionic serve
```

**Android Platform**

Read this steps for Android Platform Setup [https://ionicframework.com/docs/installation/android](https://ionicframework.com/docs/installation/android) .

Add platform android to the IONIC proyect.

```
ionic cordova platform add android
```

Build platform android.

```
ionic cordova build android
```

**Test app in simulator devices**

Downdolad Genymotion [https://www.genymotion.com](https://www.genymotion.com). User account is required for test!.

Add new AVD (Android Virtual Device) lasted API22 and Run AVD.

For testing the app with the AVD running in Genymotion, 

```
ionic run android --device
```
## Liberies / Plugins included 
* [Ionic-Components](https://ionicframework.com/docs/components/)
* [cordova-plugin-network-information](https://ionicframework.com/docs/native/network)
* [signature_pad](https://www.npmjs.com/package/signature_pad)
* [ApolloGraqhl]() 
* [ApolloGraqhl-Link](https://www.apollographql.com/docs/link/links/error)
* [fingerprint-aio](https://ionicframework.com/docs/native/fingerprint-aio)
* [pdf-maker](https://pdfmake.github.io/docs/)
* [pdf-maker-tutorial](https://ionicacademy.com/create-pdf-files-ionic-pdfmake/)
* [local-storage](https://ionicframework.com/docs/building/storage)
* [LoadingController](https://ionicframework.com/docs/v3/api/components/loading/LoadingController/)
* [ToastController](https://ionicframework.com/docs/v3/api/components/toast/ToastController/)
* [FontAwesome](https://github.com/FortAwesome/angular-fontawesome)

## Copyright and license

Easy Forms App is licensed for Estrategica&copy; 2019.

Project is developed by [EstrategicaComunicaciones](https://github.com/EstrategicaEasyForm)
