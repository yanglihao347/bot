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

const playDota2 = (steamID) => {
    client.chatMessage(steamID, "已开始运行dota2");
    client.gamesPlayed(["Dota 2", 570]);
}

const checkCSGOInventory = (steamID) => {
    manager.getInventoryContents(730, 2, true, (err, inventory, currency) => {
        if(err) {
            console.log(err);
            return err;
        }
        client.chatMessage(steamID, `csgo库存为${inventory.length}`);
        console.log('inventory监听到了。', inventory.length);
    })
}

//监听好友发来消息的事件
client.on("friendMessage", (steamID, message) => {
    console.log('friendMessage事件监听到了。')
    switch(message){
        case 'hi':
            playDota2(steamID);
            break;
        case 'a':
            checkCSGOInventory(steamID);
            break;
        default:
            console.log('未能识别指令。')
            
    }
})

// 监听web会话事件
client.on('webSession', (sessionId, cookies, c ) => {
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
    if (offer.isGlitched() || offer.state === 11) {
        console.log('报价有些小问题，拒绝中。');
        declineOffer(offer);
    } else if (offer.partner.getSteamID64() === config.ownerID) {
        console.log('来自大号的报价，接受！');
        console.log(offer);
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

const item = {
    appid: 730,
    contextid: '2',
    assetid: '16774932678',
    classid: '3526743264',
    instanceid: '143865972',
    amount: 1,
    pos: 95,
    id: '16774932678',
    background_color: '',
    icon_url:
     '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsQEl9Jg9SpIW1KgRr7PHNYzFL4o7mxdm0lPj6J77fkm5D-4so3bjDpN-k3w2yrkI6ZTyndo7Eewc3NV6Drlbsxuy9hpa6vsmfyycypGB8suuDYvF_',        
    icon_url_large:
     '-9a81dlWLwJ2UUGcVs_nsVtzdOEdtWwKGZZLQHTxDZ7I56KU0Zwwo4NUX4oFJZEHLbXU5A1PIYQNqhpOSV-fRPasw8rsQEl9Jg9SpIW1KgRr7PHNYzFL4o7mxdm0lPj6J77fkm5D-_p9i_vG8MKs3wW2-kBtZGClcYfDdFNqM1CB81C3lei80ZHuu5-bynJluHR05yqMgVXp1v9P5g4k',   
    descriptions:
     [ [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object],
       [Object] ],
    tradable: true,
    name: 'Berlin 2019 Minor Challengers (Holo/Foil)',
    name_color: 'D2D2D2',
    type: 'Base Grade Container',
    market_name: 'Berlin 2019 Minor Challengers (Holo/Foil)',
    market_hash_name: 'Berlin 2019 Minor Challengers (Holo-Foil)',
    commodity: true,
    market_tradable_restriction: 7,
    marketable: true,
    tags: [ [Object], [Object], [Object], [Object], [Object] ],
    is_currency: false,
    market_marketable_restriction: 0,       
    fraudwarnings: [] }