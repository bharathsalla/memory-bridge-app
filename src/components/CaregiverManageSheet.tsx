import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Pill, Activity, Heart, Trash2, Edit3, Check, Clock } from 'lucide-react';
import {
  useMedications, useAddMedication, useUpdateMedication, useDeleteMedication,
  useActivities, useAddActivity, useUpdateActivity, useDeleteActivity,
  useVitals, useAddVital, useDeleteVital,
  DbMedication, DbActivity, DbVital,
} from '@/hooks/useCareData';

type Tab = 'meds' | 'activities' | 'vitals';

const VITAL_TYPES = [
  { value: 'blood_pressure', label: 'Blood Pressure', unit: 'mmHg', icon: '🩺' },
  { value: 'heart_rate', label: 'Heart Rate', unit: 'bpm', icon: '❤️' },
  { value: 'weight', label: 'Weight', unit: 'kg', icon: '⚖️' },
  { value: 'sleep', label: 'Sleep', unit: 'hours', icon: '😴' },
  { value: 'steps', label: 'Steps', unit: 'steps', icon: '👟' },
  { value: 'temperature', label: 'Temperature', unit: '°C', icon: '🌡️' },
];

const ACTIVITY_ICONS = ['💊', '🍳', '🚶', '🔔', '💪', '🧘', '🎵', '📖', '🛁', '🏥'];

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CaregiverManageSheet({ open, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('meds');

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-black/40"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl max-h-[85%] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3">
              <h2 className="text-[20px] font-bold text-foreground">Manage Patient Data</h2>
              <button onClick={onClose} className="w-9 h-9 rounded-full bg-muted flex items-center justify-center touch-target">
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 px-5 pb-3">
              {([
                { id: 'meds' as Tab, label: 'Medications', icon: Pill },
                { id: 'activities' as Tab, label: 'Activities', icon: Activity },
                { id: 'vitals' as Tab, label: 'Vitals', icon: Heart },
              ]).map(t => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`flex items-center gap-1.5 px-3.5 h-9 rounded-full text-[13px] font-semibold transition-all touch-target ${
                      tab === t.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-6">
              {tab === 'meds' && <MedsPanel />}
              {tab === 'activities' && <ActivitiesPanel />}
              {tab === 'vitals' && <VitalsPanel />}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ── Medications Panel ──
function MedsPanel() {
  const { data: meds = [], isLoading } = useMedications();
  const addMed = useAddMedication();
  const updateMed = useUpdateMedication();
  const deleteMed = useDeleteMedication();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', dosage: '', time: '', instructions: '' });

  const resetForm = () => { setForm({ name: '', dosage: '', time: '', instructions: '' }); setShowForm(false); setEditingId(null); };

  const handleSubmit = () => {
    if (!form.name.trim() || !form.dosage.trim() || !form.time.trim()) return;
    if (editingId) {
      updateMed.mutate({ id: editingId, ...form }, { onSuccess: resetForm });
    } else {
      addMed.mutate({ ...form, taken: false, taken_at: null }, { onSuccess: resetForm });
    }
  };

  const startEdit = (med: DbMedication) => {
    setForm({ name: med.name, dosage: med.dosage, time: med.time, instructions: med.instructions });
    setEditingId(med.id);
    setShowForm(true);
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-3">
      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full ios-card-elevated p-4 flex items-center gap-3 text-primary font-semibold rounded-2xl touch-target"
        >
          <Plus className="w-5 h-5" />
          Add Medication
        </button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ios-card-elevated p-4 rounded-2xl space-y-3"
          >
            <div className="text-[15px] font-bold text-foreground">{editingId ? 'Edit' : 'New'} Medication</div>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Name (e.g. Lisinopril)"
              className="w-full h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <div className="flex gap-2">
              <input
                value={form.dosage}
                onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                placeholder="Dosage"
                className="flex-1 h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <input
                value={form.time}
                onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                placeholder="Time"
                className="flex-1 h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
            </div>
            <input
              value={form.instructions}
              onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
              placeholder="Instructions (optional)"
              className="w-full h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <div className="flex gap-2">
              <button onClick={resetForm} className="flex-1 h-11 rounded-xl bg-muted text-muted-foreground text-[14px] font-semibold">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!form.name.trim() || !form.dosage.trim()}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {meds.map(med => (
        <div key={med.id} className="ios-card-elevated p-4 rounded-2xl flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${med.taken ? 'bg-success/10' : 'bg-primary/10'}`}>
            {med.taken ? <Check className="w-5 h-5 text-success" /> : <Pill className="w-5 h-5 text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[15px] font-semibold text-foreground">{med.name} {med.dosage}</div>
            <div className="text-[12px] text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {med.time} {med.instructions ? `· ${med.instructions}` : ''}
            </div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => startEdit(med)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => deleteMed.mutate(med.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Activities Panel ──
function ActivitiesPanel() {
  const { data: activities = [], isLoading } = useActivities();
  const addActivity = useAddActivity();
  const updateActivity = useUpdateActivity();
  const deleteActivity = useDeleteActivity();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ description: '', time: '', icon: '📋', completed: false });

  const resetForm = () => { setForm({ description: '', time: '', icon: '📋', completed: false }); setShowForm(false); setEditingId(null); };

  const handleSubmit = () => {
    if (!form.description.trim() || !form.time.trim()) return;
    if (editingId) {
      updateActivity.mutate({ id: editingId, ...form }, { onSuccess: resetForm });
    } else {
      addActivity.mutate(form, { onSuccess: resetForm });
    }
  };

  const startEdit = (act: DbActivity) => {
    setForm({ description: act.description, time: act.time, icon: act.icon, completed: act.completed });
    setEditingId(act.id);
    setShowForm(true);
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-3">
      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full ios-card-elevated p-4 flex items-center gap-3 text-primary font-semibold rounded-2xl touch-target"
        >
          <Plus className="w-5 h-5" />
          Add Activity
        </button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ios-card-elevated p-4 rounded-2xl space-y-3"
          >
            <div className="text-[15px] font-bold text-foreground">{editingId ? 'Edit' : 'New'} Activity</div>
            <input
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description (e.g. Morning walk)"
              className="w-full h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <input
              value={form.time}
              onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
              placeholder="Time (e.g. 9:00 AM)"
              className="w-full h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <div>
              <div className="text-[12px] text-muted-foreground mb-2">Icon</div>
              <div className="flex gap-2 flex-wrap">
                {ACTIVITY_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => setForm(f => ({ ...f, icon }))}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-[20px] transition-all ${
                      form.icon === icon ? 'bg-primary/15 ring-2 ring-primary' : 'bg-muted'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={resetForm} className="flex-1 h-11 rounded-xl bg-muted text-muted-foreground text-[14px] font-semibold">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!form.description.trim() || !form.time.trim()}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold disabled:opacity-50"
              >
                {editingId ? 'Update' : 'Add'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activities.map(act => (
        <div key={act.id} className="ios-card-elevated p-4 rounded-2xl flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[18px] shrink-0 ${act.completed ? 'bg-success/10' : 'bg-muted'}`}>
            {act.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-[15px] font-medium ${act.completed ? 'text-muted-foreground line-through' : 'text-foreground'}`}>{act.description}</div>
            <div className="text-[12px] text-muted-foreground">{act.time}</div>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button onClick={() => startEdit(act)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <Edit3 className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
            <button onClick={() => deleteActivity.mutate(act.id)} className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Trash2 className="w-3.5 h-3.5 text-destructive" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Vitals Panel ──
function VitalsPanel() {
  const { data: vitals = [], isLoading } = useVitals();
  const addVital = useAddVital();
  const deleteVital = useDeleteVital();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'blood_pressure', value: '', unit: 'mmHg', notes: '', recorded_at: new Date().toISOString() });

  const resetForm = () => { setForm({ type: 'blood_pressure', value: '', unit: 'mmHg', notes: '', recorded_at: new Date().toISOString() }); setShowForm(false); };

  const handleTypeChange = (type: string) => {
    const vt = VITAL_TYPES.find(v => v.value === type);
    setForm(f => ({ ...f, type, unit: vt?.unit || '' }));
  };

  const handleSubmit = () => {
    if (!form.value.trim()) return;
    addVital.mutate(form, { onSuccess: resetForm });
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Loading...</div>;

  // Group by type, show latest of each
  const latestByType = VITAL_TYPES.map(vt => {
    const latest = vitals.find(v => v.type === vt.value);
    return { ...vt, vital: latest };
  });

  return (
    <div className="space-y-3">
      {!showForm && (
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="w-full ios-card-elevated p-4 flex items-center gap-3 text-primary font-semibold rounded-2xl touch-target"
        >
          <Plus className="w-5 h-5" />
          Record Vital
        </button>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="ios-card-elevated p-4 rounded-2xl space-y-3"
          >
            <div className="text-[15px] font-bold text-foreground">Record Vital</div>
            <div className="flex gap-2 flex-wrap">
              {VITAL_TYPES.map(vt => (
                <button
                  key={vt.value}
                  onClick={() => handleTypeChange(vt.value)}
                  className={`flex items-center gap-1.5 px-3 h-9 rounded-full text-[12px] font-medium transition-all ${
                    form.type === vt.value ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span>{vt.icon}</span>
                  {vt.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                value={form.value}
                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                placeholder="Value"
                className="flex-1 h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
              />
              <div className="h-11 px-4 rounded-xl bg-muted flex items-center text-[14px] text-muted-foreground">
                {form.unit}
              </div>
            </div>
            <input
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="w-full h-11 px-4 rounded-xl bg-muted text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none"
            />
            <div className="flex gap-2">
              <button onClick={resetForm} className="flex-1 h-11 rounded-xl bg-muted text-muted-foreground text-[14px] font-semibold">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!form.value.trim()}
                className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-[14px] font-semibold disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-2 gap-2.5">
        {latestByType.map(item => (
          <div key={item.value} className="ios-card-elevated p-3.5 rounded-2xl relative group">
            <div className="text-[20px] mb-1">{item.icon}</div>
            <div className="text-[18px] font-bold text-foreground">
              {item.vital ? `${item.vital.value}` : '—'}
            </div>
            <div className="text-[11px] text-muted-foreground">{item.label}</div>
            {item.vital && (
              <>
                <div className="text-[10px] text-muted-foreground mt-0.5">{item.vital.unit}</div>
                <button
                  onClick={() => deleteVital.mutate(item.vital!.id)}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-destructive/10 items-center justify-center hidden group-hover:flex"
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
