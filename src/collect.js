import qs from 'qs';

import { upload } from './upload';
import { EVENT_TYPE } from './config/constant';

// 钩子函数-参数创建前
let beforeCreateParams;
// 钩子函数-上报日志前
let beforeUpload;
// 钩子函数-上报日志后
let afterUpload;
// 狗子函数-报错
let onError = function (e) {
  console.log(e);
};
// 注册钩子函数
export function registerBeforeCreateParams(callback) {
  beforeCreateParams = callback;
}
export function registerBeforeUpload(callback) {
  beforeUpload = callback;
}
export function registerAfterUpload(callback) {
  afterUpload = callback;
}
export function registerOnError(callback) {
  onError = callback;
}

// 采集基本数据
export function collect(customData = {}, options = {}, isSendBeacon = false, e) {
  /**
   * 1. 采集页面的基本信息
   *    a. 应用
   *    b. 页面
   * 2. 日志上报信息
   *    a. 应用id和页面id
   *    b. 访问时间
   *    c. ua
   * 3. 调用日志上报API
   * */
  let appId, pageId, moduleId, timestamp, ua, url;
  beforeCreateParams && beforeCreateParams();
  // 1. 采集页面的基本信息
  const metaList = document.getElementsByTagName('meta');
  for (let i = 0; i < metaList.length; i++) {
    const meta = metaList[i];
    if (meta.getAttribute('app-id')) {
      appId = meta.getAttribute('app-id');
    }
  }
  const body = document.body;
  pageId = body.getAttribute('page-id');
  if (!appId || !pageId) return;
  if (e) {
    moduleId = e.target.getAttribute('module_id')
  }
  timestamp = Date.now();
  ua = window.navigator.userAgent;
  url = window.location.href;
  // 2. 日志上报信息
  let params = {
    appId,
    pageId,
    moduleId,
    timestamp,
    ua,
    url,
    args: JSON.stringify(customData),
  };
  let data = qs.stringify(params);
  if (beforeUpload) {
    data = beforeUpload(data);
  }
  let uploadUrl, uploadData;
  try {
    const result = upload(data, options, isSendBeacon);
    uploadUrl = result.url;
    uploadData = result.uploadData;
  } catch (e) {
    onError(e);
  } finally {
    afterUpload && afterUpload(uploadUrl, uploadData);
  }
}

// 发送PV日志
export function sendPV() {
  collect({}, { eventType: EVENT_TYPE.pv });
}
// 发送曝光日志
export function sendExp(data = {}, e) {
  collect(data, { eventType: EVENT_TYPE.exp }, false, e);
}
// 发送点击日志
export function sendClick(data = {}, e) {
  collect(data, { eventType: EVENT_TYPE.click }, false, e);
}
// 发送自定义日志
export function sendCustom(data = {}) {
  collect(data, { eventType: EVENT_TYPE.custom });
}
// 发送页面停留时长
export function sendStayTime(data = {}) {
  collect(data, { eventType: EVENT_TYPE.stay }, true);
}
// 发送性能数据
export function sendPerf(data = {}) {
  collect(data, { eventType: EVENT_TYPE.perf }, true);
}
// 发送异常数据
export function sendError(data = {}) {
  collect(data, { eventType: EVENT_TYPE.error }, true);
}

// 使用IntersectionObserver监听需要上报日志的dom
export function collectAppear() {
  const appearEvent = new CustomEvent('onAppear');
  const disappearEvent = new CustomEvent('onDisappear');
  let ob;
  if (window.FycMonitorObserver) {
    ob = window.FycMonitorObserver;
  } else {
    ob = new IntersectionObserver((e) => {
      e.forEach((d) => {
        if (d.intersectionRatio > 0) {
          console.log(d.target.className, 'appear');
          d.target.dispatchEvent(appearEvent);
        } else {
          console.log(d.target.className, 'disappear');
          d.target.dispatchEvent(disappearEvent);
        }
      });
    });
  }
  let obNodeList = window.FycMonitorObserverNodeList || [];
  const appearNodes = document.querySelectorAll('[appear]');
  appearNodes.forEach((node) => {
    if (!obNodeList.includes(node)) {
      ob.observe(node);
      obNodeList.push(node);
    }
  });
  // 避免重复创建IntersectionObserver实例，如果之前创建过，直接复用即可，保证全局只有一个IntersectionObserver实例
  window.FycMonitorObserver = ob;
  // 避免重复对dom进行observe，如果之前已经坚挺了，就无需再次observe，因此需要维护一个已监听过的dom列表。
  window.FycMonitorObserverNodeList = obNodeList;
}

export default {};
