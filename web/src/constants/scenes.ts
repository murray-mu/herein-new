export interface Scene {
  id: number;
  title: string;
  ordinary: { visual: string; focus: string; mood: string };
  herein: { visual: string; focus: string; mood: string };
  location: string;
  time: string;
}

export const observationScenes: Scene[] = [
  {
    id: 0,
    title: "一个人走路",
    ordinary: {
      visual: "一个穿着风衣的男青年正走在小区的人行道上，低头看手机。",
      focus: "一个普通路人，没什么特别的风景。",
      mood: "冷漠、例行公事"
    },
    herein: {
      visual: "他刚下班，手里攥着一袋刚买的小白菜。细雨刚停，风吹过来有些凉意。小区门口的暖黄色路灯刚好在这一刻亮起，照亮了他衣服上的一点泥点。",
      focus: "时间感、刚结束的疲惫、细碎的生活秩序。",
      mood: "温柔、释怀、活着的微光"
    },
    location: "新华路小区旁",
    time: "傍晚 18:45"
  },
  {
    id: 1,
    title: "雨后的阳台",
    ordinary: {
      visual: "阳台有些潮湿，花盆里有积水，天色阴暗。",
      focus: "下雨天带来的出行不便，脏乱的角落。",
      mood: "阴沉、压抑"
    },
    herein: {
      visual: "雨水正沿着晾衣架的边缘凝聚，慢慢滴落在仙人掌的刺尖上。隔壁阳台传来隐约的切菜声，还有一台老收音机正在播报晚间新闻，混着雨后湿润泥土的气味。",
      focus: "空间的情绪、隐秘 of 日常节奏。",
      mood: "宁静、生活流"
    },
    location: "老式居民楼 3 楼",
    time: "午后 14:15"
  },
  {
    id: 2,
    title: "老人收摊",
    ordinary: {
      visual: "一个卖烤地瓜的老头正在推着三轮车准备离开街角。",
      focus: "占道经营、街头一角。",
      mood: "行色匆匆、忽略不计"
    },
    herein: {
      visual: "炉子里的余温把最后一点红薯香带进微凉的秋风里。老人拍了拍手上的煤灰，将一块干净的棉被仔细地盖在炉口上。他的三轮车车轮转得很慢，压过落满槐花的柏油路，留下一行长长的影子。",
      focus: "生命的质感、缓慢的告别、岁月的重量。",
      mood: "沉静、尊严"
    },
    location: "农贸市场拐角",
    time: "夜里 21:30"
  }
];
