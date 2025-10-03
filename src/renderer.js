import i_poke from './icon/poke.svg'
import i_title from './icon/special-title.svg'

function getTargetByAvatar(avatarElement) {
    // 判断是否是消息上的头像
    if (avatarElement.classList.contains('message-container__avatar')) {
        const props = avatarElement.parentElement.parentElement.parentElement.__VUE__[0].vnode.component.props
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
    if (avatarElement.classList.contains('group-user__avatar')) {
        const vueInstance = avatarElement.parentElement.parentElement.__VUE__[0];
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
                    const message = getTargetByAvatar(e.target)
                    if (message.chatType === 1) {
                        window.llqqnt_pp.poke(message.senderUin);
                    }
                });
            });
        }
        if (node?.previousSibling?.classList?.contains('q-context-menu')) {
            const r = node.previousSibling.getBoundingClientRect();
            const rightClickEle = document.elementFromPoint(r.x, r.y);
            // console.log("右击的元素", rightClickEle);
            if (rightClickEle.classList?.contains('avatar')) {
                node.previousSibling.insertAdjacentHTML('beforeend',
                    `<a class="q-context-menu-item q-context-menu-item--normal poke-menu vue-component" bf-label-inner="true">
                 <div class="q-context-menu-item__icon q-context-menu-item__head"><i class="q-svg-icon q-icon" style="width: 16px; height: 16px"> 
                 <img class="my-icon" src="${i_poke}" alt="" style="width: 16px; height: 16px;transform: rotate(90deg) scaleY(-1);"></i></div>` +
                    '<span class="q-context-menu-item__text" >戳一戳</span></a>' +
                    '<a class="q-context-menu-item q-context-menu-item--normal special-title-menu">' +
                    `<div class="q-context-menu-item__icon q-context-menu-item__head"><i class="q-svg-icon q-icon" style="width: 16px; height: 16px">
                <img class="my-icon" src="${i_title}" alt="" style="width: 16px; height: 16px"></i></div>` +
                    '<span class="q-context-menu-item__text" >设置头衔</span></a>'
                );
                node.previousSibling.querySelector('.poke-menu').addEventListener('click', e => {
                    const targetInfo = getTargetByAvatar(rightClickEle)
                    // const groupName = document.getElementsByClassName("chat-header__contact-name")[0].firstElementChild.textContent.trim();
                    window.llqqnt_pp.poke(targetInfo.targetUin, targetInfo.groupCode);
                });

                node.previousSibling.querySelector('.special-title-menu').addEventListener('click', e => {
                    const targetInfo = getTargetByAvatar(rightClickEle)
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

