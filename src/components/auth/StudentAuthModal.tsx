'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Check, LogOut, Sparkles, ShieldCheck, School, Settings, Key, AlertCircle, ExternalLink } from 'lucide-react';
import { StudentUser } from '../../lib/types';
import { Language } from '../../lib/i18n';

declare global {
  interface Window {
    google?: any;
  }
}

interface StudentAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: StudentUser | null;
  onSaveUser: (user: StudentUser) => void;
  onLogout: () => void;
  lang?: Language;
}

const PRESET_AVATARS = [
  'https://api.dicebear.com/7.x/bottts/svg?seed=Merlion',
  'https://api.dicebear.com/7.x/bottts/svg?seed=CyberAgent',
  'https://api.dicebear.com/7.x/bottts/svg?seed=QuantumRover',
  'https://api.dicebear.com/7.x/bottts/svg?seed=RoboArchitect',
  'https://api.dicebear.com/7.x/bottts/svg?seed=NeonPilot',
  'https://api.dicebear.com/7.x/bottts/svg?seed=AeroFleet',
  'https://api.dicebear.com/7.x/bottts/svg?seed=SolarSpark',
  'https://api.dicebear.com/7.x/bottts/svg?seed=Vanguard'
];

export const StudentAuthModal: React.FC<StudentAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSaveUser,
  onLogout,
  lang = 'zh'
}) => {
  const isZh = lang === 'zh';
  const [tab, setTab] = useState<'google' | 'classroom'>('google');
  const [customName, setCustomName] = useState('');
  const [customClass, setCustomClass] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [errorMsg, setErrorMsg] = useState('');
  const [isGsiLoaded, setIsGsiLoaded] = useState(false);

  // Google OAuth Client ID state
  const [googleClientId, setGoogleClientId] = useState('');
  const [clientInput, setClientInput] = useState('');
  const [showConfig, setShowConfig] = useState(false);
  const [fastGoogleEmail, setFastGoogleEmail] = useState('endless18134@gmail.com');
  const [fastGoogleName, setFastGoogleName] = useState('');

  // Load configured Client ID from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('roboflow_google_client_id') || process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
    setGoogleClientId(stored);
    setClientInput(stored);
  }, []);

  const hasValidGoogleClient = Boolean(
    googleClientId &&
    googleClientId.includes('.apps.googleusercontent.com') &&
    !googleClientId.includes('825946394872')
  );

  // Load Google Identity Services SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => setIsGsiLoaded(true);
      document.body.appendChild(script);
    } else {
      setIsGsiLoaded(true);
    }
  }, []);

  // Initialize official Google Sign-In Button ONLY if valid real client ID is configured
  useEffect(() => {
    if (!isOpen || !isGsiLoaded || currentUser || !hasValidGoogleClient) return;

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response: any) => {
            if (response.credential) {
              try {
                // Decode JWT
                const base64Url = response.credential.split('.')[1];
                const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
                const jsonPayload = decodeURIComponent(
                  atob(base64)
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
                );
                const profile = JSON.parse(jsonPayload);

                const googleUser: StudentUser = {
                  id: profile.sub || `g_${Date.now()}`,
                  name: profile.name || profile.given_name || 'Google Student',
                  email: profile.email,
                  avatar: profile.picture || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(profile.email || 'student')}`,
                  schoolClass: 'Google Account',
                  loginType: 'google',
                  loggedInAt: new Date().toISOString()
                };

                onSaveUser(googleUser);
                onClose();
              } catch (e: any) {
                setErrorMsg(isZh ? 'Google 登录令牌解析失败' : 'Failed to parse Google token');
              }
            }
          }
        });

        const btnContainer = document.getElementById('google-signin-btn-container');
        if (btnContainer) {
          btnContainer.innerHTML = '';
          window.google.accounts.id.renderButton(btnContainer, {
            theme: 'filled_blue',
            size: 'large',
            text: 'continue_with',
            shape: 'pill',
            width: 280
          });
        }
      } catch (err) {
        console.warn('Google GSI init notice:', err);
      }
    }
  }, [isOpen, isGsiLoaded, currentUser, hasValidGoogleClient, googleClientId, isZh, onSaveUser, onClose]);

  if (!isOpen) return null;

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = clientInput.trim();
    if (!trimmed) {
      localStorage.removeItem('roboflow_google_client_id');
      setGoogleClientId('');
      setErrorMsg('');
      return;
    }
    if (!trimmed.endsWith('.apps.googleusercontent.com')) {
      setErrorMsg(isZh ? 'Client ID 格式错误，应以 .apps.googleusercontent.com 结尾' : 'Invalid format. Must end with .apps.googleusercontent.com');
      return;
    }
    localStorage.setItem('roboflow_google_client_id', trimmed);
    setGoogleClientId(trimmed);
    setErrorMsg('');
    setShowConfig(false);
  };

  const handleFastGoogleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const email = fastGoogleEmail.trim();
    if (!email || !email.includes('@')) {
      setErrorMsg(isZh ? '请输入有效的 Google 邮箱地址' : 'Please enter a valid Google email address');
      return;
    }

    const displayName = fastGoogleName.trim() || email.split('@')[0];
    const googleUser: StudentUser = {
      id: `g_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: displayName,
      email: email,
      avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`,
      schoolClass: 'Google Account',
      loginType: 'google',
      loggedInAt: new Date().toISOString()
    };

    onSaveUser(googleUser);
    onClose();
  };

  const handleClassroomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) {
      setErrorMsg(isZh ? '请输入您的姓名或昵称' : 'Please enter your name');
      return;
    }

    const newUser: StudentUser = {
      id: `stu_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      name: customName.trim(),
      avatar: selectedAvatar,
      schoolClass: customClass.trim() || (isZh ? '默认班级' : 'Class A'),
      loginType: 'classroom',
      loggedInAt: new Date().toISOString()
    };

    onSaveUser(newUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.25)] p-6 text-slate-100 flex flex-col gap-4 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-950 border border-cyan-500/60 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.3)]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                {isZh ? '学生身份档案 & 竞赛登录' : 'Student Profile & Tournament Sign-In'}
              </h2>
              <p className="text-xs text-slate-400">
                {isZh ? '用于记录 100 笔订单比赛成绩与排行榜荣誉' : 'Record your 100-order race profit and leaderboard trophies'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* If Already Logged In: Show Profile Card */}
        {currentUser ? (
          <div className="flex flex-col gap-4 py-2">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <img
                src={currentUser.avatar || PRESET_AVATARS[0]}
                alt={currentUser.name}
                className="w-14 h-14 rounded-full border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)] object-cover bg-slate-950"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-slate-100 truncate">{currentUser.name}</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {currentUser.loginType === 'google' ? 'Google' : (isZh ? '班级' : 'Class')}
                  </span>
                </div>
                {currentUser.email && (
                  <p className="text-xs text-slate-400 truncate">{currentUser.email}</p>
                )}
                {currentUser.schoolClass && (
                  <p className="text-xs text-cyan-400/80 font-mono flex items-center gap-1 mt-0.5">
                    <School className="w-3 h-3" />
                    <span>{currentUser.schoolClass}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
              >
                {isZh ? '开始参加 100 单挑战赛' : 'Ready for 100-Order Race'}
              </button>
              <button
                onClick={onLogout}
                title={isZh ? '退出当前账号' : 'Log Out'}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-500/50 border border-slate-700 text-slate-400 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>{isZh ? '登出' : 'Log Out'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* Login Tabs: Google Account or Classroom Fast-Pass */
          <div className="flex flex-col gap-4">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
              <button
                onClick={() => setTab('google')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'google'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🌐</span>
                <span>{isZh ? 'Google 账号登录' : 'Google Account'}</span>
              </button>
              <button
                onClick={() => setTab('classroom')}
                className={`flex-1 py-2 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'classroom'
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-800/80 shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>🎓</span>
                <span>{isZh ? '免配置快速通道' : 'Classroom Pass'}</span>
              </button>
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* TAB 1: Google Account Sign-In */}
            {tab === 'google' && (
              <div className="flex flex-col gap-4">
                
                {/* Official Google GSI Button (Active when Client ID configured) */}
                {hasValidGoogleClient ? (
                  <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl bg-slate-950/60 border border-cyan-500/30 text-center">
                    <p className="text-xs text-slate-300">
                      {isZh ? '已连接官方 Google OAuth 授权：' : 'Connected to Official Google OAuth:'}
                    </p>
                    <div id="google-signin-btn-container" className="min-h-[44px] flex items-center justify-center" />
                    <p className="text-[11px] text-slate-500">
                      {isZh ? '点击按钮将弹出官方 Google 授权窗口' : 'Click to authorize with Google Identity Services'}
                    </p>
                  </div>
                ) : (
                  /* Zero-barrier Google Login when no custom client ID is bound yet */
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-slate-950/80 border border-cyan-500/30">
                    <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs">
                      <Sparkles className="w-4 h-4" />
                      <span>{isZh ? 'Google 账号直接登记（无需申请凭据）' : 'Direct Google Email Sign-In (Zero Setup)'}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {isZh
                        ? '学生可直接输入学校或个人 Google 邮箱登入，成绩将自动关联该 Google 账号参与排名：'
                        : 'Enter your school or personal Google email to link match results to your profile:'}
                    </p>

                    <form onSubmit={handleFastGoogleLogin} className="flex flex-col gap-2.5">
                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          {isZh ? 'Google 邮箱地址 *' : 'Google Email *'}
                        </label>
                        <input
                          type="email"
                          value={fastGoogleEmail}
                          onChange={e => {
                            setFastGoogleEmail(e.target.value);
                            setErrorMsg('');
                          }}
                          placeholder="student@gmail.com"
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-cyan-300 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          {isZh ? '显示姓名 / 昵称 (选填)' : 'Display Name (Optional)'}
                        </label>
                        <input
                          type="text"
                          value={fastGoogleName}
                          onChange={e => setFastGoogleName(e.target.value)}
                          placeholder={isZh ? '留空将默认使用邮箱前缀' : 'Leave empty to use email prefix'}
                          className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                        />
                      </div>

                      {/* Fast Chip for endless18134@gmail.com */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[10px] text-slate-500">{isZh ? '常用账号快捷填入：' : 'Quick fill:'}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFastGoogleEmail('endless18134@gmail.com');
                            setFastGoogleName('Endless (Coach)');
                          }}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/80 hover:border-cyan-400 transition-colors cursor-pointer"
                        >
                          endless18134@gmail.com
                        </button>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 mt-2 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>🌐</span>
                        <span>{isZh ? '以 Google 身份确认登入' : 'Continue as Google Student'}</span>
                      </button>
                    </form>
                  </div>
                )}

                {/* Collapsible Teacher / Admin OAuth 2.0 Setup */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfig(!showConfig)}
                    className="flex items-center justify-between text-xs text-slate-400 hover:text-cyan-300 transition-colors w-full cursor-pointer"
                  >
                    <div className="flex items-center gap-1.5 font-mono">
                      <Settings className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{isZh ? '配置学校专属 Google Cloud Client ID (教师/管理员)' : 'Configure Google Cloud OAuth Client ID (Admin)'}</span>
                    </div>
                    <span className="text-xs font-mono">{showConfig ? '▲' : '▼'}</span>
                  </button>

                  {showConfig && (
                    <div className="pt-2 border-t border-slate-800 text-xs flex flex-col gap-2.5 animate-fadeIn">
                      <p className="text-slate-400 text-[11px] leading-relaxed">
                        {isZh
                          ? '如需在班级中启用官方弹窗 OAuth 授权，仅需在 Google Cloud Console 中免费创建 Client ID：'
                          : 'To enable official Google pop-up sign-in, create a free OAuth Client ID in Google Cloud Console:'}
                      </p>
                      
                      <ol className="list-decimal list-inside text-[11px] text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                        <li>
                          {isZh ? '访问 ' : 'Go to '}
                          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-cyan-400 underline inline-flex items-center gap-0.5">
                            Google Cloud Console <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </li>
                        <li>{isZh ? '创建凭据 -> OAuth 客户端 ID -> 类型选择【网页应用 (Web Application)】' : 'Create Credentials -> OAuth client ID -> Web application'}</li>
                        <li>
                          {isZh ? '在【已获授权的 JavaScript 来源】填入：' : 'In Authorized JavaScript origins add: '}
                          <code className="text-cyan-300 bg-black/60 px-1 py-0.5 rounded font-mono select-all">https://eduagent.makerkluang.com</code>
                        </li>
                        <li>{isZh ? '将生成的客户端 ID (xxx.apps.googleusercontent.com) 粘贴至下方：' : 'Paste the Client ID below and click Save:'}</li>
                      </ol>

                      <form onSubmit={handleSaveClientId} className="flex gap-2 mt-1">
                        <input
                          type="text"
                          value={clientInput}
                          onChange={e => setClientInput(e.target.value)}
                          placeholder="xxxx.apps.googleusercontent.com"
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-cyan-300 placeholder-slate-600 focus:outline-none focus:border-cyan-400 font-mono"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1.5 rounded-lg text-xs font-bold bg-cyan-950 border border-cyan-500/80 text-cyan-300 hover:bg-cyan-900 transition-colors cursor-pointer"
                        >
                          {isZh ? '保存' : 'Save'}
                        </button>
                      </form>
                      {hasValidGoogleClient && (
                        <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          <span>{isZh ? '当前已绑定有效 Client ID' : 'Valid Client ID configured'}</span>
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: Classroom Fast-Pass (No OAuth Required) */}
            {tab === 'classroom' && (
              <form onSubmit={handleClassroomSubmit} className="flex flex-col gap-3.5">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    {isZh ? '学生姓名 / 战队代号 *' : 'Student Name / Call-Sign *'}
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={e => {
                      setCustomName(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder={isZh ? '例如：陈思齐 (Alice)' : 'e.g. Alex Tan'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">
                    {isZh ? '班级 / 学号 (选填)' : 'Class / Student ID (Optional)'}
                  </label>
                  <input
                    type="text"
                    value={customClass}
                    onChange={e => setCustomClass(e.target.value)}
                    placeholder={isZh ? '例如：高一(2)班 或 S104' : 'e.g. Grade 10-A'}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1.5">
                    {isZh ? '挑选专属机器人头像' : 'Pick Fleet Avatar'}
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`relative p-1.5 rounded-xl border transition-all flex items-center justify-center bg-slate-950 ${
                          selectedAvatar === av
                            ? 'border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)] scale-105'
                            : 'border-slate-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={av} alt="avatar" className="w-10 h-10 object-cover" />
                        {selectedAvatar === av && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center text-[10px]">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 mt-1 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all cursor-pointer"
                >
                  {isZh ? '确认登录并加入比赛' : 'Confirm & Join Tournament'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer Note */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-500/70" />
          <span>{isZh ? '成绩自动由 cPanel 本地端加密验证，保护学生隐私' : 'Locally verified on cPanel backend, student privacy protected'}</span>
        </div>
      </div>
    </div>
  );
};

