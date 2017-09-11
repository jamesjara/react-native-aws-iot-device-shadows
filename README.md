# aws-iot-device-sdk-js-react-native
React Native Component wrapper for connecting to AWS IoT from a device using SDK JavaScript bundle
 
Allows developers to use the AWS IOT shadow support from a React Native component.  

* [Overview](#overview)
* [Installation](#install)
* [Examples](#examples)
* [API Documentation](#api)
* [Connection Types](#connections) 
* [AWS bundle](#bundle)
* [Debugging mode](#debug)
* [Unit Tests](#unittests)
* [License](#license)
* [Support](#support)

<a name="overview"></a>
## Overview
This document provides instructions on how to install and configure the AWS 
IoT device/Shadow in React Native.

### AWS SDK Dependency
This package is built on top of the AWS SDK [aws-sdk.js](https://github.com/aws/aws-iot-device-sdk-js) which provides two classes: 'device'
and 'thingShadow'. 
 
#### Thing Shadows
The 'thingShadow' class implements additional functionality for accessing Thing Shadows via the AWS IoT
API; the thingShadow class allows devices to update, be notified of changes to,
get the current state of, or delete Thing Shadows from AWS IoT.  Thing
Shadows allow applications and devices to synchronize their state on the AWS IoT platform. 

#### Device
The 'device' class wraps [mqtt.js](https://github.com/mqttjs/MQTT.js/blob/master/README.md) to provide a
secure connection to the AWS IoT platform and expose the [mqtt.js](https://github.com/mqttjs/MQTT.js/blob/master/README.md) interfaces upward.  It provides features to simplify handling of intermittent connections, including progressive backoff retries, automatic re-subscription upon connection, and queued offline publishing with configurable drain rate.

<a name="install"></a>
## Installation

Installing with npm:

```sh
npm install react-native-aws-iot-device-shadows
```

<a name="examples"></a>
## Examples

### MQTT React Native IoT Shadow Class
```js
<AWSIoTMQTT
    ref={(ref) => { this.AWSIoTMQTT = ref; }}
    type="shadow"
    region="us-west-2"
    host="asdasd.iot.aws.com"
    onReconnect={() => this.onConnect()}
    onConnect={() => this.onConnect()}
    onDelta={(thingId, stateObject) => this.onDelta(thingId, stateObject)}
    onStatus={(thingId, statusType, clientToken, stateObject) =>
        this.onStatus(thingId, statusType, clientToken, stateObject)}
    onThingConnected={(thingId) => { this.onThingConnected(thingId); }}
/>
```

### MQTT React Native IoT device Class
```js
<AWSIoTMQTT
    ref={(ref) => { this.AWSIoTMQTT = ref; }}
    type="shadows"
    region="us-west-2"
    host="asdasd.iot.aws.com"
    onReconnect={() => this.onConnect()}
    onConnect={() => this.onConnect()}
    xxxxxxxxx
/>
```
    
<a name="AWSIoTMQTT"></a>
## AWSIoTMQTT

Returns a React Native component whichs wraps xxxxxxxx


<a name="api"></a>
## API Documentation

  * `type`: use 'device' for device type and 'shadows' for ShadowThing
  * `host`: the AWS IoT endpoint you will use to connect
  * `region`: the AWS IoT region you will use to connect
  * `config`: extra configuration for the thingShadow
  * `onConnect`: callback for when the websockets connects
  * `onReconnect`: callback for when the websockets reconnects
  * `onDelta`: callback for delta msg
  * `onStatus`: callback for status msg
  * `onThingConnected`: callback for each registered thing

<a name="connections"></a>
## Connection Types

This react native component only supports one type of connections to the AWS IoT platform:

* MQTT over WebSocket/TLS with SigV4 authentication using port 443


<a name="debug"></a>
## Debug

The enable debug mode for display logging information just pass a object with debug:true

```js
<AWSIoTMQTT
    config={debug:true}
    ...
/>
```

<a name="bundle"></a>
## Re-Creating the bundle with webpack
This IOT JS SDK is packaged with[webpack](https://webpack.js.org/), because currently there is not official support for AWS IOT react native. This  is already bundle it for you using the last version.

```sh
npm run build
```

<a name="unittests"></a>
## Unit Tests

This package includes unit tests which can be run as follows:

```sh
npm test
```

Running the unit tests will also generate code coverage data in the 'reports'
directory.

<a name="license"></a>
## License
This react native component is distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0), see LICENSE.txt and NOTICE.txt for more information.

<a name="suport"></a>
## Support
feel free to open any ticket in github issues
