const SteamUser = require('steam-user');
const SteamTotp = require('steam-totp');
const SteamCommunity = require('steamcommunity');
const TradeOfferManager = require('steam-tradeoffer-manager');
const config = require('./config.json');
// const Prices = require('./Prices.json');

const client = new SteamUser();
const community = new SteamCommunity();
const manager = new TradeOfferManager({
    steam: client,
    community,
    pollInterval: 10000,
});

const logOnOptions = {
    accountName: config.username,
    password: config.password,
    // twoFactorCode是用来二步认证的，也就是自动生成验证码
    twoFactorCode: SteamTotp.generateAuthCode(config.sharedSecret)
};

// 登录需要验证码，有个桌面版验证码工具，晚点看一下 
client.logOn(logOnOptions);

client.on('loggedOn', () => {
    console.log('登录成功。');
    //设置账户状态 在线、忙碌...
    client.setPersona(SteamUser.EPersonaState.Online);
    //设置正在玩什么游戏
    // client.gamesPlayed(["Custom Game", 440]);
});

//监听好友发来消息的事件
client.on("friendMessage", (steamID, message) => {
    console.log('friendMessage事件监听到了。')
    if (message === "hi") {
        client.chatMessage(steamID, "你好，已经生效了");
        client.gamesPlayed(["Dota 2", 570]);
    }
    if(message === "a") {
        console.log('a监听到了。')
        manager.getInventoryContents(730, 2, true, (err, inventory, currency) => {
            console.log('inventory监听到了。')
            console.log(err, inventory, currency);
        })
    }
})

// 监听web会话事件
client.on('webSession', (sessionId, cookies, c ) => {
    console.log('websession事件监听到了。', sessionId, cookies);
    manager.setCookies(cookies);
    community.setCookies(cookies);
    community.startConfirmationChecker(20000, config.identitySecret);
})

function acceptOffer(offer) {
    offer.accept((err) => {
        community.checkConfirmations();
        console.log('我们接受了一个报价');
        if (err) {
            console.log("接受报价时出现了一个错误。");
        }
    });
}

function declineOffer(offer) {
    offer.decline((err) => {
        console.log('我们拒绝了一个报价');
        if (err) {
            console.log("拒绝报价时出现了一个错误。");
        }
    });
}

function processOffer(offer) {
    console.log('进入处理报价函数。');
    if (offer.isGlitched() || offer.state === 11) {
        console.log('报价有些小问题，拒绝中。');
        declineOffer(offer);
    } else if (offer.partner.getSteamID64() === config.ownerID) {
        console.log('来自大号的报价，接受！');
        acceptOffer(offer);
    } else {
        // let ourItems = offer.itemsToGive;
        // let theirItems = offer.itemsToReceive;
        // let ourValue = 0;
        // let theirValue = 0;
        // for (let i in ourItems) {
        //     let item = ourItems[i].market_name;
        //     if (Prices[items]) {
        //         ourValue += Prices[item].sell
        //     } else {
        //         console.log('无效值。');
        //         ourValue += 99999;
        //     }
        // }
        // for (let i in theirItems) {
        //     let item = theirItems[i].market_name;
        //     if (Prices[item]) {
        //         theirValue += Prices[item].buy;
        //     } else {
        //     console.log('他们的值不同。');
        //     }
        // }
        // console.log('我们的值：' + ourValue);
        // console.log('他们的值：' + theirValue);
        // if (ourValue <= theirValue) {
        //     acceptOffer(offer);
        // } else {
        //     declineOffer(offer);
        // }
    }
}

// client.setOption('promptSteamGuardCode', false);

manager.on('newOffer', (offer) => {
    console.log('收到新报价。')
    processOffer(offer);

    // if (offer.partner.getSteamID64() === config.ownerID) {
    //     acceptOffer(offer);
    // } else {
    //     declineOffer(offer);
    // }
});

manager.on('unknownOfferSent', (offer) => {
    console.log('收到新报价unknownOfferSent。', offer);
    // processOffer(offer);

    // if (offer.partner.getSteamID64() === config.ownerID) {
    //     acceptOffer(offer);
    // } else {
    //     declineOffer(offer);
    // }
});