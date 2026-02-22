/**
 * 塔罗 78 张牌数据与抽牌函数
 * 结构：id, name_cn, filename, upright, reversed（与 TarotCard 接口一致）
 * 图片放在「抽卡」文件夹中，filename 即文件名（如 00-TheFool.jpg、Wands01.jpg）
 */

(function (global) {
    var tarotData = global.tarotData || [
        { id: 0, name_cn: "愚者", filename: "00-TheFool.jpg", upright: "保持纯粹的信心，勇敢开启一段充满可能的全新旅程。", reversed: "在出发前稍微停顿，整理好行囊会让这段冒险更稳健。" },
        { id: 1, name_cn: "魔术师", filename: "01-TheMagician.jpg", upright: "你已经拥有了所需的资源，现在是展示才华的好时机。", reversed: "放慢脚步去磨炼基础，内在潜力的觉醒需要一点耐心。" },
        { id: 2, name_cn: "女祭司", filename: "02-TheHighPriestess.jpg", upright: "信任你的直觉，在静默中你会找到最清晰的答案。", reversed: "尝试将内在的智慧与现实连接，让灵感在生活中落地。" },
        { id: 3, name_cn: "皇后", filename: "03-TheEmpress.jpg", upright: "此时适合感受生命的美好，用温柔的创造力去关怀周遭。", reversed: "先学会温柔地照顾自己，内在的丰盈会自然吸引美好。" },
        { id: 4, name_cn: "皇帝", filename: "04-TheEmperor.jpg", upright: "运用你的理性与原则，稳扎稳打地建立属于你的秩序。", reversed: "此时适合展现灵活的领导力，用包容让你的领域更坚固。" },
        { id: 5, name_cn: "教皇", filename: "05-TheHierophant.jpg", upright: "在传统与共识中寻找力量，寻求良师益友的指引。", reversed: "尝试倾听内心的真理，建立属于你自己的独特信仰。" },
        { id: 6, name_cn: "恋人", filename: "06-TheLovers.jpg", upright: "建立深层的情感连接，做出一个忠于内心的美好选择。", reversed: "重新梳理内在的价值观，当内心和谐时，选择会变简单。" },
        { id: 7, name_cn: "战车", filename: "07-TheChariot.jpg", upright: "意志坚定地朝目标迈进，平衡好冲突的力量。", reversed: "暂缓紧绷的节奏，梳理好情绪后再出发会更有爆发力。" },
        { id: 8, name_cn: "力量", filename: "08-Strength.jpg", upright: "温柔的力量胜过刚猛，用慈悲与耐性去化解难题。", reversed: "接纳自己的小脆弱，它是你内在坚韧力量的另一种起点。" },
        { id: 9, name_cn: "隐士", filename: "09-TheHermit.jpg", upright: "在独处中沉淀智慧，你内心的明灯会指引方向。", reversed: "带着思考出的感悟回到人群，让智慧在交流中发光。" },
        { id: 10, name_cn: "命运之轮", filename: "10-WheelOfFortune.jpg", upright: "顺应流转的契机，积极拥抱生命中的每一个转折。", reversed: "在变化中保持平常心，观察重复的模式以寻找突破口。" },
        { id: 11, name_cn: "正义", filename: "11-Justice.jpg", upright: "保持客观与平衡，你的诚实与责任感将带来公正。", reversed: "此时适合进行自我修正，用更平衡的视角看待复杂现状。" },
        { id: 12, name_cn: "倒吊人", filename: "12-TheHangedMan.jpg", upright: "换个角度看世界，有意的停顿会让你获得崭新的觉悟。", reversed: "结束不必要的等待，用实际的行动去打破暂时的停滞。" },
        { id: 13, name_cn: "死神", filename: "13-Death.jpg", upright: "坦然接纳一个阶段的结束，为新生的美好腾出空间。", reversed: "温和地告别旧习惯，新生的曙光其实已经在不远处。" },
        { id: 14, name_cn: "节制", filename: "14-Temperance.jpg", upright: "在平衡中寻找治愈的力量，让生活的节奏回归和谐。", reversed: "微调当下的生活重心，在小小的克制中重获平衡美感。" },
        { id: 15, name_cn: "恶魔", filename: "15-TheDevil.jpg", upright: "觉察当下的欲望与束缚，认清束缚你的幻象即是自由的开始。", reversed: "慢慢解开自我设限的枷锁，你正在找回掌控生活的能力。" },
        { id: 16, name_cn: "高塔", filename: "16-TheTower.jpg", upright: "接受突如其来的转变，它是为了构建更稳固的未来。", reversed: "在震荡中寻找重塑的机会，旧的崩塌正是新的转机。" },
        { id: 17, name_cn: "星星", filename: "17-TheStar.jpg", upright: "保持纯粹的希望，你的心灵正在进入一个疗愈期。", reversed: "即便光芒微弱也要相信星光，美好的愿景依然在前方。" },
        { id: 18, name_cn: "月亮", filename: "18-TheMoon.jpg", upright: "信任你在迷雾中的直觉，谨慎且轻盈地探索未知。", reversed: "云开见月明，焦虑正慢慢消散，真相正变得越来越清晰。" },
        { id: 19, name_cn: "太阳", filename: "19-TheSun.jpg", upright: "尽情绽放你的活力，积极透明的态度会吸引所有好运。", reversed: "调低过度的自负，在平凡简单的快乐中感受生命暖意。" },
        { id: 20, name_cn: "审判", filename: "20-Judgement.jpg", upright: "听从内心的召唤，总结过去，开启更高维度的人生。", reversed: "温柔地放下自我批判，给自己一个重新开始的宽容契机。" },
        { id: 21, name_cn: "世界", filename: "21-TheWorld.jpg", upright: "庆祝这一阶段的圆满，整合所有经验去开启新循环。", reversed: "圆满近在咫尺，只需再一点点坚持就能完成最后的拼图。" },
        { id: 22, name_cn: "权杖首牌", filename: "Wands01.jpg", upright: "热忱地投身于新计划，你的行动力现在正处于高峰。", reversed: "先在内心沉淀热情，等灵感更成熟时再果断出发。" },
        { id: 23, name_cn: "权杖二", filename: "Wands02.jpg", upright: "站在现有的成就之上，从容地规划更远大的未来。", reversed: "回归当下的土地，扎实的基础会让未来的远眺更有底气。" },
        { id: 24, name_cn: "权杖三", filename: "Wands03.jpg", upright: "保持你的远见，你播下的种子正在稳步萌芽。", reversed: "耐心地处理每一个细节，好消息正在跨越迷雾赶来。" },
        { id: 25, name_cn: "权杖四", filename: "Wands04.jpg", upright: "享受这份稳定与欢愉，与爱的人分享阶段性的成果。", reversed: "在日常的细微处寻找安定感，家人的支持是你最大的底气。" },
        { id: 26, name_cn: "权杖五", filename: "Wands05.jpg", upright: "在良性的竞争中提升自己，不同的观点会碰撞出智慧。", reversed: "尝试寻找共赢的路径，合作的力量远比竞争更持久。" },
        { id: 27, name_cn: "权杖六", filename: "Wands06.jpg", upright: "带着自信接受众人的认可，分享这份成功的荣耀。", reversed: "保持平和的内心，外界的评价只是你成长的点缀。" },
        { id: 28, name_cn: "权杖七", filename: "Wands07.jpg", upright: "坚守你的立场，这种勇气会让你在挑战中更具魅力。", reversed: "灵活调整防守的策略，适度的放松会让你更有后劲。" },
        { id: 29, name_cn: "权杖八", filename: "Wands08.jpg", upright: "顺应这股高效的趋势，你的目标正在加速实现。", reversed: "在快速推进中保持呼吸频率，沉稳的步伐比盲目更高效。" },
        { id: 30, name_cn: "权杖九", filename: "Wands09.jpg", upright: "保护好你的成果，你过去的经验是你最坚实的盾牌。", reversed: "卸下过重的防备心，尝试信任环境，你会发现更轻松的路径。" },
        { id: 31, name_cn: "权杖十", filename: "Wands10.jpg", upright: "虽然肩上的责任重大，但这也是你能力卓绝的证明。", reversed: "尝试分担与精简，合理的放手会让你的旅程更轻盈。" },
        { id: 32, name_cn: "权杖侍从", filename: "Wands11.jpg", upright: "保持那份珍贵的好奇心，世界正准备给你新惊喜。", reversed: "将奇思妙想记录下来，耐心培育会让灵感变得可落地。" },
        { id: 33, name_cn: "权杖骑士", filename: "Wands12.jpg", upright: "充满激情地冲向理想，你的勇气极具感染力。", reversed: "在热烈中加入一点沉稳，有节奏的冲刺会让你走得更远。" },
        { id: 34, name_cn: "权杖皇后", filename: "Wands13.jpg", upright: "用你的热情与自信去照亮他人，你拥有极强的感召力。", reversed: "回归内在的温厚，用更内敛的方式去展现你的生命力。" },
        { id: 35, name_cn: "权杖国王", filename: "Wands14.jpg", upright: "展现你的卓越统筹力，用成熟的策略引领目标达成。", reversed: "用更亲和的沟通取代指令，团队的共鸣会成就更大的目标。" },
        { id: 36, name_cn: "圣杯首牌", filename: "Cups01.jpg", upright: "让爱与直觉自然流淌，一段美好的情感关系正在萌芽。", reversed: "先填满自己的心杯，内在的爱会自然吸引外界的共鸣。" },
        { id: 37, name_cn: "圣杯二", filename: "Cups02.jpg", upright: "珍惜这份默契的连接，平等的互动会让感情更持久。", reversed: "此时适合沟通与修补，微小的真诚就能找回平衡的节奏。" },
        { id: 38, name_cn: "圣杯三", filename: "Cups03.jpg", upright: "融入欢快的社交氛围，在分享中倍增你的快乐。", reversed: "回归亲密的小圈子，高质量的独处或深谈更有助于充电。" },
        { id: 39, name_cn: "圣杯四", filename: "Cups04.jpg", upright: "静心聆听内在的需求，在反思中明确真正想要的价值。", reversed: "试着抬头看看，一个充满诚意的新契机正试图引起你的注意。" },
        { id: 40, name_cn: "圣杯五", filename: "Cups05.jpg", upright: "接纳当下的情感波动，转身你会发现支持从未离去。", reversed: "阴影正在退去，现在的你已经拥有了重新出发的力量。" },
        { id: 41, name_cn: "圣杯六", filename: "Cups06.jpg", upright: "温习美好的回忆，像孩子一样单纯地看待当下的生活。", reversed: "带着过去的养分活在当下，你会发现新的快乐同样纯粹。" },
        { id: 42, name_cn: "圣杯七", filename: "Cups07.jpg", upright: "展开想象的翅膀，在众多的可能中筛选出最心动的选项。", reversed: "拨开繁杂的诱惑，专注于最务实的目标会让心境更清爽。" },
        { id: 43, name_cn: "圣杯八", filename: "Cups08.jpg", upright: "勇敢地去追寻更高层次的精神满足，这是一次美丽的远行。", reversed: "确认好内心的方向再起航，守护好当下的美好也是一种智慧。" },
        { id: 44, name_cn: "圣杯九", filename: "Cups09.jpg", upright: "享受这份心满意足，生活正以你喜欢的方式呈现。", reversed: "寻找更深层的内在快乐，分享你的幸福会让喜悦翻倍。" },
        { id: 45, name_cn: "圣杯十", filename: "Cups10.jpg", upright: "感受家庭与团圆的温馨，这份和谐是你最宝贵的财富。", reversed: "主动营造和谐的家庭氛围，一点包容就能化解小小分歧。" },
        { id: 46, name_cn: "圣杯侍从", filename: "Cups11.jpg", upright: "温柔地表达你的情感，一个纯真的灵感正在敲门。", reversed: "保护好你那颗敏感的心，将情绪转化为动人的文字或艺术。" },
        { id: 47, name_cn: "圣杯骑士", filename: "Cups12.jpg", upright: "带着浪漫的情怀去追求理想，你的温情会让路径变美。", reversed: "将浪漫的情绪落地为行动，真实的关系比幻想更迷人。" },
        { id: 48, name_cn: "圣杯皇后", filename: "Cups13.jpg", upright: "信任你慈悲的直觉，你拥有治愈自己与他人的强大能量。", reversed: "设立健康的情感边界，温和地保护好自己的内在能量。" },
        { id: 49, name_cn: "圣杯国王", filename: "Cups14.jpg", upright: "保持情绪的稳健与宽广，你的沉稳是大家信赖的源泉。", reversed: "寻找情感的出口，平衡的内心会让你处理复杂关系更游刃有余。" },
        { id: 50, name_cn: "宝剑首牌", filename: "Swords01.jpg", upright: "保持清醒的逻辑，一个突破性的洞见将为你开启道路。", reversed: "梳理杂乱的思绪，给头脑一点留白，答案会自然显现。" },
        { id: 51, name_cn: "宝剑二", filename: "Swords02.jpg", upright: "在静默中寻求平衡，给决策一点发酵的时间。", reversed: "揭开犹豫的迷雾，勇敢面对内心，你会知道该如何选择。" },
        { id: 52, name_cn: "宝剑三", filename: "Swords03.jpg", upright: "正视当下的疼痛，它是通往深刻理解与治愈的必经之路。", reversed: "时间正在抚平伤口，尝试原谅自己，让心情重新放晴。" },
        { id: 53, name_cn: "宝剑四", filename: "Swords04.jpg", upright: "允许自己彻底休息，精神的留白是为了更好的出发。", reversed: "经过充分的充电，你已经准备好重回生活的舞台了。" },
        { id: 54, name_cn: "宝剑五", filename: "Swords05.jpg", upright: "从冲突中观察不同的立场，成败都是宝贵的学习机会。", reversed: "放下竞争的执念，寻找共识会让你赢得更有尊严与长远。" },
        { id: 55, name_cn: "宝剑六", filename: "Swords06.jpg", upright: "平稳地渡过困难期，你正在迈向更安宁的彼岸。", reversed: "接纳现状的微小起伏，这种缓慢的移动正是疗愈的开始。" },
        { id: 56, name_cn: "宝剑七", filename: "Swords07.jpg", upright: "运用智谋而非蛮力，谨慎采取行动。", reversed: "坦诚地面对每一个细节，最诚实的方案往往也是最高效的。" },
        { id: 57, name_cn: "宝剑八", filename: "Swords08.jpg", upright: "意识到束缚只是心智的幻觉，其实你随时可以跨过边界。", reversed: "尝试走出思维的舒适区，你会发现外界其实非常开阔。" },
        { id: 58, name_cn: "宝剑九", filename: "Swords09.jpg", upright: "那些不安只是夜晚的阴影，阳光一照，它们就会消失。", reversed: "尝试向信任的人倾诉，阳光照进内心，噩梦便不再真实。" },
        { id: 59, name_cn: "宝剑十", filename: "Swords10.jpg", upright: "最难的时刻已经过去，你正站在置之死地而后生的起点。", reversed: "曙光已现，接纳过去的所有经历，它们正成就更强大的你。" },
        { id: 60, name_cn: "宝剑侍从", filename: "Swords11.jpg", upright: "保持敏捷的求知欲，多方位的视角会带给你新洞察。", reversed: "将敏锐的观察力用在学习上，言语的谨慎会让你的智慧更迷人。" },
        { id: 61, name_cn: "宝剑骑士", filename: "Swords12.jpg", upright: "带着逻辑与勇气直面难题，你的果敢会迅速解决问题。", reversed: "在冲锋前先确认方向，稍微放慢速度会让你的执行更有力。" },
        { id: 62, name_cn: "宝剑皇后", filename: "Swords13.jpg", upright: "保持独立而客观的思考，你的专业性会赢得大家的尊重。", reversed: "在理性中加入一丝温情，智慧与包容的结合会让你更有魅力。" },
        { id: 63, name_cn: "宝剑国王", filename: "Swords14.jpg", upright: "运用你卓越的逻辑统筹全局，制定公正且清晰的规则。", reversed: "用建议取代说服，灵活的变通会让你的规则更具人性深度。" },
        { id: 64, name_cn: "星币首牌", filename: "Pentacles01.jpg", upright: "一个务实且丰盛的新机会已经出现，请稳稳地抓住它。", reversed: "检查基础是否夯实，在行动前做好周全的理财规划。" },
        { id: 65, name_cn: "星币二", filename: "Pentacles02.jpg", upright: "灵活优雅地处理多项任务，保持生活节奏的平衡。", reversed: "精简非必要的琐事，将精力专注于最重要的那一两件事。" },
        { id: 66, name_cn: "星币三", filename: "Pentacles03.jpg", upright: "在团队协作中发挥专业优势，大家的合力会成就精品。", reversed: "加强沟通与技能磨炼，细致的打磨会让你的作品更出众。" },
        { id: 67, name_cn: "星币四", filename: "Pentacles04.jpg", upright: "稳健地守护好你的资源，建立起让你安心的物质基础。", reversed: "尝试适度的流动与分享，财富在健康的循环中会更有生命力。" },
        { id: 68, name_cn: "星币五", filename: "Pentacles05.jpg", upright: "即便处于暂时的匮乏，也要记得向外界寻求温暖的支持。", reversed: "转机正悄然出现，保持乐观，你会找到解决财务难题的门径。" },
        { id: 69, name_cn: "星币六", filename: "Pentacles06.jpg", upright: "大方地分享你的资源，施与受的平衡会带来长久的富足。", reversed: "将资源用在最需要的地方，这也是一种负责。" },
        { id: 70, name_cn: "星币七", filename: "Pentacles07.jpg", upright: "耐心地等待收获的季节，你之前的努力正在厚积薄发。", reversed: "检查你的投入方向，小小的调整会让未来的收益更稳健。" },
        { id: 71, name_cn: "星币八", filename: "Pentacles08.jpg", upright: "专注钻研你的技艺，这种精益求精的态度是成功的保障。", reversed: "在细节中寻找乐趣，换个方式去工作能让你找回专注度。" },
        { id: 72, name_cn: "星币九", filename: "Pentacles09.jpg", upright: "享受这份自给自足的优雅，你值得拥有这种高品质的生活。", reversed: "在物质享受之外寻找精神共鸣，简单的生活同样可以很精致。" },
        { id: 73, name_cn: "星币十", filename: "Pentacles10.jpg", upright: "感受家族与事业的传承之美，长远的规划正带来持久繁荣。", reversed: "主动促进团队或家庭的良性互动，共同的目标会化解小小阻碍。" },
        { id: 74, name_cn: "星币侍从", filename: "Pentacles11.jpg", upright: "踏实地学习实务知识，为未来的富足埋下一颗良种。", reversed: "将想法付诸小步实践，每一个务实的小行动都是成功的开端。" },
        { id: 75, name_cn: "星币骑士", filename: "Pentacles12.jpg", upright: "保持稳健且持久的执行力，你的耐心是通往成功的最短路径。", reversed: "微调你的步伐，保持灵活的节奏能让你在长跑中更有活力。" },
        { id: 76, name_cn: "星币皇后", filename: "Pentacles13.jpg", upright: "用务实且温柔的心去经营生活，创造一个富足舒适的环境。", reversed: "回归简单的物欲需求，用更多的爱去丰盈你现有的家园。" },
        { id: 77, name_cn: "星币国王", filename: "Pentacles14.jpg", upright: "展现你成熟的资源管控力，你的可靠会赢得长久的繁荣。", reversed: "审视商业决策中的人情味，共赢的心态会成就更伟大的事业。" }
    ];

    // 建议文案：去掉逗号与句号，并在原逗号处换行
    function formatTarotAdvice(text) {
        if (!text || typeof text !== 'string') return '';
        return text.replace(/\uFF0C/g, '\n').replace(/\u3002/g, '').trim();
    }
    // 兼容现有 script：补充 name、imageUrl 及 upright/reversed 的 { advice } 形态
    tarotData.forEach(function (card) {
        card.name = card.name_cn;
        card.imageUrl = card.filename;
        var u = formatTarotAdvice(card.upright);
        var r = formatTarotAdvice(card.reversed);
        card.upright = { advice: u };
        card.reversed = { advice: r };
    });

    /**
     * 抽一张塔罗牌，50% 概率正位 / 50% 概率逆位
     * @returns {{ card: object, isReversed: boolean, index: number }}
     */
    function drawTarotCard() {
        if (!tarotData || tarotData.length === 0) {
            return { card: null, isReversed: false, index: -1 };
        }
        var index = Math.floor(Math.random() * tarotData.length);
        var card = tarotData[index];
        var isReversed = Math.random() < 0.5;
        return { card: card, isReversed: isReversed, index: index };
    }

    global.tarotData = tarotData;
    global.drawTarotCard = drawTarotCard;
})(typeof window !== 'undefined' ? window : this);
