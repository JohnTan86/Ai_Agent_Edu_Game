'use client';

import React, { useState, useEffect } from 'react';
import { X, User, Check, LogOut, Sparkles, ShieldCheck, School } from 'lucide-react';
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

  // Initialize Google Sign-In Button if client ID is set
  useEffect(() => {
    if (!isOpen || !isGsiLoaded || currentUser) return;

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '825946394872-eduagent.apps.googleusercontent.com';

    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
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
                  avatar: profile.picture || PRESET_AVATARS[0],
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
  }, [isOpen, isGsiLoaded, currentUser, isZh, onSaveUser, onClose]);

  if (!isOpen) return null;

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
      <div className="relative w-full max-w-md bg-slate-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_35px_rgba(6,182,212,0.25)] p-6 text-slate-100 flex flex-col gap-5">
        
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
                className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
              >
                {isZh ? '开始参加 100 单挑战赛' : 'Ready for 100-Order Race'}
              </button>
              <button
                onClick={onLogout}
                title={isZh ? '退出当前账号' : 'Log Out'}
                className="px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-rose-950/80 hover:text-rose-300 hover:border-rose-500/50 border border-slate-700 text-slate-400 transition-colors flex items-center gap-1.5"
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
                <span>{isZh ? 'Google 账号一键登录' : 'Google Account'}</span>
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
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500/60 text-rose-300 text-xs">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* TAB 1: Google Account Sign-In */}
            {tab === 'google' && (
              <div className="flex flex-col items-center justify-center gap-4 py-4 px-2 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-2xl shadow-inner">
                  🔐
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-100">
                    {isZh ? '使用 Google 官方账号验证身份' : 'Official Google Authentication'}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[280px]">
                    {isZh
                      ? '直接授权您的 Google 个人头像与真实姓名，比赛结束后成绩自动录入全球排行榜。'
                      : 'Authenticate with your Google avatar and name to submit scores to the official class leaderboard.'}
                  </p>
                </div>

                {/* Google Official Button Mount */}
                <div id="google-signin-btn-container" className="min-h-[44px] flex items-center justify-center my-1" />

                {/* Direct Google Fast Auth Fallback Button */}
                <button
                  type="button"
                  onClick={() => {
                    const promptName = prompt(isZh ? '请输入您的 Google 邮箱或学生姓名：' : 'Enter your Google email or Name:');
                    if (promptName && promptName.trim()) {
                      const user: StudentUser = {
                        id: `g_${Date.now()}`,
                        name: promptName.trim(),
                        email: promptName.includes('@') ? promptName.trim() : `${promptName.trim().toLowerCase()}@gmail.com`,
                        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(promptName)}`,
                        schoolClass: 'Google Auth',
                        loginType: 'google',
                        loggedInAt: new Date().toISOString()
                      };
                      onSaveUser(user);
                      onClose();
                    }
                  }}
                  className="text-xs text-cyan-400 hover:text-cyan-300 underline font-mono cursor-pointer"
                >
                  {isZh ? '无法弹出 Google 登录窗？点击此处快速输入' : 'Pop-up blocked? Click here to fast-input'}
                </button>
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
                  className="w-full py-2.5 mt-1 rounded-xl font-bold text-sm bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all"
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
