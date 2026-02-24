// ========== 24 节气精确计算（基于太阳黄经约每 15° 一节气，回归年 365.2422 日） ==========
const TERM_NAMES = ['小寒','大寒','立春','雨水','惊蛰','春分','清明','谷雨','立夏','小满','芒种','夏至','小暑','大暑','立秋','处暑','白露','秋分','寒露','霜降','立冬','小雪','大雪','冬至'];
// 2000 年各节气 UTC 时间戳（月 0-based，日）— 用于推算任意年份
const TERM_2000_UTC_MS = [
    Date.UTC(2000, 0, 6), Date.UTC(2000, 0, 21), Date.UTC(2000, 1, 4), Date.UTC(2000, 1, 19),
    Date.UTC(2000, 2, 5), Date.UTC(2000, 2, 20), Date.UTC(2000, 3, 5), Date.UTC(2000, 3, 20),
    Date.UTC(2000, 4, 5), Date.UTC(2000, 4, 21), Date.UTC(2000, 5, 6), Date.UTC(2000, 5, 21),
    Date.UTC(2000, 6, 7), Date.UTC(2000, 6, 22), Date.UTC(2000, 7, 7), Date.UTC(2000, 7, 23),
    Date.UTC(2000, 8, 8), Date.UTC(2000, 8, 23), Date.UTC(2000, 9, 8), Date.UTC(2000, 9, 23),
    Date.UTC(2000, 10, 7), Date.UTC(2000, 10, 22), Date.UTC(2000, 11, 7), Date.UTC(2000, 11, 22)
];
const DAY_MS = 86400 * 1000;
const YEAR_AVG_MS = 365.2422 * DAY_MS;

/** 某年某节气 0-based 索引 的日期（本地日期，取整天） */
function getTermDateInYear(year, termIndex) {
    const ms = TERM_2000_UTC_MS[termIndex] + (year - 2000) * YEAR_AVG_MS;
    const d = new Date(ms);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

/** 根据给定日期得到：当前节气名、下一节气名、距下一节气天数 */
function getSolarTermInfo(date) {
    const y = date.getFullYear();
    const today = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

    for (let i = 0; i < 24; i++) {
        const termDate = getTermDateInYear(y, i);
        const termTime = termDate.getTime();
        if (today < termTime) {
            const nextName = TERM_NAMES[i];
            const days = Math.round((termTime - today) / DAY_MS);
            const prevIndex = i === 0 ? 23 : i - 1;
            const currentName = TERM_NAMES[prevIndex];
            return { currentName, nextName, daysToNext: days };
        }
    }
    const currentName = TERM_NAMES[23];
    const nextTermDate = getTermDateInYear(y + 1, 0);
    const days = Math.round((nextTermDate.getTime() - today) / DAY_MS);
    return { currentName, nextName: TERM_NAMES[0], daysToNext: days };
}

// ========== 农历与干支（支持 1900–2100，含闰月；1900-01-31 为农历庚子年正月初一） ==========
const LUNAR_INFO = [
    0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
    0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
    0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
    0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
    0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
    0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5b0, 0x14573, 0x052b0, 0x0a9a8, 0x0e950, 0x06aa0,
    0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
    0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b6a0, 0x195a6,
    0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
    0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
    0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
    0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
    0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
    0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
    0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0,
    0x14b63, 0x09370, 0x049f8, 0x04970, 0x064b0, 0x168a6, 0x0ea50, 0x06b20, 0x1a6c4, 0x0aae0,
    0x0a2e0, 0x0d2e3, 0x0c960, 0x0d557, 0x0d4a0, 0x0da50, 0x05d55, 0x056a0, 0x0a6d0, 0x055d4,
    0x052d0, 0x0a9b8, 0x0a950, 0x0b4a0, 0x0b6a6, 0x0ad50, 0x055a0, 0x0aba4, 0x0a5b0, 0x052b0,
    0x0b273, 0x06930, 0x07337, 0x06aa0, 0x0ad50, 0x14b55, 0x04b60, 0x0a570, 0x054e4, 0x0d160,
    0x0e968, 0x0d520, 0x0daa0, 0x16aa6, 0x056d0, 0x04ae0, 0x0a9d4, 0x0a2d0, 0x0d150, 0x0f252,
    0x0d520
];
// 公元1900年：1月1日—1月30日为农历己亥年，1月31日—12月31日为农历庚子年，故 1月31日 = 庚子年正月初一
const LUNAR_START = new Date(1900, 0, 31);
const LUNAR_MONTH_NAMES = ['正', '二', '三', '四', '五', '六', '七', '八', '九', '十', '冬', '腊'];
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

function getLeapMonth(lunarYear) {
    const idx = lunarYear - 1900;
    return idx >= 0 && idx < LUNAR_INFO.length ? (LUNAR_INFO[idx] & 0xf) : 0;
}

function getMonthDays(lunarYear, month) {
    const idx = lunarYear - 1900;
    if (idx < 0 || idx >= LUNAR_INFO.length || month < 1 || month > 12) return 29;
    const bit = 1 << (16 - month);
    return ((LUNAR_INFO[idx] & 0xfff0) & bit) ? 30 : 29;
}

function getLeapMonthDays(lunarYear) {
    const leap = getLeapMonth(lunarYear);
    if (!leap) return 0;
    const idx = lunarYear - 1900;
    return (LUNAR_INFO[idx] & 0xf0000) ? 30 : 29;
}

function getYearDays(lunarYear) {
    const idx = lunarYear - 1900;
    if (idx < 0 || idx >= LUNAR_INFO.length) return 354;
    let sum = 29 * 12;
    for (let i = 0x8000; i >= 0x8; i >>= 1) {
        if ((LUNAR_INFO[idx] & 0xfff0 & i) !== 0) sum++;
    }
    return sum + getLeapMonthDays(lunarYear);
}

function daysBetween(dateStart, dateEnd) {
    const d = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), dateEnd.getDate());
    const s = new Date(dateStart.getFullYear(), dateStart.getMonth(), dateStart.getDate());
    return Math.round((d - s) / DAY_MS);
}

/** 公历 date 转农历：{ lunarYear, lunarMonth, lunarDay, isLeapMonth } */
function solarToLunar(date) {
    let offset = daysBetween(LUNAR_START, date);
    if (offset < 0) return { lunarYear: 1900, lunarMonth: 1, lunarDay: 1, isLeapMonth: false };
    let lunarYear = 1900;
    for (let y = 1900; y < 2100; y++) {
        const days = getYearDays(y);
        if (offset < days) break;
        offset -= days;
        lunarYear = y + 1;
    }
    const leapMonth = getLeapMonth(lunarYear);
    let lunarMonth = 1;
    let isLeapMonth = false;
    for (let i = 1; i <= 12; i++) {
        if (leapMonth > 0 && i === leapMonth + 1) {
            const leapDays = getLeapMonthDays(lunarYear);
            if (offset < leapDays) {
                lunarMonth = leapMonth;
                isLeapMonth = true;
                break;
            }
            offset -= leapDays;
        }
        const monthDays = getMonthDays(lunarYear, i);
        if (offset < monthDays) {
            lunarMonth = i;
            break;
        }
        offset -= monthDays;
    }
    const lunarDay = offset + 1;
    return { lunarYear, lunarMonth, lunarDay, isLeapMonth };
}

/** 农历日 → 中文（初一…三十） */
function lunarDayToChinese(day) {
    if (day < 1 || day > 30) return '';
    const ten = ['初', '十', '廿', '三'];
    const one = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
    if (day === 10) return '初十';
    if (day === 20) return '二十';
    if (day === 30) return '三十';
    const d10 = Math.floor(day / 10);
    const d1 = day % 10;
    return ten[d10] + (d1 === 0 ? one[9] : one[d1 - 1]);
}

/** 农历年 → 干支（丙午年等，与常见历书一致） */
function yearToGanZhi(lunarYear) {
    const j = lunarYear - 4;
    const t = ((j % 10) + 10) % 10;
    const d = ((j % 12) + 12) % 12;
    return TIAN_GAN[t] + DI_ZHI[d];
}

/** 供页头显示：{ lunarStr, ganZhiStr } */
function getLunarDisplay(date) {
    const lunar = solarToLunar(date);
    const monthStr = (lunar.isLeapMonth ? '闰' : '') + LUNAR_MONTH_NAMES[lunar.lunarMonth - 1] + '月';
    const dayStr = lunarDayToChinese(lunar.lunarDay);
    return {
        lunarStr: monthStr + dayStr,
        ganZhiStr: yearToGanZhi(lunar.lunarYear) + '年'
    };
}

// ========== 北京时间：以 0 点为日界，跨日后自动刷新 ==========
const WEEK_CN = ['周日','周一','周二','周三','周四','周五','周六'];
const MONTH_NAMES_CN = ['一月','二月','三月','四月','五月','六月','七月','八月','九月','十月','十一月','十二月'];
const BEIJING_OFFSET_MS = 8 * 3600 * 1000;

/** 当前北京时间对应的日期部分（年/月/日/星期）。北京 = UTC+8，用 UTC 时间加 8 小时再取 UTC 年月日即得北京日期 */
function getBeijingDateParts() {
    var now = new Date();
    var beijingMs = now.getTime() + BEIJING_OFFSET_MS;
    var b = new Date(beijingMs);
    return {
        year: b.getUTCFullYear(),
        month: b.getUTCMonth(),
        day: b.getUTCDate(),
        weekDay: b.getUTCDay()
    };
}

/** 距离下一次北京时间 0 点 的毫秒数 */
function getMsUntilNextBeijingMidnight() {
    var p = getBeijingDateParts();
    var midnightBeijingUTC = Date.UTC(p.year, p.month, p.day) - BEIJING_OFFSET_MS;
    var nextMidnight = midnightBeijingUTC + 86400000;
    var msUntil = nextMidnight - new Date().getTime();
    if (msUntil <= 0) msUntil += 86400000;
    return msUntil;
}

// ========== 页面加载时自动获取并显示当天实时日期（按北京时间） ==========
function updatePageDate() {
    var p = getBeijingDateParts();
    var dateForLunar = new Date(p.year, p.month, p.day);

    var dayNumEl = document.getElementById('day-num');
    var monthYearEl = document.getElementById('month-year');
    var dayWeekEl = document.getElementById('day-week');
    if (dayNumEl) dayNumEl.textContent = p.day;
    if (monthYearEl) monthYearEl.textContent = MONTH_NAMES_CN[p.month] + ' ' + p.year;
    if (dayWeekEl) dayWeekEl.textContent = WEEK_CN[p.weekDay];

    var lunarDisplay = getLunarDisplay(dateForLunar);
    var lunarTextEl = document.getElementById('lunar-text');
    var ganzhiTextEl = document.getElementById('ganzhi-text');
    if (lunarTextEl) lunarTextEl.textContent = lunarDisplay.lunarStr;
    if (ganzhiTextEl) ganzhiTextEl.textContent = lunarDisplay.ganZhiStr;

    var termInfo = getSolarTermInfo(dateForLunar);
    var termNameEl = document.getElementById('term-name');
    var termDaysEl = document.getElementById('term-days');
    if (termNameEl) termNameEl.textContent = termInfo.currentName;
    if (termDaysEl) termDaysEl.textContent = '距「' + termInfo.nextName + '」' + termInfo.daysToNext + '天';
}

// ========== 周易卡面：节气+时辰 → 中国传统色背景，字体颜色自动适配 ==========
var ZHOUYI_TERM_COLORS = [
    '#E8D5C4', '#C4B5A0', '#D5EBE1', '#A8D4E0', '#C9E4C5', '#B8D4A8', '#E8D4E4', '#D4E0C9',
    '#F5E6C8', '#E8D4A8', '#E8D4B8', '#F0D8A8', '#F5E0B0', '#E8C898', '#EFEFEF', '#E0D8C8',
    '#E8E4D8', '#E0D4C0', '#D8C8B8', '#D4C0A8', '#D8D0C8', '#E0E0D8', '#D0C8C0', '#C8C0B8'
];
var ZHOUYI_SHICHEN_COLORS = [
    '#1a1a2e', '#2d2d44', '#4a4a6a', '#7d7d99', '#9a9ab8', '#b8b8d4',
    '#d4c4a8', '#e8dcc8', '#c4b898', '#a89878', '#6a5a4a', '#3a2a1a'
];
function zhouyiBlendHex(c1, c2, ratio) {
    var parse = function (hex) {
        var h = hex.replace(/^#/, '');
        return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    };
    var p1 = parse(c1), p2 = parse(c2);
    var r = Math.round(p1[0] + (p2[0] - p1[0]) * ratio);
    var g = Math.round(p1[1] + (p2[1] - p1[1]) * ratio);
    var b = Math.round(p1[2] + (p2[2] - p1[2]) * ratio);
    return '#' + [r, g, b].map(function (x) { return x.toString(16).padStart(2, '0'); }).join('');
}
function zhouyiLuminance(hex) {
    var h = hex.replace(/^#/, '');
    var r = parseInt(h.slice(0, 2), 16) / 255, g = parseInt(h.slice(2, 4), 16) / 255, b = parseInt(h.slice(4, 6), 16) / 255;
    var sr = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    var sg = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    var sb = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * sr + 0.7152 * sg + 0.0722 * sb;
}
function getZhouyiTheme(date) {
    date = date || new Date();
    var termIndex = (function () {
        var y = date.getFullYear();
        var today = new Date(y, date.getMonth(), date.getDate()).getTime();
        for (var i = 0; i < 24; i++) {
            var termTime = getTermDateInYear(y, i).getTime();
            if (today < termTime) return i === 0 ? 23 : i - 1;
        }
        return 23;
    })();
    var hour = date.getHours();
    var shiChenIndex = Math.floor(((hour + 1) % 24) / 2);
    var termColor = ZHOUYI_TERM_COLORS[termIndex];
    var shiChenColor = ZHOUYI_SHICHEN_COLORS[shiChenIndex];
    var backgroundColor = zhouyiBlendHex(termColor, shiChenColor, 0.15);
    var L = zhouyiLuminance(backgroundColor);
    var text, secondary, accent;
    if (L >= 0.4) {
        text = '#1a1a1a';
        secondary = '#2d2d2d';
        accent = '#5c0a0a';
    } else {
        text = '#f5f5f0';
        secondary = '#e0e0e0';
        accent = '#f0b0a0';
    }
    return { backgroundColor: backgroundColor, text: text, secondary: secondary, accent: accent };
}

// ========== 数据库：毛主席语录、孙子兵法 100 条、周易 64 卦、塔罗 78 张 ==========
const database = {
    mao: [
        { text: "星星之火，可以燎原。", source: "《毛泽东选集" },
        { text: "世界是你们的，也是我们的，但是归根结底是你们的。", source: "1957年接见留学生讲话" },
        { text: "文明其精神，野蛮其体魄。", source: "《体育之研究" },
        { text: "没有调查就没有发言权。", source: "《反对本本主义" },
        { text: "人民，只有人民，才是创造世界历史的动力。", source: "《论联合政府" },
        { text: "一切反动派都是纸老虎。", source: "《和美国记者安娜·路易斯·斯特朗的谈话" },
        { text: "下定决心，不怕牺牲，排除万难，去争取胜利。", source: "《愚公移山" },
        { text: "虚心使人进步，骄傲使人落后。", source: "中共八大开幕词" },
        { text: "枪杆子里面出政权。", source: "八七会议" },
        { text: "实事求是。", source: "《改造我们的学习" },
        { text: "群众是真正的英雄。", source: "《农村调查》的序言和跋" },
        { text: "我们应当相信群众，我们应当相信党。", source: "《关于农业合作化问题" },
        { text: "贪污和浪费是极大的犯罪。", source: "《我们的经济政策" },
        { text: "团结一致，同心同德，任何强大的敌人，任何困难的环境，都会向我们投降。", source: "《为争取千百万群众进入抗日民族统一战线而斗争" },
        { text: "敌人一天天烂下去，我们一天天好起来。", source: "中共八届六中全会" },
        { text: "凡是敌人反对的，我们就要拥护；凡是敌人拥护的，我们就要反对。", source: "《和中央社、扫荡报、新民报三记者的谈话" },
        { text: "革命不是请客吃饭。", source: "《湖南农民运动考察报告" },
        { text: "帝国主义和一切反动派都是纸老虎。", source: "《和美国记者安娜·路易斯·斯特朗的谈话" },
        { text: "人民万岁。", source: "开国大典" },
        { text: "好好学习，天天向上。", source: "为少年儿童题词" },
        { text: "自己动手，丰衣足食。", source: "《经济问题与财政问题" },
        { text: "为人民服务。", source: "《为人民服务" },
        { text: "人不犯我，我不犯人；人若犯我，我必犯人。", source: "《和中央社、扫荡报、新民报三记者的谈话" },
        { text: "在战略上要藐视敌人，在战术上要重视敌人。", source: "《关于目前党的政策中的几个重要问题" },
        { text: "务必使同志们继续地保持谦虚、谨慎、不骄、不躁的作风。", source: "《在中国共产党第七届中央委员会第二次全体会议上的报告" },
        { text: "我们的目的一定要达到，我们的目的一定能够达到。", source: "第一届全国人大一次会议" },
        { text: "发展体育运动，增强人民体质。", source: "为中华全国体育总会题词" },
        { text: "妇女能顶半边天。", source: "民间流传/题词精神" },
        { text: "世界是你们的。", source: "1957年莫斯科大学讲话" },
        { text: "青年是整个社会力量中的一部分最积极最有生气的力量。", source: "《青年团的工作要照顾青年的特点" },
        { text: "读书是学习，使用也是学习，而且是更重要的学习。", source: "《中国革命战争的战略问题" },
        { text: "卑贱者最聪明，高贵者最愚蠢。", source: "中共八大二次会议" },
        { text: "我们正在做我们的前人从来没有做过的极其光荣伟大的事业。", source: "第一届全国人大一次会议" },
        { text: "多少事，从来急；天地转，光阴迫。一万年太久，只争朝夕。", source: "《满江红·和郭沫若同志" },
        { text: "世上无难事，只要肯登攀。", source: "《水调歌头·重上井冈山" },
        { text: "不管风吹浪打，胜似闲庭信步。", source: "《水调歌头·游泳" },
        { text: "宜将剩勇追穷寇，不可沽名学霸王。", source: "《七律·人民解放军占领南京" },
        { text: "雄关漫道真如铁，而今迈步从头越。", source: "《忆秦娥·娄山关" },
        { text: "不到长城非好汉。", source: "《清平乐·六盘山" },
        { text: "红军不怕远征难，万水千山只等闲。", source: "《七律·长征" },
        { text: "问苍茫大地，谁主沉浮？", source: "《沁园春·长沙" },
        { text: "数风流人物，还看今朝。", source: "《沁园春·雪" },
        { text: "我们不但善于破坏一个旧世界，我们还将善于建设一个新世界。", source: "中共七届二中全会" },
        { text: "团结、紧张、严肃、活泼。", source: "抗大校训" },
        { text: "坚定正确的政治方向，艰苦朴素的工作作风，灵活机动的战略战术。", source: "抗大教育方针" },
        { text: "一切空话都是无用的，必须给人民以看得见的物质福利。", source: "《经济问题与财政问题" },
        { text: "武器是战争的重要的因素，但不是决定的因素，决定的因素是人不是物。", source: "《论持久战" },
        { text: "战争的伟力之最深厚的根源，存在于民众之中。", source: "《论持久战" },
        { text: "保存自己，消灭敌人。", source: "《论持久战" },
        { text: "敌进我退，敌驻我扰，敌疲我打，敌退我追。", source: "游击战术十六字诀" },
        { text: "战略上以一当十，战术上以十当一。", source: "《中国革命战争的战略问题" },
        { text: "不打无准备之仗，不打无把握之仗。", source: "《目前形势和我们的任务" },
        { text: "集中优势兵力，各个歼灭敌人。", source: "《目前形势和我们的任务" },
        { text: "一切行动听指挥。", source: "三大纪律八项注意" },
        { text: "所谓政治，就是把我们的人搞得多多的，把敌人的人搞得少少的。", source: "延安时期讲话" },
        { text: "谁是我们的敌人？谁是我们的朋友？这个问题是革命的首要问题。", source: "《中国社会各阶级的分析" },
        { text: "革命不是请客吃饭，不是做文章，不是绘画绣花。", source: "《湖南农民运动考察报告" },
        { text: "矫枉必须过正，不过正不能矫枉。", source: "《湖南农民运动考察报告" },
        { text: "农民问题乃国民革命的中心问题。", source: "《湖南农民运动考察报告" },
        { text: "实践、认识、再实践、再认识，这种形式，循环往复以至无穷。", source: "《实践论" },
        { text: "矛盾着的对立面又统一，又斗争，由此推动事物的运动和变化。", source: "《矛盾论" },
        { text: "外因是变化的条件，内因是变化的根据。", source: "《矛盾论" },
        { text: "事物发展的根本原因，不是在事物的外部而是在事物的内部。", source: "《矛盾论" },
        { text: "我们看事情必须要看它的实质。", source: "《矛盾论" },
        { text: "对于任何问题应取分析态度，不要否定一切。", source: "《学习和时局" },
        { text: "惩前毖后，治病救人。", source: "《学习和时局" },
        { text: "知无不言，言无不尽；言者无罪，闻者足戒。", source: "《论联合政府" },
        { text: "有则改之，无则加勉。", source: "《论联合政府" },
        { text: "批评与自我批评是一个整体。", source: "延安整风" },
        { text: "因为我们是为人民服务的，所以，我们如果有缺点，就不怕别人批评指出。", source: "《为人民服务" },
        { text: "只要我们为人民的利益坚持好的，为人民的利益改正错的，我们这个队伍就一定会兴旺起来。", source: "《为人民服务" },
        { text: "我们的干部要关心每一个战士，一切革命队伍的人都要互相关心，互相爱护，互相帮助。", source: "《为人民服务" },
        { text: "我们都是来自五湖四海，为了一个共同的革命目标，走到一起来了。", source: "《为人民服务" },
        { text: "我们一定要坚持下去，一定要不断地工作。", source: "《愚公移山" },
        { text: "下定决心，不怕牺牲，排除万难，去争取胜利。", source: "《愚公移山" },
        { text: "使全党团结得像钢铁一样。", source: "中共七大" },
        { text: "谦虚、谨慎、戒骄、戒躁。", source: "中共七大/七届二中全会" },
        { text: "务必使同志们继续地保持艰苦奋斗的作风。", source: "七届二中全会" }
    ],
    bingfa: [
        { id: 3, original: "攻其无备，出其不意。", translation: "在敌人没有准备时进攻，在敌人意想不到时出击。", source: "计篇" },
        { id: 4, original: "不战而屈人之兵，善之善者也。", translation: "不通过战争就使敌人屈服，才是高明中最高明的。", source: "谋攻篇" },
        { id: 5, original: "凡用兵之法，全国为上，破国次之。", translation: "战争的原则，使敌国完整投降是上策，击破敌国使其受损是次策。", source: "谋攻篇" },
        { id: 6, original: "上兵伐谋，其次伐交，其次伐兵，其下攻城。", translation: "上等的用兵策略是挫败敌方谋略，其次是外交瓦解，再次是武力击败，最下策是攻城。", source: "谋攻篇" },
        { id: 7, original: "兵者，国之大事，死生之地，存亡之道，不可不察也。", translation: "战争是国家的重大事务，关系到生死与存亡，必须严谨考察研究。", source: "计篇" },
        { id: 8, original: "兵贵胜，不贵久。", translation: "战争贵在速战速决取得胜利，而不宜拖延持久。", source: "作战篇" },
        { id: 9, original: "取用于国，因粮于敌，故军食可足也。", translation: "武器装备由国内供应，粮食在敌国补充，这样军队的给养就充足了。", source: "作战篇" },
        { id: 10, original: "故善用兵者，屈人之兵而非战也。", translation: "善于用兵的人，使敌人屈服而不是靠硬拼。", source: "谋攻篇" },
        { id: 11, original: "故用兵之法，十则围之，五则攻之，倍则分之。", translation: "用兵原则：兵力十倍于敌就包围，五倍就进攻，两倍就分化瓦解敌人。", source: "谋攻篇" },
        { id: 12, original: "敌则能战之，少则能逃之，不若则能避之。", translation: "势均力敌就设法战胜，兵力少就撤退，战力不如就避开锋芒。", source: "谋攻篇" },
        { id: 13, original: "故知胜有五：知可以战与不可以战者胜。", translation: "预知胜利有五条：懂得判断什么时候能打、什么时候不能打的人会赢。", source: "谋攻篇" },
        { id: 14, original: "知彼知己，百战不殆；不知彼而知己，一胜一负；不知彼不知己，每战必殆。", translation: "了解双方便无危险；只了解自己则胜负各半；都不了解则每战必危。", source: "谋攻篇" },
        { id: 15, original: "昔之善战者，先为不可胜，以待敌之可胜。", translation: "以前善战的人，先让自己不可被战胜，再等待敌人出现漏洞。", source: "形篇" },
        { id: 16, original: "不可胜在己，可胜在敌。", translation: "不被战胜取决于自己的防守，可以战胜取决于敌人的失误。", source: "形篇" },
        { id: 17, original: "善战者，立于不败之地，而不失敌之败也。", translation: "善战的人让自己处于不败地位，同时不放过任何击败敌人的机会。", source: "形篇" },
        { id: 18, original: "胜兵先胜而后求战，败兵先战而后求胜。", translation: "胜利的军队先创造必胜条件再打仗，失败的军队先打仗再碰运气求胜。", source: "形篇" },
        { id: 19, original: "善用兵者，修道而保法，故能为胜败之政。", translation: "善用兵的人修明政治、确保法制，因此能主宰胜败。", source: "形篇" },
        { id: 20, original: "兵法：一曰度，二曰量，三曰数，四曰称，五曰胜。", translation: "兵法五要素：土地广狭、资源多少、兵力多寡、战力对比、胜负判断。", source: "形篇" },
        { id: 21, original: "凡战者，以正合，以奇胜。", translation: "战争中，通常以“正”兵交战，以“奇”兵取胜。", source: "势篇" },
        { id: 22, original: "故善出奇者，无穷如天地，不竭如江河。", translation: "善于出奇制胜的人，战法像天地般无穷，像江河般不竭。", source: "势篇" },
        { id: 23, original: "终而复始，日月是也。死而复生，四时是也。", translation: "循环往复如同日月的运行，周而复始如同四季的更替。", source: "势篇" },
        { id: 27, original: "战势不过奇正，奇正之变，不可胜穷也。", translation: "战态不过“奇”与“正”，两者的变化组合是无穷无尽的。", source: "势篇" },
        { id: 28, original: "激水之疾，至于漂石者，势也。", translation: "湍急的水流能冲走石头，这是因为强大的势能。", source: "势篇" },
        { id: 29, original: "鸷鸟之疾，至于毁折者，节也。", translation: "猛禽搏击能折断猎物骨头，这是因为把握好了冲击的节奏。", source: "势篇" },
        { id: 30, original: "是故善战者，其势险，其节短。", translation: "善战者的态势要险峻，进攻的节奏要短促有力。", source: "势篇" },
        { id: 31, original: "势如彍弩，节如发机。", translation: "势态如同拉满的强弩，节奏如同扣动扳机的瞬间。", source: "势篇" },
        { id: 32, original: "纷纷纭纭，斗乱而不可乱也。", translation: "即使旌旗纷乱、战况激烈，也要保持阵脚不乱。", source: "势篇" },
        { id: 33, original: "浑浑沌沌，形圆而不可败也。", translation: "即使局势浑沌、看似混乱，也要防守严密使敌无隙可乘。", source: "势篇" },
        { id: 34, original: "乱生于治，怯生于勇，弱生于强。", translation: "混乱产生于严整之中，胆怯产生于勇敢之中，弱小产生于强大之中。", source: "势篇" },
        { id: 35, original: "治乱，数也；勇怯，势也；强弱，形也。", translation: "严整或混乱在于组织；勇敢或胆怯在于势态；强大或弱小在于实力。", source: "势篇" },
        { id: 36, original: "故善动敌者，形之，敌必从之。", translation: "善于调动敌人的人，向敌展示假象，敌人一定会跟从。", source: "势篇" },
        { id: 37, original: "予之，敌必取之。以利动之，以卒待之。", translation: "给予诱饵敌人必取，用小利引诱，再用伏兵待机击之。", source: "势篇" },
        { id: 38, original: "凡先处战地而待敌者佚，后处战地而趋战者劳。", translation: "先到达战场等待敌人的从容主动，后到达战场仓促应战的疲惫被动。", source: "虚实篇" },
        { id: 39, original: "故善战者，致人而不致于人。", translation: "善于作战的人，是调动敌人，而不是被敌人调动。", source: "虚实篇" },
        { id: 40, original: "能使敌人自至者，利之也。", translation: "能让敌人自己送上门，是用利益引诱的结果。", source: "虚实篇" },
        { id: 41, original: "能使敌人不得至者，害之也。", translation: "能让敌人无法到达，是造成其困境阻碍的结果。", source: "虚实篇" },
        { id: 42, original: "故敌佚能劳之，饱能饥之，安能动之。", translation: "敌人安逸就骚扰使其疲劳，粮食充足就设法使其饥饿，稳定就设法使其动摇。", source: "虚实篇" },
        { id: 43, original: "出其所不趋，趋其所不意。", translation: "进攻敌人不防守的地方，出现在敌人意想不到的地方。", source: "虚实篇" },
        { id: 44, original: "行千里而不劳者，行于无人之地也。", translation: "行军千里不疲劳，是因为走的是敌人没有设防的地带。", source: "虚实篇" },
        { id: 45, original: "攻而必取者，攻其所不守也。", translation: "进攻必然获胜，是因为攻击敌人疏于防守的地方。", source: "虚实篇" },
        { id: 46, original: "守而必固者，守其所不攻也。", translation: "防守必然稳固，是因为守在敌人攻不到或不必攻的地方。", source: "虚实篇" },
        { id: 47, original: "故善攻者，敌不知其所守。善守者，敌不知其所攻。", translation: "善攻者让敌不知守哪，善守者让敌不知攻哪。", source: "虚实篇" },
        { id: 48, original: "微乎微乎，至于无形。神乎神乎，至于无声。", translation: "微妙啊微妙，达到无影无踪；神奇啊神奇，达到无声无息。", source: "虚实篇" },
        { id: 49, original: "故能为敌之司命。", translation: "这样就能成为敌人命运的主宰。", source: "虚实篇" },
        { id: 50, original: "进而不可御者，冲其虚也。", translation: "进攻时对方无法抵挡，是因为冲向了敌人的虚弱处。", source: "虚实篇" },
        { id: 51, original: "退而不可追者，速而不可及也。", translation: "撤退时对方追不上，是因为动作迅速让敌赶不上。", source: "虚实篇" },
        { id: 52, original: "故我欲战，敌虽高垒深沟，不得不与我战者，攻其所必救也。", translation: "我想开战，敌即使深沟高垒也得应战，是因为我攻其必救。", source: "虚实篇" },
        { id: 53, original: "我不欲战，画地而守之，敌不得与我战者，乖其所之也。", translation: "我不想打，即使只划地自守敌也打不起来，是因为我误导了其进攻方向。", source: "虚实篇" },
        { id: 54, original: "故形人而我无形，则我专而敌分。", translation: "让敌人暴露形迹而我隐藏行踪，这样我方兵力集中而敌方兵力分散。", source: "虚实篇" },
        { id: 55, original: "我专为一，敌分为十，是以十攻其一也。", translation: "我方集中一处，敌方分散十处，就是用十倍兵力打敌方一倍。", source: "虚实篇" },
        { id: 57, original: "知战之地，知战之日，则可千里而会战。", translation: "如果预知开战地点和时间，即使相隔千里也可以集结会战。", source: "虚实篇" },
        { id: 58, original: "不知战地，不知战日，则左不能救右，右不能救左。", translation: "不知战地战日，军队各部就无法互相救援。", source: "虚实篇" },
        { id: 59, original: "故策之而知得失之计，作之而知动静之理。", translation: "通过分析判断敌方计划，通过挑衅摸清敌方行动规律。", source: "虚实篇" },
        { id: 60, original: "形之而知死生之地，角之而知有余不足之处。", translation: "诱敌示形判断死生之地，通过试探性接触了解敌兵力分布。", source: "虚实篇" },
        { id: 61, original: "故形兵之极，至于无形。无形则深间不能窥，智者不能谋。", translation: "用兵的最高境界是“无形”，让间谍无法侦察，智者无法谋划。", source: "虚实篇" },
        { id: 62, original: "因形而错胜于众，众不能知。", translation: "根据敌情变化灵活取胜，大众也看不出其中的奥妙。", source: "虚实篇" },
        { id: 63, original: "人皆知我所以胜之形，而莫知吾所以制胜之形。", translation: "人们只看到获胜的表象，却不知道真正决定胜负的内在变化。", source: "虚实篇" },
        { id: 64, original: "故其战胜不复，而应形于无穷。", translation: "每次获胜的方法不重复，而是适应敌情进行无穷的变化。", source: "虚实篇" },
        { id: 65, original: "夫兵形象水，水之形避高而趋下，兵之形避实而击虚。", translation: "用兵像水：水避开高处流向低处，用兵避开强点攻击虚弱。", source: "虚实篇" },
        { id: 66, original: "水因地而制流，兵因敌而制胜。", translation: "水根据地形决定流向，军队根据敌情决定胜法。", source: "虚实篇" },
        { id: 67, original: "故兵无常势，水无常形。能因敌变化而取胜者，谓之神。", translation: "用兵无定势，水无定形。能随敌情变化而取胜的称为“神”。", source: "虚实篇" },
        { id: 68, original: "凡军争之难者，以迂为直，以患为利。", translation: "争夺先机的难点在于：化迂回为直捷，化不利为有利。", source: "军争篇" },
        { id: 69, original: "故迂其途而诱之以利，后人发，先人至，此知迂直之计者也。", translation: "绕道走并利诱敌人，虽然晚出发却早到达，这是懂得迂直之计。", source: "军争篇" },
        { id: 70, original: "军争为利，军争为危。", translation: "争夺先机可能有大利，也伴随着极大的危险。", source: "军争篇" },
        { id: 76, original: "故不知诸侯之谋者，不能豫交。", translation: "不了解列强意图的，不能结交盟友。", source: "军争篇" },
        { id: 77, original: "不知山林、险阻、沮泽之形者，不能行军。", translation: "不了解地理环境的，不能行军。", source: "军争篇" },
        { id: 79, original: "故兵以诈立，以利动，以分合为变者也。", translation: "战争靠伪装立足，根据利益行动，根据情况集结或分散。", source: "军争篇" },
        { id: 80, original: "故其疾如风，其徐如林，侵掠如火，不动如山，难知如阴，动如雷震。", translation: "行动神速如风，从容如林，侵略如火，坚守如山，隐蔽如阴，爆发如雷。", source: "军争篇" },
        { id: 81, original: "掠乡分众，廓地分利，悬权而动。", translation: "夺取敌方资源，权衡利弊后采取行动。", source: "军争篇" },
        { id: 82, original: "先知迂直之计者胜。此军争之法也。", translation: "先领悟“迂直”之计的人获胜。这就是争夺先机的方法。", source: "军争篇" },
        { id: 83, original: "《军政》曰：言不相闻，故为金鼓；视不相见，故为旌旗。", translation: "古书说：声音听不清就用鸣金击鼓，视觉看不清就用旗帜。", source: "军争篇" },
        { id: 84, original: "夫金鼓旌旗者，所以一人之耳目也。", translation: "敲鼓打旗是为了统一全军的视听。", source: "军争篇" },
        { id: 85, original: "人既专一，则勇者不得独进，怯者不得独退，此用众之法也。", translation: "行动统一后，勇敢的不乱闯，胆小的撤不了，这就是指挥大军的方法。", source: "军争篇" },
        { id: 87, original: "三军可夺气，将军可夺心。", translation: "敌方全军的士气可以被挫败，敌方将领的意志可以被动摇。", source: "军争篇" },
        { id: 88, original: "是故朝气锐，昼气惰，暮气归。故善用兵者，避其锐气，击其惰归，此治气者也。", translation: "避开敌方初期的锐气，攻击其疲惫想回营的状态。", source: "军争篇" },
        { id: 89, original: "以治待乱，以静待哗，此治心者也。", translation: "用严整对待混乱，用镇定对待喧嚣，这是心理掌控。", source: "军争篇" },
        { id: 90, original: "以近待远，以佚待劳，以饱待饥，此治力者也。", translation: "以就近待远道而来，以逸待劳，以饱待饥，这是体力掌控。", source: "军争篇" },
        { id: 93, original: "佯北勿从，锐卒勿攻，饵兵勿食，归师勿遏，围师必阙，穷寇勿迫。", translation: "假装败退别追，诱敌之兵别吃，身陷绝境的敌人别逼得太死。", source: "军争篇" },
        { id: 95, original: "圮地无舍，衢地交合，绝地无留，围地则谋，死地则战。", translation: "沼泽地别驻扎，交通要道结盟，险恶地快走，绝地要拼死一战。", source: "九变篇" },
        { id: 96, original: "途有所不由，军有所不击，城有所不攻，地有所不争，君命有所不受。", translation: "有的路不走，有的敌不打，有的城不攻，有的君命可以不听。", source: "九变篇" },
        { id: 97, original: "故将通于九变之利者，知用兵矣。", translation: "能精通各种机变利弊的将领，才算懂得用兵。", source: "九变篇" },
        { id: 100, original: "是故智者之虑，必杂于利害。", translation: "聪明人的考虑，一定会兼顾利益和损害两个方面。", source: "九变篇" }
    ],
    zhouyi: [
        { id: "第 01 卦", shortName: "乾卦", name: "乾为天", symbol: "\u4DC0", original: "元，亨，利，贞。", title: "满格运行", advice: "不要犹豫，现在是你的主场。请保持高频的行动力，全力以赴地推进目标。" },
        { id: "第 02 卦", shortName: "坤卦", name: "坤为地", symbol: "\u4DC1", original: "元亨，利牝马之贞。", title: "借力而行", advice: "收敛锋芒，先成全别人。通过支持他人来达成目标，最后自然会成全你自己。" },
        { id: "第 03 卦", shortName: "屯卦", name: "水雷屯", symbol: "\u4DC2", original: "元，亨，利，贞，勿用有攸往。", title: "深耕厚植", advice: "刚起步难免会有波折。别急着破土，先扎深根，现在的停滞是在积攒突破的力道。" },
        { id: "第 04 卦", shortName: "蒙卦", name: "山水蒙", symbol: "\u4DC3", original: "匪我求童蒙，童蒙求我。", title: "归零心态", advice: "承认自己的盲区。找个懂行的人虚心求教，别一个人在迷雾中消耗体力。" },
        { id: "第 05 卦", shortName: "需卦", name: "水天需", symbol: "\u4DC4", original: "有孚，光亨，贞吉。", title: "静候时机", advice: "焦虑于事无补。既然已经尽力，剩下的交给时间。别在等待的过程中损耗能量。" },
        { id: "第 06 卦", shortName: "讼卦", name: "天水讼", symbol: "\u4DC5", original: "有孚，窒。惕中吉。", title: "止损为上", advice: "别为了争一口气而丢了全局。主动退后半步，把精力放回更有价值的事情上。" },
        { id: "第 07 卦", shortName: "师卦", name: "地水师", symbol: "\u4DC6", original: "贞，丈人吉，无咎。", title: "严明纪律", advice: "这不是你一个人的战斗。整合身边的资源，确立清晰的规矩，带队出发。" },
        { id: "第 08 卦", shortName: "比卦", name: "水地比", symbol: "\u4DC7", original: "原筮，元永贞，无咎。", title: "磁场筛选", advice: "靠近那些能给你正能量的人。选择同路人比一味追求社交数量更重要。" },
        { id: "第 09 卦", shortName: "小畜卦", name: "风天小畜", symbol: "\u4DC8", original: "亨。密云不雨，自我西郊。", title: "微调优化", advice: "大的方向暂时动不了，就先从手边的一件小事改起。细节的积累会带来质变。" },
        { id: "第 10 卦", shortName: "履卦", name: "天泽履", symbol: "\u4DC9", original: "履虎尾，不咥人，亨。", title: "如履薄冰", advice: "局势复杂，说话做事都要留三分余地。步子慢一点、稳一点，才是最快的。" },
        { id: "第 11 卦", shortName: "泰卦", name: "地天泰", symbol: "\u4DCA", original: "小往大来，吉亨。", title: "趁热打铁", advice: "运势正旺，顺水推舟。在舒服的时候也要为未来的下坡路做一点储备。" },
        { id: "第 12 卦", shortName: "否卦", name: "天地否", symbol: "\u4DCB", original: "不利君子贞，大往小来。", title: "沉潜守志", advice: "沟通无效时请保持沉默。闭上嘴，熬过去，在静止中默默打磨自己的能力。" },
        { id: "第 13 卦", shortName: "同人卦", name: "天火同人", symbol: "\u4DCC", original: "于野，亨。利涉大川。", title: "破圈寻找", advice: "去外面看看，找那些志同道合的人。跨界协作会给你带来意想不到的生机。" },
        { id: "第 14 卦", shortName: "大有卦", name: "火天大有", symbol: "\u4DCD", original: "元亨。", title: "惜物惜福", advice: "收获颇丰时更要保持克制。现在的资源是借来的，懂得分享才能让好运持久。" },
        { id: "第 15 卦", shortName: "谦卦", name: "地山谦", symbol: "\u4DCE", original: "亨，君子有终。", title: "藏锋守拙", advice: "真正的强大不需要证明。保持低姿态，这会帮你避开很多不必要的敌意和阻力。" },
        { id: "第 16 卦", shortName: "豫卦", name: "雷地豫", symbol: "\u4DCF", original: "利建侯行师。", title: "戒骄戒躁", advice: "快乐和安逸最容易让人麻痹。享受当下的同时，别忘了检查你的安全边际。" },
        { id: "第 17 卦", shortName: "随卦", name: "泽雷随", symbol: "\u4DD0", original: "元亨利贞，无咎。", title: "顺势而动", advice: "不要逆流而上。观察大势所趋，顺应节奏去调整你的计划，会事半功倍。" },
        { id: "第 18 卦", shortName: "蛊卦", name: "山风蛊", symbol: "\u4DD1", original: "元亨，利涉大川。", title: "刮骨疗毒", advice: "积弊已久，必须狠下心来清理烂摊子。拖延只会让成本更高，现在就动手。" },
        { id: "第 19 卦", shortName: "临卦", name: "地泽临", symbol: "\u4DD2", original: "元亨利贞。至于八月有凶。", title: "亲临前线", advice: "机会已经出现在地平线上。亲自上阵，关注每一个执行细节，好运正在加速。" },
        { id: "第 20 卦", shortName: "观卦", name: "风地观", symbol: "\u4DD3", original: "盥而不荐，有孚颙若。", title: "审时度势", advice: "先别急着下结论。多看、多想、少动，换一个视角，你会发现完全不同的真相。" },
        { id: "第 21 卦", shortName: "噬嗑卦", name: "火雷噬嗑", symbol: "\u4DD4", original: "亨。利用刑。", title: "果断破局", advice: "遇到阻碍就用力咬碎它。别试图用温情去软化敌人，果断行动才能建立威信。" },
        { id: "第 22 卦", shortName: "贲卦", name: "山火贲", symbol: "\u4DD5", original: "亨。小利有攸往。", title: "返璞归真", advice: "外在的包装已经足够。现在请把注意力收回来，关注内核的质量和本质。" },
        { id: "第 23 卦", shortName: "剥卦", name: "山地剥", symbol: "\u4DD6", original: "不利有攸往。", title: "顺应周期", advice: "颓势已定，硬抗无益。保存实力，等这阵风刮过去，低头是为了下一次抬头。" },
        { id: "第 24 卦", shortName: "复卦", name: "地雷复", symbol: "\u4DD7", original: "亨。出入无疾，朋来无咎。", title: "重启更新", advice: "走偏了就转回来。每一次归零，都是一次难得的迭代契机。初心就是指路灯。" },
        { id: "第 25 卦", shortName: "无妄卦", name: "天雷无妄", symbol: "\u4DD8", original: "元亨利贞。其匪正有眚。", title: "顺其自然", advice: "别想太多。倒霉有时只是概率，不是惩罚。做好分内事，不期待奇迹发生。" },
        { id: "第 26 卦", shortName: "大畜卦", name: "山天大畜", symbol: "\u4DD9", original: "利贞。不家食吉。", title: "蓄势待发", advice: "现在的积累是为了更远的远方。不要急着变现，再多读几本书，多练几次功。" },
        { id: "第 27 卦", shortName: "颐卦", name: "山雷颐", symbol: "\u4DDA", original: "贞吉。观颐，自求口实。", title: "言语节制", advice: "管好你的嘴，无论是饮食还是说话。慎重的言行是当下的保命符。" },
        { id: "第 28 卦", shortName: "大过卦", name: "泽风大过", symbol: "\u4DDB", original: "栋桡。利有攸往，亨。", title: "紧急应对", advice: "压力已到临界点。要么彻底放手，要么全力突围，墨守成规只会加速崩塌。" },
        { id: "第 29 卦", shortName: "坎卦", name: "坎为水", symbol: "\u4DDC", original: "习坎，有孚，维心亨。", title: "直面险阻", advice: "陷阱一个接一个。沉住气，关关难过关关过，勇气是唯一能带你出去的路。" },
        { id: "第 30 卦", shortName: "离卦", name: "离为火", symbol: "\u4DDD", original: "利贞，亨。畜牝牛，吉。", title: "寻找依托", advice: "火没有木头无法持久。找一个可靠的平台或合作伙伴，让自己有个安身立命之所。" },
        { id: "第 31 卦", shortName: "咸卦", name: "泽山咸", symbol: "\u4DDE", original: "亨，利贞，取女吉。", title: "真诚感应", advice: "放下套路，用真心去沟通。当你不再试图去操控局势时，转机反而会出现。" },
        { id: "第 32 卦", shortName: "恒卦", name: "雷风恒", symbol: "\u4DDF", original: "亨，无咎，利贞。", title: "坚持不懈", advice: "别总是换赛道。现在的平庸是因为还没过临界点，咬牙再坚持一下。" },
        { id: "第 33 卦", shortName: "遁卦", name: "天山遁", symbol: "\u4DE0", original: "亨，小利贞。", title: "优雅离场", advice: "该撤退的时候别犹豫。保存实力并不丢人，跑得快也是一种战略智慧。" },
        { id: "第 34 卦", shortName: "大壮卦", name: "雷天大壮", symbol: "\u4DE1", original: "利贞。", title: "克制力量", advice: "别到处秀肌肉。真正的强大是不怒而威。冲动是魔鬼，收敛才是智慧。" },
        { id: "第 35 卦", shortName: "晋卦", name: "火地晋", symbol: "\u4DE2", original: "康侯用锡马蕃庶。", title: "顺势晋升", advice: "事业正在上行轨道。保持感恩的心态，同时别忘了提携曾帮过你的人。" },
        { id: "第 36 卦", shortName: "明夷卦", name: "地火明夷", symbol: "\u4DE3", original: "利艰贞。", title: "韬光养晦", advice: "现在的光芒太刺眼，容易招忌。把灯关小点，隐藏自己的才华，暗自发力。" },
        { id: "第 37 卦", shortName: "家人卦", name: "风火家人", symbol: "\u4DE4", original: "利女贞。", title: "回归中心", advice: "照顾好你的大后方。处理好亲密关系，家里的安稳是你出门打拼的底气。" },
        { id: "第 38 卦", shortName: "睽卦", name: "火泽睽", symbol: "\u4DE5", original: "小事吉。", title: "求同存异", advice: "合不来很正常。不必强求每个人都理解你，各走各的路，小事上保持礼貌。" },
        { id: "第 39 卦", shortName: "蹇卦", name: "水山蹇", symbol: "\u4DE6", original: "利西南，不利东北。", title: "绕道而行", advice: "前方施工，请勿硬闯。寻找更有利的地形或时机，暂时的折返是为了更快的到达。" },
        { id: "第 40 卦", shortName: "解卦", name: "雷水解", symbol: "\u4DE7", original: "利西南。无所往，其来复吉。", title: "轻装上阵", advice: "误会和麻烦正在消散。原谅该原谅的，放下该放下的，大步往前走，别回头。" },
        { id: "第 41 卦", shortName: "损卦", name: "山泽损", symbol: "\u4DE8", original: "损，有孚，元吉。", title: "适当割舍", advice: "现在的失去是给未来的得到腾空间。减掉不必要的欲望和项目，让身心轻盈。" },
        { id: "第 42 卦", shortName: "益卦", name: "风雷益", symbol: "\u4DE9", original: "利有攸往，利涉大川。", title: "果断进取", advice: "运气正向你倾斜。别浪费这个窗口期，想做的事情现在就去做，成功率最高。" },
        { id: "第 43 卦", shortName: "夬卦", name: "泽天夬", symbol: "\u4DEA", original: "扬于王庭，孚号有厉。", title: "决断执行", advice: "摊牌的时候到了。长痛不如短痛，这种暧昧或僵持的局面必须由你来终结。" },
        { id: "第 44 卦", shortName: "姤卦", name: "天风姤", symbol: "\u4DEB", original: "女壮，勿用取女。", title: "警惕诱惑", advice: "突如其来的好运或艳遇往往带着高昂的价码。控制住本能，多思考背后的动机。" },
        { id: "第 45 卦", shortName: "萃卦", name: "泽地萃", symbol: "\u4DEC", original: "亨，王假有庙。", title: "资源整合", advice: "聚在一起是为了更大的目标。明确利益分配机制，别只谈感情不谈规则。" },
        { id: "第 46 卦", shortName: "升卦", name: "地风升", symbol: "\u4DED", original: "元亨，用见大人。", title: "步步为营", advice: "稳扎稳打地爬。别盯着云端看，看好脚下的每一个台阶，踏实比速度重要。" },
        { id: "第 47 卦", shortName: "困卦", name: "泽水困", symbol: "\u4DEE", original: "贞，大人吉，无咎。", title: "精神突围", advice: "环境困住了你，但困不住你的思想。在静默中磨练意志，等待那个必然出现的缺口。" },
        { id: "第 48 卦", shortName: "井卦", name: "水风井", symbol: "\u4DEF", original: "改邑不改井，无丧无得。", title: "深挖价值", advice: "别到处挖坑，深挖一口井。你的核心竞争力需要时间的沉淀和不断的修缮。" },
        { id: "第 49 卦", shortName: "革卦", name: "泽火革", symbol: "\u4DF0", original: "已日乃孚，元亨利贞。", title: "彻底重构", advice: "修补已经无济于事。换个系统、换个思路、甚至换个环境。推倒重来是唯一的出路。" },
        { id: "第 50 卦", shortName: "鼎卦", name: "火风鼎", symbol: "\u4DF1", original: "元吉，亨。", title: "稳重权衡", advice: "权力的博弈需要平衡。找准你的位置，既要做干活的人，也要做看清风向的人。" },
        { id: "第 51 卦", shortName: "震卦", name: "震为雷", symbol: "\u4DF2", original: "亨。震来虩虩，笑言哑哑。", title: "处变不惊", advice: "动静很大，但雷声大雨点小。守住内心的定力，别被外界的喧嚣扰乱了脚步。" },
        { id: "第 52 卦", shortName: "艮卦", name: "艮为山", symbol: "\u4DF3", original: "艮其背，不获其身。", title: "止步内观", advice: "停下来。不仅是脚步，还有你的焦虑。在全然的安静中，答案会自己浮现。" },
        { id: "第 53 卦", shortName: "渐卦", name: "风山渐", symbol: "\u4DF4", original: "女归吉，利贞。", title: "循序渐进", advice: "慢就是快。那种一夜暴富、一蹴而就的梦少做。按部就班地走，才最稳妥。" },
        { id: "第 54 卦", shortName: "归妹卦", name: "雷泽归妹", symbol: "\u4DF5", original: "征凶，无攸利。", title: "纠正错位", advice: "这种不平等的关系注定难长久。审视你的位置，别在错误的方向上投入更多感情。" },
        { id: "第 55 卦", shortName: "丰卦", name: "雷火丰", symbol: "\u4DF6", original: "亨，王假之，勿忧。", title: "居安思危", advice: "盛宴总会散场。在最辉煌的时候，就要为天黑后的生活做打算。" },
        { id: "第 56 卦", shortName: "旅卦", name: "火山旅", symbol: "\u4DF7", original: "小亨，旅贞吉。", title: "随遇而安", advice: "你只是个过客。保持客气与清醒，别在临时驻足的地方投入过深，随时准备出发。" },
        { id: "第 57 卦", shortName: "巽卦", name: "巽为风", symbol: "\u4DF8", original: "小亨，利有攸往。", title: "灵活渗透", advice: "像风一样柔软，比像石头一样坚硬更有用。顺着缝隙进入，达成你的目标。" },
        { id: "第 58 卦", shortName: "兑卦", name: "兑为泽", symbol: "\u4DF9", original: "亨，利贞。", title: "喜悦沟通", advice: "聊得开心很重要，但别在笑声中忘了正事。保持礼貌，坚守原则。" },
        { id: "第 59 卦", shortName: "涣卦", name: "风水涣", symbol: "\u4DFA", original: "亨，王假有庙。", title: "化解僵局", advice: "散伙或分裂不一定是坏事。打破旧的格局，才能在废墟上建立更自由的未来。" },
        { id: "第 60 卦", shortName: "节卦", name: "水泽节", symbol: "\u4DFB", original: "亨。苦节不可贞。", title: "适度节制", advice: "自律是好事，但把自己逼死就叫自虐。找到那个让你舒服且持续的节奏。" },
        { id: "第 61 卦", shortName: "中孚卦", name: "风泽中孚", symbol: "\u4DFC", original: "豚鱼吉，利涉大川。", title: "坚守诚信", advice: "信任是唯一的货币。在这个阶段，说实话、办实事，这会为你赢得最核心的资源。" },
        { id: "第 62 卦", shortName: "小过卦", name: "雷泽小过", symbol: "\u4DFD", original: "亨，利贞。", title: "保持谨慎", advice: "小事可以通融，大事绝不含糊。在这个敏感时期，保守一点对你有好处。" },
        { id: "第 63 卦", shortName: "既济卦", name: "水火既济", symbol: "\u4DFE", original: "亨，小利贞。", title: "慎终如始", advice: "事情办成了，真正的考验才开始。别急着庆祝，防范那些微小的、可能导致翻船的隐患。" },
        { id: "第 64 卦", shortName: "未济卦", name: "火水未济", symbol: "\u4DFF", original: "亨，小狐汔济。", title: "最后一公里", advice: "还没结束。越是接近成功，越要冷静。收好尾，别在最后一刻掉进坑里。" }
    ],
    tarot: [
        { text: "愚者：新的开始、天真、冒险与无限可能。", source: "塔罗·愚者 The Fool" },
        { text: "魔术师：创造力、行动力、资源与显化。", source: "塔罗·魔术师 The Magician" },
        { text: "女祭司：直觉、神秘、内在智慧与潜意识。", source: "塔罗·女祭司 The High Priestess" },
        { text: "皇后：丰饶、母性、美与自然的滋养。", source: "塔罗·皇后 The Empress" },
        { text: "皇帝：权威、秩序、父亲形象与稳定。", source: "塔罗·皇帝 The Emperor" },
        { text: "教皇：传统、信仰、教导与灵性传承。", source: "塔罗·教皇 The Hierophant" },
        { text: "恋人：选择、爱、结合与价值观的契合。", source: "塔罗·恋人 The Lovers" },
        { text: "战车：意志、胜利、自律与前进。", source: "塔罗·战车 The Chariot" },
        { text: "力量：内在力量、勇气、耐心与温柔驯服。", source: "塔罗·力量 Strength" },
        { text: "隐者：独处、寻求真理、智慧与内省。", source: "塔罗·隐者 The Hermit" },
        { text: "命运之轮：轮回、转变、机遇与命运。", source: "塔罗·命运之轮 Wheel of Fortune" },
        { text: "正义：公平、因果、真相与平衡。", source: "塔罗·正义 Justice" },
        { text: "倒吊人：牺牲、换位思考、等待与顿悟。", source: "塔罗·倒吊人 The Hanged Man" },
        { text: "死神：结束、转化、重生与放手。", source: "塔罗·死神 Death" },
        { text: "节制：调和、中庸、炼金与平衡。", source: "塔罗·节制 Temperance" },
        { text: "恶魔：欲望、执念、物质束缚与阴影。", source: "塔罗·恶魔 The Devil" },
        { text: "高塔：突变、觉醒、崩塌与启示。", source: "塔罗·高塔 The Tower" },
        { text: "星星：希望、灵感、疗愈与指引。", source: "塔罗·星星 The Star" },
        { text: "月亮：幻觉、潜意识、恐惧与直觉。", source: "塔罗·月亮 The Moon" },
        { text: "太阳：成功、活力、喜悦与光明。", source: "塔罗·太阳 The Sun" },
        { text: "审判：觉醒、召唤、救赎与新生。", source: "塔罗·审判 Judgement" },
        { text: "世界：完成、圆满、循环与整合。", source: "塔罗·世界 The World" },
        { text: "权杖王牌：新行动、热情、创意与机会。", source: "塔罗·权杖王牌" },
        { text: "权杖二：计划、决策与远见。", source: "塔罗·权杖二" },
        { text: "权杖三：拓展、合作与视野。", source: "塔罗·权杖三" },
        { text: "权杖四：庆祝、稳定与家园。", source: "塔罗·权杖四" },
        { text: "权杖五：冲突、竞争与分歧。", source: "塔罗·权杖五" },
        { text: "权杖六：胜利、认可与自信。", source: "塔罗·权杖六" },
        { text: "权杖七：坚持、防御与信念。", source: "塔罗·权杖七" },
        { text: "权杖八：迅速、行动与自由。", source: "塔罗·权杖八" },
        { text: "权杖九：毅力、警觉与边界。", source: "塔罗·权杖九" },
        { text: "权杖十：负担、责任与坚持。", source: "塔罗·权杖十" },
        { text: "权杖侍从：消息、探索与热情。", source: "塔罗·权杖侍从" },
        { text: "权杖骑士：冲动、冒险与活力。", source: "塔罗·权杖骑士" },
        { text: "权杖皇后：自信、独立与魅力。", source: "塔罗·权杖皇后" },
        { text: "权杖国王：领导、远见与魄力。", source: "塔罗·权杖国王" },
        { text: "宝剑王牌：突破、真相与心智力量。", source: "塔罗·宝剑王牌" },
        { text: "宝剑二：抉择、僵局与回避。", source: "塔罗·宝剑二" },
        { text: "宝剑三：伤心、失落与疗愈。", source: "塔罗·宝剑三" },
        { text: "宝剑四：休息、反思与恢复。", source: "塔罗·宝剑四" },
        { text: "宝剑五：争执、胜负与代价。", source: "塔罗·宝剑五" },
        { text: "宝剑六：过渡、疗愈与前行。", source: "塔罗·宝剑六" },
        { text: "宝剑七：策略、独行与保留。", source: "塔罗·宝剑七" },
        { text: "宝剑八：限制、恐惧与自我设障。", source: "塔罗·宝剑八" },
        { text: "宝剑九：焦虑、噩梦与内在恐惧。", source: "塔罗·宝剑九" },
        { text: "宝剑十：结束、低谷与黎明前。", source: "塔罗·宝剑十" },
        { text: "宝剑侍从：好奇、警觉与消息。", source: "塔罗·宝剑侍从" },
        { text: "宝剑骑士：冲动、挑战与锐气。", source: "塔罗·宝剑骑士" },
        { text: "宝剑皇后：清晰、独立与洞察。", source: "塔罗·宝剑皇后" },
        { text: "宝剑国王：权威、理智与决断。", source: "塔罗·宝剑国王" },
        { text: "圣杯王牌：情感、直觉与新关系。", source: "塔罗·圣杯王牌" },
        { text: "圣杯二：伙伴、和谐与联结。", source: "塔罗·圣杯二" },
        { text: "圣杯三：欢庆、友谊与丰收。", source: "塔罗·圣杯三" },
        { text: "圣杯四：内省、选择与不满。", source: "塔罗·圣杯四" },
        { text: "圣杯五：悲伤、释怀与接纳。", source: "塔罗·圣杯五" },
        { text: "圣杯六：回忆、纯真与馈赠。", source: "塔罗·圣杯六" },
        { text: "圣杯七：幻想、选择与梦境。", source: "塔罗·圣杯七" },
        { text: "圣杯八：离开、追寻与放下。", source: "塔罗·圣杯八" },
        { text: "圣杯九：满足、愿望与独享。", source: "塔罗·圣杯九" },
        { text: "圣杯十：和谐、家庭与圆满。", source: "塔罗·圣杯十" },
        { text: "圣杯侍从：敏感、创意与直觉。", source: "塔罗·圣杯侍从" },
        { text: "圣杯骑士：浪漫、邀请与理想主义。", source: "塔罗·圣杯骑士" },
        { text: "圣杯皇后：滋养、共情与直觉。", source: "塔罗·圣杯皇后" },
        { text: "圣杯国王：情感成熟、包容与智慧。", source: "塔罗·圣杯国王" },
        { text: "星币王牌：富足、机会与物质根基。", source: "塔罗·星币王牌" },
        { text: "星币二：平衡、适应与多任务。", source: "塔罗·星币二" },
        { text: "星币三：合作、技艺与建设。", source: "塔罗·星币三" },
        { text: "星币四：稳定、保守与守护。", source: "塔罗·星币四" },
        { text: "星币五：匮乏、寒冬与互助。", source: "塔罗·星币五" },
        { text: "星币六：给予、公平与分享。", source: "塔罗·星币六" },
        { text: "星币七：耐心、投资与收获。", source: "塔罗·星币七" },
        { text: "星币八：技艺、专注与勤劳。", source: "塔罗·星币八" },
        { text: "星币九：自律、富足与独享。", source: "塔罗·星币九" },
        { text: "星币十：家族、传承与稳固。", source: "塔罗·星币十" },
        { text: "星币侍从：学习、机会与务实。", source: "塔罗·星币侍从" },
        { text: "星币骑士：稳健、可靠与进取。", source: "塔罗·星币骑士" },
        { text: "星币皇后：丰饶、安全感与滋养。", source: "塔罗·星币皇后" },
        { text: "星币国王：成功、权威与富足。", source: "塔罗·星币国王" }
    ]
};

let currentPool = '';
var currentBingfaTranslation = '';
/** 各卡池本次会话最后一次抽到的内容，切回该卡池时恢复卡面 */
var lastDrawnByPool = { mao: null, bingfa: null, zhouyi: null, tarot: null };

var DAILY_DRAW_LIMIT = 5;
var DRAW_COUNTS_KEY = 'dailyDrawTotal';
var OPEN_SCREEN_COLOR_KEY = 'openScreenColorToday';
var POOL_LABELS = { mao: '红星', bingfa: '兵法', zhouyi: '周易', tarot: '塔罗' };

/** 传统色色库（开屏卡背「今日传统色」一天只显示一次，随机取一） */
var luckyColors = [
    { name: '胭脂', hex: '#9d2933' },
    { name: '朱砂', hex: '#ff461f' },
    { name: '青冥', hex: '#1e3a5f' },
    { name: '月白', hex: '#d6ecf0' },
    { name: '竹青', hex: '#789262' },
    { name: '秋香', hex: '#d9b611' },
    { name: '酡颜', hex: '#f9906f' },
    { name: '绾', hex: '#a35b44' },
    { name: '乌金', hex: '#a78e44' },
    { name: '檀', hex: '#b36d61' },
    { name: '苍青', hex: '#2e4a5c' },
    { name: '妃红', hex: '#be002f' },
    { name: '青莲', hex: '#7b3e8a' },
    { name: '藕色', hex: '#edd1d8' },
    { name: '松花', hex: '#b8d4a4' },
    { name: '天青', hex: '#2eadd7' },
    { name: '藤黄', hex: '#ffb61e' },
    { name: '玄青', hex: '#3d3b4f' },
    { name: '鸦青', hex: '#424c50' },
    { name: '绛紫', hex: '#8c4356' },
    { name: '黎', hex: '#75664d' },
    { name: '艾绿', hex: '#a8b78b' },
    { name: '丁香', hex: '#cca4e3' },
    { name: '霁青', hex: '#4a6fa5' },
    { name: '琥珀', hex: '#ca6924' }
];

/** 根据 hex 计算相对亮度（0~1），用于深色背景时自动用浅色字 */
function getLuminance(hex) {
    var h = hex.replace(/^#/, '');
    var r = parseInt(h.slice(0, 2), 16) / 255;
    var g = parseInt(h.slice(2, 4), 16) / 255;
    var b = parseInt(h.slice(4, 6), 16) / 255;
    r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function applyOpenScreenCardBack() {
    var card = document.getElementById('capture-area');
    var cardBack = document.getElementById('cardBack');
    var nameEl = document.getElementById('card-back-color-name');
    var hintEl = document.getElementById('card-back-hint');
    var dateEl = document.getElementById('card-back-date');
    if (!card || !cardBack || !nameEl) return;
    var today = getTodayDateString();
    var stored = null;
    try {
        var raw = localStorage.getItem(OPEN_SCREEN_COLOR_KEY);
        if (raw) stored = JSON.parse(raw);
    } catch (e) {}
    var color;
    if (stored && stored.date === today && stored.hex && stored.name) {
        color = { name: stored.name, hex: stored.hex };
    } else {
        var idx = Math.floor(Math.random() * luckyColors.length);
        color = luckyColors[idx];
        try { localStorage.setItem(OPEN_SCREEN_COLOR_KEY, JSON.stringify({ date: today, name: color.name, hex: color.hex })); } catch (e) {}
    }
    cardBack.style.background = color.hex;
    cardBack.style.backgroundImage = 'none';
    cardBack.style.backgroundSize = '';
    cardBack.style.backgroundRepeat = '';
    cardBack.style.backgroundBlendMode = '';
    nameEl.textContent = '\u4eca\u65e5\u4f20\u7edf\u8272\u202f\u00b7\u202f' + color.name;
    var dark = getLuminance(color.hex) < 0.45;
    var textColor = dark ? 'rgba(255,255,255,0.92)' : 'rgba(0,0,0,0.78)';
    nameEl.style.color = textColor;
    if (hintEl) hintEl.style.color = dark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.65)';
    if (dateEl) {
        var now = new Date();
        var beijingMs = now.getTime() + BEIJING_OFFSET_MS;
        var b = new Date(beijingMs);
        var timeStr = b.getUTCHours() + ':' + String(b.getUTCMinutes()).padStart(2, '0');
        dateEl.textContent = '\u4eca\u65e5 ' + getTodayDateString() + '  ' + timeStr + ' \u5317\u4eac\u65f6\u95f4';
        dateEl.style.color = dark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)';
    }
    var poolSel = document.querySelector('.pool-selector');
    if (poolSel) poolSel.style.setProperty('--pool-active-color', color.hex);
}

/** 今日日期字符串，按北京时间（用于每日抽卡次数、0 点刷新日界） */
function getTodayDateString() {
    var p = getBeijingDateParts();
    return p.year + '-' + String(p.month + 1).padStart(2, '0') + '-' + String(p.day).padStart(2, '0');
}

/** 北京时间 0 点整刷新：清空昨日卡面、翻回卡背、更新日期与再抽按钮，并预约下一次 0 点 */
var beijingMidnightTimer = null;
function refreshAtBeijingMidnight() {
    var today = getTodayDateString();
    if (lastKnownBeijingDate && today === lastKnownBeijingDate) {
        /* 仍是同一天（定时器可能被提前触发或时钟偏差），只重新预约下一次 0 点，不重复刷新 */
        scheduleNextBeijingMidnight();
        return;
    }
    lastDrawnByPool = { mao: null, bingfa: null, zhouyi: null, tarot: null };
    updatePageDate();
    lastKnownBeijingDate = today;
    updateReDrawButton();
    changePool(currentPool);
    scheduleNextBeijingMidnight();
}
function scheduleNextBeijingMidnight() {
    if (beijingMidnightTimer) clearTimeout(beijingMidnightTimer);
    var ms = getMsUntilNextBeijingMidnight();
    beijingMidnightTimer = setTimeout(refreshAtBeijingMidnight, ms);
}

/** 页面重新可见时检查是否已跨日（解决后台时定时器未触发导致日期不刷新） */
var lastKnownBeijingDate = '';
var beijingMidnightCheckInterval = null;
function checkDateRefreshOnVisible() {
    var today = getTodayDateString();
    if (lastKnownBeijingDate && lastKnownBeijingDate !== today) {
        refreshAtBeijingMidnight();
    }
    lastKnownBeijingDate = today;
    /* 可见时每分钟检查一次是否已跨北京 0 点，弥补 setTimeout 被系统节流导致的不准时 */
    if (beijingMidnightCheckInterval) clearInterval(beijingMidnightCheckInterval);
    beijingMidnightCheckInterval = setInterval(function () {
        if (document.visibilityState !== 'visible') return;
        var t = getTodayDateString();
        if (lastKnownBeijingDate && t !== lastKnownBeijingDate) {
            refreshAtBeijingMidnight();
        }
    }, 60000);
}
function stopBeijingMidnightCheckInterval() {
    if (beijingMidnightCheckInterval) {
        clearInterval(beijingMidnightCheckInterval);
        beijingMidnightCheckInterval = null;
    }
}
document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
        checkDateRefreshOnVisible();
    } else {
        stopBeijingMidnightCheckInterval();
    }
});
window.addEventListener('focus', checkDateRefreshOnVisible);

/** 今日已抽次数（全卡池共用，最多 5 次） */
function getDailyDrawUsed() {
    try {
        var raw = localStorage.getItem(DRAW_COUNTS_KEY);
        var data = raw ? JSON.parse(raw) : null;
        var today = getTodayDateString();
        if (!data || data.date !== today) return 0;
        return typeof data.total === 'number' ? Math.min(data.total, DAILY_DRAW_LIMIT) : 0;
    } catch (e) {
        return 0;
    }
}

function saveDailyDrawUsed(total) {
    try {
        localStorage.setItem(DRAW_COUNTS_KEY, JSON.stringify({ date: getTodayDateString(), total: total }));
    } catch (e) {}
}

function updatePoolButtonLabels() {
    document.querySelectorAll('.pool-selector button[data-pool]').forEach(function (btn) {
        var pool = btn.getAttribute('data-pool');
        btn.textContent = POOL_LABELS[pool] || pool;
    });
}

function updateReDrawButton() {
    var btn = document.getElementById('re-draw-btn');
    if (!btn) return;
    var used = getDailyDrawUsed();
    var left = DAILY_DRAW_LIMIT - used;
    if (left <= 0) {
        btn.textContent = '明日再来';
    } else if (left >= DAILY_DRAW_LIMIT) {
        btn.textContent = '再抽一张';
    } else {
        btn.textContent = '再抽一张 ' + left + '/' + DAILY_DRAW_LIMIT;
    }
}

/** 打字机效果：逐字显示文案，完成后回调 */
var tarotTypewriterTimeouts = [];
function runTypewriter(el, text, speedMs, onDone) {
    if (!el) return;
    for (var t = 0; t < tarotTypewriterTimeouts.length; t++) clearTimeout(tarotTypewriterTimeouts[t]);
    tarotTypewriterTimeouts = [];
    el.textContent = '';
    if (!text) { if (onDone) onDone(); return; }
    var i = 0;
    function tick() {
        if (i >= text.length) {
            if (onDone) onDone();
            return;
        }
        el.textContent = text.slice(0, i + 1);
        i++;
        tarotTypewriterTimeouts.push(setTimeout(tick, speedMs));
    }
    tarotTypewriterTimeouts.push(setTimeout(tick, speedMs));
}

/** 出处显示文案：仅当恰好一个《和一个》时不动；前后都没有则不加《》；多了或少了则补成一对。末尾不保留多余的中黑点（·）等。 */
function formatSourceDisplay(source) {
    if (!source || typeof source !== 'string') return '';
    var s = source.trim().replace(/[\u00B7\u30FB\u2022\u2024]+$/, '').trim(); // 去掉末尾中黑点·等，避免多出一个黑点
    if (!s) return '';
    var countOpen = (s.match(/\u300A/g) || []).length;  // 《
    var countClose = (s.match(/\u300B/g) || []).length; // 》
    var out;
    if (countOpen === 0 && countClose === 0) out = '—— ' + s;
    else if (countOpen === 1 && countClose === 1) out = '—— ' + s;
    else if (countOpen >= 1 && countClose >= 1) {
        var first = s.indexOf('\u300A');
        var last = s.lastIndexOf('\u300B');
        var inner = s.slice(first + 1, last);
        out = '—— \u300A' + inner + '\u300B';
    } else if (countOpen >= 1 && countClose === 0) out = '—— ' + s + '\u300B';
    else if (countOpen === 0 && countClose >= 1) out = '—— \u300A' + s;
    else out = '—— ' + s;
    return out.replace(/[\u00B7\u30FB\u2022\u2024]+$/, ''); // 最终文案末尾再次去掉·，防止任何路径多出黑点
}

/** 行首禁则：把行首的标点移到上一行行尾，保证所有行首都不是标点。 */
function ensureNoLineStartsWithPunctuation(text) {
    if (!text || typeof text !== 'string') return '';
    var lineHeadPunct = /^[\u3000\u3001\u3002\uFF0C\uFF08\uFF09\uFF1A\uFF1B\uFF1F\uFF01\u201C\u201D\u2018\u2019\u3010\u3011\u300A\u300B\u2026\u2014]+/;
    var lines = text.split('\n');
    for (var i = 1; i < lines.length; i++) {
        var m = lines[i].match(lineHeadPunct);
        if (m) {
            var run = m[0];
            lines[i] = lines[i].slice(run.length);
            lines[i - 1] = lines[i - 1] + run;
        }
    }
    return lines.join('\n');
}

/** 与周易 advice 一致的换行规则：句号、分号后强制换行；逗号仅当该句号行超过一行且折行后第二行<4字时在逗号处换行。LINE_CHARS=20。行首禁则已应用。 */
function formatLineBreaksLikeAdvice(text) {
    if (!text || typeof text !== 'string') return '';
    var LINE_CHARS = 20;
    var step1 = text.replace(/\u3002/g, '\u3002\n').replace(/\uFF1B/g, '\uFF1B\n');
    var lines = step1.split('\n').filter(Boolean);
    var result = lines.map(function (line) {
        if (line.indexOf('\uFF0C') < 0) return line;
        var len = line.length;
        if (len <= LINE_CHARS) return line;
        var remainder = len % LINE_CHARS;
        if (remainder >= 4 || remainder === 0) return line;
        var idx = line.indexOf('\uFF0C');
        if (idx >= 0) return line.slice(0, idx + 1) + '\n' + line.slice(idx + 1);
        return line;
    }).join('\n');
    return ensureNoLineStartsWithPunctuation(result);
}

/** 孙子兵法正文换行：句号（。）后强制换行；长度>17 时，仅在「整段会超过两行」且「在标点处换行后第二行≤4字」时在离行尾最近的分号（；）或逗号（，）处换行（优先分号），否则在17字处断行，保证自然段落最多两行。 */
function formatBingfaLineBreaks(text) {
    if (!text || typeof text !== 'string') return '';
    var LINE_CHARS = 17;
    var step1 = text.replace(/\u3002/g, '\u3002\n');
    var segments = step1.split('\n').filter(Boolean);
    var out = [];
    for (var i = 0; i < segments.length; i++) {
        var line = segments[i];
        while (line.length > LINE_CHARS) {
            var overflow = line.length - LINE_CHARS;
            var head = line.slice(0, LINE_CHARS);
            var lastSemi = head.lastIndexOf('\uFF1B');
            var lastComma = head.lastIndexOf('\uFF0C');
            var brk = -1;
            var allowPunctBreak = line.length > LINE_CHARS * 2;
            if (allowPunctBreak && overflow >= 1 && overflow <= 4) {
                var minBrk = line.length - 5;
                var semiOk = lastSemi >= minBrk;
                var commaOk = lastComma >= minBrk;
                brk = semiOk ? lastSemi : (commaOk ? lastComma : -1);
            }
            if (brk >= 0) {
                out.push(line.slice(0, brk + 1));
                line = line.slice(brk + 1);
            } else {
                out.push(line.slice(0, LINE_CHARS));
                line = line.slice(LINE_CHARS);
            }
        }
        if (line.length) out.push(line);
    }
    return ensureNoLineStartsWithPunctuation(out.join('\n'));
}

/**
 * 根据 JSON 数据渲染周易卡面，2:3 卡面分为上中下三个垂直分区。
 * @param {Object} data - 单条周易数据 { id, name, symbol, original, title, advice }
 */
function renderZhouyiCard(data) {
    var quoteEl = document.getElementById('quote-display');
    if (!quoteEl) return;
    quoteEl.innerHTML = '';
    quoteEl.className = 'zhouyi-layout';

    var theme = getZhouyiTheme(new Date());
    var cardFront = document.getElementById('cardFront');
    if (cardFront) {
        cardFront.style.backgroundColor = theme.backgroundColor;
        cardFront.style.setProperty('--zhouyi-text', theme.text);
        cardFront.style.setProperty('--zhouyi-secondary', theme.secondary);
        cardFront.style.setProperty('--zhouyi-accent', theme.accent);
        cardFront.classList.toggle('zhouyi-theme-dark', theme.text === '#f5f5f0');
    }

    var s1 = document.createElement('div');
    s1.className = 'zhouyi-s1 zhouyi-float';
    var leftCol = document.createElement('div');
    leftCol.className = 'zhouyi-id-wrap';
    var idEl = document.createElement('div');
    idEl.className = 'zhouyi-id';
    idEl.textContent = data.id || '';
    idEl.style.color = theme.secondary;
    leftCol.appendChild(idEl);
    var shortEl = document.createElement('div');
    shortEl.className = 'zhouyi-shortName';
    shortEl.textContent = data.shortName || '';
    shortEl.style.color = theme.accent;
    leftCol.appendChild(shortEl);
    s1.appendChild(leftCol);
    var sym = document.createElement('div');
    sym.className = 'zhouyi-symbol';
    sym.textContent = data.symbol || '';
    sym.style.color = theme.accent;
    s1.appendChild(sym);
    var nameEl = document.createElement('div');
    nameEl.className = 'zhouyi-name';
    nameEl.textContent = data.name || '';
    nameEl.style.color = theme.text;
    s1.appendChild(nameEl);
    quoteEl.appendChild(s1);

    var s2 = document.createElement('div');
    s2.className = 'zhouyi-s2 zhouyi-float';
    var orig = document.createElement('div');
    orig.className = 'zhouyi-original';
    orig.textContent = (data.original || '').replace(/，/g, '\u00B7').replace(/；/g, '\u00B7').replace(/\u3002/g, '');
    orig.style.color = theme.text;
    s2.appendChild(orig);
    quoteEl.appendChild(s2);

    var s3 = document.createElement('div');
    s3.className = 'zhouyi-s3 zhouyi-float';
    var titleEl = document.createElement('div');
    titleEl.className = 'zhouyi-title-text';
    titleEl.textContent = data.title || '';
    titleEl.style.color = theme.accent;
    s3.appendChild(titleEl);
    var adviceEl = document.createElement('div');
    adviceEl.className = 'zhouyi-advice';
    adviceEl.style.color = theme.secondary;
    s3.appendChild(adviceEl);
    var rawAdvice = data.advice || '';
    runTypewriter(adviceEl, formatLineBreaksLikeAdvice(rawAdvice), 52, null);
    quoteEl.appendChild(s3);
}

/** 恢复该卡池上次抽到的卡面（不翻牌、直接显示正面） */
function restoreCardFace(poolName) {
    var saved = lastDrawnByPool[poolName];
    if (!saved) return false;
    var quoteEl = document.getElementById('quote-display');
    var contentEl = document.querySelector('.card-content');
    var frontEl = document.querySelector('.card-front');
    if (!quoteEl || !contentEl) return false;
    if (saved.item && poolName === 'zhouyi' && saved.item.symbol !== undefined) {
        renderZhouyiCard(saved.item);
        var sourceElZ = document.getElementById('source-display');
        if (sourceElZ) { sourceElZ.innerText = ''; sourceElZ.removeAttribute('data-bingfa-hint'); sourceElZ.classList.remove('bingfa-hint-btn'); }
        var footerElZ = document.querySelector('.card-footer');
        if (footerElZ) footerElZ.classList.add('zhouyi-footer-hidden');
    } else if (saved.tarotCard) {
        var cardFrontReset = document.getElementById('cardFront');
        if (cardFrontReset) {
            cardFrontReset.style.backgroundColor = '';
            cardFrontReset.style.removeProperty('--zhouyi-text');
            cardFrontReset.style.removeProperty('--zhouyi-secondary');
            cardFrontReset.style.removeProperty('--zhouyi-accent');
            cardFrontReset.classList.remove('zhouyi-theme-dark');
        }
        var tarotCard = saved.tarotCard;
        var isReversed = saved.isReversed;
        var tarotImageEl = document.getElementById('tarot-image');
        var tarotCenterEl = document.getElementById('tarot-center-card');
        var tarotTitleEl = document.getElementById('tarot-title');
        var tarotAdviceEl = document.getElementById('tarot-advice');
        if (tarotCard && contentEl && tarotImageEl && tarotCenterEl && tarotTitleEl && tarotAdviceEl) {
            contentEl.classList.add('tarot-active');
            var fn = (tarotCard.filename || '').toLowerCase();
            var suit = fn.indexOf('pentacles') === 0 ? 'pentacles' : fn.indexOf('cups') === 0 ? 'cups' : fn.indexOf('wands') === 0 ? 'wands' : fn.indexOf('swords') === 0 ? 'swords' : 'major';
            if (cardFrontReset) cardFrontReset.setAttribute('data-tarot-suit', suit);
            var imgUrl = tarotCard.imageUrl ? 'url(' + tarotCard.imageUrl + ')' : '';
            tarotImageEl.style.backgroundImage = imgUrl;
            tarotCenterEl.style.backgroundImage = imgUrl;
            tarotImageEl.classList.toggle('tarot-reversed', isReversed);
            tarotCenterEl.classList.toggle('tarot-reversed', isReversed);
            contentEl.classList.toggle('tarot-reversed-display', isReversed);
            tarotTitleEl.textContent = (tarotCard.name || '') + (isReversed ? ' · 逆位' : ' · 正位');
            var advice = isReversed ? (tarotCard.reversed && tarotCard.reversed.advice) : (tarotCard.upright && tarotCard.upright.advice);
            tarotAdviceEl.style.whiteSpace = 'pre-line';
            tarotAdviceEl.textContent = advice || '';
            quoteEl.className = '';
            quoteEl.textContent = '';
            var sourceElTarot = document.getElementById('source-display');
            if (sourceElTarot) { sourceElTarot.removeAttribute('data-bingfa-hint'); sourceElTarot.classList.remove('bingfa-hint-btn'); sourceElTarot.innerText = ''; }
        }
        var footerTarot = document.querySelector('.card-footer');
        if (footerTarot) { footerTarot.classList.add('tarot-footer-hidden'); footerTarot.classList.remove('bingfa-footer', 'mao-footer', 'zhouyi-footer-hidden'); }
        var belowTarot = document.getElementById('bingfa-translation-below');
        if (belowTarot) { belowTarot.textContent = ''; belowTarot.classList.remove('is-visible'); belowTarot.setAttribute('aria-hidden', 'true'); }
    } else if (saved.item) {
        var item = saved.item;
        var cardFrontReset = document.getElementById('cardFront');
        if (cardFrontReset) {
            cardFrontReset.style.backgroundColor = '';
            cardFrontReset.style.removeProperty('--zhouyi-text');
            cardFrontReset.style.removeProperty('--zhouyi-secondary');
            cardFrontReset.style.removeProperty('--zhouyi-accent');
            cardFrontReset.classList.remove('zhouyi-theme-dark');
        }
        var mainText = (item.original != null ? item.original : item.text) || '';
        var subText = (item.translation && item.translation.trim()) ? item.translation.trim() : '';
        if (poolName === 'bingfa') {
            quoteEl.className = 'bingfa-quote';
            quoteEl.innerHTML = '';
            mainText = formatBingfaLineBreaks(mainText);
            if (subText) subText = formatLineBreaksLikeAdvice(subText);
            var origBlock = document.createElement('div');
            origBlock.className = 'bingfa-original';
            origBlock.style.whiteSpace = 'pre-line';
            origBlock.textContent = mainText;
            quoteEl.appendChild(origBlock);
            var sourceBlock = document.createElement('div');
            sourceBlock.className = 'bingfa-source';
            sourceBlock.textContent = item.source ? formatSourceDisplay(item.source) : '';
            quoteEl.appendChild(sourceBlock);
            currentBingfaTranslation = subText || '';
            var sourceElFinal = document.getElementById('source-display');
            if (sourceElFinal) { sourceElFinal.innerText = '查看翻译'; sourceElFinal.setAttribute('data-bingfa-hint', '1'); sourceElFinal.classList.add('bingfa-hint-btn'); }
        } else {
            quoteEl.className = poolName === 'mao' ? 'mao-quote' : '';
            if (quoteEl.className === '') quoteEl.removeAttribute('class');
            mainText = poolName === 'mao' ? formatBingfaLineBreaks(mainText) : mainText;
            var fullMain = (subText ? mainText + '\n' + subText : mainText).replace(/\s*[\u00B7\u30FB\u2022\u2024]+\s*$/, '');
            quoteEl.textContent = fullMain;
            quoteEl.style.whiteSpace = 'pre-line';
            var sourceEl = document.getElementById('source-display');
            if (sourceEl) { sourceEl.removeAttribute('data-bingfa-hint'); sourceEl.classList.remove('bingfa-hint-btn'); sourceEl.innerText = item.source ? formatSourceDisplay(item.source) : ''; }
        }
        var footerEl = document.querySelector('.card-footer');
        if (footerEl) {
            footerEl.classList.toggle('bingfa-footer', poolName === 'bingfa');
            footerEl.classList.toggle('mao-footer', poolName === 'mao');
            footerEl.classList.remove('zhouyi-footer-hidden', 'tarot-footer-hidden');
        }
        var belowEl = document.getElementById('bingfa-translation-below');
        if (belowEl) { belowEl.textContent = ''; belowEl.classList.remove('is-visible'); belowEl.setAttribute('aria-hidden', 'true'); }
    }
    if (contentEl) {
        if (poolName === 'zhouyi') {
            contentEl.classList.add('quote-zhouyi');
            contentEl.classList.remove('tarot-active');
            if (frontEl) frontEl.classList.add('zhouyi-card');
        } else if (poolName !== 'tarot') {
            contentEl.classList.remove('quote-zhouyi', 'tarot-active');
            if (frontEl) { frontEl.classList.remove('zhouyi-card'); frontEl.removeAttribute('data-tarot-suit'); }
        } else {
            if (frontEl) frontEl.classList.remove('zhouyi-card');
        }
    }
    return true;
}

var POOL_ACCENT_COLORS = { mao: '#8b3732', bingfa: '#1a3a5c', zhouyi: '#382a52', tarot: '#2a452a' };

function changePool(poolName) {
    currentPool = poolName;
    document.querySelectorAll('.pool-selector button').forEach(function (btn) {
        btn.classList.toggle('active', btn.getAttribute('data-pool') === poolName);
    });
    var poolSel = document.querySelector('.pool-selector');
    if (poolSel) {
        if (poolName && POOL_ACCENT_COLORS[poolName]) poolSel.style.setProperty('--pool-active-color', POOL_ACCENT_COLORS[poolName]);
        else poolSel.style.removeProperty('--pool-active-color');
    }
    var cardEl = document.getElementById('capture-area');
    var cardBack = document.getElementById('cardBack');
    if (cardBack) {
        if (poolName) {
            cardBack.style.background = '';
            cardBack.style.backgroundImage = '';
            cardBack.style.backgroundSize = '';
            cardBack.style.backgroundRepeat = '';
            cardBack.style.backgroundBlendMode = '';
        }
    }
    if (cardEl) cardEl.setAttribute('data-pool', poolName || '');
    if (!poolName) applyOpenScreenCardBack();
    var drawLabel = document.getElementById('card-back-draw-label');
    if (drawLabel) drawLabel.textContent = poolName ? '点击抽卡' : '选择卡池';
    var contentEl = document.querySelector('.card-content');
    if (contentEl) contentEl.classList.remove('quote-zhouyi');
    var front = document.querySelector('.card-front');
    if (front) front.classList.toggle('zhouyi-card', poolName === 'zhouyi');
    var flipInner = document.getElementById('card-flip-inner');
    var afterDrawEl = document.getElementById('card-actions-after-draw');
    if (poolName && lastDrawnByPool[poolName]) {
        restoreCardFace(poolName);
        if (flipInner) flipInner.classList.remove('is-flipped');
        if (front) front.style.opacity = '1';
        if (afterDrawEl) afterDrawEl.classList.add('is-visible');
        updatePoolButtonLabels();
        return;
    }
    if (front) front.style.opacity = '0';
    if (flipInner) flipInner.classList.add('is-flipped');
    if (afterDrawEl) afterDrawEl.classList.remove('is-visible');
    updatePoolButtonLabels();
}

function drawCard() {
    if (!currentPool) return;
    var used = getDailyDrawUsed();
    if (used >= DAILY_DRAW_LIMIT) {
        alert('今日 5 次已用完，明日再来～');
        return;
    }
    const pool = database[currentPool];
    if (!pool || pool.length === 0) return;
    const random = Math.floor(Math.random() * pool.length);
    const item = pool[random];

    const flipInner = document.getElementById('card-flip-inner');
    if (!flipInner) return;

    var frontEl = document.getElementById('cardFront');
    if (frontEl) frontEl.style.opacity = '0'; // 翻转过程中只显示卡背，避免旧卡面闪现
    // 1. 先向左翻转 180 度，翻转过程中显示卡背
    flipInner.classList.add('is-flipped');

    // 2. 翻到背面后再更新正面文字，然后翻回正面，避免卡顿
    setTimeout(function () {
        var savedTarotResult = null;
        var quoteEl = document.getElementById('quote-display');
        if (currentPool === 'zhouyi' && item.symbol !== undefined) {
            renderZhouyiCard(item);
            var sourceElZ = document.getElementById('source-display');
            sourceElZ.innerText = '';
            sourceElZ.removeAttribute('data-bingfa-hint');
            sourceElZ.classList.remove('bingfa-hint-btn');
            var footerElZ = document.querySelector('.card-footer');
            if (footerElZ) footerElZ.classList.add('zhouyi-footer-hidden');
        } else if (currentPool === 'tarot' && typeof window.drawTarotCard === 'function') {
            var tarotResult = window.drawTarotCard();
            savedTarotResult = tarotResult;
            var tarotCard = tarotResult.card;
            var isReversed = tarotResult.isReversed;
            var cardFrontReset = document.getElementById('cardFront');
            if (cardFrontReset) {
                cardFrontReset.style.backgroundColor = '';
                cardFrontReset.style.removeProperty('--zhouyi-text');
                cardFrontReset.style.removeProperty('--zhouyi-secondary');
                cardFrontReset.style.removeProperty('--zhouyi-accent');
                cardFrontReset.classList.remove('zhouyi-theme-dark');
            }
            var contentElTarot = document.getElementById('card-content');
            var tarotImageEl = document.getElementById('tarot-image');
            var tarotCenterEl = document.getElementById('tarot-center-card');
            var tarotTitleEl = document.getElementById('tarot-title');
            var tarotAdviceEl = document.getElementById('tarot-advice');
            if (tarotCard && contentElTarot && tarotImageEl && tarotCenterEl && tarotTitleEl && tarotAdviceEl) {
                contentElTarot.classList.add('tarot-active');
                var fn = (tarotCard.filename || '').toLowerCase();
                var suit = fn.indexOf('pentacles') === 0 ? 'pentacles' : fn.indexOf('cups') === 0 ? 'cups' : fn.indexOf('wands') === 0 ? 'wands' : fn.indexOf('swords') === 0 ? 'swords' : 'major';
                if (cardFrontReset) cardFrontReset.setAttribute('data-tarot-suit', suit);
                var imgUrl = tarotCard.imageUrl ? 'url(' + tarotCard.imageUrl + ')' : '';
                tarotImageEl.style.backgroundImage = imgUrl;
                tarotCenterEl.style.backgroundImage = imgUrl;
                tarotImageEl.style.backgroundSize = '';
                tarotImageEl.style.backgroundPosition = '';
                tarotCenterEl.style.backgroundSize = '';
                tarotCenterEl.style.backgroundPosition = '';
                if (isReversed) {
                    tarotImageEl.classList.add('tarot-reversed');
                    tarotCenterEl.classList.add('tarot-reversed');
                    contentElTarot.classList.add('tarot-reversed-display');
                } else {
                    tarotImageEl.classList.remove('tarot-reversed');
                    tarotCenterEl.classList.remove('tarot-reversed');
                    contentElTarot.classList.remove('tarot-reversed-display');
                }
                var titleText = (tarotCard.name || '') + (isReversed ? ' · 逆位' : ' · 正位');
                var advice = isReversed ? (tarotCard.reversed && tarotCard.reversed.advice) : (tarotCard.upright && tarotCard.upright.advice);
                tarotAdviceEl.style.whiteSpace = 'pre-line';
                runTypewriter(tarotTitleEl, titleText, 48, function () {
                    runTypewriter(tarotAdviceEl, advice || '', 52, null);
                });
                quoteEl.className = '';
                quoteEl.textContent = '';
                var sourceElTarot = document.getElementById('source-display');
                sourceElTarot.removeAttribute('data-bingfa-hint');
                sourceElTarot.classList.remove('bingfa-hint-btn');
                sourceElTarot.innerText = '';
            } else {
                contentElTarot.classList.remove('tarot-active', 'tarot-reversed-display');
                if (cardFrontReset) cardFrontReset.removeAttribute('data-tarot-suit');
                for (var tt = 0; tt < tarotTypewriterTimeouts.length; tt++) clearTimeout(tarotTypewriterTimeouts[tt]);
                tarotTypewriterTimeouts = [];
                if (tarotImageEl) { tarotImageEl.style.backgroundImage = ''; tarotImageEl.style.backgroundSize = ''; tarotImageEl.style.backgroundPosition = ''; tarotImageEl.classList.remove('tarot-reversed'); }
                if (tarotCenterEl) { tarotCenterEl.style.backgroundImage = ''; tarotCenterEl.style.backgroundSize = ''; tarotCenterEl.style.backgroundPosition = ''; tarotCenterEl.classList.remove('tarot-reversed'); }
                if (tarotTitleEl) tarotTitleEl.textContent = '';
                if (tarotAdviceEl) tarotAdviceEl.textContent = '';
                quoteEl.className = '';
                quoteEl.textContent = item.text || '';
                quoteEl.style.whiteSpace = 'pre-line';
                var sourceElFallback = document.getElementById('source-display');
                sourceElFallback.removeAttribute('data-bingfa-hint');
                sourceElFallback.classList.remove('bingfa-hint-btn');
                sourceElFallback.innerText = item.source ? formatSourceDisplay(item.source) : '';
            }
            var footerTarot = document.querySelector('.card-footer');
            if (footerTarot) {
                footerTarot.classList.toggle('tarot-footer-hidden', !!tarotCard);
                footerTarot.classList.remove('bingfa-footer', 'mao-footer', 'zhouyi-footer-hidden');
            }
            var belowTarot = document.getElementById('bingfa-translation-below');
            if (belowTarot) {
                belowTarot.textContent = '';
                belowTarot.classList.remove('is-visible');
                belowTarot.setAttribute('aria-hidden', 'true');
            }
        } else {
            var cardFrontReset = document.getElementById('cardFront');
            if (cardFrontReset) {
                cardFrontReset.style.backgroundColor = '';
                cardFrontReset.style.removeProperty('--zhouyi-text');
                cardFrontReset.style.removeProperty('--zhouyi-secondary');
                cardFrontReset.style.removeProperty('--zhouyi-accent');
                cardFrontReset.classList.remove('zhouyi-theme-dark');
            }
            var mainText = (item.original != null ? item.original : item.text) || '';
            var subText = (item.translation && item.translation.trim()) ? item.translation.trim() : '';
            if (currentPool === 'bingfa') {
                quoteEl.className = 'bingfa-quote';
                quoteEl.innerHTML = '';
                mainText = formatBingfaLineBreaks(mainText);
                if (subText) subText = formatLineBreaksLikeAdvice(subText);
                var origBlock = document.createElement('div');
                origBlock.className = 'bingfa-original';
                origBlock.style.whiteSpace = 'pre-line';
                quoteEl.appendChild(origBlock);
                var sourceBlock = document.createElement('div');
                sourceBlock.className = 'bingfa-source';
                quoteEl.appendChild(sourceBlock);
                runTypewriter(origBlock, mainText, 52, function () {
                    runTypewriter(sourceBlock, item.source ? formatSourceDisplay(item.source) : '', 52, null);
                });
                if (subText) {
                    currentBingfaTranslation = subText;
                } else {
                    currentBingfaTranslation = '';
                }
            } else {
                quoteEl.className = currentPool === 'mao' ? 'mao-quote' : '';
                if (quoteEl.className === '') quoteEl.removeAttribute('class');
                if (currentPool === 'mao') mainText = formatBingfaLineBreaks(mainText);
                quoteEl.textContent = '';
                quoteEl.style.whiteSpace = 'pre-line';
                var sourceEl = document.getElementById('source-display');
                if (sourceEl) {
                    sourceEl.removeAttribute('data-bingfa-hint');
                    sourceEl.classList.remove('bingfa-hint-btn');
                    sourceEl.innerText = '';
                }
                var fullMain = (subText ? mainText + '\n' + subText : mainText).replace(/\s*[\u00B7\u30FB\u2022\u2024]+\s*$/, ''); // 去掉正文末尾多余的中黑点
                runTypewriter(quoteEl, fullMain, 52, function () {
                    runTypewriter(sourceEl, item.source ? formatSourceDisplay(item.source) : '', 52, null);
                });
            }
            var sourceElFinal = document.getElementById('source-display');
            if (currentPool === 'bingfa') {
                sourceElFinal.innerText = '查看翻译';
                sourceElFinal.setAttribute('data-bingfa-hint', '1');
                sourceElFinal.classList.add('bingfa-hint-btn');
            }
            var footerEl = document.querySelector('.card-footer');
            if (footerEl) {
                footerEl.classList.toggle('bingfa-footer', currentPool === 'bingfa');
                footerEl.classList.toggle('mao-footer', currentPool === 'mao');
                footerEl.classList.remove('zhouyi-footer-hidden', 'tarot-footer-hidden');
            }
            var belowEl = document.getElementById('bingfa-translation-below');
            if (belowEl) {
                belowEl.textContent = '';
                belowEl.classList.remove('is-visible');
                belowEl.setAttribute('aria-hidden', 'true');
            }
        }
        var contentEl = document.querySelector('.card-content');
        var frontEl = document.querySelector('.card-front');
        if (contentEl) {
            if (currentPool === 'zhouyi') {
                contentEl.classList.add('quote-zhouyi');
                contentEl.classList.remove('tarot-active');
                if (frontEl) frontEl.classList.add('zhouyi-card');
            } else if (currentPool !== 'tarot') {
                contentEl.classList.remove('quote-zhouyi', 'tarot-active');
                if (frontEl) { frontEl.classList.remove('zhouyi-card'); frontEl.removeAttribute('data-tarot-suit'); }
            } else {
                if (frontEl) frontEl.classList.remove('zhouyi-card');
            }
        }
        if (currentPool === 'tarot' && savedTarotResult) {
            lastDrawnByPool.tarot = { tarotCard: savedTarotResult.card, isReversed: savedTarotResult.isReversed };
        } else {
            lastDrawnByPool[currentPool] = { item: item };
        }
        flipInner.classList.remove('is-flipped');
        var frontToShow = document.getElementById('cardFront');
        if (frontToShow) frontToShow.style.opacity = '1';
        var afterDrawEl = document.getElementById('card-actions-after-draw');
        if (afterDrawEl) afterDrawEl.classList.add('is-visible');
        var used = getDailyDrawUsed() + 1;
        saveDailyDrawUsed(used);
        updateReDrawButton();
    }, 1000);
}

/** 保存卡片正面为图片（需先引入 html2canvas）；孙子兵法「查看翻译/收起翻译」按钮与译文区不显示在图片中。 */
async function saveCardAsImage() {
    var cardEl = document.getElementById('cardFront');
    if (!cardEl) return;
    if (typeof html2canvas === 'undefined') {
        console.warn('html2canvas 未加载');
        return;
    }
    var belowEl = document.getElementById('bingfa-translation-below');
    var hadHidden = false;
    if (belowEl) {
        hadHidden = belowEl.style.display === 'none';
        belowEl.style.setProperty('display', 'none');
    }
    var footerEl = cardEl.querySelector('.card-footer.bingfa-footer');
    var footerDisplay = '';
    if (footerEl) {
        footerDisplay = footerEl.style.display;
        footerEl.style.setProperty('display', 'none');
    }
    try {
        var canvas = await html2canvas(cardEl, {
            backgroundColor: null,
            useCORS: true,
            scale: 3
        });
        var link = document.createElement('a');
        link.download = '\u4ECA\u65E5\u542F\u793A-' + Date.now() + '.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    } catch (e) {
        console.error('保存图片失败', e);
    } finally {
        if (belowEl && !hadHidden) belowEl.style.removeProperty('display');
        if (footerEl) footerEl.style.removeProperty('display');
    }
}

/** 再抽一张：淡出后重新抽卡，翻转时只显示卡背，翻回正面后再显示新内容；今日已抽满则不再抽 */
function reDraw() {
    if (getDailyDrawUsed() >= DAILY_DRAW_LIMIT) return;
    var front = document.getElementById('cardFront');
    if (!front) return;
    front.style.transition = 'opacity 0.3s ease';
    front.style.opacity = '0';
    setTimeout(function () {
        drawCard();
        // 不在此时恢复 opacity，由 drawCard 在翻回正面时再设为 1，避免旧卡面闪现
    }, 300);
}

// 页面加载时：绑定「查看翻译」、卡背键盘抽卡、更新日期与节气、预约北京时间 0 点刷新
document.addEventListener('DOMContentLoaded', function () {
    updatePageDate();
    lastKnownBeijingDate = getTodayDateString();
    updatePoolButtonLabels();
    updateReDrawButton();
    scheduleNextBeijingMidnight();
    if (document.visibilityState === 'visible') checkDateRefreshOnVisible();
    var cardEl = document.getElementById('capture-area');
    if (cardEl && !cardEl.getAttribute('data-pool')) cardEl.setAttribute('data-pool', '');
    applyOpenScreenCardBack();
    var drawLabel = document.getElementById('card-back-draw-label');
    if (drawLabel) drawLabel.textContent = currentPool ? '点击抽卡' : '选择卡池';
    var sourceEl = document.getElementById('source-display');
    var belowEl = document.getElementById('bingfa-translation-below');
    if (sourceEl && belowEl) {
        sourceEl.addEventListener('click', function () {
            if (!this.classList.contains('bingfa-hint-btn')) return;
            if (belowEl.classList.toggle('is-visible')) {
                belowEl.textContent = currentBingfaTranslation;
                belowEl.setAttribute('aria-hidden', 'false');
                this.innerText = '收起翻译';
            } else {
                belowEl.textContent = '';
                belowEl.setAttribute('aria-hidden', 'true');
                this.innerText = '查看翻译';
            }
        });
    }
    var cardEl = document.getElementById('capture-area');
    var cardBack = document.getElementById('cardBack');
    if (cardEl) {
        cardEl.addEventListener('click', function (e) {
            if (!currentPool) return;
            var inner = document.getElementById('card-flip-inner');
            if (!inner || !inner.classList.contains('is-flipped')) return;
            e.preventDefault();
            e.stopPropagation();
            drawCard();
        });
    }
    if (cardBack) {
        cardBack.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                drawCard();
            }
        });
    }
});
window.drawCard = drawCard;
window.changePool = changePool;
