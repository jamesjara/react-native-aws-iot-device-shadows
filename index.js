import React, { Component } from 'react';
import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import { AWSIoTData } from './aws-iot-device-sdk-js-react-native.js';

/**
 * Use this class as a React native component
 *
 * @param newConfig
 * @returns {{}}
 * @constructor
 */
class AWSIoTMQTT extends Component {
    
    constructor(props) {
        super(props);
        this.type = props.type === 'shadow' ? 'thingShadow' : 'device';
        this.service = null;
        this.registry = {};
    }
    
    componentDidMount() {
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
    
    addThing(thingId, extraConfig) {
        if (this.type === 'device') {
            console.warn('addthing is only supported for shadows implementations');
            return;
        }
        if (this.registry[thingId]) {
            return;
        }
        const config = {
            persistentSubscribe: true
        };
        if (extraConfig) {
            Object.assign(config, extraConfig);
        }
        this.registry[thingId] = config;
        let callback = null;
        if (this.props.onThingConnected) {
            callback = this.props.onThingConnected.bind(null, thingId);
        }
        this.service.register(thingId, config, callback);
        this.service.on('close', () => {
            delete this.registry[thingId];
            this.service.unregister(thingId);
        });
    }
    
    render() {
        return null;
    }
}

/**
 * Use this class with redux
 *
 * @param configuration
 * @returns {{ AWSIoTMQTTClient }}
 * @constructor
 */
export function AWSIoTMQTTClient(newConfig) {
    const self = { };
    self.service = null;
    self.store = null;
    newConfig.type = newConfig.type === 'shadow' ? 'thingShadow' : 'device';
    
    const config = {
        //
        // Set the AWS region we will operate in.
        //
        region: newConfig.region,
        host: newConfig.host,
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
    
    if (newConfig) {
        Object.assign(config, newConfig);
    }
    
    self.connect = function (accessKeyId, secretAccessKey, sessionToken) {
        config.accessKeyId = accessKeyId;
        config.secretKey = secretAccessKey;
        config.sessionToken = sessionToken;
        self.service = AWSIoTData[config.type](config);
        self.service.on('connect', self.onConnect);
        self.service.on('reconnect', self.onReconnect);
        self.service.on('status', self.onStatus);
        self.service.on('delta', self.onDelta);
        self.service.on('close', self.onClose);
    };
    
    self.setStore = function (store) {
        self.store = store;
    };
    
    self.onConnect = function (test) {
        self.store.dispatch({ type: 'MQTT_ON_CONNECT', test });
    };
    
    self.onReconnect = function (test) {
        self.store.dispatch({ type: 'MQTT_ON_RECONNECT', test });
    };
    
    self.onStatus = function (thingId, statusType, clientToken, stateObject) {
        self.store.dispatch({ type: 'MQTT_ON_STATUS', thingId, statusType, clientToken, stateObject });
    };
    
    self.onDelta = function (thingName, stateObject) {
        self.store.dispatch({ type: 'MQTT_ON_DELTA', thingName, stateObject });
    };
    
    self.onClose = function (test) {
        self.store.dispatch({ type: 'MQTT_ON_CLOSE', test });
    };
    
    return self;
}

export default AWSIoTMQTT;
