import React, {Component} from 'react';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import {AWSIoTData} from './aws-iot-device-sdk-js-react-native.js';

class AWSIoTMQTT extends Component {
    
    constructor(props){
        super(props);
        this.type = props.type === 'shadow' ? 'thingShadow' : 'device';
        this.service = null;
        this.registry = {};
    }
    
    componentDidMount(){
        
        const config = {
            //
            // Set the AWS region we will operate in.
            //
            region: this.props.region,
            host: this.props.host,
            //
            // Connect via secure WebSocket
            //
            protocol: 'wss',
            //
            // Set the maximum reconnect time to 8 seconds; this is a browser application
            // so we don't want to leave the user waiting too long for reconnection after
            // re-connecting to the network/re-opening their laptop/etc...
            //
            maximumReconnectTimeMs: 8000,
            //
            // Enable console debugging information (optional)
            //
            debug: false,
            //
            // IMPORTANT: the AWS access key ID, secret key, and sesion token must be
            // initialized with empty strings.
            //
            accessKeyId: '',
            secretKey: '',
            sessionToken: ''
        };
    
        if (this.props.config) {
            Object.assign(config, this.props.config);
        }
        
        console.log(this.type);
        this.service = AWSIoTData[this.type](config);
        
        if (this.props.onConnect) {
            this.service.on('connect', this.props.onConnect);
        }
        
        if (this.props.onReconnect) {
            this.service.on('reconnect', this.props.onReconnect);
        }
        
        if (this.props.onDelta) {
            this.service.on('delta', this.props.onDelta);
        }
    
        if (this.props.onStatus) {
            this.service.on('status', this.props.onStatus);
        }
    
        if (this.props.onClose) {
            this.service.on('close', this.props.onClose);
        }
    
        if (this.props.onOffline) {
            this.service.on('offline', this.props.onOffline);
        }
    }
    
    addThing (thingId, extraConfig ) {
        if(this.type==='device'){
            console.warn('addthing is only supported for shadows implementations');
            return;
        }
        if(this.registry[thingId]){
            return;
        }
        let config = {
            persistentSubscribe: true
        };
        if(extraConfig){
            Object.assign(config, extraConfig);
        }
        this.registry[thingId] = config;
        let callback = null;
        if (this.props.onThingConnected) {
            callback = this.props.onThingConnected.bind(null, thingId ) ;
        }
        this.service.register(thingId, config, callback );
        this.service.on('close', () => {
            delete this.registry[thingId];
            this.service.unregister(thingId);
        });
    }
    
    render (){
        return null
    }
}

export default AWSIoTMQTT
