import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, 
  CheckCircle2, 
  ClipboardCheck, 
  AlertCircle, 
  LogOut, 
  ChevronRight,
  Clock,
  MapPin,
  RefreshCw,
  X,
  Wrench,
  Save
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import type { Room, RoomStatus, ReportType, Report, ChecklistItem } from '@/src/types';

interface CleanerUIProps {
  rooms: Room[];
  reports: Report[];
  checklistItems: ChecklistItem[];
  onUpdateStatus: (roomId: string, status: RoomStatus) => void;
  onReport: (roomId: string, type: ReportType, description: string, image?: string) => void;
  onSaveMaintenance: (roomId: string, note: string) => void;
  staffName: string;
  onLogout: () => void;
}

export default function CleanerUI({ 
  rooms, 
  reports,
  checklistItems, 
  onUpdateStatus, 
  onReport, 
  onSaveMaintenance, 
  staffName, 
  onLogout 
}: CleanerUIProps) {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isReporting, setIsReporting] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('issue');
  const [description, setDescription] = useState('');
  const [maintenanceNote, setMaintenanceNote] = useState('');
  
  // Camera State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const myRooms = rooms.filter(r => r.assignedStaffName === staffName || !r.assignedStaffId);

  useEffect(() => {
    if (selectedRoom) {
      setMaintenanceNote(selectedRoom.maintenanceNote || '');
      setCheckedItems({}); // Reset checklist when room is selected
    }
  }, [selectedRoom]);

  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      alert("カメラを起動できませんでした。ブラウザの設定を確認してください。");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleStatusChange = (roomId: string, currentStatus: RoomStatus) => {
    // Transition directly to clean as requested
    const nextStatus: RoomStatus = 'clean';
    
    onUpdateStatus(roomId, nextStatus);
    setSelectedRoom(null);
  };

  const getStatusColor = (status: RoomStatus) => {
    switch (status) {
      case 'dirty': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'cleaning': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'checking': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'clean': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  const getStatusLabel = (status: RoomStatus) => {
    switch (status) {
      case 'dirty': return '未清掃';
      case 'cleaning': return '清掃中';
      case 'checking': return '確認中';
      case 'clean': return '完了';
    }
  };

  return (
    <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-5 flex items-center justify-between sticky top-0 z-10 shrink-0">
        <div className="flex items-center gap-3">
          <motion.button 
            whileTap={{ scale: 0.95 }}
            onClick={onLogout}
            className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-black uppercase tracking-widest border border-slate-100 rounded-md mr-2"
          >
            <LogOut size={14} />
            戻る
          </motion.button>
          <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-sm uppercase">
            {staffName === 'スタッフA' ? 'A' : staffName === 'スタッフB' ? 'B' : (staffName.replace('スタッフ', '').trim() || 'ス')}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
              <span className="text-[10px] font-bold text-slate-400 tracking-widest">清掃スタッフモード</span>
            </div>
            <h1 className="text-sm font-black text-slate-900 leading-none font-display">{staffName}</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">
        <AnimatePresence mode="wait">
          {!selectedRoom ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-black text-slate-900">担当・未割当の部屋</h2>
                <div className="text-[10px] px-2 py-1 bg-slate-100 text-slate-500 rounded font-bold">
                  合計: {myRooms.length}件
                </div>
              </div>

              {myRooms.length === 0 ? (
                <div className="bg-slate-50 rounded-lg p-12 text-center border-2 border-dashed border-slate-200">
                  <CheckCircle2 size={48} className="mx-auto text-slate-200 mb-4" />
                  <p className="text-slate-400 font-bold text-xs">現在担当する部屋はありません</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myRooms.map((room, index) => (
                    <motion.button
                      key={room.id}
                      id={`room-${room.roomNumber}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedRoom(room)}
                      className="w-full bg-white rounded-lg p-5 flex items-center justify-between border border-slate-200 shadow-sm transition-all text-left hover:border-slate-300"
                    >
                      <div className="flex items-center gap-5">
                        <div className={cn(
                          "w-14 h-14 rounded-md flex items-center justify-center font-black text-xl border-2 transition-all",
                          getStatusColor(room.status)
                        )}>
                          {room.roomNumber}
                        </div>
                        <div>
                          <span className={cn(
                            "text-[10px] font-black px-2 py-0.5 rounded border mb-1 block w-fit",
                            getStatusColor(room.status)
                          )}>
                            {getStatusLabel(room.status)}
                          </span>
                          <div className="flex items-center gap-2">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{room.roomType || 'スタンダード'}</span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-slate-300" />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-20"
            >
              <button 
                onClick={() => setSelectedRoom(null)}
                className="text-slate-400 text-xs font-black flex items-center gap-1 mb-2 hover:text-slate-600"
              >
                <ChevronRight size={14} className="rotate-180" />
                リストに戻る
              </button>

              <div className="bg-white rounded-lg p-8 border border-slate-200 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight font-display">{selectedRoom.roomNumber} <span className="text-slate-300 font-normal">号室</span></h2>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">{selectedRoom.roomType || 'スタンダード・ダブル'}</p>
                    </div>
                    <span className={cn(
                      "px-3 py-1 rounded text-xs font-black border",
                      getStatusColor(selectedRoom.status)
                    )}>
                      {getStatusLabel(selectedRoom.status)}
                    </span>
                  </div>
                
                <div className="bg-slate-50 border border-slate-100 rounded-md p-5 mb-8">
                  <p className="text-slate-400 text-[10px] font-black mb-1">現在の進行状況</p>
                  <p className="text-2xl font-black text-slate-900">{getStatusLabel(selectedRoom.status)}</p>
                </div>

                {selectedRoom.status !== 'clean' && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    id="status-action-btn"
                    onClick={() => handleStatusChange(selectedRoom.id, selectedRoom.status)}
                    className="w-full py-6 rounded-lg font-black text-xl flex flex-col items-center justify-center gap-1 transition-all text-white bg-emerald-600 shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                  >
                    <span className="text-2xl">清掃を完了にする</span>
                  </motion.button>
                )}
              </div>

              {/* Maintenance Note Section */}
              <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-sm font-black flex items-center gap-2">
                     <Wrench size={16} className="text-slate-400" />
                     備品交換・メンテ記録
                   </h3>
                   <button 
                    onClick={() => onSaveMaintenance(selectedRoom.id, maintenanceNote)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                   >
                     <Save size={20} />
                   </button>
                </div>
                <textarea
                  value={maintenanceNote}
                  onChange={(e) => setMaintenanceNote(e.target.value)}
                  placeholder="例：シャンプー補充、電球交換(2024/05/17)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-4 text-sm font-bold min-h-[100px] outline-none focus:bg-white focus:ring-1 focus:ring-blue-200 transition-all font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsReporting(true); setReportType('issue'); setCapturedImage(null); }}
                  className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col items-center justify-center gap-3 shadow-sm transition-all group hover:border-rose-300"
                >
                  <div className="w-12 h-12 bg-rose-50 rounded-md flex items-center justify-center text-rose-500 group-hover:scale-105 transition-transform relative">
                    <AlertCircle size={24} />
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 border border-rose-100">
                      <Camera size={14} />
                    </div>
                  </div>
                  <span className="font-black text-[11px] text-slate-900 text-center uppercase tracking-tight">不備報告</span>
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { setIsReporting(true); setReportType('lost_item'); setCapturedImage(null); }}
                  className="bg-white border border-slate-200 p-6 rounded-lg flex flex-col items-center justify-center gap-3 shadow-sm transition-all group hover:border-amber-300"
                >
                  <div className="w-12 h-12 bg-amber-50 rounded-md flex items-center justify-center text-amber-500 group-hover:scale-105 transition-transform relative">
                    <Camera size={24} />
                  </div>
                  <span className="font-black text-[11px] text-slate-900 text-center uppercase tracking-tight">忘れ物報告</span>
                </motion.button>
              </div>

              {/* Existing Reports Section */}
              {reports.filter(r => r.roomId === selectedRoom.id && r.status === 'pending').length > 0 && (
                <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm overflow-hidden">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">現在の報告事項</h3>
                  <div className="space-y-4">
                    {reports.filter(r => r.roomId === selectedRoom.id && r.status === 'pending').map(report => (
                      <div key={report.id} className="flex gap-4 p-3 bg-slate-50 rounded border border-slate-100">
                        {report.imageUrl && (
                          <div className="w-16 h-16 rounded overflow-hidden flex-shrink-0 border border-slate-200">
                            <img src={report.imageUrl} className="w-full h-full object-cover" alt="Report" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-[8px] font-black px-1.5 py-0.5 rounded border uppercase",
                              report.type === 'issue' ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                            )}>
                              {report.type === 'issue' ? '不備' : '忘れ物'}
                            </span>
                          </div>
                          <p className="text-[11px] font-bold text-slate-700 line-clamp-2">{report.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-6 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 mb-4 font-black uppercase tracking-widest">規定清掃チェックリスト</p>
                <div className="space-y-2">
                  {checklistItems.map((item, index) => (
                    <motion.button 
                      key={item.id} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setCheckedItems(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className={cn(
                        "w-full flex items-center gap-3 p-4 bg-slate-50 border border-slate-100 rounded-md transition-all text-left group",
                        checkedItems[item.id] ? "bg-emerald-50/50 border-emerald-200" : "bg-slate-50 border-slate-100 hover:border-slate-300"
                      )}
                    >
                      <motion.div 
                        animate={checkedItems[item.id] ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                        className={cn(
                          "w-5 h-5 rounded border flex items-center justify-center transition-all",
                          checkedItems[item.id] ? "bg-emerald-600 border-emerald-600 text-white" : "bg-white border-slate-300 text-transparent"
                        )}
                      >
                        <CheckCircle2 size={12} strokeWidth={4} />
                      </motion.div>
                      <span className={cn(
                        "text-sm font-bold transition-all",
                        checkedItems[item.id] ? "text-slate-400 line-through" : "text-slate-900"
                      )}>
                        {item.label}
                        {item.isRequired && <span className="ml-2 text-[8px] font-black text-rose-500 bg-rose-50 px-1 border border-rose-100 rounded">必須</span>}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isReporting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-md flex items-end sm:items-center justify-center p-4"
            onClick={() => {
              setIsReporting(false);
              stopCamera();
            }}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full max-w-md rounded-t-xl sm:rounded-xl p-8 shadow-2xl overflow-hidden border-t sm:border border-slate-200"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-black text-slate-900">
                  {reportType === 'issue' ? '設備破損・不備報告' : '客室忘れ物報告'}
                </h3>
                <button 
                  onClick={() => {
                    setIsReporting(false);
                    stopCamera();
                  }} 
                  className="bg-slate-100 p-2 rounded-md text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                {!isCameraActive && !capturedImage && (
                  <button 
                    onClick={startCamera}
                    className="w-full aspect-video bg-slate-50 rounded-lg flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-200 hover:bg-slate-100 transition-colors"
                  >
                    <Camera size={40} className="text-slate-300" />
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">カメラを起動して撮影</p>
                  </button>
                )}

                {isCameraActive && (
                  <div className="relative aspect-video bg-black rounded-lg overflow-hidden group">
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-6 flex justify-center gap-4">
                      <button 
                        onClick={capturePhoto}
                        className="w-16 h-16 bg-white rounded-full border-4 border-slate-400 active:scale-90 transition-transform shadow-lg"
                      />
                    </div>
                  </div>
                )}

                {capturedImage && (
                  <div className="relative aspect-video rounded-lg overflow-hidden group border border-slate-200">
                    <img src={capturedImage} className="w-full h-full object-cover" alt="Captured" />
                    <button 
                      onClick={() => { setCapturedImage(null); startCamera(); }}
                      className="absolute top-4 right-4 bg-slate-900/80 p-2 rounded-md text-white backdrop-blur-sm hover:bg-slate-900 transition-colors"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>
                )}

                <canvas ref={canvasRef} className="hidden" />

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 px-1 uppercase tracking-widest">詳細内容</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="不備の内容を入力..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-slate-400 focus:bg-white rounded-lg p-5 text-slate-700 min-h-[120px] transition-all font-bold outline-none"
                  />
                </div>

                <button
                  id="submit-report-btn"
                  onClick={() => {
                    if (selectedRoom) {
                      onReport(selectedRoom.id, reportType, description, capturedImage || undefined);
                      setIsReporting(false);
                      setDescription('');
                      setCapturedImage(null);
                      stopCamera();
                    }
                  }}
                  className={cn(
                    "w-full py-5 rounded-lg font-black text-white shadow-lg transition-all active:scale-[0.99]",
                    reportType === 'issue' ? "bg-rose-600 shadow-rose-100 hover:bg-rose-700" : "bg-amber-600 shadow-amber-100 hover:bg-amber-700"
                  )}
                >
                  報告を送信する
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
