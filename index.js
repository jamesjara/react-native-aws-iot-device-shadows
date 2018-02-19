// import AWS from 'aws-sdk/dist/aws-sdk-react-native';
import {AWSIoTData} from './aws-iot-device-sdk-js-react-native.js';

/**
 * Use this class with redux
 *
 * @param {Object} configuration
 * @return {{ AWSIoTMQTTClient }}
 * @constructor
 */
export function AWSIoTMQTTClient(configuration) {
    const self = { };
    self.service = null;
    self.store = null;
    configuration.type = configuration.type === 'shadow' ? 'thingShadow' : 'device';

    const config = {
        //
        // Set the AWS region we will operate in.
        //
        region: configuration.region,
        host: configuration.host,
        //
        // Connect via secure WebSocket
        //
        protocol: 'wss',
        //
        // Set the maximum reconnect time to 8 seconds; this is a browser application
        // so we don't want to leave the user waiting too long for reconnection after
        // re-connecting to the network/re-opening their laptop/etc...
        //
        maximumReconnectTimeMs: 1000,
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
        sessionToken: '',
    };

    if (configuration) {
        Object.assign(config, configuration);
    }

    self.connect = function(accessKeyId, secretAccessKey, sessionToken) {
        config.accessKeyId = accessKeyId;
        config.secretKey = secretAccessKey;
        config.sessionToken = sessionToken;
        self.service = AWSIoTData[config.type](config);
        self.config = config;
        self.service.on('connect', self.onConnect);
        self.service.on('reconnect', self.onReconnect);
        self.service.on('offline', self.onOffline);
        self.service.on('error', self.onError);
        self.service.on('message', self.onMessage);
        self.service.on('status', self.onStatus);
        self.service.on('delta', self.onDelta);
        self.service.on('close', self.onClose);
        self.service.on('timeout', self.onTimeout);
    };

    self.setStore = function(store) {
        self.store = store;
    };

    self.onConnect = function() {
        self.store.dispatch({type: 'MQTT_ON_CONNECT'});
    };

    self.onReconnect = function() {
        self.store.dispatch({type: 'MQTT_ON_RECONNECT'});
    };

    self.onOffline = function() {
        self.store.dispatch({type: 'MQTT_ON_OFFLINE'});
    };

    self.onError = function(error) {
        self.store.dispatch({type: 'MQTT_ON_ERROR', error});
    };

    self.onMessage = function(topic, payload) {
        self.store.dispatch({type: 'MQTT_ON_MESSAGE', topic, payload});
    };

    self.onStatus = function(thingId, statusType, clientToken, stateObject) {
        self.store.dispatch({type: 'MQTT_ON_STATUS', thingId, statusType, clientToken, stateObject});
    };

    self.onDelta = function(thingName, stateObject) {
        self.store.dispatch({type: 'MQTT_ON_DELTA', thingName, stateObject});
    };

    self.onClose = function() {
        self.store.dispatch({type: 'MQTT_ON_CLOSE'});
    };

    self.onTimeout = function(thingName, clientToken) {
        self.store.dispatch({type: 'MQTT_ON_TIMEOUT', thingName, clientToken});
    };

    return self;
}

export default AWSIoTMQTTClient;
