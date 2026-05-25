import { useState } from 'react';
import {
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
  Info,
  ChevronRight,
  Copy,
  Image as ImageIcon,
  BookImage,
  FileText,
  Bookmark
} from 'lucide-react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState('experience');

  // Custom Card Generator State
  const [sceneTitle, setSceneTitle] = useState('下班后的便利店');
  const [sceneDetails, setSceneDetails] = useState([
    '手里捏着一张刚打印的发票',
    '冷柜散发着白色雾气',
    '关东煮的汤汁咕嘟咕嘟响',
    '收银员正在小声打着哈欠',
    '门外霓虹灯在积水里碎成一地金黄'
  ]);
  const [newDetail, setNewDetail] = useState('');
  const [city, setCity] = useState('大连');
  const [timePeriod, setTimePeriod] = useState('夜里11点');
  const [copied, setCopied] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);

  // Image Generation State
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImageBase64, setGeneratedImageBase64] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // Zine Preview Mode
  const [activeCardType, setActiveCardType] = useState('content');

  // Aesthetic Presets for AI Prompts
  const [selectedStyle, setSelectedStyle] = useState('cinematic_realism');

  // Active scene for "Observer Simulator"
  const [selectedScene, setSelectedScene] = useState(0);
  const [isPresentView, setIsPresentView] = useState(false);

  // Practice state
  const [practiceProgress, setPracticeProgress] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
    5: false
  });

  // Style Details Dictionary for Prompt Engineering
  const stylePresets: Record<string, { name: string; englishKeywords: string; chineseKeywords: string; colorTone: string }> = {
    cinematic_realism: {
      name: "电影纪实 (35mm)",
      englishKeywords: "cinematic realism, 35mm photograph, documentary style, hyper-realistic details, authentic street atmosphere, subtle color grading, natural light",
      chineseKeywords: "电影感纪实、35毫米镜头摄影、纪录片风格、极致细节、真实街头氛围、微弱调色、自然光影",
      colorTone: "Low saturation, natural contrast, moody lighting / 低饱和度，自然对比，情绪光影"
    },
    street_photography: {
      name: "纪实抓拍 (Leica)",
      englishKeywords: "Leica M11 style street photography, candid moment, high micro-contrast, crisp textures, grain, fleeting moment, organic capture",
      chineseKeywords: "徕卡街头抓拍、抓拍瞬间、高微对比、清晰肌理、自然颗粒感、稍纵即逝的瞬间、有机的捕捉",
      colorTone: "Classic chrome, organic film grain / 经典纪实胶片，细腻颗粒"
    },
    moody_rain: {
      name: "微雨湿润 (Rainy Mood)",
      englishKeywords: "wet street reflections, rain droplets, condensation on glass, misty ambiance, neon glow bleeding through raindrops, cold color palette mixed with warm light sources",
      chineseKeywords: "湿润街头倒影、细腻雨滴、玻璃冷凝水汽、薄雾弥漫氛围、霓虹微光穿透雨水、冷色调衬托暖光源",
      colorTone: "Moody blues, amber highlights / 情绪暗蓝，琥珀暖色高光"
    },
    warm_nostalgia: {
      name: "落日暖调 (Golden Hour)",
      englishKeywords: "golden hour light, long warm shadows, nostalgia ambiance, sunset glow, dust motes floating in light beam, intimate atmosphere",
      chineseKeywords: "落日余晖、漫长温暖投影、复古怀旧氛围、晚霞斜照、光束中漂浮的微尘、亲密的日常感",
      colorTone: "Warm golden hue, faded blacks / 温暖金黄，复古褪色暗部"
    }
  };

  // Mock scenes with two perspective representations
  const observationScenes = [
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

  // UNIFIED BRAND LOGO: 活字印刷版
  const LogoLetterpress = ({ className = "w-24", dark = false }: { className?: string; dark?: boolean }) => (
    <div className={`flex flex-col items-center justify-center select-none text-center ${className}`}>
      <svg viewBox="0 0 160 110" className={`w-full h-auto fill-current transition-colors ${dark ? 'text-zinc-900' : 'text-zinc-100'}`}>
        <defs>
          <filter id="herein-ink-bleed">
            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <g filter="url(#herein-ink-bleed)">
          <text x="35" y="58" className="font-serif font-black" fontSize="48" letterSpacing="4">此</text>
          <text x="92" y="58" className="font-serif font-black" fontSize="48" letterSpacing="4">间</text>
          <text x="80" y="88" textAnchor="middle" className="font-serif tracking-[0.2em] font-bold" fontSize="17">HEREIN</text>
          <line x1="25" y1="102" x2="135" y2="102" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3,3" />
        </g>
      </svg>
    </div>
  );

  const handleAddDetail = () => {
    if (newDetail.trim() && sceneDetails.length < 6) {
      setSceneDetails([...sceneDetails, newDetail.trim()]);
      setNewDetail('');
    }
  };

  const handleRemoveDetail = (index: number) => {
    setSceneDetails(sceneDetails.filter((_, i) => i !== index));
  };

  const handleCopyCard = () => {
    let textToCopy = "";

    if (activeCardType === 'cover') {
      textToCopy = `《此间 HEREIN》城市记忆 • 封面
封面口号：封存不可复制的现场
记录地点：${city}
记录时间：${timePeriod}
---
“不消费城市，只感受城市。我真实活过的证据。”`;
    } else if (activeCardType === 'content') {
      textToCopy = `《此间 HEREIN》城市记忆 • 正页
时间：${timePeriod} | 地点：${city}
场景：${sceneTitle}
---
${sceneDetails.map((d, i) => `${i + 1}. ${d}`).join('\n')}
---
“不消费城市，只感受城市。我真实活过的证据。”`;
    } else {
      textToCopy = `《此间 HEREIN》城市记忆 • 封底
封底愿力：让每一座城、每一个人都拥有一段属于自己的此间
---
《此间 HEREIN》
AI时代里，一种重新感受人与城市关系的方法。`;
    }

    copyToClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate dynamic AI Prompt based on input and selected style
  const generateAIPrompt = () => {
    const style = stylePresets[selectedStyle];
    const detailsString = sceneDetails.join(', ');

    let englishPrompt = "";
    let chinesePrompt = "";

    if (activeCardType === 'cover') {
      englishPrompt = `An elegant, minimalist documentary magazine cover for "HEREIN" magazine. A cinematic shot representing "${sceneTitle}" in "${city}" during ${timePeriod}. Heavy negative space, natural 35mm film grain, ${style.englishKeywords}, authentic feel, nostalgic and peaceful --ar 3:4 --v 6.0 --style raw`;
      chinesePrompt = `《此间》封面美学：在 [${city}] 的 [${timePeriod}]，拍摄能够代表 [${sceneTitle}] 氛围的封面大图。极简构图、留白艺术、35毫米胶片质感、${style.chineseKeywords}，高雅内敛。`;
    } else if (activeCardType === 'content') {
      englishPrompt = `A poignant documentary photograph of ${sceneTitle} in ${city} during ${timePeriod}. Key details captured: ${detailsString}. ${style.englishKeywords}, raw emotion, deeply atmospheric, hyper-realistic, volumetric lighting, shot on 35mm film, masterfully composed, storytelling image, unposed, real life --ar 3:4 --v 6.0 --style raw`;
      chinesePrompt = `《此间》正页美学：在 [${city}] 的 [${timePeriod}]，拍摄 [${sceneTitle}]。画面中包含细节：[${detailsString}]。视觉美学风格：${style.chineseKeywords}，真实的情感流露，浓厚的生活氛围，微观肌理，胶片颗粒，讲故事的画面，拒绝网红修图感，真实人间。`;
    } else {
      englishPrompt = `A quiet, atmospheric abstract documentary photo representing the closing scene of a journey in ${city}. Soft evening light fading, a beautiful solitary texture, nostalgic vibe, ${style.englishKeywords}, highly poetic, quiet wisdom --ar 3:4 --v 6.0 --style raw`;
      chinesePrompt = `《此间》封底意境：宁静而深邃的城市落幕光影，带着淡淡的余晖与纹理质感。象征一段喧嚣归于平静的生活旅程，具有极高诗意与纪实格调。`;
    }

    return { english: englishPrompt, chinese: chinesePrompt };
  };

  const handleCopyPrompt = () => {
    const prompts = generateAIPrompt();
    const textToCopy = `《此间 HEREIN》AI 画面生成提示词 (Midjourney / SD / DALL-E) [${activeCardType === 'cover' ? '封面卡片' : activeCardType === 'content' ? '正页内容' : '封底愿力'}]

【英文提示词 (复制此段运行)】
${prompts.english}

【中文美学构想】
${prompts.chinese}

【风格控制】
- 氛围色调: ${stylePresets[selectedStyle].colorTone}
- 尺寸控制: 严格 3:4 比例比例 (--ar 3:4)
- 镜头设置: 35mm f/2.0, natural grain`;

    copyToClipboard(textToCopy);
    setPromptCopied(true);
    setTimeout(() => setPromptCopied(false), 2000);
  };

  // Unified clipboard function supporting standard fallback
  const copyToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('Fallback clipboard error', err);
    }
    document.body.removeChild(textArea);
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    setImageError(null);
    setGeneratedImageBase64(null);

    try {
      const prompts = generateAIPrompt();
      const promptText = activeCardType === 'cover'
        ? `A cinematic magazine cover: ${prompts.english}`
        : activeCardType === 'content'
          ? `A documentary photograph: ${prompts.english}`
          : `An atmospheric closing scene: ${prompts.english}`;

      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: promptText }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Generation failed');
      }

      const data = await response.json();
      setGeneratedImageBase64(data.image);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImageBase64) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${generatedImageBase64}`;
    link.download = `herein-${activeCardType}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const togglePractice = (id: number) => {
    setPracticeProgress({
      ...practiceProgress,
      [id]: !practiceProgress[id as keyof typeof practiceProgress]
    });
  };

  return (
    <div className="min-h-screen bg-[#121212] text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-700 selection:text-white">

      {/* Premium Elegant Header */}
      <header className="border-b border-zinc-800/80 sticky top-0 bg-[#121212]/95 backdrop-blur-md z-50 transition-all">
        <div className="max-w-6xl mx-auto px-6 py-3 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <LogoLetterpress className="w-14" />
            <div className="border-l border-zinc-800 pl-4">
              <span className="text-xs font-mono tracking-widest text-zinc-400 block uppercase">此间 HEREIN</span>
              <p className="text-[10px] text-zinc-500 tracking-wider">A City Observation System</p>
            </div>
          </div>

          <nav className="flex gap-1 md:gap-2 text-xs md:text-sm font-medium">
            <button
              onClick={() => setActiveTab('experience')}
              className={`px-3 py-1.5 transition-all duration-300 border-b-2 ${activeTab === 'experience' ? 'border-zinc-300 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              视角转换体验
            </button>
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-1.5 transition-all duration-300 border-b-2 ${activeTab === 'generator' ? 'border-zinc-300 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              记忆卡片与提示词
            </button>
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-3 py-1.5 transition-all duration-300 border-b-2 ${activeTab === 'practice' ? 'border-zinc-300 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              五维感官训练
            </button>
            <button
              onClick={() => setActiveTab('manifesto')}
              className={`px-3 py-1.5 transition-all duration-300 border-b-2 ${activeTab === 'manifesto' ? 'border-zinc-300 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
            >
              此间宣言书
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* ACTIVE TAB: OBSERVATION EXPERIENCE */}
        {activeTab === 'experience' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block">Core Experience / 核心体验</span>
              <h2 className="text-3xl md:text-4xl font-extralight tracking-tight text-white">
                你每天是在 <span className="font-normal border-b border-zinc-700 italic px-1">路过</span> 城市，还是 <span className="font-normal text-amber-200 border-b border-amber-800/80 italic px-1">在场</span> 感受？
              </h2>
              <p className="text-sm md:text-base text-zinc-400 leading-relaxed max-w-2xl">
                《此间 HEREIN》不教你拍摄"好看的爆款景点"，而是训练你像雷达般捕获那些正在被忽略的人间微芒。尝试下面的互动，感受视角变换带来的心灵震颤。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-4 space-y-4">
                <span className="text-xs font-semibold text-zinc-500 tracking-wider uppercase block">选择观察场景</span>
                <div className="space-y-3">
                  {observationScenes.map((scene, idx) => (
                    <button
                      key={scene.id}
                      onClick={() => {
                        setSelectedScene(idx);
                        setIsPresentView(false);
                      }}
                      className={`w-full text-left p-4 rounded-lg border transition-all duration-300 flex items-center justify-between ${
                        selectedScene === idx
                          ? 'bg-zinc-900 border-zinc-600 text-white shadow-lg shadow-black/30'
                          : 'bg-transparent border-zinc-800/60 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="font-medium text-sm flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          {scene.title}
                        </div>
                        <div className="text-xs text-zinc-500 flex items-center gap-2">
                          <span>{scene.location}</span>
                          <span>•</span>
                          <span>{scene.time}</span>
                        </div>
                      </div>
                      <ChevronRight className={`h-4 w-4 transition-transform duration-300 ${selectedScene === idx ? 'transform translate-x-1 text-amber-200' : 'text-zinc-600'}`} />
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-zinc-900/40 rounded-lg border border-zinc-800/60 space-y-2.5">
                  <div className="flex items-center gap-2 text-zinc-300 text-xs font-semibold">
                    <Info className="h-3.5 w-3.5 text-amber-400/80" />
                    什么是"在场感"？
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    大部分时候我们通过手机屏幕或"打卡"来消费城市。而在场感，是闭上眼睛能听见晚风的声音、能看到雨后亮起的一扇窗。真实，比"漂亮"更重要。
                  </p>
                </div>
              </div>

              <div className="lg:col-span-8 bg-zinc-950 rounded-xl border border-zinc-800/80 overflow-hidden shadow-2xl">
                <div className="bg-zinc-900 px-6 py-3 border-b border-zinc-800 flex justify-between items-center text-xs text-zinc-400">
                  <div className="flex items-center gap-2 font-mono">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span>OBSERVER_MODE_STABLE</span>
                  </div>
                  <div className="font-mono flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{observationScenes[selectedScene].time}</span>
                  </div>
                </div>

                <div className="relative min-h-[320px] md:min-h-[380px] p-8 flex flex-col justify-between transition-colors duration-500"
                  style={{
                    background: isPresentView
                      ? 'radial-gradient(circle at center, #1b1a16 0%, #0d0c0a 100%)'
                      : 'radial-gradient(circle at center, #18181b 0%, #09090b 100%)'
                  }}
                >
                  <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-zinc-800/60 pointer-events-none"></div>
                  <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-zinc-800/60 pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-zinc-800/60 pointer-events-none"></div>
                  <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-zinc-800/60 pointer-events-none"></div>

                  <div className="self-end px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-800 text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
                    {observationScenes[selectedScene].location}
                  </div>

                  <div className="my-auto max-w-xl mx-auto text-center space-y-6 py-6">
                    <div className="space-y-2">
                      <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase">
                        {isPresentView ? "《此间》视角 - 在场观察" : "普通视角 - 浮光掠影"}
                      </span>
                      <h3 className="text-xl md:text-2xl font-light leading-snug tracking-wide text-white">
                        {isPresentView
                          ? `" ${observationScenes[selectedScene].herein.visual} "`
                          : `" 以前你看到：${observationScenes[selectedScene].ordinary.visual} "`
                        }
                      </h3>
                    </div>

                    <div className="inline-flex flex-wrap justify-center gap-3 text-[11px] font-mono">
                      <span className={`px-2 py-1 rounded transition-colors ${isPresentView ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50' : 'bg-zinc-900 text-zinc-400'}`}>
                        关注焦点: {isPresentView ? observationScenes[selectedScene].herein.focus : observationScenes[selectedScene].ordinary.focus}
                      </span>
                      <span className={`px-2 py-1 rounded transition-colors ${isPresentView ? 'bg-amber-950/40 text-amber-300 border border-amber-900/50' : 'bg-zinc-900 text-zinc-400'}`}>
                        空间情绪: {isPresentView ? observationScenes[selectedScene].herein.mood : observationScenes[selectedScene].ordinary.mood}
                      </span>
                    </div>
                  </div>

                  <div className="w-full max-w-md mx-auto pt-4 border-t border-zinc-900/80">
                    <div className="flex justify-between text-xs text-zinc-500 font-medium mb-2.5">
                      <span className={!isPresentView ? 'text-zinc-300' : ''}>路过 (无感)</span>
                      <span className={isPresentView ? 'text-amber-300 font-bold' : ''}>在场 (看见生命)</span>
                    </div>
                    <div className="relative flex items-center justify-between bg-zinc-900 rounded-full p-1.5 border border-zinc-800">
                      <button
                        onClick={() => setIsPresentView(false)}
                        className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all ${!isPresentView ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                      >
                        普通观察
                      </button>
                      <button
                        onClick={() => setIsPresentView(true)}
                        className={`flex-1 py-1.5 rounded-full text-xs font-medium transition-all flex items-center justify-center gap-1 ${isPresentView ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-900/20' : 'text-zinc-500 hover:text-amber-300'}`}
                      >
                        <Sparkles className="h-3 w-3" />
                        开启《此间》视角
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-900/60 px-6 py-4 border-t border-zinc-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                  <div className="text-xs text-zinc-400">
                    <span className="font-semibold text-zinc-300">观察练习：</span>
                    {isPresentView ? "你看见了时间流动，空气中的温度被写进了生活的旁白里。" : "试着打开《此间》视角，捕捉微风、雨滴 and 具体的人。"}
                  </div>
                  <button
                    onClick={() => {
                      setSceneTitle(observationScenes[selectedScene].title);
                      const chunks = observationScenes[selectedScene].herein.visual.split('。').filter(Boolean);
                      setSceneDetails(chunks);
                      setCity(observationScenes[selectedScene].location.split(' ')[0]);
                      setTimePeriod(observationScenes[selectedScene].time);
                      setActiveTab('generator');
                      setActiveCardType('content');
                    }}
                    className="text-xs font-semibold text-amber-200 hover:text-amber-100 transition-colors flex items-center gap-1 self-end md:self-auto shrink-0"
                  >
                    以此场景制作城市卡片
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-8 border border-zinc-800 rounded-xl bg-gradient-to-r from-zinc-950 via-[#161616] to-[#0c0c0d] text-center max-w-4xl mx-auto space-y-3">
              <p className="text-base md:text-lg font-extralight text-zinc-300 italic">
                " 真正的《此间》强调的是：真实。甚至有时候，真实比'漂亮'更重要。 "
              </p>
              <div className="h-px w-12 bg-zinc-700 mx-auto"></div>
              <p className="text-xs font-mono text-zinc-500">—— 《此间 HEREIN》</p>
            </div>
          </div>
        )}

        {/* ACTIVE TAB: MEMORY CARD & PROMPT GENERATOR */}
        {activeTab === 'generator' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Zine Suite / 城市三联折页折子</span>
              <h2 className="text-3xl font-extralight tracking-tight text-white">《此间》三联影像志 (3:4)</h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                我们将单页卡片升级为由<strong>「封面」 (封面口号) 、「正页」 (微小瞬间细节) 、「封底」 (此间愿力) </strong>构成的三维独立纸质志。每张影像卡片皆按 3:4 黄金画幅设计，内嵌斑驳质感的「活字印刷」工艺盖印。
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-zinc-900/60 rounded-xl p-5 border border-zinc-800 space-y-3">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">1. 切换编辑页卡 / Select Booklet Page</span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setActiveCardType('cover')}
                      className={`py-2 px-1 rounded text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                        activeCardType === 'cover'
                          ? 'bg-amber-950/20 border-amber-600/80 text-amber-200'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <BookImage className="h-3.5 w-3.5" />
                      <span>封面 (Cover)</span>
                    </button>
                    <button
                      onClick={() => setActiveCardType('content')}
                      className={`py-2 px-1 rounded text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                        activeCardType === 'content'
                          ? 'bg-amber-950/20 border-amber-600/80 text-amber-200'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <FileText className="h-3.5 w-3.5" />
                      <span>正页 (Content)</span>
                    </button>
                    <button
                      onClick={() => setActiveCardType('back')}
                      className={`py-2 px-1 rounded text-xs font-semibold border transition-all flex flex-col items-center gap-1 ${
                        activeCardType === 'back'
                          ? 'bg-amber-950/20 border-amber-600/80 text-amber-200'
                          : 'bg-zinc-950 border-zinc-850 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Bookmark className="h-3.5 w-3.5" />
                      <span>封底 (Back)</span>
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-5">
                  <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase pb-2 border-b border-zinc-850 flex items-center justify-between">
                    <span>
                      {activeCardType === 'cover' && "封面内容配置"}
                      {activeCardType === 'content' && "正页人间瞬间采集"}
                      {activeCardType === 'back' && "封底愿力配置"}
                    </span>
                    <span className="text-[10px] text-zinc-500 lowercase font-normal">Edit Page Content</span>
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-zinc-400">城市/地点</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="如：小满的大连"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-zinc-400">时间</label>
                      <input
                        type="text"
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(e.target.value)}
                        placeholder="如：夜里11点"
                        className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600 transition-colors"
                      />
                    </div>
                  </div>

                  {activeCardType === 'cover' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-400">封面主标题 (场景)</label>
                        <input
                          type="text"
                          value={sceneTitle}
                          onChange={(e) => setSceneTitle(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-400">封面口号 (Slogan - 固定)</label>
                        <input
                          type="text"
                          readOnly
                          value="封存不可复制的现场"
                          className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-500 rounded px-3 py-2 text-xs cursor-not-allowed"
                        />
                        <p className="text-[10px] text-zinc-500">此间核心封面口号，赋予观察深刻的第一印象。</p>
                      </div>
                    </div>
                  )}

                  {activeCardType === 'content' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-400">瞬间场景主题</label>
                        <input
                          type="text"
                          value={sceneTitle}
                          onChange={(e) => setSceneTitle(e.target.value)}
                          placeholder="如：夜归的小区路灯下"
                          className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-zinc-600 transition-colors"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[11px] font-semibold text-zinc-400 block">采集的瞬间痕迹 ({sceneDetails.length}/6)</label>
                        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
                          {sceneDetails.map((detail, index) => (
                            <div key={index} className="flex gap-2 items-center bg-zinc-950 px-3 py-2 rounded border border-zinc-800/80 text-xs">
                              <span className="text-zinc-600 font-mono text-[10px]">{index + 1}</span>
                              <span className="text-zinc-300 flex-grow leading-relaxed">{detail}</span>
                              <button
                                onClick={() => handleRemoveDetail(index)}
                                className="text-zinc-500 hover:text-red-400 transition-colors px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>

                        {sceneDetails.length < 6 ? (
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={newDetail}
                              onChange={(e) => setNewDetail(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleAddDetail()}
                              placeholder="添加具体、微小的现实细节..."
                              className="flex-grow bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                            />
                            <button
                              onClick={handleAddDetail}
                              className="px-3 bg-zinc-200 hover:bg-white text-zinc-950 text-xs font-bold rounded shrink-0"
                            >
                              添加
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  )}

                  {activeCardType === 'back' && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-semibold text-zinc-400">封底愿力 (Wish/Vision - 固定)</label>
                        <textarea
                          readOnly
                          rows={3}
                          value="让每一座城、每一个人都拥有一段属于自己的此间"
                          className="w-full bg-zinc-900/60 border border-zinc-800 text-zinc-500 rounded px-3 py-2 text-xs cursor-not-allowed leading-relaxed resize-none"
                        />
                        <p className="text-[10px] text-zinc-500">《此间》的温暖闭幕词，让城市体验拥有一段属于当下的余温回响。</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-3 border-t border-zinc-800 flex gap-2">
                    <button
                      onClick={() => {
                        setSceneTitle('落花天桥下的避雨处');
                        setSceneDetails([
                          '雨水顺着生锈的铁栏杆流下来',
                          '一个外卖小哥摘下头盔坐在电动车上发呆',
                          '桥洞口有一株槐树正在飘落白色花瓣',
                          '地上积水反射出昏暗的红色刹车灯光'
                        ]);
                        setCity('高架天桥旁');
                        setTimePeriod('黄昏 17:50');
                      }}
                      className="flex-1 py-1.5 rounded border border-zinc-800 hover:border-zinc-700 text-xs font-medium text-zinc-400 transition-colors"
                    >
                      导入经典《此间》模版
                    </button>
                    <button
                      onClick={() => {
                        setSceneTitle('');
                        setSceneDetails([]);
                      }}
                      className="px-3 py-1.5 rounded border border-zinc-800 hover:bg-zinc-800 text-xs font-medium text-zinc-400 transition-colors"
                    >
                      重置
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-900/60 rounded-xl p-6 border border-zinc-800 space-y-4">
                  <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase pb-2 border-b border-zinc-850 flex items-center justify-between">
                    <span>3. 视觉美学定调</span>
                    <span className="text-[10px] text-zinc-500 lowercase font-normal">Aesthetic Style</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(stylePresets).map(([key, style]) => (
                      <button
                        key={key}
                        onClick={() => setSelectedStyle(key)}
                        className={`p-3 text-left rounded-lg border transition-all duration-350 text-xs ${
                          selectedStyle === key
                            ? 'bg-amber-950/20 border-amber-600/80 text-amber-200 shadow-md'
                            : 'bg-zinc-950 border-zinc-850 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                        }`}
                      >
                        <div className="font-semibold">{style.name}</div>
                        <div className="text-[9px] text-zinc-500 mt-1 truncate">{style.colorTone.split('/')[1] || style.colorTone}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-7 space-y-6">
                <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl p-6 md:p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-zinc-850 pb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-amber-400" />
                        《此间》影像志折子 (严格 3:4 比例)
                      </h4>
                      <p className="text-[10px] text-zinc-500">双面显影：卡片已内嵌活字工艺印信，比例完美贴合实体冲印标准</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCopyCard}
                        className="px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-[11px] font-medium text-zinc-300 transition-colors flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        {copied ? '已复制文本' : '复制卡片文本'}
                      </button>
                      <button
                        onClick={handleCopyPrompt}
                        className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold transition-colors flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3" />
                        {promptCopied ? '已复制提示词' : '复制 AI 提示词'}
                      </button>
                      <button
                        onClick={handleGenerateImage}
                        disabled={generatingImage}
                        className="px-3 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-[11px] font-bold transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Sparkles className="h-3 w-3" />
                        {generatingImage ? '生成中...' : '生成图片'}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-stretch">
                    <div className="md:col-span-6 flex flex-col justify-center items-center">
                      {activeCardType === 'cover' && (
                        <div className="w-full max-w-[300px] aspect-[3/4] bg-[#161617] p-8 rounded-none border border-zinc-800 text-zinc-300 relative overflow-hidden flex flex-col justify-between shadow-lg">
                          <div className="flex justify-center border-b border-zinc-900 pb-3">
                            <LogoLetterpress className="w-16" />
                          </div>
                          <div className="my-auto space-y-4">
                            <span className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase block">VOLUME 01 // 创刊号</span>
                            <h5 className="text-2xl font-serif text-white tracking-wide leading-snug">{sceneTitle || '（未输入场景）'}</h5>
                            <div className="h-0.5 w-8 bg-amber-500/80"></div>
                          </div>
                          <div className="pt-4 border-t border-zinc-900 flex flex-col gap-2">
                            <p className="text-[11px] font-serif text-amber-200 tracking-wider">" 封存不可复制的现场 "</p>
                            <div className="flex justify-between items-baseline text-[8px] font-mono text-zinc-500 uppercase">
                              <span>地点: {city || '此间城市'}</span>
                              <span>{timePeriod || '此时此刻'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {activeCardType === 'content' && (
                        <div className="w-full max-w-[300px] aspect-[3/4] bg-[#151516] p-7 rounded-none border border-zinc-800 text-zinc-300 relative overflow-hidden flex flex-col justify-between shadow-lg">
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                            <div className="transform -translate-x-3 scale-[0.65] origin-left">
                              <LogoLetterpress className="w-16" />
                            </div>
                            <span className="text-[8px] font-mono text-zinc-500 uppercase">{city} // {timePeriod}</span>
                          </div>
                          <div className="space-y-3 my-auto flex-grow pt-4 z-10">
                            <div className="space-y-1">
                              <span className="text-[8px] font-mono text-zinc-500 uppercase block">OBSERVED / 场景痕迹</span>
                              <h5 className="text-sm font-semibold text-zinc-100 font-serif">{sceneTitle || '（未输入场景）'}</h5>
                            </div>
                            <ul className="space-y-2.5 pt-2">
                              {sceneDetails.map((detail, idx) => (
                                <li key={idx} className="flex gap-2 text-[11px] leading-relaxed text-zinc-300 items-start">
                                  <span className="text-amber-500 font-mono text-xs leading-none mt-0.5">•</span>
                                  <span>{detail}</span>
                                </li>
                              ))}
                              {sceneDetails.length === 0 && (
                                <li className="text-xs text-zinc-600 italic">在左侧采集现场细节，让正文逐渐饱满...</li>
                              )}
                            </ul>
                          </div>
                          <div className="absolute right-0 bottom-12 opacity-[0.06] pointer-events-none transform rotate-12 scale-110">
                            <LogoLetterpress className="w-32" />
                          </div>
                          <div className="pt-3 border-t border-zinc-900/80 flex justify-between items-center text-[8px] font-mono text-zinc-500 z-10">
                            <div>
                              <p className="tracking-widest font-bold text-zinc-400">《此间 HEREIN》正页</p>
                              <p className="text-[7px] text-zinc-600">我真实活过的证据</p>
                            </div>
                            <span className="text-[8px] text-zinc-500">{timePeriod}</span>
                          </div>
                        </div>
                      )}

                      {activeCardType === 'back' && (
                        <div className="w-full max-w-[300px] aspect-[3/4] bg-[#121213] p-8 rounded-none border border-zinc-800 text-zinc-300 relative overflow-hidden flex flex-col justify-between shadow-lg">
                          <div className="text-center py-2 border-b border-zinc-900">
                            <span className="text-[8px] font-mono text-zinc-500 tracking-widest uppercase">THE ENDING OF JOURNEY</span>
                          </div>
                          <div className="my-auto text-center space-y-6 px-2">
                            <div className="opacity-80 flex justify-center">
                              <LogoLetterpress className="w-24 text-zinc-200" />
                            </div>
                            <div className="space-y-2">
                              <p className="text-xs font-serif leading-relaxed text-zinc-300 text-center">
                                " 让每一座城、每一个人都拥有一段属于自己的此间。 "
                              </p>
                            </div>
                          </div>
                          <div className="pt-4 border-t border-zinc-900 text-center space-y-1">
                            <p className="text-[7px] font-mono text-zinc-600 uppercase">A Method of Reconnecting Man & City in the AI Era.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-6 flex flex-col justify-between bg-zinc-900/40 p-5 rounded-lg border border-zinc-850">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono tracking-wider text-zinc-500 uppercase block">AI PROMPT / 画面生成提示词</span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700 font-mono text-amber-300">
                            {stylePresets[selectedStyle].name}
                          </span>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 block uppercase">
                              {activeCardType === 'cover' ? '封面大图 (Cover Prompt)' : activeCardType === 'content' ? '正页配图 (Content Prompt)' : '结束意境 (Back Cover Prompt)'}
                            </span>
                            <div className="bg-zinc-950 p-3 rounded border border-zinc-850/60 max-h-[140px] overflow-y-auto font-mono text-[10px] text-zinc-300 leading-relaxed select-all">
                              {generateAIPrompt().english}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono text-zinc-500 block">意向视觉构想 (CN)</span>
                            <p className="text-[11px] text-zinc-400 leading-relaxed italic">
                              {generateAIPrompt().chinese}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-zinc-850 text-[10px] text-zinc-500 space-y-2">
                        <p className="font-semibold text-zinc-400">如何获取属于你的《此间》影像？</p>
                        <p className="leading-relaxed">1. 点击 <strong>「生成图片」</strong> 按钮，直接调用 OpenAI gpt-image-2 模型生成城市纪实影像。</p>
                        <p className="leading-relaxed">2. 亦可复制英文提示词，在 Midjourney / DALL-E 中运行。我们已锁定 <strong>3:4 比例</strong>。</p>
                        <p className="leading-relaxed">3. 将生成的高质素城市纪实大图冲印成实体照片，贴在你的城市记忆卡片旁，便是一本实体《此间》影像志。</p>
                      </div>
                    </div>
                  </div>

                  {/* Generated Image Result */}
                  {(generatedImageBase64 || generatingImage || imageError) && (
                    <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl p-6 space-y-4">
                      <h4 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-amber-400" />
                        AI 生成结果
                      </h4>

                      {generatingImage && (
                        <div className="flex flex-col items-center justify-center py-16 space-y-4">
                          <div className="h-10 w-10 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-xs text-zinc-500">正在调用 gpt-image-2 生成图片...</p>
                        </div>
                      )}

                      {imageError && (
                        <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-xs text-red-400">
                          {imageError}
                        </div>
                      )}

                      {generatedImageBase64 && (
                        <div className="space-y-4">
                          <div className="flex justify-center">
                            <img
                              src={`data:image/png;base64,${generatedImageBase64}`}
                              alt="AI Generated"
                              className="max-w-full max-h-[400px] rounded-lg border border-zinc-800 object-contain"
                            />
                          </div>
                          <div className="flex justify-center">
                            <button
                              onClick={handleDownloadImage}
                              className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-2"
                            >
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                <polyline points="7 10 12 15 17 10" />
                                <line x1="12" y1="15" x2="12" y2="3" />
                              </svg>
                              下载图片
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE TAB: FIVE DIMENSION PRACTICE */}
        {activeTab === 'practice' && (
          <div className="space-y-12 animate-fadeIn">
            <div className="max-w-3xl space-y-3">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Observer Growth / 观察力重建</span>
              <h2 className="text-3xl font-extralight tracking-tight text-white">用《此间》重建生命感知的 5 个练习</h2>
              <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
                《此间》不是简单的滤镜，而是在AI时代重新找回人与城市关系的练习系统。完成下面的训练指标，建立你的个人在场系统。
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((num) => {
                const practices: Record<number, { title: string; desc: string; task: string; tag: string }> = {
                  1: { title: "重新拥有观察力", desc: "不再用眼睛\"扫视\"城市，而是盯着光线和特定的人。", task: "观察离你最近的正在工作的人（保洁、外卖员、收银员），记住并写下他身上的 3 个微小特征。", tag: "对抗\"感知力退化\"" },
                  2: { title: "建立个人真实审美", desc: "打破社交平台的流行公式，知道什么是真实的，什么是空洞的网红套路。", task: "找到一处不完美甚至是旧旧的街道角落，拍下一张照片，不添加任何滤镜，寻找它生命力的体现。", tag: "摆脱\"平台审美绑架\"" },
                  3: { title: "沉淀个人城市记忆", desc: "用时间记录你曾在大地上生活过的铁证，把回忆锚定在具体的风、雨、天光上。", task: "记下你今天下班（或放学）经过某段路时的空气温度和迎面走过的人。存入本地日志中。", tag: "书写\"我真实活过的证据\"" },
                  4: { title: "形成个人内容风格", desc: "不当模版流水线。你的城市、你的观察、你的时间，这才是你无可替代的气质。", task: "撰写一段没有任何网络热梗的随笔。只描述名词、光影变化和你的具体触觉，不超过80字。", tag: "消除\"机器克隆感\"" },
                  5: { title: "重建\"在场感\"", desc: "退出焦虑的无限信息刷屏。从网络断联片刻，重新退回到\"此时此地\"。", task: "出门散步20分钟，期间不允许掏出手机看任何消息或拍照。纯粹用耳朵、眼睛去吸收当下的喧嚣。", tag: "逃出\"一直在线\"的牢笼" },
                };
                const p = practices[num];
                return (
                  <div key={num} className="p-6 bg-zinc-900/40 rounded-xl border border-zinc-800 flex flex-col justify-between space-y-6">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="h-8 w-8 rounded bg-zinc-800 flex items-center justify-center text-xs text-amber-300 font-mono">0{num}</div>
                        <button
                          onClick={() => togglePractice(num)}
                          className={`h-6 px-2.5 rounded-full text-[10px] font-semibold flex items-center gap-1 transition-colors ${
                            practiceProgress[num as keyof typeof practiceProgress] ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-zinc-800 text-zinc-400 hover:text-zinc-200'
                          }`}
                        >
                          {practiceProgress[num as keyof typeof practiceProgress] ? <Check className="h-3 w-3" /> : null}
                          {practiceProgress[num as keyof typeof practiceProgress] ? '已完成练习' : '标记完成'}
                        </button>
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-base font-semibold text-white">{p.title}</h4>
                        <p className="text-xs text-zinc-400 leading-relaxed">{p.desc}</p>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded border border-zinc-900 space-y-1.5">
                        <span className="text-[10px] font-mono text-amber-500 block uppercase font-bold">今日练习任务:</span>
                        <p className="text-xs text-zinc-300">{p.task}</p>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-3">
                      训练：{p.tag}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/20 max-w-xl mx-auto text-center space-y-3">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest block font-bold">在场感知训练进度</span>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    className={`h-2.5 w-12 rounded-full transition-all duration-300 ${
                      practiceProgress[num as keyof typeof practiceProgress] ? 'bg-amber-400' : 'bg-zinc-800'
                    }`}
                  ></div>
                ))}
              </div>
              <p className="text-xs text-zinc-500">
                你已激活 {Object.values(practiceProgress).filter(Boolean).length} / 5 项在场本能。
              </p>
            </div>
          </div>
        )}

        {/* ACTIVE TAB: TEXT MANIFESTO */}
        {activeTab === 'manifesto' && (
          <div className="max-w-3xl mx-auto space-y-12 animate-fadeIn py-4">
            <div className="text-center space-y-4">
              <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">The Manifesto / 品牌宣言书</span>
              <h2 className="text-4xl font-serif font-extralight tracking-wide text-white">《此间 HEREIN》是什么？</h2>
              <div className="h-0.5 w-16 bg-zinc-700 mx-auto mt-4"></div>
            </div>

            <div className="space-y-12 text-zinc-300 font-serif leading-relaxed text-sm md:text-base">
              <div className="space-y-3">
                <p className="text-zinc-400 text-xs font-mono tracking-wider">用一句大众能听懂的话：</p>
                <div className="bg-zinc-900/40 p-6 rounded border border-zinc-800">
                  <p className="text-zinc-500 line-through text-xs mb-1 font-sans">它不是教你"拍好看"。</p>
                  <p className="text-base text-white font-medium">它是：教你重新看见你正在生活的城市。</p>
                </div>
              </div>

              <div className="space-y-4">
                <p>很多人每天都在城市里经过：地铁、小区、菜市场、下班路、深夜便利店。</p>
                <p className="border-l-2 border-zinc-700 pl-4 italic text-zinc-400">幕后观察：人是"路过"的，不是"在场"的。</p>
                <p>《此间 HEREIN》做的事情，就是：把那些快被忽略掉的人间瞬间，重新留下来。</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
                <div className="p-6 bg-zinc-950 rounded border border-zinc-900 space-y-4">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-red-400/80 flex items-center gap-2">✕《此间》不是什么？</h4>
                  <ul className="space-y-3 text-xs text-zinc-400 font-sans">
                    <li className="flex gap-2 items-start"><span className="text-zinc-700">•</span><span><strong>不是旅游攻略：</strong>不关心消费城市，不追求"打卡/出片/必去"。</span></li>
                    <li className="flex gap-2 items-start"><span className="text-zinc-700">•</span><span><strong>不是高级滤镜：</strong>反对伪电影感、网红情绪、空镜堆砌和AI炫技。</span></li>
                    <li className="flex gap-2 items-start"><span className="text-zinc-700">•</span><span><strong>不是文艺表演：</strong>不为了刻意表现孤独或高级而伪装。</span></li>
                  </ul>
                </div>
                <div className="p-6 bg-amber-950/20 rounded border border-amber-900/30 space-y-4">
                  <h4 className="text-sm font-sans font-bold uppercase tracking-widest text-amber-200 flex items-center gap-2">✓《此间》真正做的是什么？</h4>
                  <ul className="space-y-3 text-xs text-zinc-300 font-sans">
                    <li className="flex gap-2 items-start"><span className="text-amber-500">•</span><span><strong>一套"城市观察系统"：</strong>训练你感知时间流动。</span></li>
                    <li className="flex gap-2 items-start"><span className="text-amber-500">•</span><span><strong>空间里的情绪感知：</strong>捕捉空气、气味、和属于夜晚的微温。</span></li>
                    <li className="flex gap-2 items-start"><span className="text-amber-500">•</span><span><strong>重新理解人间：</strong>把视野投向那些在生活、在等待、在疲惫、在沉默的具体人身上。</span></li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-800/80">
                <h3 className="text-lg text-white font-sans font-semibold">AI时代里的真实性</h3>
                <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                  为什么它会和现在大部分内容不一样？因为内容平台都在追"更快、更爆、更刺激"，而《此间》反着来。风吹动塑料袋、老人慢慢收摊、雨水从阳台滴下来、夜里还有一盏灯亮着……这些东西不会让你肾上腺素激增，但它会让你在嘈杂的世界里，突然安静下来。
                </p>
                <p className="text-sm font-semibold text-amber-200 font-sans">AI能生成极其精致的画面，但人，仍然需要真实地活过。这就是《此间》的全部意义。</p>
              </div>
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-zinc-800/80 bg-zinc-950 text-zinc-500 text-xs py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div className="space-y-2 flex items-center gap-4">
            <LogoLetterpress className="w-16" />
            <div className="text-left border-l border-zinc-900 pl-4">
              <p className="font-semibold tracking-wider text-zinc-400">《此间 HEREIN》城市观察系统</p>
              <p className="text-[10px]">AI 时代里，一种重新感受人与城市关系的方法。</p>
            </div>
          </div>
          <div className="text-[10px] text-zinc-600">© 2026 HEREIN. Designed with Presence.</div>
        </div>
      </footer>

    </div>
  );
}
