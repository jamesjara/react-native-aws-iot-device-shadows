# aws-iot-device-sdk-js-react-native
React Native Component wrapper for connecting to AWS IoT from a device using SDK JavaScript bundle
 
Allows developers to use the AWS IOT shadow support from a React Native component.  

* [Overview](#overview)
* [Installation](#install)
* [Examples](#examples)
* [API Documentation](#api)
* [Connection Types](#connections)
* [Example Programs](#programs)
* [Browser Applications](#browser)
* [Troubleshooting](#troubleshooting)
* [Unit Tests](#unittests)
* [License](#license)
* [Support](#support)

<a name="overview"></a>
## Overview
This document provides instructions on how to install and configure the AWS 
IoT Shadow React Native and includes examples.

### AWS SDK Dependency
This package is built on top of the AWS SDK Dependency [aws-sdk.js](https://github.com/aws/aws-iot-device-sdk-js) which provides two classes: 'device'
and 'thingShadow'.  The 'device' class wraps [mqtt.js](https://github.com/mqttjs/MQTT.js/blob/master/README.md) to provide a
secure connection to the AWS IoT platform and expose the [mqtt.js](https://github.com/mqttjs/MQTT.js/blob/master/README.md) interfaces upward.  It provides features to simplify handling of intermittent connections, including progressive backoff retries, automatic re-subscription upon connection, and queued offline publishing with configurable drain rate.

### Thing Shadows
The 'thingShadow' class implements additional functionality for accessing Thing Shadows via the AWS IoT
API; the thingShadow class allows devices to update, be notified of changes to,
get the current state of, or delete Thing Shadows from AWS IoT.  Thing
Shadows allow applications and devices to synchronize their state on the AWS IoT platform. 

<a name="install"></a>
## Installation

Installing with npm:

```sh
npm install aws-iot-device-sdk-js-react-native
```

<a name="examples"></a>
## Examples

### MQTT React Native IoT Shadow Class
```js
<AWSIoTShadows
    ref={(ref) => { this.AWSIoTShadows = ref; }}
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

### Thing Shadow React Native Full Example Class
```js
import React, { Component } from 'react'; 
import AWSIoTShadows from 'react-native-aws-iot-device-shadows';

class MQTTAWSIOTShadows extends Component {

    constructor(props) {
        super(props);
        this.state = {
            device: {
              deviceId: "smartDevice1",
              temp: 80
            }
        };
        this.AWSIoTShadows = null;
    }

    componentDidMount() {
        // trigger STS credentials from Cognito Pool
        this.AWSIoTShadows.shadow.updateWebSocketCredentials(
                accessKeyId,
                secretAccessKey,
                sessionToken
       );
    } 

    onConnect() {
        this.AWSIoTShadows.addThing(this.device.deviceId);
    }

    onDelta(thingId, stateObject) {
        if (stateObject.state.device && stateObject.state.device.temp) {
            this.updateState(thingId, {
                temp: stateObject.state.temp
            });
        }
    }

    onStatus(thingId, statusType, clientToken, stateObject) {
        if (statusType === 'rejected') {
            //
            // If an operation is rejected it is likely due to a version conflict;
            // request the latest version so that we synchronize with the shadow
            // The most notable exception to this is if the thing shadow has not
            // yet been created or has been deleted.
            // if gets still in progress client token of the will be null
            //
            if (stateObject.code !== 404) {
                this.AWSIoTShadows.shadow.get(thingId);
            }
        } else if (statusType === 'accepted') {
            if (stateObject.state && stateObject.state.desired && stateObject.state.desired.temp) {
                this.updateState(thingId, {
                    temp: stateObject.state.desired.temp
                });
            }
        }
    }

    onThingConnected(thingId) {
        this.AWSIoTShadows.shadow.get(thingId);
    }

    updateState(thingId, sensors) {
        Object.assign(this.device, sensors);

        this.setState({
            device
        });
    }

    updateShadow(key) {
        const current = this.data.device;

        const update = {
            [key]: ((Math.floor(Math.random() * (99 - 1)) + 1))
        };

        this.AWSIoTShadows.shadow.update(current.deviceId, {
            state: {
                desired: update
            }
        });
    }

    render() {
        return (
            <Container>
                <AWSIoTShadows
                    ref={(ref) => { this.AWSIoTShadows = ref; }}
                    region="us-west-2"
                    host="asdasd.iot.aws.com"
                    onConnect={() => this.onConnect()}
                    onDelta={(thingId, stateObject) => this.onDelta(thingId, stateObject)}
                    onStatus={(thingId, statusType, clientToken, stateObject) =>
                        this.onStatus(thingId, statusType, clientToken, stateObject)}
                    onThingConnected={(thingId) => { this.onThingConnected(thingId); }}
                />
                <Text>{this.state.device.temp}</Text>
                <Button
                    onPress={() => this.updateShadow('temp')}
                >
                  <Text>Update Shadow Randomly</Text>
                </Button>
            </Container>
        );
    }
}

export default MQTTAWSIOTShadows;
```
    
<a name="AWSIoTShadows"></a>
### AWSIoTShadows

Returns a wrapper for the [awsIot.thingShadow()](https://github.com/aws/aws-iot-device-sdk-js#client) 
class, configured for a WSS connection with the AWS IoT platform and with 
arguments as specified in `options`.  The AWSIoT-specific arguments are as 
follows:

<a name="api"></a>
### API Documentation

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

##### Debug

The enable debug mode for display logging information just pass a object with debug:true

```js
<AWSIoTShadows
    config={debug:true}
    ...
/>
```

<a name="bundle"></a>
## Re-Creating the bundle with webpack
This IOT JS SDK is packaged with[webpack](https://webpack.js.org/), because currently there is not support for react native, it is already bundle for you using the last version.

```sh
./node_modules/.bin/webpack --config webpack.config.js
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
This SDK is distributed under the [Apache License, Version 2.0](http://www.apache.org/licenses/LICENSE-2.0), see LICENSE.txt and NOTICE.txt for more information.

<a name="suport"></a>
## Support
feel free to open any ticket in github issues
