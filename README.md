## Somfy TaHoma / Connexoon app for Homey
With this app it's possible to connect your Somfy TaHoma or Connexoon box to Homey and control your senarios and IO homecontrol devices / sensors directly from Homey.

### Supported devices / services with most common parameters:
* IO vertical exterior blinds
* IO roller shutters
* IO horizontal awnings
* IO exterior venetian blinds
* Velux IO roof windows
* Velux IO blinds
* Velux IO roller shutters
* Sunis wirefree IO sensor
* Thermis wirefree IO sensor
* Opening Detector IO sensor
* TaHoma scenarios

### Suggestions or problems?
Do you have a suggestion for (or a problem with) this app that you would like implemented?
Please go to the github page and create an issue or pull request with your suggestion/problem.

If you like this app and would like to support its development, consider buying me a cup of coffee.
<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top">
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="hosted_button_id" value="4U7BSXH7G6JPC">
<input type="image" src="https://www.paypalobjects.com/en_US/GB/i/btn/btn_donateCC_LG.gif" border="0" name="submit" alt="PayPal – The safer, easier way to pay online!">
<img alt="" border="0" src="https://www.paypalobjects.com/nl_NL/i/scr/pixel.gif" width="1" height="1">
</form>

### Changelog:

### 1.5.1

### 1.5.0
* App is now compatible with Homey V2.
* Added support for Velux IO exterior roller shutters.
* Apart from setting the window covering state to open or closed, it is now also possible to use a slider to set it to a specific position, in order to use this new feature it is necessary to remove and add the device in Homey.
* App is also compatible with the Somfy Connexoon.

#### 1.4.0
* Added support for the IO Opening Detector.
* Added synchronization speed preference to the settings screen. This enables the user to choose their own synchronization time between Homey and TaHoma. The default time is 10 seconds.

#### 1.3.7
* Fixed a bug that would cause the temperature of the Thermis to be incorrect.

#### 1.3.6
* Fixed a bug that would crash the app.

#### 1.3.5
* Ability to log out of the TaHoma service was added.

#### 1.3.4
* Changed app store assets
* Optimized code for a better performance

#### 1.3.3
* Added an icon for the IO exterior venetian blinds.

#### 1.3.2
* Added support for IO exterior venetian blinds.
* The roller shutters device supports low speed management motors as well.

#### 1.3.1
* Added support for IO horizontal awnings.

#### 1.3.0
* Added support for IO roller shutters.
* Added support for Velux IO roof windows.
* Added support for Velux IO blinds.

#### 1.2.1
* Fixed an issue that would prohibit TaHoma scenarios to be used.
* Fixed an issue where the temperature of the Thermis wouldn’t be processed anymore.
* Fixed an issue where the settings screen would not be visible.
* Fixed an issue where flow triggers wouldn't trigger.
* Fixed an issue where devices couldn't be added anymore.

#### 1.2.0
* App is now compatible with SDK 2.

#### 1.1.0
* Added support for the Somfy Thermis WireFree IO sensor.

#### 1.0.3
* Fixed an issue that would crash the app, if there was an error response from TaHoma.

#### 1.0.2
* A user defined action (which is in progress), can no longer be overwritten by another action through cloud sync.
* Fixed an issue that would crash the app, if the response from the TaHoma API was in the wrong format.

#### 1.0.1
* Because of a difference in blind states between TaHoma and Homey, sometimes it wasn't possible to open halfway closed blinds after a sync with TaHoma cloud or a cloud sync would open the blinds when the user had closed the blinds half way. This is now fixed.

#### 1.0.0
* First release with support for IO vertical exterior blinds and Sunis IO wirefree sensor
