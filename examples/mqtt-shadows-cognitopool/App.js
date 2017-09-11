import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import AWSIoTMQTT from '../../../react-native-aws-iot-device-shadows/index.js';

export default class App extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            device: {
                deviceId: "smartDevice1",
                temp: 80
            }
        };
        this.AWSIoTMQTT = null;
    }
    
    componentDidMount() {
        // trigger STS credentials from Cognito Pool
        this.AWSIoTMQTT.shadow.updateWebSocketCredentials(
            accessKeyId,
            secretAccessKey,
            sessionToken
        );
    }
    
    
    
    onConnect() {
        this.AWSIoTMQTT.addThing(this.device.deviceId);
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
                this.AWSIoTMQTT.shadow.get(thingId);
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
        this.AWSIoTMQTT.shadow.get(thingId);
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
        
        this.AWSIoTMQTT.shadow.update(current.deviceId, {
            state: {
                desired: update
            }
        });
    }
    
    render() {
        return (
            <Container>
                <AWSIoTMQTT
                    ref={(ref) => { this.AWSIoTMQTT = ref; }}
                    region="us-west-2"
                    host="asdasd.iot.aws.com"
                    type="shadows"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
