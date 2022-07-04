import {
  sendPV,
  sendExp,
  sendClick,
  sendStayTime,
  sendCustom,
  sendPerf,
  sendError,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
} from './collect';

// 全局监听load事件
window.addEventListener('load', () => {
  collectAppear();
});
// 全局监听点击事件
!window.__DisabledClickMonitor && window.addEventListener('click', (e) => {
  sendClick({target: e.target}, e)
});

// 自动监听当前页面停留时长
window.addEventListener('load', function() {
  window.__FycMonitor_ENTER_TIME = Date.now();
})
window.addEventListener('beforeunload', function() {
  if (window.__FycMonitor_ENTER_TIME) {
    window.__FycMonitor_LEAVE_TIME = Date.now();
    const stayTime = window.__FycMonitor_LEAVE_TIME - window.__FycMonitor_ENTER_TIME;
    sendStayTime({stayTime})
  }
})

// 监控性能指标
let fp = 0;
let fcp = 0;
let lcp = 0;
function observerCallback(performance, observer) {
  performance.getEntries().forEach(timing => {
    if (timing.name === 'first-paint') {
      fp = timing.startTime;
    } else if (timing.name === 'first-contentful-paint') {
      fcp = timing.startTime;
    } else if (timing.entryType === 'largest-contentful-paint') {
      lcp = timing.startTime;
    }
  });
  sendPerf({fp, fcp, lcp})
}
let observer = new PerformanceObserver(observerCallback);
observer.observe({
  entryTypes: ['paint', 'largest-contentful-paint']
})

// 监控异常信息
window.onerror= function(message, source, lineno, colno, error) {
  const stack = error.stack;
  sendError({stack, message});
}
window.onunhandledrejection = function(e) {
  const stack = e.reason.stack;
  const message = e.reason.message;
  sendError({stack, message})
}

window.FycMonitor = {
  sendPV,
  sendExp,
  sendClick,
  sendStayTime,
  sendCustom,
  sendError,
  registerBeforeCreateParams,
  registerBeforeUpload,
  registerAfterUpload,
  registerOnError,
  collectAppear,
};
