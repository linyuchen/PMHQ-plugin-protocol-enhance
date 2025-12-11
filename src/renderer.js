import i_poke from './icon/poke.svg'
import i_title from './icon/special-title.svg'

function getTargetByAvatar(rightClickElement) {
    // 判断是否是消息上的头像
    if (rightClickElement.classList.contains('message-container__avatar')) {
        let props = rightClickElement.parentElement.parentElement.parentElement['__VUE__']?.[0].vnode.component.props;
        if (!props) {
            props = rightClickElement.parentElement.parentElement.parentElement.parentElement['__VUE__']?.[0].vnode.component.props;
        }
        if (props.msgRecord.chatType === 1) {
            return {
                targetUin: props.msgRecord.senderUin,
                targetUid: props.msgRecord.senderUid
            }
        } else {
            return {
                groupCode: props.msgRecord.peerUin,
                targetUin: props.msgRecord.senderUin,
                targetUid: props.msgRecord.senderUid
            }
        }
    }
    // 判断是否是群成员列表上的头像
    if (rightClickElement.classList.contains('group-user__avatar')) {
        const vueInstance = rightClickElement.parentElement.parentElement.__VUE__[0];
        const props = vueInstance.props;
        // console.log(props)
        // 通过vue的parent Component 获取群号
        const groupComponent = vueInstance.parent.parent;
        const groupCode = groupComponent.props.groupCode;
        return {
            groupCode,
            targetUin: props.memberData.uin,
            targetUid: props.memberData.uid
        }
    }

    // 小灰条消息
    if (rightClickElement.classList.contains('gray-tip-action')) {
        const vueInstance = rightClickElement.parentElement.__VUE__[0];
        const msgRecord = vueInstance.parent.data.msgRecord
        const targetUin = msgRecord.elements[0].grayTipElement.jsonGrayTipElement.xmlToJsonParam.templParam.get('uin_str1')
        const targetUid = vueInstance.props[3]?.payload.uid
        const groupCode = msgRecord.peerUin
        return {
            groupCode,
            targetUin,
            targetUid
        }
    }
}

function injectCSS() {
    const style = document.createElement('style');
    style.textContent = `
     [q-theme="light"] .my-icon{
        filter: invert(1) hue-rotate(180deg);
      }
`;

// 将 style 元素添加到 <head>
    document.head.appendChild(style);
}

function injectContextMenu() {
    // 可以使用消息id从app.__vue_app__?.config?.globalProperties?.$store?.state?.aio_chatMsgArea获取群号和群成员
    injectCSS()
    // console.log('[协议增强] Inject context menu...');

    // 选择目标节点
    const targetNode = document.body;

    function hookNode(node) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const avatars = node.querySelectorAll('.avatar');
            // console.log(avatars);
            avatars.forEach(avatar => {
                // console.log(avatar);
                avatar.addEventListener('contextmenu', e => {
                    // console.log('右击了头像', e);
                    const targetInfo = getTargetByAvatar(e.target)
                    if (!targetInfo.groupCode) {
                        window.llqqnt_pp.poke(targetInfo.targetUin);
                    }
                });
            });
        }
        if (node?.previousSibling?.classList?.contains('q-context-menu')) {
            const r = node.previousSibling.getBoundingClientRect();
            const rightClickEle = document.elementFromPoint(r.x, r.y);
            // console.log("右击的元素", rightClickEle);
            const isAvatar = rightClickEle.classList.contains('avatar');
            const isGrayTipAction = rightClickEle.classList.contains('gray-tip-action');
            if (isAvatar || isGrayTipAction) {
                let html = `
                <a class="q-context-menu-item q-context-menu-item--normal poke-menu vue-component" bf-label-inner="true">
                     <div class="q-context-menu-item__icon q-context-menu-item__head">
                         <i class="q-svg-icon q-icon" style="width: 16px; height: 16px"> 
                             <img class="my-icon" src="${i_poke}" alt="" style="width: 16px; height: 16px;transform: rotate(90deg) scaleY(-1);">
                         </i>
                     </div>
                    <span class="q-context-menu-item__text">戳一戳</span>
                </a>`
                if (isAvatar) {
                    html +=
                        `<a class="q-context-menu-item q-context-menu-item--normal special-title-menu" bf-label-inner="true">
                        <div class="q-context-menu-item__icon q-context-menu-item__head">
                            <i class="q-svg-icon q-icon" style="width: 16px; height: 16px">
                                <img class="my-icon" src="${i_title}" alt="" style="width: 16px; height: 16px">
                            </i>
                        </div>
                        <span class="q-context-menu-item__text">设置头衔</span>
                    </a>`
                }
                node.previousSibling.insertAdjacentHTML('beforeend', html);
                const targetInfo = getTargetByAvatar(rightClickEle)
                // console.log('[戳一戳] targetInfo:', targetInfo)
                // console.log('[戳一戳] .poke-menu element:', node.previousSibling.querySelector('.poke-menu'))
                const pokeMenu = node.previousSibling.querySelector('.poke-menu')
                if (pokeMenu) {
                    pokeMenu.addEventListener('click', e => {
                        e.preventDefault();
                        e.stopPropagation();
                        // console.log('[戳一戳] 点击了，准备调用 poke', targetInfo);
                        if (!targetInfo) {
                            // console.error('[戳一戳] targetInfo 为空');
                            return;
                        }
                        if (!window.llqqnt_pp?.poke) {
                            // console.error('[戳一戳] window.llqqnt_pp.poke 未定义');
                            return;
                        }
                        window.llqqnt_pp.poke(targetInfo.targetUin, targetInfo.groupCode);
                    });
                } else {
                    // console.error('[戳一戳] 找不到 .poke-menu 元素');
                }

                node.previousSibling.querySelector('.special-title-menu')?.addEventListener('click', e => {
                    // const groupName = document.getElementsByClassName("chat-header__contact-name")[0].firstElementChild.textContent.trim();
                    window.llqqnt_pp.setSpecialTitle(targetInfo.groupCode, targetInfo.targetUid);
                });

            }
        }
    }

    // console.log(targetNode);
    // 配置需要观察的变动类型
    hookNode(targetNode);
    const config = {
        childList: true,      // 观察子节点的变动
        subtree: true         // 观察后代节点
    };

    // 创建一个回调函数，当变动发生时执行
    const callback = function (mutationsList, observer) {
        // console.log(mutationsList);
        for (const mutation of mutationsList) {
            // console.log(mutation.addedNodes);
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(hookNode);
            }
        }
    };

    // 创建一个新的观察者实例并传入回调函数
    const observer = new MutationObserver(callback);

    // 开始观察目标节点并传入配置
    observer.observe(targetNode, config);
}

function onLoad() {
    const injectedWindowIds = new Set();
    window.llqqnt_pp.ipcOn('llqqnt_pp_create_window', (event, args) => {
        // console.log('llqqnt_pp_create_window', args)
        const {windowId} = args;
        if (injectedWindowIds.has(windowId)) {
            return;
        }
        injectedWindowIds.add(windowId);
        injectContextMenu();
    })
}

onLoad()

