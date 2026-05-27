'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiFileText, FiUser, FiCalendar, FiPlus, FiTrash2, FiPrinter, FiShield } from 'react-icons/fi';

export default function PdfPrescriptionPage() {
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [diagnosis, setDiagnosis] = useState('');
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', duration: '' }]);
  const [advice, setAdvice] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const addMedicine = () => setMedicines([...medicines, { name: '', dosage: '', duration: '' }]);
  const removeMedicine = (idx: number) => {
    if (medicines.length > 1) setMedicines(medicines.filter((_, i) => i !== idx));
  };
  const updateMedicine = (idx: number, field: string, value: string) => {
    const updated = medicines.map((m, i) => (i === idx ? { ...m, [field]: value } : m));
    setMedicines(updated);
  };

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const jsPDF = (await import('jspdf')).default;
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageW = 210;
      let y = 20;

      // Header
      doc.setFillColor(25, 25, 35);
      doc.rect(0, 0, pageW, 35, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ZYNRTA CARE', pageW / 2, 16, { align: 'center' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered Digital Healthcare Platform', pageW / 2, 24, { align: 'center' });
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageW / 2, 30, { align: 'center' });

      y = 45;
      doc.setTextColor(60, 60, 70);
      doc.setDrawColor(200, 200, 210);
      doc.line(15, y, 195, y);
      y += 8;

      // Patient Details
      doc.setFontSize(14);
      doc.setTextColor(25, 25, 35);
      doc.setFont('helvetica', 'bold');
      doc.text('Patient Details', 15, y);
      y += 7;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 90);
      doc.text(`Name: ${patientName || '________________'}`, 15, y);
      doc.text(`Age: ${patientAge || '___'}`, 110, y);
      doc.text(`Gender: ${patientGender}`, 155, y);
      y += 12;

      // Symptoms
      if (symptoms) {
        doc.setFontSize(14);
        doc.setTextColor(25, 25, 35);
        doc.setFont('helvetica', 'bold');
        doc.text('Reported Symptoms', 15, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 90);
        const symLines = doc.splitTextToSize(symptoms, 170);
        doc.text(symLines, 15, y);
        y += symLines.length * 5 + 7;
      }

      // Diagnosis
      if (diagnosis) {
        doc.setFontSize(14);
        doc.setTextColor(25, 25, 35);
        doc.setFont('helvetica', 'bold');
        doc.text('Diagnosis', 15, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 90);
        const diagLines = doc.splitTextToSize(diagnosis, 170);
        doc.text(diagLines, 15, y);
        y += diagLines.length * 5 + 7;
      }

      // Medicines
      const validMeds = medicines.filter(m => m.name.trim());
      if (validMeds.length > 0) {
        doc.setFontSize(14);
        doc.setTextColor(25, 25, 35);
        doc.setFont('helvetica', 'bold');
        doc.text('Prescribed Medicines', 15, y);
        y += 7;

        doc.setFillColor(240, 240, 245);
        doc.rect(15, y - 3, 180, 6, 'F');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(60, 60, 70);
        doc.text('Medicine', 18, y + 1);
        doc.text('Dosage', 90, y + 1);
        doc.text('Duration', 145, y + 1);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 80, 90);
        validMeds.forEach((m) => {
          doc.text(m.name, 18, y);
          doc.text(m.dosage || '-', 90, y);
          doc.text(m.duration || '-', 145, y);
          y += 6;
        });
        y += 4;
      }

      // Advice
      if (advice) {
        doc.setFontSize(14);
        doc.setTextColor(25, 25, 35);
        doc.setFont('helvetica', 'bold');
        doc.text('Recommendations', 15, y);
        y += 7;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 90);
        const advLines = doc.splitTextToSize(advice, 170);
        doc.text(advLines, 15, y);
        y += advLines.length * 5 + 7;
      }

      // Footer
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 160);
      doc.text('This is a computer-generated prescription. Generated by ZyntraCare AI Platform.', pageW / 2, 285, { align: 'center' });
      doc.text(`Prescription ID: ZC-${Date.now().toString(36).toUpperCase()}`, pageW / 2, 290, { align: 'center' });

      doc.save(`prescription-${Date.now()}.pdf`);
    } catch (err: any) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold mb-4">
            <FiFileText size={14} /> Digital Prescription
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            AI{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Prescription</span>{' '}
            Generator
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl mx-auto">
            Generate professional downloadable PDF prescriptions with medicines, diagnosis, and recommendations.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Input Form */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2">
              <FiFileText className="text-emerald-400" size={20} /> Prescription Details
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Patient Name</label>
                  <input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="Full name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Age</label>
                  <input value={patientAge} onChange={e => setPatientAge(e.target.value)} placeholder="Years" type="number" min="0" max="150" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Gender</label>
                  <select value={patientGender} onChange={e => setPatientGender(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors">
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Reported Symptoms</label>
                <textarea value={symptoms} onChange={e => setSymptoms(e.target.value)} placeholder="e.g. Fever, cough, headache since 3 days..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Diagnosis</label>
                <textarea value={diagnosis} onChange={e => setDiagnosis(e.target.value)} placeholder="e.g. Upper respiratory tract infection..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs text-slate-400">Prescribed Medicines</label>
                  <button onClick={addMedicine} className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1">
                    <FiPlus size={14} /> Add Medicine
                  </button>
                </div>
                <div className="space-y-2">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="grid grid-cols-10 gap-2 items-center">
                      <input value={med.name} onChange={e => updateMedicine(idx, 'name', e.target.value)} placeholder="Medicine name" className="col-span-4 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                      <input value={med.dosage} onChange={e => updateMedicine(idx, 'dosage', e.target.value)} placeholder="Dosage" className="col-span-3 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                      <input value={med.duration} onChange={e => updateMedicine(idx, 'duration', e.target.value)} placeholder="Duration" className="col-span-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
                      <button onClick={() => removeMedicine(idx)} disabled={medicines.length <= 1} className="text-red-400 hover:text-red-300 disabled:opacity-30 p-2">
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 mb-1 block">Recommendations / Advice</label>
                <textarea value={advice} onChange={e => setAdvice(e.target.value)} placeholder="e.g. Take plenty of rest, stay hydrated..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 transition-colors" />
              </div>
            </div>
          </motion.div>

          {/* Preview + Download */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            {/* Live Preview */}
            <div ref={previewRef} className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FiPrinter className="text-teal-400" size={20} /> Prescription Preview
              </h2>

              <div className="bg-white text-black rounded-xl p-5 min-h-[300px] text-sm font-mono shadow-lg">
                <div className="text-center mb-4 pb-3 border-b border-gray-200">
                  <h3 className="text-lg font-bold tracking-wider">ZYNRTA CARE</h3>
                  <p className="text-[10px] text-gray-500">AI-Powered Digital Healthcare Platform</p>
                  <p className="text-[9px] text-gray-400 mt-1">Generated: {new Date().toLocaleString('en-IN')}</p>
                </div>

                <div className="mb-3">
                  <p className="font-bold text-xs text-gray-500 mb-1">PATIENT DETAILS</p>
                  <p className="text-xs">{patientName ? `Name: ${patientName}` : 'Name: ________________'}</p>
                  <p className="text-xs">{patientAge ? `Age: ${patientAge} yrs` : 'Age: ___'} &nbsp;|&nbsp; Gender: {patientGender}</p>
                </div>

                {symptoms && (
                  <div className="mb-3">
                    <p className="font-bold text-xs text-gray-500 mb-1">REPORTED SYMPTOMS</p>
                    <p className="text-xs">{symptoms}</p>
                  </div>
                )}

                {diagnosis && (
                  <div className="mb-3">
                    <p className="font-bold text-xs text-gray-500 mb-1">DIAGNOSIS</p>
                    <p className="text-xs">{diagnosis}</p>
                  </div>
                )}

                {medicines.filter(m => m.name.trim()).length > 0 && (
                  <div className="mb-3">
                    <p className="font-bold text-xs text-gray-500 mb-1">PRESCRIBED MEDICINES</p>
                    {medicines.filter(m => m.name.trim()).map((m, i) => (
                      <p key={i} className="text-xs">{i + 1}. {m.name} — {m.dosage || '-'} × {m.duration || '-'}</p>
                    ))}
                  </div>
                )}

                {advice && (
                  <div className="mb-3">
                    <p className="font-bold text-xs text-gray-500 mb-1">RECOMMENDATIONS</p>
                    <p className="text-xs">{advice}</p>
                  </div>
                )}

                <div className="mt-4 pt-3 border-t border-gray-200 text-[8px] text-gray-400 text-center">
                  Computer-generated prescription • ZyntraCare AI Platform
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button onClick={generatePdf} disabled={generating} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl font-bold hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 flex items-center justify-center gap-3 text-lg">
              {generating ? (
                <><span className="animate-pulse">Generating PDF...</span></>
              ) : (
                <><FiDownload size={20} /> Download Prescription PDF</>
              )}
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <FiShield size={14} /> Generated locally in your browser. No data uploaded.
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
