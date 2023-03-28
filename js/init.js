const GET_LOCATION_HREF = 'get-location-href'
const TOGGLE_LIVE2D = 'toggle-live2d'
const TOFFLE_GRAYSCALE = 'toggle-grayscale'
const TOGGLE_LOCK = 'toggle-lock'

/**
 * @description: 初始化
 * 此页面的所有方法都不能直接在页面中调用，需要通过注入的js调用
 */
// live2dWidget.init({
//   model: {
//     jsonPath: chrome.runtime.getURL('assets/asuna_04.model.json'),
//   },
//   display: {
//     superSample: 2,
//     width: 300,
//     height: 400,
//     position: 'left',
//     hOffset: 0,
//     vOffset: 0,
//   },
// })

/**
 * 在下一轮事件循环动作，确保DOM已经生成
 */
setTimeout(() => {
  const href = location.href
  const status = localStorage.getItem(href + TOGGLE_LIVE2D)
  toggleLive2d(+status)
  /**
   * 看板娘拖动事件
   */

  const modelDom = document.getElementById('live2d-widget')
  let mousePosition = {
    x: 0,
    y: 0
  }

  modelDom.addEventListener('dragstart', async (event) => {
    mousePosition.x = event.offsetX
    mousePosition.y = event.offsetY
  })

  modelDom.addEventListener('dragend', async (event) => {
    modelDom.style.left = event.screenX - mousePosition.x + "px";
    modelDom.style.top = event.screenY - mousePosition.y - (window.outerHeight - window.innerHeight) + "px";
  })
}, 0)

addListener()

/**
 * 添加监听
 * @returns
 */
function addListener() {
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const { cmd, storage, status } = request
    const href = location.href

    if (cmd === GET_LOCATION_HREF) {
      sendResponse({ href })
      toggleLive2d(storage[href + TOGGLE_LIVE2D])
      return
    }

    if (cmd === TOGGLE_LIVE2D) {
      sendResponse({ href })
      toggleLive2d(status)
      localStorage.setItem(href + TOGGLE_LIVE2D, +status)
      return
    }

    if (cmd === TOGGLE_LOCK) {
      
      toggleLock(status)
      return
    }
    
    if (cmd === TOFFLE_GRAYSCALE) {
      toggleGrayscale(status)
      return
    }
  })
}

/**
 * 开关看板娘
 * @returns
 */
function toggleLive2d(status) {
  const ele = document.getElementById('live2d-widget')

  if (!ele) {
    console.error('liveDom is undefined')
    return
  }

  if (status) {
    ele.style.display = 'block'
    ele.draggable = true
    ele.style.pointerEvents = 'auto'
  } else {
    ele.style.display = 'none'
  }
}

/**
 * 全屏置灰/还原
 * @returns
 */
function toggleGrayscale(status) {
  const dom = document.documentElement

  if (status) {
    dom.classList.add('gray')
    dom.classList.remove('colored')
  } else {
    dom.classList.add('colored')
    dom.classList.remove('gray')
  }
}

/**
 * 锁定
 * @returns
 */
function toggleLock(status) {
  const ele = document.getElementById('live2d-widget')

  if (status) {
    ele.draggable = false
    ele.style.pointerEvents = 'none'
  } else {
    ele.draggable = true
    ele.style.pointerEvents = 'auto'
  }
}


/**
 * 向页面注入JS；注入的js内部的方法能给页面调用
 * @param {*} jsPath
 */
function injectCustomJs(jsPath = 'js/inject.js', local) {
  const temp = document.createElement('script')
  temp.setAttribute('type', 'text/javascript')
  temp.src = local ? chrome.runtime.getURL(jsPath) : jsPath // chrome-extension://mdlgngagnfhcadopgbhkbpgmohbeedmd/js/inject.js
  document.head.appendChild(temp)
}
