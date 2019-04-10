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
git clone https://github.com/davith01/easy-forms.git
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
npm install
```
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

* [Ionic-Angular Components](https://ionicframework.com/docs/components/)
* [Cordova Plugin Facebook](https://ionicframework.com/docs/native/facebook/)
* [Cordova build android](https://ionicframework.com/docs/cli/cordova/build/)
* cordova-sqlite-storage
* cordova-plugin-fingerprint-aio
* angular2-signaturepad


## Copyright and license

Easy Maker Framekork is licensed under The MIT License (MIT). Which means that you can use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software. But you always need to state that Colorlib is the original author of this template.

Project is developed by [David Camacho](https://davithc01@gmail.com)
