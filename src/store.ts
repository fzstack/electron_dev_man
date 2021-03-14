import { action, autorun, makeObservable, observable } from 'mobx';
import MqttClient from '@/utilities/mqtt_client'


type Origin = {
  topic: string,
  payload: string,
  id: number,
}

type DeviceEvents = 'auth';

type DeviceCallbacks = Pick<{
  'auth': () => void,
}, DeviceEvents>;

export class Device {
  gateway?: string;
  id?: string;
  sn?: string;
  name?: string;
  value?: object;

  authState: boolean = false;
  authTime?: Date;

  private callbacks: Partial<DeviceCallbacks> = {};


  constructor(private outter: DeviceStore) {
    makeObservable(this, {
      gateway: observable,
      id: observable,
      sn: observable,
      name: observable,
      value: observable,
      authState: observable,
      authTime: observable,
      auth: action,
    });
  }

  async auth() {
    if(this.authState) return;

    if(this.gateway == null || this.id == null) {
      throw new Error('sn');
    }

    await this.outter.client.pub(this.gateway, `$cmd=set_did_key&device_sn=${this.sn}&did=${this.id}&key=${this.id.padStart(36, '0')}`)
    this.authState = true;
    this.authTime = new Date();
    this.callbacks['auth']?.();
  }

  async reset() {
    if(this.sn == null || this.gateway == null) {
      throw new Error('reset while sn is null');
    }
    await this.outter.client.pub(this.gateway, `$cmd=autoinitialvalue&device_sn=${this.sn}`);
  }

  async sample() {
    if(this.sn == null || this.gateway == null) {
      throw new Error('reset while sn is null');
    }

    await this.outter.client.pub(this.gateway, `$cmd=sample&device_sn=${this.sn}`);
  }

  async factory() {
    if(this.sn == null || this.gateway == null) {
      throw new Error('reset while sn is null');
    }

    await this.outter.client.pub(this.gateway, `$cmd=FactoryStatus&device_sn=${this.sn}`);
  }

  async setUploadDuration(dur: number) {
    if(this.sn == null || this.gateway == null) {
      throw new Error('reset while sn is null');
    }
    await this.outter.client.pub(this.gateway, `$cmd=set_state_intv&device_sn=${this.sn}&state_intv=${dur}`);
  }

  async setMoniTime(moniTimes: number[]) {
    if(this.sn == null || this.gateway == null) {
      throw new Error('reset while sn is null');
    }
    await this.outter.client.pub(this.gateway, `$cmd=test_intv&time0=${moniTimes[0]}&time1=${moniTimes[1]}&time2=${moniTimes[2]}&time3=${moniTimes[3]}&time4=${moniTimes[4]}`);
  }

  genDid(): string {
    if(this.sn == null)
      throw new Error('sn');

    return new Map([
      ['WG', '10'],
      ['YL', '11'],
      ['LF', '12'],
      ['QJ', '13'],
    ]).get(this.sn.slice(0, 2)) + this.sn.slice(-4);
  }

  getSn(): string {
    if(this.id == null)
      throw new Error('id');

    return `${new Map([
      ['10', 'WG'],
      ['11', 'YL'],
      ['12', 'LF'],
      ['13', 'QJ'],
    ]).get(this.id.substr(0, 2))}0121000000${this.id.substr(-4)}`;
  }

  on<T extends keyof DeviceCallbacks>(event: T, callback: DeviceCallbacks[T]) {
    this.callbacks[event] = callback;
  }
}

export class DeviceStore {
  devices: Device[] = [];
  origins: Origin[] = [];
  autoAuth: boolean = true;

  constructor(public client: MqttClient) {
    makeObservable(this, {
      devices: observable,
      origins: observable,
      autoAuth: observable,
      setAutoAuth: action,
    });

    this.client.on('msg', action(msg => {
      //this.msgs.push(msg);
      try {
        const from = msg.from();
        const params = msg.params();
        const json = params.get('json');
        let device: Device | undefined;
        if(json != null) {
          const [[id, info]]: [string, Object][] = Object.entries(json);
          const [[name, record]]: [string, Object][] = Object.entries(info);
          const [[timeStr, value]]: [string, object][] = Object.entries(record);

          device = this.devices.find(device => device.id == id);
          if(device == null) {
            device = new Device(this);
            device.id = id;
            device.sn = device.getSn();
            this.devices.push(device);
          }
          device.gateway = from;
          device.name = name;
          device.value = value;
          device.authState = true;
        }

        const cmd = params.get('cmd');

        if(cmd == 'get_did_key') {
          const tmpDevice = new Device(this);
          tmpDevice.sn = params.get('device_sn');
          tmpDevice.id = tmpDevice.genDid();
          tmpDevice.authState = false;
          tmpDevice.gateway = from;
          device = this.devices.find(device => device.id == tmpDevice.id);
          if(device == null) {
            device = tmpDevice;
            this.devices.push(device);
          }

          if(this.autoAuth) {
            console.log('auto authing');
            device.auth();
          }
        }

        const sn = params.get('device_sn');
        if(sn != null && device != null) {
          device.sn = sn;
        }


      } catch(e) {

      }
    }));

    this.client.on('origin', action((topic, payload) => {

      this.origins.push({topic, payload: payload.toString('utf8'), id: Math.random()})
      if(this.origins.length > 100) {
        this.origins.shift();
      }
    }));

    autorun(() => {
      console.log({devices: this.devices});
    })
  }

  setAutoAuth(value: boolean) {
    this.autoAuth = value;
  }

}

