/**
 * 数据上报
 * @params {*} data 上报数据
 * @params {*} options 附加参数
 *
 */
import UUID from 'uuidjs';

import { EVENT_TYPE } from './config/constant';

function getUserIdAndVisitorId() {
  let userId, visitorId;
  userId = window.localStorage.getItem('user_id');
  visitorId = window.localStorage.getItem('visitor_id');
  if (!visitorId) {
    visitorId = UUID.generate();
    window.localStorage.setItem('visitor_id', visitorId);
  }
  if (!userId) {
    userId = visitorId;
  }
  return {
    userId,
    visitorId,
  };
}

export function upload(data, options = {}, isSendBeacon = false) {
  // 获取eventType
  const { eventType = EVENT_TYPE.pv } = options;
  // 获取user_id和visitor_id
  const { userId, visitorId } = getUserIdAndVisitorId();

  const uploadData = `${data}&eventType=${eventType}&user_id=${userId}&visitor_id=${visitorId}`;
  const src = `http://book.youbaobao.xyz:7001/monitor/upload?${uploadData}`;

  if (!isSendBeacon) {
    let img = new Image();
    img.src = src;
    img = null; //内存释放
  } else {
    window.navigator.sendBeacon(src);
  }

  return {
    url: src,
    uploadData,
  };
}

export default upload;
