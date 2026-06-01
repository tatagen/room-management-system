/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutDashboard, User, ArrowRightLeft, Package } from 'lucide-react';
import { cn } from './lib/utils';
import CleanerUI from './components/CleanerUI';
import ManagerUI from './components/ManagerUI';
import type { Room, Staff, Report, RoomStatus, ReportType, ChecklistItem } from './types';
import { 
  collection, 
  onSnapshot, 
  updateDoc, 
  doc, 
  addDoc, 
  serverTimestamp,
  query,
  orderBy,
  setDoc,
  deleteDoc,
  getDoc,
  getDocs
} from 'firebase/firestore';
import { db } from './lib/firebase';

export default function App() {
  const [currentStaff, setCurrentStaff] = useState<Staff | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([
    { id: 'manager', name: 'メイン管理者', role: 'manager' },
    { id: 'cleaner-a', name: 'スタッフA', role: 'cleaner' },
    { id: 'cleaner-b', name: 'スタッフB', role: 'cleaner' },
  ]);
  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Seeding lock refs to prevent concurrent triggers in same mount session
  const isSeedingRooms = useRef(false);
  const isSeedingStaff = useRef(false);
  const isSeedingChecklist = useRef(false);

  // Loading Timeout Fallback to prevent white-screen freeze under offline/slow start conditions
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Subscribe to Rooms
  useEffect(() => {
    const q = query(collection(db, 'rooms'), orderBy('roomNumber', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Room[];
      setRooms(roomData);
      setLoading(false);
    }, (error) => {
      console.error("Error reading rooms:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Reports
  useEffect(() => {
    const q = query(collection(db, 'reports'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const reportData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Report[];
      setReports(reportData);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Staff and auto-seed if empty
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'staff'), (snapshot) => {
      if (snapshot.empty) {
        if (isSeedingStaff.current) {
          return;
        }
        isSeedingStaff.current = true;

        try {
          const initialStaff = [
            { id: 'manager', name: 'メイン管理者', role: 'manager' },
            { id: 'cleaner-a', name: 'スタッフA', role: 'cleaner' },
            { id: 'cleaner-b', name: 'スタッフB', role: 'cleaner' },
          ];
          
          initialStaff.forEach(s => {
            const { id, ...data } = s;
            setDoc(doc(db, 'staff', id), data).catch(err => console.error("Error seeding staff:", err));
          });
        } catch (error) {
          console.error("Error seeding staff list:", error);
        }
      } else {
        const staffData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Staff[];
        
        // Sort: Manager first, then cleaners by name ascending (A then B)
        const sortedStaff = staffData.sort((a, b) => {
          if (a.role === 'manager') return -1;
          if (b.role === 'manager') return 1;
          return a.name.localeCompare(b.name); // A comes before B
        });
        
        setStaffList(sortedStaff);
      }
    }, (error) => {
      console.error("Error subscribing to staff:", error);
    });
    return () => unsubscribe();
  }, []);

  // Subscribe to Checklist and auto-seed if empty
  useEffect(() => {
    let unmounted = false;
    const q = query(collection(db, 'checklist'), orderBy('order', 'asc'));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        if (isSeedingChecklist.current) {
          if (!unmounted) {
            setChecklistItems([]);
          }
          return;
        }
        isSeedingChecklist.current = true;

        try {
          const seed = [
            { label: 'シーツ交換', isRequired: true, order: 1 },
            { label: 'アメニティ補充', isRequired: true, order: 2 },
            { label: '浴室・トイレ清掃', isRequired: true, order: 3 },
          ];
          for (const item of seed) {
            await addDoc(collection(db, 'checklist'), item);
          }
        } catch (error) {
          console.error("Error seeding checklist:", error);
          if (!unmounted) {
            setChecklistItems([]);
          }
        }
      } else {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChecklistItem[];
        setChecklistItems(items);
      }
    });
    return () => {
      unmounted = true;
      unsubscribe();
    };
  }, []);


  // Master controller action to clear database and reset data to a clean slate
  const handleResetAndSeed = async () => {
    setLoading(true);
    try {
      // 1. Delete all rooms directly from Firestore query to avoid any stale cache
      const roomsSnapshot = await getDocs(collection(db, 'rooms'));
      const roomDeletePromises = roomsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(roomDeletePromises);

      // 2. Delete all checklist items directly from Firestore query
      const checklistSnapshot = await getDocs(collection(db, 'checklist'));
      const checklistDeletePromises = checklistSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(checklistDeletePromises);

      // 3. Delete all reports directly from Firestore query
      const reportsSnapshot = await getDocs(collection(db, 'reports'));
      const reportDeletePromises = reportsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(reportDeletePromises);

      const seed = [
        { label: 'シーツ交換', isRequired: true, order: 1 },
        { label: 'アメニティ補充', isRequired: true, order: 2 },
        { label: '浴室・トイレ清掃', isRequired: true, order: 3 },
      ];
      for (const item of seed) {
        await addDoc(collection(db, 'checklist'), item);
      }

      console.log("Database reset successfully. Rooms cleared.");
    } catch (error) {
      console.error("Error during reset:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRoom = async (roomId: string, updates: Partial<Room>) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  };

  const handleAddRoom = async (roomNumber: string, roomType?: string) => {
    await addDoc(collection(db, 'rooms'), {
      roomNumber,
      roomType: roomType || 'スタンダード',
      status: 'dirty',
      assignedStaffId: null,
      assignedStaffName: null,
      updatedAt: serverTimestamp()
    });
  };

  const handleDeleteRoom = async (roomId: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    await deleteDoc(roomRef);
  };

  const handleUpdateChecklistItem = async (id: string, updates: Partial<ChecklistItem>) => {
    const ref = doc(db, 'checklist', id);
    await updateDoc(ref, updates);
  };

  const handleAddChecklistItem = async (label: string) => {
    const order = checklistItems.length > 0 ? Math.max(...checklistItems.map(i => i.order)) + 1 : 1;
    await addDoc(collection(db, 'checklist'), {
      label,
      isRequired: true,
      order
    });
  };

  const handleDeleteChecklistItem = async (id: string) => {
    const ref = doc(db, 'checklist', id);
    await deleteDoc(ref);
  };

  const handleReport = async (roomId: string, type: ReportType, description: string, imageUrl?: string) => {
    if (!currentStaff) return;
    const room = rooms.find(r => r.id === roomId);
    await addDoc(collection(db, 'reports'), {
      roomId,
      roomNumber: room?.roomNumber || '?',
      staffId: currentStaff.id,
      staffName: currentStaff.name,
      type,
      description,
      imageUrl: imageUrl || '', 
      status: 'pending',
      createdAt: serverTimestamp()
    });
  };

  const handleSaveMaintenance = async (roomId: string, maintenanceNote: string) => {
    const roomRef = doc(db, 'rooms', roomId);
    await updateDoc(roomRef, {
      maintenanceNote,
      lastMaintenanceDate: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  };

  const handleResolveReport = async (reportId: string) => {
    const report = reports.find(r => r.id === reportId);
    const reportRef = doc(db, 'reports', reportId);
    if (report && report.type === 'lost_item') {
      await deleteDoc(reportRef);
    } else {
      await updateDoc(reportRef, {
        status: 'resolved',
        updatedAt: serverTimestamp()
      });
    }
  };

  const handleDeleteReport = async (reportId: string) => {
    try {
      const reportRef = doc(db, 'reports', reportId);
      await deleteDoc(reportRef);
      console.log("Report deleted successfully:", reportId);
    } catch (error) {
      console.error("Error deleting report:", error);
    }
  };

  const handleDeleteAllReports = async () => {
    setLoading(true);
    try {
      console.log("Bulk deleting all reports directly from Firestore...");
      const snapshot = await getDocs(collection(db, 'reports'));
      const promises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(promises);
      console.log("All reports deleted successfully.");
    } catch (e) {
      console.error("Error deleting all reports:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-10 h-10 border-2 border-slate-200 border-t-slate-900 rounded-full shadow-sm"
        />
      </div>
    );
  }

  if (!currentStaff) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
        {/* Subtle grid pattern background simulation */}
        <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md relative z-10"
        >
          <div className="text-center mb-16">
            <motion.div 
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="w-20 h-20 bg-slate-900 rounded-lg mx-auto flex items-center justify-center shadow-lg mb-8"
            >
              <Package className="text-white w-10 h-10" />
            </motion.div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter uppercase tracking-widest font-display">客室管理システム</h1>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] mb-4 text-center uppercase">ユーザーを選択してログイン</p>
            {staffList.map(staff => (
              <motion.button
                key={staff.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCurrentStaff(staff)}
                className="w-full bg-white border border-slate-200 hover:border-slate-800 p-6 rounded-lg flex items-center gap-5 transition-all text-left shadow-sm group"
              >
                <div className={cn(
                  "w-12 h-12 rounded flex items-center justify-center font-black text-xl transition-all group-hover:bg-slate-900 group-hover:text-white border border-slate-100",
                  staff.role === 'manager' ? "bg-slate-50 text-slate-900" : "bg-slate-50 text-slate-900"
                )}>
                  {staff.role === 'manager' ? <LayoutDashboard size={24} /> : <User size={24} />}
                </div>
                <div className="flex-1">
                  <p className="text-slate-900 font-black text-base leading-tight uppercase tracking-widest">{staff.name}</p>
                </div>
                <div className="w-8 h-8 rounded border border-slate-100 flex items-center justify-center text-slate-300 group-hover:border-slate-900 group-hover:text-slate-900 transition-all">
                   <ArrowRightLeft size={14} />
                </div>
              </motion.button>
            ))}
          </div>
          
          <div className="mt-20 text-center">
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {currentStaff.role === 'manager' ? (
          <motion.div
            key="manager"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <ManagerUI 
              rooms={rooms}
              reports={reports}
              staff={staffList}
              checklistItems={checklistItems}
              onUpdateRoom={handleUpdateRoom}
              onAddRoom={handleAddRoom}
              onDeleteRoom={handleDeleteRoom}
              onUpdateChecklist={handleUpdateChecklistItem}
              onAddChecklist={handleAddChecklistItem}
              onDeleteChecklist={handleDeleteChecklistItem}
              onResolveReport={handleResolveReport}
              onDeleteReport={handleDeleteReport}
              onDeleteAllReports={handleDeleteAllReports}
              onLogout={() => setCurrentStaff(null)}
              onResetAndSeed={handleResetAndSeed}
            />
          </motion.div>
        ) : (
          <motion.div
            key="cleaner"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-full"
          >
            <CleanerUI 
              rooms={rooms}
              reports={reports}
              staffName={currentStaff.name}
              checklistItems={checklistItems}
              onUpdateStatus={(roomId, status) => handleUpdateRoom(roomId, { status })}
              onReport={handleReport}
              onSaveMaintenance={handleSaveMaintenance}
              onLogout={() => setCurrentStaff(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

