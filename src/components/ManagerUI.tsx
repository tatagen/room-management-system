import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart3, 
  Settings, 
  UserCircle2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Search,
  Grid2X2,
  ListFilter,
  PlusCircle,
  MoreVertical,
  X,
  Package,
  Calendar,
  ChevronDown,
  RefreshCw,
  Wrench,
  Trash2,
  CheckSquare,
  LogOut,
  Home
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { Room, RoomStatus, Report, Staff, ChecklistItem } from '@/src/types';

interface ManagerUIProps {
  rooms: Room[];
  reports: Report[];
  staff: Staff[];
  checklistItems: ChecklistItem[];
  onUpdateRoom: (roomId: string, updates: Partial<Room>) => void;
  onAddRoom: (roomNumber: string, roomType?: string) => void;
  onDeleteRoom: (roomId: string) => void;
  onUpdateChecklist: (id: string, updates: Partial<ChecklistItem>) => void;
  onAddChecklist: (label: string) => void;
  onDeleteChecklist: (id: string) => void;
  onResolveReport: (reportId: string) => void;
  onDeleteReport: (reportId: string) => void;
  onDeleteAllReports: () => Promise<void>;
  onLogout: () => void;
  onResetAndSeed: () => Promise<void>;
}

export default function ManagerUI({ 
  rooms, 
  reports, 
  staff, 
  checklistItems,
  onUpdateRoom, 
  onAddRoom, 
  onDeleteRoom,
  onUpdateChecklist,
  onAddChecklist,
  onDeleteChecklist,
  onResolveReport, 
  onDeleteReport,
  onDeleteAllReports,
  onLogout,
  onResetAndSeed
}: ManagerUIProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'reports' | 'rooms' | 'config'>('dashboard');
  const [dashboardSection, setDashboardSection] = useState<'dashboard' | 'reports' | 'rooms' | 'config'>('dashboard');
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomType, setNewRoomType] = useState('スタンダード・ダブル');
  const [newChecklistLabel, setNewChecklistLabel] = useState('');
  const [dashChecklistLabel, setDashChecklistLabel] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [selectedFloor, setSelectedFloor] = useState<'all' | '1' | '2' | '3'>('all');
  const [resetConfirm, setResetConfirm] = useState(false);
  const [isClearingAllReports, setIsClearingAllReports] = useState(false);

  const scrollToDashboardSection = (section: 'dashboard' | 'reports' | 'rooms' | 'config') => {
    setDashboardSection(section);
    setIsMobileMenuOpen(false);
    
    const elementId = section === 'dashboard' ? 'section-dashboard' :
                      section === 'reports' ? 'section-reports' :
                      section === 'rooms' ? 'section-rooms' : 'section-config';
                      
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  React.useEffect(() => {
    if (activeTab !== 'dashboard') return;

    const container = document.getElementById('main-scroll-container');
    if (!container) return;

    const sections = [
      { id: 'section-dashboard', tab: 'dashboard' },
      { id: 'section-reports', tab: 'reports' },
      { id: 'section-rooms', tab: 'rooms' },
      { id: 'section-config', tab: 'config' }
    ] as const;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      const triggerY = containerRect.top + 160; 
      
      let active: 'dashboard' | 'reports' | 'rooms' | 'config' = 'dashboard';
      
      for (const sect of sections) {
        const el = document.getElementById(sect.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= triggerY + 50) {
            active = sect.tab;
          }
        }
      }
      setDashboardSection(active);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activeTab]);

  const stats = {
    total: rooms.length,
    dirty: rooms.filter(r => r.status === 'dirty').length,
    cleaning: rooms.filter(r => r.status === 'cleaning').length,
    checking: rooms.filter(r => r.status === 'checking').length,
    clean: rooms.filter(r => r.status === 'clean').length,
    efficiency: Math.round((rooms.filter(r => r.status === 'clean').length / (rooms.length || 1)) * 100)
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'dirty': return 'bg-red-50 text-red-600 border-red-100';
      case 'cleaning': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'checking': return 'bg-yellow-50 text-yellow-600 border-yellow-100';
      case 'clean': return 'bg-green-50 text-green-600 border-green-100';
    }
  };

  const getStatusDot = (status: RoomStatus) => {
    switch (status) {
      case 'dirty': return 'bg-red-500';
      case 'cleaning': return 'bg-blue-500';
      case 'checking': return 'bg-yellow-500';
      case 'clean': return 'bg-green-500';
    }
  };

  return (
    <div className="h-screen bg-[#F8F9FA] flex font-sans text-slate-900 overflow-hidden">
      {/* Main Content (Always Full screen, no sidebar) */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header with integrated Brand Logo & Unified Logout */}
        <header className="h-auto lg:h-24 px-4 lg:px-10 py-5 lg:py-0 bg-white border-b border-slate-100 flex flex-col lg:flex-row items-center justify-between gap-4 shrink-0 shadow-sm">
          <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
            <div className="flex items-center gap-3">
              <button
                onClick={onLogout}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-black text-[10px] uppercase tracking-widest rounded-lg transition-all border border-slate-200 flex items-center gap-1.5 cursor-pointer"
                id="sidebar-logout-btn"
              >
                <LogOut size={12} />
                ログアウト
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-black tracking-tighter text-slate-900 font-display uppercase">ルーム・オプス</span>
              </div>
            </div>
            
            <div className="h-5 w-px bg-slate-200 hidden lg:block mx-2"></div>
            
            <div>
              <h2 className="text-sm lg:text-base font-black text-slate-900 tracking-wider uppercase font-display bg-slate-100 px-3 py-1.5 rounded-md">
                {activeTab === 'dashboard' && 'ダッシュボード'}
                {activeTab === 'reports' && '通知・報告'}
                {activeTab === 'rooms' && '客室管理'}
                {activeTab === 'config' && '清掃規定'}
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-4 w-full lg:w-auto justify-end">
            <div className="flex gap-2 shrink-0 items-center">
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[9px] lg:text-[10px] font-black tracking-widest flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span> 未清掃 {stats.dirty}件
              </div>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[9px] lg:text-[10px] font-black tracking-widest flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span> 清掃中 {stats.cleaning}件
              </div>
              <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded text-[9px] lg:text-[10px] font-black tracking-widest flex items-center gap-2 whitespace-nowrap">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> 完了 {stats.clean}件
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div id="main-scroll-container" className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="space-y-16 pb-32"
              >
                {/* 1. Dashboard Summary Section */}
                <div id="section-dashboard" className="space-y-8 scroll-mt-6">
                  {/* Quick Link Jumps */}
                  <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-100 rounded-xl shadow-sm">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">クイックジャンプ:</span>
                    <button 
                      onClick={() => scrollToDashboardSection('dashboard')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-1.5 border",
                        dashboardSection === 'dashboard' ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-200 hover:border-slate-400 text-slate-600"
                      )}
                    >
                      <BarChart3 size={12} />
                      状況サマリー
                    </button>
                    <button 
                      onClick={() => scrollToDashboardSection('reports')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-1.5 border",
                        dashboardSection === 'reports' ? "bg-rose-900 border-rose-900 text-white" : "bg-slate-50 border-slate-200 hover:border-rose-400 text-slate-600"
                      )}
                    >
                      <AlertTriangle size={12} />
                      破損・忘れ物 ({reports.filter(r => r.status === 'pending').length}件)
                    </button>
                    <button 
                      onClick={() => scrollToDashboardSection('rooms')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-1.5 border",
                        dashboardSection === 'rooms' ? "bg-slate-900 border-slate-900 text-white" : "bg-slate-50 border-slate-200 hover:border-slate-800 text-slate-600"
                      )}
                    >
                      <Settings size={12} />
                      客室マスター
                    </button>
                    <button 
                      onClick={() => scrollToDashboardSection('config')}
                      className={cn(
                        "px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest flex items-center gap-1.5 border",
                        dashboardSection === 'config' ? "bg-blue-900 border-blue-900 text-white" : "bg-slate-50 border-slate-200 hover:border-blue-400 text-slate-600"
                      )}
                    >
                      <CheckSquare size={12} />
                      チェックリスト
                    </button>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                    {[
                      { label: '未清掃', value: stats.dirty, icon: Clock, color: 'text-slate-950', bg: 'bg-red-50' },
                      { label: '清掃中', value: stats.cleaning, icon: RefreshCw, color: 'text-slate-950', bg: 'bg-blue-50' },
                      { label: '確認待ち', value: stats.checking, icon: AlertTriangle, color: 'text-slate-950', bg: 'bg-yellow-50' },
                      { label: '完了', value: stats.clean, icon: CheckCircle2, color: 'text-slate-950', bg: 'bg-green-50' }
                    ].map((stat, i) => (
                      <div
                        key={i}
                        className="bg-white p-4 md:p-8 rounded-lg border border-slate-100 flex flex-col gap-1 md:gap-2 shadow-sm"
                      >
                        <p className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em]">{stat.label}</p>
                        <div className="flex items-baseline gap-0.5 md:gap-1">
                          <span className={cn("text-2xl md:text-5xl font-black tracking-tighter", stat.color)}>{stat.value}</span>
                          <span className="text-[10px] md:text-xs font-bold text-slate-300">件</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Floor situation / staff state content */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-8">
                    {/* Room Map / Grid */}
                    <div className="xl:col-span-2 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-black tracking-widest flex items-center gap-2">
                          <Grid2X2 size={16} className="text-slate-400" />
                          フロア状況マップ
                        </h3>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                          <button 
                            onClick={() => setSelectedFloor('all')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-black tracking-widest rounded-md transition-all cursor-pointer",
                              selectedFloor === 'all' ? "bg-white shadow-sm text-slate-900 border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            すべて
                          </button>
                          <button 
                            onClick={() => setSelectedFloor('1')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-black tracking-widest rounded-md transition-all cursor-pointer",
                              selectedFloor === '1' ? "bg-white shadow-sm text-slate-900 border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            1F
                          </button>
                          <button 
                            onClick={() => setSelectedFloor('2')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-black tracking-widest rounded-md transition-all cursor-pointer",
                              selectedFloor === '2' ? "bg-white shadow-sm text-slate-900 border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            2F
                          </button>
                          <button 
                            onClick={() => setSelectedFloor('3')}
                            className={cn(
                              "px-3 py-1 text-[10px] font-black tracking-widest rounded-md transition-all cursor-pointer",
                              selectedFloor === '3' ? "bg-white shadow-sm text-slate-900 border border-slate-200/50" : "text-slate-400 hover:text-slate-600"
                            )}
                          >
                            3F
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-6 gap-2 md:gap-4 p-2.5 md:p-8 bg-white rounded-lg border border-slate-200 shadow-sm">
                        {rooms
                          .filter(room => selectedFloor === 'all' || room.roomNumber.startsWith(selectedFloor))
                          .map(room => (
                          <div key={room.id} className="relative group">
                            <motion.button
                              onClick={() => setSelectedRoomId(room.id)}
                              whileTap={{ scale: 0.95 }}
                              className={cn(
                                "w-full aspect-square rounded-md border flex flex-col items-center justify-center gap-1 md:gap-2 transition-all hover:scale-[1.02]",
                                room.status === 'dirty' ? "border-rose-100 bg-rose-50/10" : 
                                room.status === 'cleaning' ? "border-blue-600 bg-blue-600 text-white" :
                                room.status === 'checking' ? "border-amber-200 bg-amber-50/30" :
                                "border-emerald-600 bg-emerald-600 text-white",
                                selectedRoomId === room.id ? "ring-2 ring-slate-900 ring-offset-2" : ""
                              )}
                            >
                              <div className="flex justify-between w-full px-2">
                                <span className={cn("text-xs md:text-lg font-black", room.status === 'cleaning' || room.status === 'clean' ? 'text-white' : 'text-slate-900')}>{room.roomNumber}</span>
                              </div>
                              <span className={cn(
                                "text-[7px] md:text-[8px] font-black px-1 md:px-1.5 py-0.5 rounded tracking-tighter uppercase",
                                room.status === 'dirty' ? "bg-rose-100 text-rose-700 border border-rose-200" : 
                                room.status === 'cleaning' ? "bg-white/20 text-white" :
                                room.status === 'checking' ? "bg-amber-100 text-amber-700 border border-amber-200" :
                                "bg-white/20 text-white"
                              )}>
                                {room.status === 'dirty' ? '未着手' : 
                                 room.status === 'cleaning' ? '中' :
                                 room.status === 'checking' ? '確認' : '完了'}
                              </span>
                            </motion.button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Staff status */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-black tracking-widest flex items-center gap-2">
                        <UserCircle2 size={16} className="text-slate-400" />
                        スタッフ稼働状況
                      </h3>
                      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                        {staff.filter(s => s.role === 'cleaner').map(s => {
                          const assignedRoom = rooms.find(r => r.assignedStaffId === s.id && r.status !== 'clean');
                          return (
                            <div key={s.id} className="p-2.5 md:p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                              <div className="flex items-center gap-4">
                                <div className={cn(
                                  "w-10 h-10 rounded-md flex items-center justify-center font-black text-xs border",
                                  assignedRoom ? "bg-blue-50 border-blue-100 text-blue-600" : "bg-slate-50 border-slate-100 text-slate-400"
                                )}>
                                  {s.id.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-sm font-black text-slate-900">{s.name}</p>
                                  <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">
                                    {assignedRoom ? `${assignedRoom.roomNumber}号室を清掃中` : '待機中'}
                                  </p>
                                </div>
                              </div>
                              {assignedRoom ? (
                                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-200" />
                              ) : (
                                <div className="w-2.5 h-2.5 bg-slate-200 rounded-full" />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-slate-400"><span className="bg-[#F8F9FA] px-4">2. 破損・忘れ物 報告</span></div>
                </div>

                {/* 2. Reports Section Detail */}
                <div id="section-reports" className="space-y-6 scroll-mt-12">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <h3 className="text-sm font-black tracking-widest flex items-center gap-2">
                      <AlertTriangle size={16} className="text-slate-400" />
                      破損・忘れ物 報告状況
                    </h3>
                    {reports.length > 0 && (
                      <div className="flex items-center gap-2">
                        {isClearingAllReports ? (
                          <div className="flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-100 transition-all">
                            <span className="text-[10px] font-black text-rose-700">すべて消去しますか？</span>
                            <button
                              onClick={async () => {
                                await onDeleteAllReports();
                                setIsClearingAllReports(false);
                              }}
                              className="px-2 py-1 bg-rose-600 text-white text-[9px] font-black rounded hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                            >
                              はい
                            </button>
                            <button
                              onClick={() => setIsClearingAllReports(false)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 text-[9px] font-black rounded hover:bg-slate-300 transition-colors cursor-pointer"
                            >
                              キャンセル
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setIsClearingAllReports(true)}
                            className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-[10px] font-black tracking-widest flex items-center gap-1.5 transition-all shadow-sm uppercase cursor-pointer"
                            id="delete-all-reports-dashboard"
                          >
                            <Trash2 size={12} />
                            報告履歴を一掃
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {reports.length === 0 ? (
                      <div className="col-span-full py-16 text-center bg-white rounded-lg border border-slate-200">
                        <div className="w-12 h-12 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-4 border border-slate-100">
                          <CheckCircle2 size={24} className="text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-black tracking-widest text-[10px] uppercase">現在、報告事項はありません</p>
                      </div>
                    ) : (
                      reports.map(report => (
                        <div
                          key={report.id}
                          className={cn(
                            "bg-white rounded-lg border overflow-hidden flex flex-col shadow-sm transition-all",
                            report.status === 'pending' ? "border-rose-200" : "border-slate-200 opacity-60"
                          )}
                        >
                          <div className="p-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-1.5 h-4 rounded-sm",
                                report.type === 'issue' ? "bg-rose-600" : "bg-amber-600"
                              )} />
                              <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{report.roomNumber}号室</span>
                            </div>
                            <div className="flex items-center gap-3">
                              {deletingReportId === report.id ? (
                                <div className="flex items-center gap-1.5 bg-rose-50/80 px-2 py-1 rounded border border-rose-100 transition-all duration-300">
                                  <span className="text-[9px] font-black text-rose-700 select-none">削除?</span>
                                  <button
                                    onClick={() => {
                                      onDeleteReport(report.id);
                                      setDeletingReportId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded hover:bg-rose-700 transition-colors cursor-pointer"
                                  >
                                    はい
                                  </button>
                                  <button
                                    onClick={() => setDeletingReportId(null)}
                                    className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-black rounded hover:bg-slate-300 transition-colors cursor-pointer"
                                  >
                                    いいえ
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                                    {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleTimeString() : '---'}
                                  </span>
                                  <button
                                    onClick={() => setDeletingReportId(report.id)}
                                    className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                                    title="この報告を完全に削除"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="p-3 md:p-4 flex flex-row gap-3 md:gap-4">
                            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                              {report.imageUrl ? (
                                <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <Package size={16} className="text-slate-300" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="mb-1 flex items-center gap-2">
                                <span className={cn(
                                  "text-[8px] md:text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded border capitalize",
                                  report.type === 'issue' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                )}>
                                  {report.type === 'issue' ? '設備破損・不備' : '忘れ物'}
                                </span>
                              </div>
                              <p className="text-[11px] md:text-xs font-medium text-slate-700 bg-slate-50 p-2 rounded border border-slate-100 line-clamp-3">
                                {report.description || '詳細説明なし'}
                              </p>
                            </div>
                          </div>
                          {report.status === 'pending' && (
                            <div className="px-4 py-3 bg-white border-t border-slate-50">
                              <button
                                onClick={() => onResolveReport(report.id)}
                                className="w-full bg-slate-900 text-white py-2.5 rounded font-black text-[10px] tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase"
                              >
                                <CheckCircle2 size={12} />
                                完了としてマーク
                              </button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Visual Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-slate-400"><span className="bg-[#F8F9FA] px-4">3. 客室マスター割当</span></div>
                </div>

                {/* 3. Rooms Master Section Detail */}
                <div id="section-rooms" className="space-y-6 scroll-mt-12">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black tracking-widest flex items-center gap-1.5">
                      <Settings size={16} className="text-slate-400" />
                      客室清掃アサイン状況
                    </h3>
                    <button 
                      onClick={() => setIsAddRoomModalOpen(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-[10px] font-black tracking-widest flex items-center gap-1.5 hover:bg-blue-700 transition-all shadow-sm uppercase"
                    >
                      <PlusCircle size={12} />
                      部屋を追加
                    </button>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    {/* Desktop View */}
                    <div className="hidden lg:block overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200">
                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">部屋番号</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">タイプ</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">清掃担当者</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ステータス</th>
                            <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">操作</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {rooms.map(room => (
                            <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="px-8 py-4 font-black text-base text-slate-900">{room.roomNumber}</td>
                              <td className="px-8 py-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.roomType || 'スタンダード'}</span>
                              </td>
                              <td className="px-8 py-4">
                                 <select 
                                   value={room.assignedStaffId || ''} 
                                   onChange={(e) => {
                                     const s = staff.find(st => st.id === e.target.value);
                                     onUpdateRoom(room.id, { 
                                       assignedStaffId: e.target.value || null,
                                       assignedStaffName: s ? s.name : null
                                     });
                                   }}
                                   className="bg-white border border-slate-200 rounded text-[10px] font-black tracking-widest px-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                                 >
                                   <option value="">未割当</option>
                                   {staff.filter(s => s.role === 'cleaner').map(s => (
                                     <option key={s.id} value={s.id}>{s.name}</option>
                                   ))}
                                 </select>
                              </td>
                              <td className="px-8 py-4">
                                 <span className={cn(
                                   "px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider",
                                   getStatusColor(room.status)
                                 )}>
                                   {room.status === 'dirty' ? '未清掃' : 
                                    room.status === 'cleaning' ? '清掃中' :
                                    room.status === 'checking' ? '確認中' : '完了'}
                                 </span>
                              </td>
                              <td className="px-8 py-4 text-slate-300">
                                {deletingRoomId === room.id ? (
                                  <div className="flex items-center gap-1">
                                    <button 
                                      onClick={() => {
                                        onDeleteRoom(room.id);
                                        setDeletingRoomId(null);
                                      }}
                                      className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black rounded transition-colors cursor-pointer"
                                    >
                                      削除
                                    </button>
                                    <button 
                                      onClick={() => setDeletingRoomId(null)}
                                      className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-black rounded transition-colors cursor-pointer"
                                    >
                                      ✖
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    onClick={() => setDeletingRoomId(room.id)}
                                    className="p-1.5 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                    title="客室を完全に削除"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile View */}
                    <div className="lg:hidden divide-y divide-slate-100">
                      {rooms.map(room => (
                        <div key={room.id} className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-black text-slate-900">{room.roomNumber}号室</span>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{room.roomType || 'スタンダード'}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider",
                                getStatusColor(room.status)
                              )}>
                                {room.status === 'dirty' ? '未清掃' : 
                                 room.status === 'cleaning' ? '清掃中' :
                                 room.status === 'checking' ? '確認中' : '完了'}
                              </span>
                              {deletingRoomId === room.id ? (
                                <div className="flex items-center gap-1">
                                  <button 
                                    onClick={() => {
                                      onDeleteRoom(room.id);
                                      setDeletingRoomId(null);
                                    }}
                                    className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded transition-colors cursor-pointer"
                                  >
                                    削除
                                  </button>
                                  <button 
                                    onClick={() => setDeletingRoomId(null)}
                                    className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-black rounded transition-colors cursor-pointer"
                                  >
                                    ✖
                                  </button>
                                </div>
                              ) : (
                                <button 
                                  onClick={() => setDeletingRoomId(room.id)}
                                  className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer"
                                  title="客室を完全に削除"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          <div>
                            <select 
                               value={room.assignedStaffId || ''} 
                               onChange={(e) => {
                                 const s = staff.find(st => st.id === e.target.value);
                                 onUpdateRoom(room.id, { 
                                   assignedStaffId: e.target.value || null,
                                   assignedStaffName: s ? s.name : null
                                 });
                               }}
                               className="w-full bg-slate-50 border border-slate-200 rounded text-[10px] font-black tracking-widest px-3 py-2 outline-none text-slate-700 font-bold"
                             >
                               <option value="">未割当</option>
                               {staff.filter(s => s.role === 'cleaner').map(s => (
                                 <option key={s.id} value={s.id}>{s.name}</option>
                               ))}
                            </select>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Visual Divider */}
                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                  <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest text-slate-400"><span className="bg-[#F8F9FA] px-4">4. 清掃規定チェックリスト</span></div>
                </div>

                {/* 4. Configuration Checklists Detail */}
                <div id="section-config" className="space-y-6 scroll-mt-12">
                  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                    <div className="p-4 lg:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-black uppercase tracking-widest">現在適用されている清掃基準項目</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">すべての客室に共通して適用される清掃基準</p>
                      </div>
                      <div className="flex gap-2 w-full sm:w-auto">
                        <input 
                          type="text" 
                          value={dashChecklistLabel}
                          onChange={(e) => setDashChecklistLabel(e.target.value)}
                          placeholder="基準・項目を追加..."
                          className="bg-slate-50 border border-slate-200 rounded px-3 py-1.5 text-xs font-bold w-full sm:w-48 focus:bg-white transition-all outline-none"
                        />
                        <button 
                          onClick={() => {
                            if (dashChecklistLabel) {
                              onAddChecklist(dashChecklistLabel);
                              setDashChecklistLabel('');
                            }
                          }}
                          className="bg-slate-900 text-white px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all whitespace-nowrap"
                        >
                          追加
                        </button>
                      </div>
                    </div>
                    
                    <div className="divide-y divide-slate-100">
                      {checklistItems.map((item, index) => (
                        <div key={item.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-4">
                            <span className="text-slate-300 font-black font-display text-xs lg:text-sm">{String(index + 1).padStart(2, '0')}</span>
                            <div>
                              <p className="text-xs font-bold text-slate-700">{item.label}</p>
                              <div className="flex items-center gap-3 mt-1.5">
                                <label className="flex items-center gap-1.5 cursor-pointer group">
                                  <input 
                                    type="checkbox" 
                                    checked={item.isRequired}
                                    onChange={(e) => onUpdateChecklist(item.id, { isRequired: e.target.checked })}
                                    className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                  />
                                  <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">必須項目</span>
                                </label>
                              </div>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => onDeleteChecklist(item.id)}
                            className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div
                key="reports"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex gap-2">
                    <button className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest shadow-lg shadow-slate-200 transition-all">すべての通知</button>
                    <button className="bg-white text-slate-400 px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest border border-slate-100 hover:text-slate-600 transition-all">未対応のみ</button>
                  </div>
                  {reports.length > 0 && (
                    <div className="flex items-center gap-2">
                      {isClearingAllReports ? (
                        <div className="flex items-center gap-1.5 bg-rose-50 px-4 py-2 rounded-xl border border-rose-100 transition-all">
                          <span className="text-[10px] font-black text-rose-700">すべて消去しますか？</span>
                          <button
                            onClick={async () => {
                              await onDeleteAllReports();
                              setIsClearingAllReports(false);
                            }}
                            className="px-2.5 py-1 bg-rose-600 text-white text-[9px] font-black rounded hover:bg-rose-700 transition-colors shadow-sm cursor-pointer"
                          >
                            はい
                          </button>
                          <button
                            onClick={() => setIsClearingAllReports(false)}
                            className="px-2.5 py-1 bg-slate-200 text-slate-700 text-[9px] font-black rounded hover:bg-slate-300 transition-colors cursor-pointer"
                          >
                            キャンセル
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsClearingAllReports(true)}
                          className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-[10px] font-black tracking-widest flex items-center gap-1.5 transition-all shadow-md uppercase cursor-pointer"
                          id="delete-all-reports-tab"
                        >
                          <Trash2 size={12} />
                          報告履歴を一掃
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {reports.length === 0 ? (
                    <div className="col-span-full py-24 text-center bg-white rounded-lg border border-slate-200">
                      <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <CheckCircle2 size={32} className="text-slate-200" />
                      </div>
                      <p className="text-slate-400 font-black tracking-widest text-xs uppercase">現在、報告事項はありません</p>
                    </div>
                  ) : (
                    reports.map(report => (
                      <motion.div
                        key={report.id}
                        layout
                        className={cn(
                          "bg-white rounded-lg border overflow-hidden flex flex-col shadow-sm transition-all",
                          report.status === 'pending' ? "border-rose-200" : "border-slate-200 opacity-60"
                        )}
                      >
                        <div className="p-4 bg-slate-50/50 flex items-center justify-between border-b border-slate-100">
                          <div className="flex items-center gap-3">
                             <div className={cn(
                               "w-1.5 h-4 rounded-sm",
                               report.type === 'issue' ? "bg-rose-600" : "bg-amber-600"
                             )} />
                             <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{report.roomNumber}号室</span>
                          </div>
                          <div className="flex items-center gap-3">
                            {deletingReportId === report.id ? (
                              <div className="flex items-center gap-1.5 bg-rose-50/80 px-2 py-1 rounded border border-rose-100 transition-all duration-300">
                                <span className="text-[9px] font-black text-rose-700 select-none">削除?</span>
                                <button
                                  onClick={() => {
                                    onDeleteReport(report.id);
                                    setDeletingReportId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white text-[9px] font-black rounded hover:bg-rose-700 transition-colors cursor-pointer"
                                >
                                  はい
                                </button>
                                <button
                                  onClick={() => setDeletingReportId(null)}
                                  className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[9px] font-black rounded hover:bg-slate-300 transition-colors cursor-pointer"
                                >
                                  いいえ
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="text-[10px] text-slate-400 font-bold tracking-tight">
                                  {report.createdAt?.toDate ? report.createdAt.toDate().toLocaleTimeString() : '---'}
                                </span>
                                <button
                                  onClick={() => setDeletingReportId(report.id)}
                                  className="text-slate-300 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition-all cursor-pointer"
                                  title="この報告を完全に削除"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="p-3 md:p-6 flex flex-row gap-3 md:gap-6">
                          <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-md flex-shrink-0 flex items-center justify-center overflow-hidden border border-slate-200">
                            {report.imageUrl ? (
                              <img src={report.imageUrl} alt="Report" className="w-full h-full object-cover" />
                            ) : (
                              <Package size={20} className="text-slate-300" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="mb-1.5 flex items-center gap-2">
                               <span className={cn(
                                 "text-[9px] md:text-[10px] font-black tracking-widest px-2 py-0.5 rounded border capitalize",
                                 report.type === 'issue' ? "bg-rose-50 text-rose-700 border-rose-100" : "bg-amber-50 text-amber-700 border-amber-100"
                               )}>
                                 {report.type === 'issue' ? '設備破損・不備' : '忘れ物'}
                               </span>
                            </div>
                            <p className="text-[11px] md:text-sm font-medium text-slate-700 leading-relaxed bg-slate-50 p-2.5 md:p-4 rounded border border-slate-100 line-clamp-3">
                              {report.description || '詳細説明なし'}
                            </p>
                          </div>
                        </div>
                        {report.status === 'pending' && (
                          <div className="px-6 py-4 bg-white border-t border-slate-50">
                            <button
                              onClick={() => onResolveReport(report.id)}
                              className="w-full bg-slate-900 text-white py-3 rounded font-black text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2 uppercase"
                            >
                              <CheckCircle2 size={14} />
                              完了としてマーク
                            </button>
                          </div>
                        )}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'rooms' && (
              <motion.div
                key="rooms"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black tracking-widest">客室管理・清掃割当</h3>
                  <button 
                    onClick={() => setIsAddRoomModalOpen(true)}
                    className="bg-blue-600 text-white px-5 py-2.5 rounded-md text-[10px] font-black tracking-widest flex items-center gap-2 hover:bg-blue-700 transition-all shadow-sm uppercase"
                  >
                    <PlusCircle size={14} />
                    部屋を追加
                  </button>
                </div>

                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200">
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">部屋番号</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">タイプ</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">清掃担当者</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">ステータス</th>
                          <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">操作</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {rooms.map(room => (
                          <tr key={room.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-5 font-black text-lg text-slate-900">{room.roomNumber}</td>
                            <td className="px-8 py-5">
                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.roomType || 'スタンダード'}</span>
                            </td>
                            <td className="px-8 py-5">
                               <select 
                                 value={room.assignedStaffId || ''} 
                                 onChange={(e) => {
                                   const s = staff.find(st => st.id === e.target.value);
                                   onUpdateRoom(room.id, { 
                                     assignedStaffId: e.target.value || null,
                                     assignedStaffName: s ? s.name : null
                                   });
                                 }}
                                 className="bg-white border border-slate-200 rounded text-[10px] font-black tracking-widest px-4 py-2 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                               >
                                 <option value="">未割当</option>
                                 {staff.filter(s => s.role === 'cleaner').map(s => (
                                   <option key={s.id} value={s.id}>{s.name}</option>
                                 ))}
                               </select>
                            </td>
                            <td className="px-8 py-5">
                               <span className={cn(
                                 "px-2.5 py-0.5 rounded text-[9px] font-black border uppercase tracking-wider",
                                 getStatusColor(room.status)
                               )}>
                                 {room.status === 'dirty' ? '未清掃' : 
                                  room.status === 'cleaning' ? '清掃中' :
                                  room.status === 'checking' ? '確認中' : '完了'}
                               </span>
                            </td>
                            <td className="px-8 py-6 text-slate-300">
                               {deletingRoomId === room.id ? (
                                 <div className="flex items-center gap-1">
                                   <button 
                                     onClick={() => {
                                       onDeleteRoom(room.id);
                                       setDeletingRoomId(null);
                                     }}
                                     className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white text-[9px] font-black rounded cursor-pointer"
                                   >
                                     削除
                                   </button>
                                   <button 
                                     onClick={() => setDeletingRoomId(null)}
                                     className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-[9px] font-black rounded cursor-pointer"
                                   >
                                     ✖
                                   </button>
                                 </div>
                               ) : (
                                 <button 
                                   onClick={() => setDeletingRoomId(room.id)}
                                   className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                   title="客室を完全に削除"
                                 >
                                   <Trash2 size={18} />
                                 </button>
                               )}
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>

                   {/* Mobile Card View */}
                   <div className="lg:hidden divide-y divide-slate-100">
                     {rooms.map(room => (
                       <div key={room.id} className="p-3 flex items-center justify-between gap-2">
                         <div className="flex items-center gap-2">
                           <span className="text-sm font-black text-slate-900">{room.roomNumber}</span>
                           <span className={cn(
                             "px-1.5 py-0.5 rounded text-[8px] font-black border uppercase tracking-wider",
                             getStatusColor(room.status)
                           )}>
                             {room.status === 'dirty' ? '未' : 
                              room.status === 'cleaning' ? '中' :
                              room.status === 'checking' ? '確認' : '完了'}
                           </span>
                         </div>
                         <div className="flex items-center gap-2">
                           <select 
                              value={room.assignedStaffId || ''} 
                              onChange={(e) => {
                                const s = staff.find(st => st.id === e.target.value);
                                onUpdateRoom(room.id, { 
                                  assignedStaffId: e.target.value || null,
                                  assignedStaffName: s ? s.name : null
                                });
                              }}
                              className="bg-slate-50 border border-slate-200 rounded text-[10px] font-black px-2 py-1 outline-none text-slate-700 font-bold w-28 text-center"
                            >
                              <option value="">未割当</option>
                              {staff.filter(s => s.role === 'cleaner').map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                              ))}
                            </select>
                            {deletingRoomId === room.id ? (
                             <div className="flex items-center gap-1">
                               <button 
                                 onClick={() => {
                                   onDeleteRoom(room.id);
                                   setDeletingRoomId(null);
                                 }}
                                 className="px-2 py-1 bg-rose-600 text-white text-[9px] font-black rounded cursor-pointer"
                               >
                                 削除
                               </button>
                               <button 
                                 onClick={() => setDeletingRoomId(null)}
                                 className="px-2 py-1 bg-slate-200 text-slate-700 text-[9px] font-black rounded cursor-pointer"
                               >
                                 ✖
                               </button>
                             </div>
                           ) : (
                             <button 
                               onClick={() => setDeletingRoomId(room.id)}
                               className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors cursor-pointer"
                               title="客室を完全に削除"
                             >
                               <Trash2 size={13} />
                             </button>
                           )}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               </motion.div>
             )}
             {activeTab === 'config' && (
              <motion.div
                key="config"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                  <div className="p-4 lg:p-8 border-b border-slate-100 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base lg:text-lg font-black uppercase tracking-widest">清掃チェックリスト規定</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        すべての客室で共通して適用される清掃項目
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 w-full lg:w-auto">
                       <input 
                         type="text" 
                         value={newChecklistLabel}
                         onChange={(e) => setNewChecklistLabel(e.target.value)}
                         placeholder="項目を追加..."
                         className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-xs font-bold w-full sm:w-64 focus:bg-white transition-all outline-none"
                       />
                       <button 
                         onClick={() => {
                           if (newChecklistLabel) {
                             onAddChecklist(newChecklistLabel);
                             setNewChecklistLabel('');
                           }
                         }}
                         className="bg-slate-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all"
                       >
                         追加
                       </button>
                    </div>
                  </div>
                  
                  <div className="divide-y divide-slate-100">
                    {checklistItems.map((item, index) => (
                      <div key={item.id} className="p-4 lg:p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4 lg:gap-6">
                           <span className="text-slate-300 font-black font-display text-base lg:text-xl">{String(index + 1).padStart(2, '0')}</span>
                           <div>
                             <p className="text-sm font-black text-slate-900">{item.label}</p>
                             <div className="flex items-center gap-4 mt-1">
                               <label className="flex items-center gap-2 cursor-pointer group">
                                 <input 
                                   type="checkbox" 
                                   checked={item.isRequired}
                                   onChange={(e) => onUpdateChecklist(item.id, { isRequired: e.target.checked })}
                                   className="w-3 h-3 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                 />
                                 <span className="text-[9px] font-black text-slate-400 group-hover:text-slate-600 uppercase tracking-widest">必須項目</span>
                               </label>
                             </div>
                           </div>
                        </div>
                        <button 
                          onClick={() => onDeleteChecklist(item.id)}
                          className="p-2 text-slate-200 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-lg border border-slate-200 p-6 lg:p-8 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-6">客室タイプ設定</h3>
                    <div className="space-y-4">
                       {['スタンダード・ダブル', 'ツイン', 'スイート'].map(type => (
                         <div key={type} className="flex items-center justify-between p-4 bg-slate-50 rounded border border-slate-100">
                           <span className="text-xs font-black text-slate-700">{type}</span>
                           <span className="text-[9px] font-black text-blue-600 px-2 py-0.5 bg-blue-50 rounded border border-blue-100">有効</span>
                         </div>
                       ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-slate-200 p-6 lg:p-8 shadow-sm">
                    <h3 className="text-sm font-black uppercase tracking-widest mb-4">データベース完全初期化</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6 leading-relaxed">
                      登録されているすべての客室、不備・忘れ物報告をデータベースから完全に消去し、クリアな状態（客室0件）にします。この操作により、すべての部屋を完全に手動で自由に追加・管理できるようになります。
                    </p>
                    <button
                      onClick={async () => {
                        if (resetConfirm) {
                          try {
                            await onResetAndSeed();
                          } catch (e) {
                            console.error(e);
                          } finally {
                            setResetConfirm(false);
                          }
                        } else {
                          setResetConfirm(true);
                        }
                      }}
                      className={cn(
                        "w-full flex items-center justify-center gap-2 font-black text-[10px] uppercase tracking-widest py-3.5 rounded-lg transition-all shadow-sm cursor-pointer",
                        resetConfirm ? "bg-rose-600 hover:bg-rose-700 text-white animate-pulse" : "bg-slate-900 hover:bg-black text-white"
                      )}
                    >
                      <RefreshCw size={14} className={cn("animate-spin-slow-once", resetConfirm && "animate-spin")} />
                      {resetConfirm ? "本当にすべての客室と報告を完全消去しますか？（実行）" : "すべての客室・報告データを完全消去して初期化"}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Add Room Modal */}
      {isAddRoomModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          onClick={() => setIsAddRoomModalOpen(false)}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white w-full max-w-md rounded-lg p-6 lg:p-10 shadow-2xl border border-slate-200"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-black uppercase tracking-widest">部屋を追加</h3>
              <button 
                onClick={() => setIsAddRoomModalOpen(false)}
                className="bg-slate-100 p-2 rounded hover:bg-slate-200 text-slate-500 transition-colors"
                id="close-add-room-btn"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">部屋番号</label>
                <input
                  id="new-room-number-input"
                  type="text"
                  value={newRoomNumber}
                  onChange={(e) => setNewRoomNumber(e.target.value)}
                  placeholder="例: 101"
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded p-4 transition-all font-black text-lg outline-none"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">部屋タイプ</label>
                <select 
                  value={newRoomType}
                  onChange={(e) => setNewRoomType(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-slate-800 rounded p-4 transition-all font-black text-lg outline-none appearance-none"
                >
                  <option>スタンダード・ダブル</option>
                  <option>ツイン</option>
                  <option>スイート</option>
                </select>
              </div>

              <button
                id="confirm-add-room-btn"
                onClick={() => {
                  if (newRoomNumber) {
                    onAddRoom(newRoomNumber, newRoomType);
                    setNewRoomNumber('');
                    setIsAddRoomModalOpen(false);
                  }
                }}
                className="w-full bg-slate-900 text-white py-4 rounded font-black text-sm uppercase tracking-widest shadow-lg hover:bg-black transition-all active:scale-[0.98] mt-4"
              >
                新規登録
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Floating Detail Panel (Mobile/Small Desktop) */}
      <AnimatePresence>
        {selectedRoomId && activeTab === 'dashboard' && (
          <div 
            className="fixed inset-0 z-[60] flex justify-end bg-slate-900/20 backdrop-blur-[2px]"
            onClick={() => setSelectedRoomId(null)}
          >
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-sm h-full shadow-2xl border-l border-slate-200 flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-xl font-black">部屋詳細</h3>
                <button 
                  onClick={() => setSelectedRoomId(null)}
                  className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                  id="close-detail-panel-btn"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {rooms.filter(r => r.id === selectedRoomId).map(room => (
                  <div key={room.id} className="space-y-6">
                    <div className="text-center">
                       <h4 className="text-5xl font-black text-slate-900 mb-2">{room.roomNumber}</h4>
                       <span className={cn(
                         "px-3 py-1 rounded text-[10px] font-black border uppercase tracking-widest",
                         getStatusColor(room.status)
                       )}>
                         {room.status === 'dirty' ? '未清掃' : room.status === 'cleaning' ? '清掃中' : room.status === 'checking' ? '確認中' : '完了'}
                       </span>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-slate-50 p-4 rounded border border-slate-200">
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">現在の担当スタッフ</p>
                         <p className="font-bold text-slate-700">{room.assignedStaffName || '未割当'}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded border border-slate-200">
                         <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">最終更新日時</p>
                         <p className="font-bold text-slate-700">{room.updatedAt?.toDate ? room.updatedAt.toDate().toLocaleString() : '---'}</p>
                      </div>
                      
                      {room.maintenanceNote && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded">
                           <div className="flex items-center gap-2 mb-1">
                             <Wrench size={14} className="text-amber-600" />
                             <p className="text-[10px] text-amber-600 font-black uppercase tracking-widest">備品交換・メンテ記録</p>
                           </div>
                           <p className="text-sm font-medium text-amber-900 leading-relaxed">{room.maintenanceNote}</p>
                           {room.lastMaintenanceDate && (
                             <p className="text-[9px] text-amber-400 font-bold mt-2">
                               最終メンテナンス: {room.lastMaintenanceDate.toDate().toLocaleDateString()}
                             </p>
                           )}
                        </div>
                      )}
                    </div>

                    <div className="pt-4 space-y-3">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">ステータスを手動で変更</p>
                       <div className="grid grid-cols-2 gap-2">
                          {(['dirty', 'cleaning', 'checking', 'clean'] as RoomStatus[]).map(status => (
                            <button
                              key={status}
                              onClick={() => onUpdateRoom(room.id, { status })}
                              className={cn(
                                "py-2.5 rounded text-[10px] font-black transition-all border uppercase tracking-widest",
                                room.status === status ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 hover:border-slate-400 text-slate-400"
                              )}
                            >
                              {status === 'dirty' ? '未清掃' : status === 'cleaning' ? '清掃中' : status === 'checking' ? '確認中' : '完了'}
                            </button>
                          ))}
                       </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
