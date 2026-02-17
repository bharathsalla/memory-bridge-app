import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, MapPin, Phone, Heart, Users, Shield, Copy, Check } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import patientAvatar from '@/assets/patient-avatar.jpg';

interface ContactInfo {
  name: string;
  relation: string;
  phone: string;
  isPrimary?: boolean;
}

const familyContacts: ContactInfo[] = [
  { name: 'Priya Sharma', relation: 'Daughter', phone: '+91 98765 43210', isPrimary: true },
  { name: 'Rajesh Sharma', relation: 'Son', phone: '+91 98765 43211' },
  { name: 'Anita Devi', relation: 'Sister', phone: '+91 87654 32109' },
];

const friendContacts: ContactInfo[] = [
  { name: 'Sunita Rao', relation: 'Neighbor', phone: '+91 99887 76655' },
  { name: 'Kamala Iyer', relation: 'Friend', phone: '+91 88776 65544' },
];

const patientDetails = {
  bloodGroup: 'B+',
  allergies: 'Penicillin, Peanuts',
  address: '42, Lakshmi Nagar, Begumpet, Hyderabad, Telangana 500016',
  emergencyNote: 'I have Alzheimer\'s. If I seem confused, please call my daughter Priya.',
  doctorName: 'Dr. Meera Reddy',
  doctorPhone: '+91 94400 12345',
  diagnosis: 'Alzheimer\'s Disease — Early-Mid Stage',
};

export default function PatientIDCard({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { patientName } = useApp();
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  const copyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone.replace(/\s/g, ''));
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="w-full max-w-md bg-background overflow-hidden"
            style={{ maxHeight: '85vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1.5 bg-muted-foreground/30" />
            </div>

            <div className="overflow-y-auto px-5 pb-8" style={{ maxHeight: 'calc(85vh - 24px)' }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[24px] font-extrabold text-foreground">My Identity Card</h2>
                <button onClick={onClose} className="w-10 h-10 bg-muted flex items-center justify-center touch-target">
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>

              {/* Patient Card */}
              <div className="bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5 mb-5 ios-card-elevated">
                <div className="flex items-center gap-4 mb-4">
                  <img src={patientAvatar} alt="Patient" className="w-20 h-20 object-cover ring-3 ring-primary/30" />
                  <div>
                    <h3 className="text-[22px] font-extrabold text-foreground">{patientName || 'Patient'}</h3>
                    <p className="text-[16px] text-muted-foreground font-medium">{patientDetails.diagnosis}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="px-3 py-1 bg-destructive/15 text-destructive text-[14px] font-bold">
                        🩸 {patientDetails.bloodGroup}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Emergency Note */}
                <div className="bg-warning/10 border border-warning/20 p-4 mb-3">
                  <div className="flex items-start gap-2.5">
                    <Shield className="w-5 h-5 text-warning mt-0.5 shrink-0" />
                    <p className="text-[15px] text-foreground font-medium leading-relaxed">{patientDetails.emergencyNote}</p>
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-3 py-3">
                  <div className="w-10 h-10 bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Address</p>
                    <p className="text-[16px] text-foreground font-medium mt-0.5">{patientDetails.address}</p>
                  </div>
                </div>

                {/* Allergies */}
                <div className="flex items-start gap-3 py-3 border-t border-border/30">
                  <div className="w-10 h-10 bg-destructive/10 flex items-center justify-center shrink-0">
                    <span className="text-[18px]">⚠️</span>
                  </div>
                  <div>
                    <p className="text-[13px] text-muted-foreground font-semibold uppercase tracking-wider">Allergies</p>
                    <p className="text-[16px] text-destructive font-bold mt-0.5">{patientDetails.allergies}</p>
                  </div>
                </div>
              </div>

              {/* Doctor */}
              <div className="mb-5">
                <h4 className="text-[13px] text-muted-foreground font-bold uppercase tracking-wider mb-3 px-1">🩺 Primary Doctor</h4>
                <div className="ios-card-elevated p-4 flex items-center gap-3.5">
                  <div className="w-12 h-12 bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-[22px]">👨‍⚕️</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[17px] font-bold text-foreground">{patientDetails.doctorName}</p>
                    <p className="text-[14px] text-muted-foreground">{patientDetails.doctorPhone}</p>
                  </div>
                  <button
                    onClick={() => copyPhone(patientDetails.doctorPhone)}
                    className="w-10 h-10 bg-primary/10 flex items-center justify-center touch-target"
                  >
                    {copiedPhone === patientDetails.doctorPhone ? <Check className="w-5 h-5 text-success" /> : <Phone className="w-5 h-5 text-primary" />}
                  </button>
                </div>
              </div>

              {/* Family */}
              <div className="mb-5">
                <h4 className="text-[13px] text-muted-foreground font-bold uppercase tracking-wider mb-3 px-1">👨‍👩‍👧 Family Contacts</h4>
                <div className="space-y-2.5">
                  {familyContacts.map(c => (
                    <div key={c.phone} className="ios-card-elevated p-4 flex items-center gap-3.5">
                      <div className="w-12 h-12 bg-accent/10 flex items-center justify-center shrink-0">
                        <Heart className="w-5 h-5 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[17px] font-bold text-foreground">{c.name}</p>
                          {c.isPrimary && <span className="px-2 py-0.5 bg-primary/15 text-primary text-[11px] font-bold">Primary</span>}
                        </div>
                        <p className="text-[14px] text-muted-foreground">{c.relation} · {c.phone}</p>
                      </div>
                      <button
                        onClick={() => copyPhone(c.phone)}
                        className="w-10 h-10 bg-primary/10 flex items-center justify-center touch-target"
                      >
                        {copiedPhone === c.phone ? <Check className="w-5 h-5 text-success" /> : <Phone className="w-5 h-5 text-primary" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Friends */}
              <div className="mb-4">
                <h4 className="text-[13px] text-muted-foreground font-bold uppercase tracking-wider mb-3 px-1">🤝 Friends & Neighbors</h4>
                <div className="space-y-2.5">
                  {friendContacts.map(c => (
                    <div key={c.phone} className="ios-card-elevated p-4 flex items-center gap-3.5">
                      <div className="w-12 h-12 bg-sage/10 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-sage" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[17px] font-bold text-foreground">{c.name}</p>
                        <p className="text-[14px] text-muted-foreground">{c.relation} · {c.phone}</p>
                      </div>
                      <button
                        onClick={() => copyPhone(c.phone)}
                        className="w-10 h-10 bg-primary/10 flex items-center justify-center touch-target"
                      >
                        {copiedPhone === c.phone ? <Check className="w-5 h-5 text-success" /> : <Phone className="w-5 h-5 text-primary" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
