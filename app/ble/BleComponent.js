/* eslint max-len: 0 */
import { Component } from 'react';
import { connect } from 'react-redux';

import { BleManager } from 'react-native-ble-plx';
import * as ble from './BleActions';

class BleComponent extends Component {
  componentWillMount() {
    this.manager = new BleManager();
    this.subscriptions = {};
    this.manager.onStateChange((newState) => {
      console.log(`State changed: ${newState}`);
    });
  }

  componentWillReceiveProps(newProps) {
    // Handle scanning
    if (newProps.scanning !== this.props.scanning) {
      if (newProps.scanning === true) {
        this.manager.startDeviceScan(null, null, (error, device) => {
          if (error) {
            newProps.pushError(error.message);
            newProps.stopScan();
            return;
          }
          if (device.name === null) return;
          // if (device.name.indexOf(ble.NAME_FILTER) !== -1) {
          if (device.name !== null) {
            newProps.deviceFound({
              uuid: device.id,
              name: device.name,
              rssi: device.rssi,
              isConnectable: device.isConnectable,
              services: {},
            });
          }
        });
      } else {
        this.manager.stopDeviceScan();
      }
    }

    // Handle connection state
    switch (newProps.state) {
      case ble.DEVICE_STATE_DISCONNECT:
        this.manager.cancelDeviceConnection(newProps.selectedDeviceId)
          .then((successIdentifier) => {
            newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
          }, (rejected) => {
            if (rejected.message !== 'Cancelled') {
              newProps.pushError(rejected.message);
            }
            newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
          });
        newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTING);
        break;

      case ble.DEVICE_STATE_CONNECT:
        this.manager.connectToDevice(newProps.selectedDeviceId)
          .then((device) => {
            this.subscriptions[device.uuid] = device.onDisconnected((error, disconnectedDevice) => {
              newProps.pushError(`Disconnected from ${disconnectedDevice.name ? disconnectedDevice.name : disconnectedDevice.uuid}`);
              newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
              this.subscriptions[device.uuid].remove();
            });

            newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_DISCOVERING);
            const promise = device.discoverAllServicesAndCharacteristics();
            return promise;
          })
          .then((device) => {
            newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_FETCHING);
            return this.fetchServicesAndCharacteristicsForDevice(device);
          })
          .then(
            (services) => {
              newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_CONNECTED);
              newProps.updateServices(newProps.selectedDeviceId, services);
            },
            (rejected) => {
              newProps.pushError(rejected.message);
              newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_DISCONNECTED);
            },
          );

        newProps.changeDeviceState(newProps.selectedDeviceId, ble.DEVICE_STATE_CONNECTING);
        break;

      default:
        break;
    }

    // Handle operations
    newProps.operations.forEach((value) => {
      const state = value.get('state');
      const deviceId = value.get('deviceIdentifier');
      const serviceId = value.get('serviceUUID');
      const characteristicId = value.get('characteristicUUID');
      const base64Value = value.get('base64Value');
      const type = value.get('type');
      const transactionId = value.get('transactionId');

      switch (type) {
        case 'read':
          if (state !== 'new') return true;
          this.manager.readCharacteristicForDevice(
            deviceId,
            serviceId,
            characteristicId,
          )
            .then((characteristic) => {
              newProps.completeTransaction(transactionId);
              newProps.updateCharacteristic(deviceId, serviceId, characteristicId, { value: characteristic.value });
            }, (rejected) => {
              newProps.pushError(rejected.message);
              newProps.completeTransaction(transactionId);
            });
          newProps.executeTransaction(transactionId);
          break;

        case 'write':
          if (state !== 'new') return true;
          this.manager.writeCharacteristicWithoutResponseForDevice(
            deviceId,
            serviceId,
            characteristicId,
            base64Value,
          )
            .then((characteristic) => {
              newProps.completeTransaction(transactionId);
              newProps.updateCharacteristic(deviceId, serviceId, characteristicId, { value: characteristic.value });
            }, (rejected) => {
              newProps.pushError(rejected.message);
              newProps.completeTransaction(transactionId);
            });
          newProps.executeTransaction(transactionId);
          break;

        case 'monitor':
          if (state === 'new') {
            newProps.updateCharacteristic(deviceId, serviceId, characteristicId, { isNotifying: true });
            this.manager.monitorCharacteristicForDevice(
              deviceId,
              serviceId,
              characteristicId,
              (error, characteristic) => {
                if (error) {
                  if (error.message === 'Cancelled') return;

                  newProps.pushError(error.message);
                  newProps.completeTransaction(transactionId);
                  return;
                }

                newProps.updateCharacteristic(deviceId, serviceId, characteristicId, { value: characteristic.value });
              }, transactionId,
            );
            newProps.executeTransaction(transactionId);
          } else if (state === 'cancel') {
            this.manager.cancelTransaction(transactionId);
            newProps.updateCharacteristic(deviceId, serviceId, characteristicId, { isNotifying: false });
            newProps.completeTransaction(transactionId);
          }
          break;

        default:
          break;
      }

      return true;
    });
  }

  componentWillUnmount() {
    this.manager.destroy();
    delete this.manager;
  }

  async fetchServicesAndCharacteristicsForDevice(device) {
    const servicesMap = {};
    const services = await device.services();

    for (const service of services) {
      // console.log(service);
      const characteristicsMap = {};
      const characteristics = await service.characteristics();

      for (const characteristic of characteristics) {
        console.log(characteristic);
        characteristicsMap[characteristic.uuid] = {
          uuid: characteristic.uuid,
          isReadable: characteristic.isReadable,
          isWritable: characteristic.isWritableWithResponse,
          isNotifiable: characteristic.isNotifiable,
          isNotifying: characteristic.isNotifying,
          value: characteristic.value,
        };
      }

      servicesMap[service.uuid] = {
        uuid: service.uuid,
        isPrimary: service.isPrimary,
        characteristicsCount: characteristics.length,
        characteristics: characteristicsMap,
      };
    }
    return servicesMap;
  }

  render() {
    return null;
  }
}

export default connect(
  state => ({
    operations: state.getIn(['ble', 'operations']),
    scanning: state.getIn(['ble', 'scanning']),
    state: state.getIn(['ble', 'state']),
    selectedDeviceId: state.getIn(['ble', 'selectedDeviceId']),
  }),
  {
    deviceFound: ble.deviceFound,
    changeDeviceState: ble.changeDeviceState,
    serviceIdsForDevice: ble.serviceIdsForDevice,
    stopScan: ble.stopScan,
    updateServices: ble.updateServices,
    updateCharacteristic: ble.updateCharacteristic,
    executeTransaction: ble.executeTransaction,
    completeTransaction: ble.completeTransaction,
    pushError: ble.pushError,
  },
)(BleComponent);
