import React, {Component} from 'react';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import {AWSIoTData} from './aws-iot-device-sdk-js-react-native.js';

class AWSIoT_shadows extends Component {
    
    constructor(props){
        super(props);
        this.shadow = null;
        this.registry = {};
    }
    
    componentDidMount(){
          
        this.shadow = AWSIoTData.thingShadow({
            //
            // Set the AWS region we will operate in.
            //
            region: this.props.region,
            host: this.props.host,
            //
            // Use the clientId created earlier.
            //
            clientId: 'pro1-' + (Math.floor((Math.random() * 100000) + 1)),
            //
            // Connect via secure WebSocket
            //
            protocol: 'wss',
            //
            // Set the maximum reconnect time to 8 seconds; this is a browser application
            // so we don't want to leave the user waiting too long for reconnection after
            // re-connecting to the network/re-opening their laptop/etc...
            //
            minimumConnectionTimeMs: 8000,
            maximumReconnectTimeMs: 8000,
            baseReconnectTimeMs: 1000,
            //
            // Enable console debugging information (optional)
            //
            debug: true,
            //
            // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
            // initialized with empty strings.
            //
            accessKeyId: '',
            secretKey: '',
            sessionToken: ''
        });
    
        if (this.props.thing) {
            this.addThing(this.props.thing);
        }
        
        if (this.props.onConnect) {
            this.shadow.on('connect', this.props.onConnect);
        }
        
        if (this.props.onReconnect) {
            this.shadow.on('reconnect', this.props.onReconnect);
        }
        
        if (this.props.onDelta) {
            this.shadow.on('delta', this.props.onDelta);
        }
    
        if (this.props.onStatus) {
            this.shadow.on('status', this.props.onStatus);
        }
    }
    
    addThing (thingId, config ) {
        if(this.registry[thingId]){
            console.log("thing is already registered");
            return;
        }
        config = {
            persistentSubscribe: true
        };
        this.registry[thingId] = config;
        let callback = null;
        if (this.props.onThingConnected) {
            callback = this.props.onThingConnected.bind(null, thingId ) ;
        }
        this.shadow.register(thingId, config, callback );
    }
    
    render (){
        return null
    }
}

export default AWSIoT_shadows