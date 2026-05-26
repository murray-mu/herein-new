import { useState } from 'react';
import { BookImage, FileText, Bookmark, Image as ImageIcon, Sparkles, Copy } from 'lucide-react';
import { stylePresets } from '../../constants/stylePresets';
import StepIndicator from './StepIndicator';
import ContentForm from './ContentForm';
import LivePreview from './LivePreview';
import ErrorState from '../shared/ErrorState';
import { CardSkeleton } from '../shared/LoadingSkeleton';
import Toast from '../shared/Toast';
import ImagePreview from '../shared/ImagePreview';

interface GeneratorTabProps {
  initialTitle?: string;
  initialDetails?: string[];
  initialCity?: string;
  initialTime?: string;
}

export default function GeneratorTab({ initialTitle = '下班后的便利店', initialDetails = [
  '手里捏着一张刚打印的发票',
  '冷柜散发着白色雾气',
  '关东煮的汤汁咕嘟咕嘟响',
  '收银员正在小声打着哈欠',
  '门外霓虹灯在积水里碎成一地金黄'
], initialCity = '大连', initialTime = '夜里11点' }: GeneratorTabProps) {
  // Card type + step
  const [activeCardType, setActiveCardType] = useState('content');
  const [currentStep, setCurrentStep] = useState(1);

  // Content state
  const [sceneTitle, setSceneTitle] = useState(initialTitle);
  const [city, setCity] = useState(initialCity);
  const [timePeriod, setTimePeriod] = useState(initialTime);
  const [sceneDetails, setSceneDetails] = useState(initialDetails);
  const [newDetail, setNewDetail] = useState('');

  // Style
  const [selectedStyle, setSelectedStyle] = useState('cinematic_realism');

  // Image generation
  const [generatingImage, setGeneratingImage] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<{ src: string; index: number } | null>(null);

  // Clipboard
  const [promptCopied, setPromptCopied] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const handleAddDetail = () => {
    if (newDetail.trim() && sceneDetails.length < 6) {
      setSceneDetails([...sceneDetails, newDetail.trim()]);
      setNewDetail('');
    }
  };

  const handleLoadTemplate = () => {
    setSceneTitle('落花天桥下的避雨处');
    setSceneDetails(['雨水顺着生锈的铁栏杆流下来', '一个外卖小哥摘下头盔坐在电动车上发呆', '桥洞口有一株槐树正在飘落白色花瓣', '地上积水反射出昏暗的红色刹车灯光']);
    setCity('高架天桥旁');
    setTimePeriod('黄昏 17:50');
  };

  const handleReset = () => { setSceneTitle(''); setSceneDetails([]); };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  };

  const generateAIPrompt = () => {
    const style = stylePresets[selectedStyle];
    const detailsString = sceneDetails.join(', ');
    if (activeCardType === 'cover') {
      return {
        english: `An elegant, minimalist documentary magazine cover for "HEREIN" magazine. A cinematic shot representing "${sceneTitle}" in "${city}" during ${timePeriod}. Heavy negative space, natural 35mm film grain, ${style.englishKeywords}, authentic feel, nostalgic and peaceful --ar 3:4 --v 6.0 --style raw`,
        chinese: `《此间》封面美学：在 [${city}] 的 [${timePeriod}]，拍摄能够代表 [${sceneTitle}] 氛围的封面大图。极简构图、留白艺术、35毫米胶片质感、${style.chineseKeywords}，高雅内敛。`
      };
    }
    if (activeCardType === 'back') {
      return {
        english: `A quiet, atmospheric abstract documentary photo representing the closing scene of a journey in ${city}. Soft evening light fading, a beautiful solitary texture, nostalgic vibe, ${style.englishKeywords}, highly poetic, quiet wisdom --ar 3:4 --v 6.0 --style raw`,
        chinese: `《此间》封底意境：宁静而深邃的城市落幕光影，带着淡淡的余晖与纹理质感。象征一段喧嚣归于平静的生活旅程，具有极高诗意与纪实格调。`
      };
    }
    return {
      english: `A poignant documentary photograph of ${sceneTitle} in ${city} during ${timePeriod}. Key details captured: ${detailsString}. ${style.englishKeywords}, raw emotion, deeply atmospheric, hyper-realistic, volumetric lighting, shot on 35mm film, masterfully composed, storytelling image, unposed, real life --ar 3:4 --v 6.0 --style raw`,
      chinese: `《此间》正页美学：在 [${city}] 的 [${timePeriod}]，拍摄 [${sceneTitle}]。画面中包含细节：[${detailsString}]。视觉美学风格：${style.chineseKeywords}，真实的情感流露，浓厚的生活氛围。`
    };
  };

  const handleGenerateImage = async () => {
    setGeneratingImage(true);
    setImageError(null);
    setGeneratedImages([]);
    try {
      const prompts = generateAIPrompt();
      const res = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompts.english }),
      });
      if (!res.ok) throw new Error('Failed to start generation');
      const { jobId } = await res.json();

      let timeout = 0;
      while (timeout < 240) {
        await new Promise(r => setTimeout(r, 2000));
        const pollRes = await fetch(`/api/generate-image/${jobId}`);
        if (!pollRes.ok) throw new Error('Polling failed');
        const job = await pollRes.json();
        if (job.image) setGeneratedImages([job.image]);
        if (job.done) {
          if (job.error) throw new Error(job.error);
          break;
        }
        timeout++;
      }
      if (timeout >= 240) throw new Error('Generation timed out');
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setGeneratingImage(false);
    }
  };

  const handleDownloadImage = (base64: string, index?: number) => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${base64}`;
    link.download = `herein-${activeCardType}${index !== undefined ? `-step${index + 1}` : ''}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    const prompts = generateAIPrompt();
    copyToClipboard(`【英文提示词】\n${prompts.english}\n\n【中文美学构想】\n${prompts.chinese}\n\n【风格控制】\n${stylePresets[selectedStyle].colorTone}\n尺寸: 3:4`);
    setPromptCopied(true);
    setToastMsg('提示词已复制');
    setTimeout(() => setPromptCopied(false), 2000);
  };

  const steps = ['卡片类型', '内容采集', '视觉风格', '生成影像'];

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 animate-fadeIn">
      <Toast message={toastMsg} visible={!!toastMsg} onClose={() => setToastMsg('')} duration={2500} />

      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest block font-bold">Zine Suite / 城市三联折页</span>
        <h2 className="text-3xl font-serif font-extralight tracking-tight text-white">《此间》三联影像志 (3:4)</h2>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-2xl">
          由「封面」「正页」「封底」构成的三维独立纸质志，按 3:4 画幅设计。
        </p>
      </div>

      {/* Step indicator */}
      <StepIndicator currentStep={currentStep} steps={steps} onStepClick={setCurrentStep} />

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Controls */}
        <div className="lg:col-span-5 space-y-6">
          {/* Step 1: Card type */}
          <div className={`bg-zinc-900/60 rounded-xl p-5 border ${currentStep === 1 ? 'border-amber-700/60' : 'border-zinc-800'} space-y-3`}>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">步骤 1: 选择卡片类型</span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cover', label: '封面', icon: BookImage },
                { id: 'content', label: '正页', icon: FileText },
                { id: 'back', label: '封底', icon: Bookmark },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => { setActiveCardType(id); setCurrentStep(2); }}
                  className={`py-2.5 px-1 rounded text-xs font-semibold border transition-all flex flex-col items-center gap-1 min-h-[44px] ${
                    activeCardType === id
                      ? 'bg-amber-950/20 border-amber-600/80 text-amber-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Content */}
          <div className={`bg-zinc-900/60 rounded-xl p-6 border ${currentStep === 2 ? 'border-amber-700/60' : 'border-zinc-800'} space-y-4`}>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">步骤 2: 采集内容</span>
              <button onClick={() => setCurrentStep(3)} className="text-[11px] text-amber-400 hover:text-amber-300 font-medium">下一步 →</button>
            </div>
            <ContentForm
              city={city} timePeriod={timePeriod} sceneTitle={sceneTitle}
              sceneDetails={sceneDetails} newDetail={newDetail}
              onCityChange={setCity} onTimeChange={setTimePeriod}
              onTitleChange={setSceneTitle} onNewDetailChange={setNewDetail}
              onAddDetail={handleAddDetail} onRemoveDetail={(i) => setSceneDetails(sceneDetails.filter((_, idx) => idx !== i))}
              onLoadTemplate={handleLoadTemplate} onReset={handleReset}
            />
          </div>

          {/* Step 3: Style */}
          <div className={`bg-zinc-900/60 rounded-xl p-6 border ${currentStep === 3 ? 'border-amber-700/60' : 'border-zinc-800'} space-y-4`}>
            <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
              <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">步骤 3: 视觉美学定调</span>
              <button onClick={() => setCurrentStep(4)} className="text-[11px] text-amber-400 hover:text-amber-300 font-medium">下一步 →</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(stylePresets).map(([key, style]) => (
                <button
                  key={key}
                  onClick={() => setSelectedStyle(key)}
                  className={`p-3 text-left rounded-lg border transition-all duration-300 text-xs ${
                    selectedStyle === key
                      ? 'bg-amber-950/20 border-amber-600/80 text-amber-200 shadow-md'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  <div className="font-semibold">{style.name}</div>
                  <div className="text-[11px] text-zinc-500 mt-1 truncate">{style.colorTone.split('/')[1] || style.colorTone}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Step 4: Generate */}
          <div className={`bg-zinc-900/60 rounded-xl p-6 border ${currentStep === 4 ? 'border-amber-700/60' : 'border-zinc-800'} space-y-4`}>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider block">步骤 4: 生成影像</span>
            <div className="flex gap-2 flex-wrap">
              <button onClick={handleGenerateImage} disabled={generatingImage}
                className="px-4 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-2 disabled:opacity-50 min-h-[44px]">
                <Sparkles className="h-4 w-4" />
                {generatingImage ? '生成中...' : '生成图片'}
              </button>
              <button onClick={handleCopyPrompt}
                className="px-4 py-2.5 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-medium text-zinc-300 transition-colors flex items-center gap-1.5 min-h-[44px]">
                <Copy className="h-3.5 w-3.5" />
                {promptCopied ? '已复制' : '复制提示词'}
              </button>
            </div>
          </div>
        </div>

        {/* Right: Preview + Results */}
        <div className="lg:col-span-7 space-y-6">
          {/* Live Preview */}
          <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl p-6 md:p-8">
            <h4 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2 pb-4 border-b border-zinc-800">
              <ImageIcon className="h-4 w-4 text-amber-400" />
              实时预览 (3:4)
            </h4>
            <div className="pt-6 flex justify-center">
              <LivePreview
                cardType={activeCardType}
                sceneTitle={sceneTitle}
                city={city}
                timePeriod={timePeriod}
                sceneDetails={sceneDetails}
              />
            </div>
          </div>

          {/* Image Results */}
          {(generatedImages.length > 0 || generatingImage || imageError) && (
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl p-6 space-y-4">
              <h4 className="text-sm font-semibold text-white tracking-wider flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-amber-400" />
                AI 生成结果
              </h4>

              {generatingImage && generatedImages.length === 0 && (
                <div className="space-y-4">
                  <CardSkeleton />
                  <p className="text-xs text-zinc-500 text-center">gpt-image-2 正在生成，预计 30-60 秒...</p>
                </div>
              )}

              {imageError && <ErrorState message={imageError} onRetry={handleGenerateImage} />}

              {generatedImages[0] && (
                <div className="space-y-4">
                  <button
                    onClick={() => setPreviewImage({ src: `data:image/png;base64,${generatedImages[0]}`, index: 0 })}
                    className="w-full group relative overflow-hidden rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400"
                  >
                    <img
                      src={`data:image/png;base64,${generatedImages[0]}`}
                      alt="AI生成城市影像"
                      className="w-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity text-xs text-white font-medium bg-zinc-900/80 px-3 py-1.5 rounded-full">
                        点击预览
                      </span>
                    </div>
                  </button>
                  <div className="flex justify-center">
                    <button onClick={() => handleDownloadImage(generatedImages[0], 0)}
                      className="px-5 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition-colors flex items-center gap-2">
                      <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      下载图片
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Lightbox */}
      {previewImage && (
        <ImagePreview
          src={previewImage.src}
          alt={`AI生成城市影像 步骤${previewImage.index + 1}`}
          onClose={() => setPreviewImage(null)}
          onDownload={() => handleDownloadImage(generatedImages[previewImage.index], previewImage.index)}
        />
      )}
    </div>
  );
}
