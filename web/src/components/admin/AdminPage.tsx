import { useState, useEffect } from 'react';
import { Palette, Cpu, Plus, Trash2, X, Power, PowerOff, Edit3, LogOut } from 'lucide-react';
import BrandMark from '../shared/BrandMark';
import LoadingSkeleton from '../shared/LoadingSkeleton';

interface PromptTemplate {
  id: number;
  template_key: string;
  name: string;
  english_keywords: string;
  chinese_keywords: string;
  color_tone: string;
  card_type: string;
  sort_order: number;
  is_active: number;
}

interface ModelConfig {
  id: number;
  name: string;
  provider: string;
  model_id: string;
  api_endpoint: string;
  parameters: any;
  is_active: number;
}

interface Props {
  token: string;
  onLogout?: () => void;
}

const EMPTY_TEMPLATE: PromptTemplate = {
  id: 0, template_key: '', name: '', english_keywords: '', chinese_keywords: '', color_tone: '', card_type: 'content', sort_order: 0, is_active: 1,
};

const EMPTY_MODEL: ModelConfig = {
  id: 0, name: '', provider: 'openai', model_id: '', api_endpoint: '', parameters: null, is_active: 0,
};

export default function AdminPage({ token, onLogout }: Props) {
  const [tab, setTab] = useState<'templates' | 'models'>('templates');
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editTemplate, setEditTemplate] = useState<PromptTemplate | null>(null);
  const [editModel, setEditModel] = useState<ModelConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'template' | 'model'; id: number; name: string } | null>(null);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const [tRes, mRes] = await Promise.all([
        fetch('/api/admin/prompt-templates', { headers }),
        fetch('/api/admin/model-configs', { headers }),
      ]);
      if (tRes.status === 401) throw new Error('登录已过期，请重新登录');
      if (tRes.status === 403) throw new Error('需要管理员权限才能访问此页面');
      if (!tRes.ok) throw new Error('加载模板数据失败');
      if (!mRes.ok) throw new Error('加载模型数据失败');
      setTemplates(await tRes.json());
      setModels(await mRes.json());
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : '加载失败');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function saveTemplate(t: PromptTemplate) {
    setSaving(true);
    try {
      const url = t.id ? `/api/admin/prompt-templates/${t.id}` : '/api/admin/prompt-templates';
      const method = t.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(t) });
      if (!res.ok) throw new Error('Save failed');
      setEditTemplate(null);
      load();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    const url = type === 'template'
      ? `/api/admin/prompt-templates/${id}`
      : `/api/admin/model-configs/${id}`;
    await fetch(url, { method: 'DELETE', headers });
    setDeleteTarget(null);
    load();
  }

  async function saveModel(m: ModelConfig) {
    setSaving(true);
    try {
      const body = {
        ...m,
        parameters: typeof m.parameters === 'string' ? (() => { try { return JSON.parse(m.parameters); } catch { return null; } })() : m.parameters,
      };
      const url = m.id ? `/api/admin/model-configs/${m.id}` : '/api/admin/model-configs';
      const method = m.id ? 'PUT' : 'POST';
      const res = await fetch(url, { method, headers, body: JSON.stringify(body) });
      if (!res.ok) throw new Error('Save failed');
      setEditModel(null);
      load();
    } catch { /* ignore */ } finally { setSaving(false); }
  }

  async function toggleModel(m: ModelConfig) {
    const body = {
      ...m,
      parameters: typeof m.parameters === 'string' ? (() => { try { return JSON.parse(m.parameters); } catch { return null; } })() : m.parameters,
      is_active: m.is_active ? false : true,
    };
    await fetch(`/api/admin/model-configs/${m.id}`, { method: 'PUT', headers, body: JSON.stringify(body) });
    load();
  }

  function formatParams(p: any): string {
    if (!p) return '—';
    if (typeof p === 'string') {
      try { return JSON.stringify(JSON.parse(p), null, 2); } catch { return p; }
    }
    return JSON.stringify(p, null, 2);
  }

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-8"><LoadingSkeleton className="h-96" /></div>;

  if (loadError) {
    return (
      <div className="min-h-screen bg-[#121212]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8">
          <div className="bg-zinc-950 rounded-xl border border-red-900/30 p-8 text-center space-y-4">
            <p className="text-sm text-red-400">{loadError}</p>
            <button onClick={load} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-xs font-bold text-zinc-950 transition-colors">
              重试
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#121212]">
      {/* Top Bar */}
      <header className="border-b border-zinc-800/60 bg-[#0f0f10]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrandMark className="w-6" />
            <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase">Admin Panel / 后台管理</span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              退出登录
            </button>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 space-y-6">
        <h2 className="text-2xl font-serif font-extralight tracking-tight text-white">系统管理</h2>

      {/* Tab selector */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab('templates')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            tab === 'templates' ? 'bg-amber-950/20 border border-amber-900/30 text-amber-200' : 'bg-zinc-900/40 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}>
          <Palette className="h-4 w-4" />
          提示词模版
        </button>
        <button
          onClick={() => setTab('models')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
            tab === 'models' ? 'bg-amber-950/20 border border-amber-900/30 text-amber-200' : 'bg-zinc-900/40 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
          }`}>
          <Cpu className="h-4 w-4" />
          模型配置
        </button>
      </div>

      {/* ─── Templates ──────────────────────────────────── */}
      {tab === 'templates' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-zinc-500">{templates.length} 个模版 · 用于记忆卡片"视觉风格"步骤<br />修改后前端生成器的步骤3会实时更新</p>
            <button onClick={() => setEditTemplate({ ...EMPTY_TEMPLATE })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-bold transition-colors">
              <Plus className="h-3.5 w-3.5" /> 添加模版
            </button>
          </div>

          {templates.length === 0 && (
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-12 text-center space-y-3">
              <p className="text-sm text-zinc-500">暂无提示词模版</p>
              <p className="text-xs text-zinc-600">点击"添加模版"创建第一个模版，它将出现在生成器的步骤 3 中</p>
            </div>
          )}
          {templates.length > 0 && (
            <div className="grid gap-3">
              {templates.map(t => (
                <div key={t.id} className="bg-zinc-950 rounded-xl border border-zinc-800 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-300">{t.template_key}</span>
                        <span className={`px-1.5 py-0.5 rounded text-[10px] ${t.is_active ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' : 'bg-zinc-800 text-zinc-500'}`}>
                          {t.is_active ? '启用' : '禁用'}
                        </span>
                        <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded">{t.card_type}</span>
                      </div>
                      <h4 className="text-sm font-semibold text-white mt-1">{t.name}</h4>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setEditTemplate({ ...t })} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setDeleteTarget({ type: 'template', id: t.id, name: t.name })} className="p-1.5 rounded hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-zinc-500">英文关键词：</span><span className="text-zinc-300">{t.english_keywords}</span></div>
                    <div><span className="text-zinc-500">中文关键词：</span><span className="text-zinc-300">{t.chinese_keywords}</span></div>
                  </div>
                  <div className="text-[11px]">
                    <span className="text-zinc-500">色调：</span><span className="text-zinc-300">{t.color_tone}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Models ─────────────────────────────────────── */}
      {tab === 'models' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-xs text-zinc-500">{models.length} 个模型 · 同时只有一个模型处于激活状态<br />激活的模型将用于前端图片生成</p>
            <button onClick={() => setEditModel({ ...EMPTY_MODEL })}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-600 hover:bg-amber-500 text-zinc-950 text-xs font-bold transition-colors">
              <Plus className="h-3.5 w-3.5" /> 添加模型
            </button>
          </div>

          {models.length === 0 && (
            <div className="bg-zinc-950 rounded-xl border border-zinc-800 p-12 text-center space-y-3">
              <p className="text-sm text-zinc-500">暂无模型配置</p>
              <p className="text-xs text-zinc-600">点击"添加模型"创建第一个模型，激活后前端将使用该模型生成图片</p>
            </div>
          )}
          {models.length > 0 && (
          <div className="grid gap-3">
            {models.map(m => (
              <div key={m.id} className={`bg-zinc-950 rounded-xl border p-5 space-y-3 ${m.is_active ? 'border-amber-700/60' : 'border-zinc-800'}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${m.is_active ? 'bg-amber-500 text-zinc-950' : 'bg-zinc-800 text-zinc-500'}`}>
                        {m.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                      <span className="text-[10px] text-zinc-500 bg-zinc-800 px-1.5 py-0.5 rounded uppercase">{m.provider}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-white mt-1">{m.name}</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">{m.model_id}</p>
                    {m.api_endpoint && <p className="text-[10px] text-zinc-600 truncate max-w-md">{m.api_endpoint}</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setEditModel({ ...m })} className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => toggleModel(m)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                        m.is_active ? 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300' : 'bg-amber-600 hover:bg-amber-500 text-zinc-950'
                      }`}>
                      {m.is_active ? <><PowerOff className="h-3.5 w-3.5" /> 停用</> : <><Power className="h-3.5 w-3.5" /> 激活</>}
                    </button>
                    <button onClick={() => setDeleteTarget({ type: 'model', id: m.id, name: m.name })} className="p-1.5 rounded hover:bg-red-950/40 text-zinc-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                {m.parameters && (
                  <div className="text-[11px] text-zinc-500 font-mono bg-zinc-900/60 rounded p-2 whitespace-pre-wrap">
                    {formatParams(m.parameters)}
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* ─── Template Edit Modal ────────────────────────── */}
      {editTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={() => setEditTemplate(null)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{editTemplate.id ? '编辑模版' : '新建模版'}</h3>
              <button onClick={() => setEditTemplate(null)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">Key <span className="text-zinc-600">(唯一标识)</span></label>
                  <input value={editTemplate.template_key} onChange={e => setEditTemplate({ ...editTemplate, template_key: e.target.value })}
                    className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">名称 <span className="text-zinc-600">(显示在步骤3)</span></label>
                  <input value={editTemplate.name} onChange={e => setEditTemplate({ ...editTemplate, name: e.target.value })}
                    className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">英文关键词 <span className="text-zinc-600">(注入到英文 Prompt)</span></label>
                <textarea value={editTemplate.english_keywords} onChange={e => setEditTemplate({ ...editTemplate, english_keywords: e.target.value })}
                  rows={3} className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">中文关键词 <span className="text-zinc-600">(注入到中文 Prompt)</span></label>
                <textarea value={editTemplate.chinese_keywords} onChange={e => setEditTemplate({ ...editTemplate, chinese_keywords: e.target.value })}
                  rows={3} className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none resize-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">色调 (Color Tone)</label>
                <input value={editTemplate.color_tone} onChange={e => setEditTemplate({ ...editTemplate, color_tone: e.target.value })}
                  className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none" />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">卡片类型</label>
                  <select value={editTemplate.card_type} onChange={e => setEditTemplate({ ...editTemplate, card_type: e.target.value })}
                    className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none">
                    <option value="cover">封面 cover</option>
                    <option value="content">内容 content</option>
                    <option value="back">封底 back</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">排序</label>
                  <input type="number" value={editTemplate.sort_order} onChange={e => setEditTemplate({ ...editTemplate, sort_order: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">状态</label>
                  <select value={editTemplate.is_active ? '1' : '0'} onChange={e => setEditTemplate({ ...editTemplate, is_active: Number(e.target.value) })}
                    className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none">
                    <option value="1">启用</option>
                    <option value="0">禁用</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditTemplate(null)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors">取消</button>
              <button onClick={() => saveTemplate(editTemplate)} disabled={saving}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-xs font-bold text-zinc-950 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Model Edit Modal ───────────────────────────── */}
      {editModel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={() => setEditModel(null)}>
          <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 w-full max-w-lg mx-4 space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">{editModel.id ? '编辑模型' : '添加模型'}</h3>
              <button onClick={() => setEditModel(null)} className="p-1 rounded hover:bg-zinc-800 text-zinc-400"><X className="h-4 w-4" /></button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">名称</label>
                  <input value={editModel.name} onChange={e => setEditModel({ ...editModel, name: e.target.value })}
                    placeholder="例如: OpenAI DALL-E 3"
                    className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none" />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-zinc-400">提供商</label>
                  <select value={editModel.provider} onChange={e => setEditModel({ ...editModel, provider: e.target.value })}
                    className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none">
                    <option value="openai">OpenAI</option>
                    <option value="nvidia">NVIDIA</option>
                    <option value="google">Google</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">模型 ID</label>
                <input value={editModel.model_id} onChange={e => setEditModel({ ...editModel, model_id: e.target.value })}
                  placeholder="例如: gpt-image-2 或 flux.1-dev"
                  className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">API 端点 <span className="text-zinc-600">(NVIDIA 必填)</span></label>
                <input value={editModel.api_endpoint} onChange={e => setEditModel({ ...editModel, api_endpoint: e.target.value })}
                  placeholder="https://ai.api.nvidia.com/v1/genai/black-forest-labs/flux.1-dev"
                  className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white focus:border-amber-600 focus:outline-none" />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] text-zinc-400">参数 (JSON) <span className="text-zinc-600">(NVIDIA: mode, cfg_scale, width, height, seed, steps)</span></label>
                <textarea value={typeof editModel.parameters === 'string' ? editModel.parameters : JSON.stringify(editModel.parameters, null, 2)}
                  onChange={e => setEditModel({ ...editModel, parameters: e.target.value })}
                  rows={6} className="w-full px-2.5 py-2 rounded bg-zinc-900 border border-zinc-800 text-xs text-white font-mono focus:border-amber-600 focus:outline-none resize-none"
                  placeholder='{"mode": "base", "cfg_scale": 3.5, "width": 1024, "height": 1024, "seed": 0, "steps": 50}' />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-[11px] text-zinc-400">设为激活</label>
                <button onClick={() => setEditModel({ ...editModel, is_active: editModel.is_active ? 0 : 1 })}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${editModel.is_active ? 'bg-amber-600' : 'bg-zinc-700'}`}>
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${editModel.is_active ? 'translate-x-4' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setEditModel(null)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors">取消</button>
              <button onClick={() => saveModel(editModel)} disabled={saving}
                className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-xs font-bold text-zinc-950 transition-colors">
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Delete Confirmation Modal ────────────────────── */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm" onClick={() => setDeleteTarget(null)}>
          <div className="bg-zinc-950 border border-red-900/30 rounded-xl p-6 w-full max-w-sm mx-4 space-y-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-white">确认删除</h3>
            <p className="text-xs text-zinc-400">
              确定要删除 <span className="text-amber-300 font-semibold">{deleteTarget.name}</span> 吗？此操作{deleteTarget.type === 'template' ? '将软删除该模版' : '将永久删除该模型配置'}。
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setDeleteTarget(null)} className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 transition-colors">取消</button>
              <button onClick={confirmDelete}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-xs font-bold text-white transition-colors">
                删除
              </button>
            </div>
          </div>
        </div>
      ) : null}
      </div>
    </div>
  );
}
