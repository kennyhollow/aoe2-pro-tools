'use client';
import { useEffect, useState } from 'react';
import { Sword, Shield, Crosshair } from 'lucide-react';
import VillagerCalc from '@/components/VillagerCalc';

interface Civ {
  id: number;
  name: string;
  specialty: string;
  uniqueUnit: string;
}

export default function Home() {
  const [civs, setCivs] = useState<Civ[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/civs')
      .then(res => res.json())
      .then(data => setCivs(data))
      .catch(err => console.error("Error:", err));
  }, []);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-6xl font-black text-yellow-500 mb-2 tracking-tighter uppercase italic">
            AoE II PRO TOOLS
          </h1>
          <p className="text-slate-400 font-bold tracking-widest uppercase text-sm">Dashboard de Mando de Agustín</p>
        </header>

        {/* --- SECCIÓN CALCULADORA --- */}
        <VillagerCalc />

        <hr className="border-slate-800 my-12" />

        {/* --- SECCIÓN CIVILIZACIONES --- */}
        <h2 className="text-2xl font-bold mb-8 text-center text-slate-400 uppercase tracking-widest">Base de Datos de Civilizaciones</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {civs.map(civ => (
            <div key={civ.id} className="group bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl hover:border-yellow-600 transition-all duration-300">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-3xl font-bold text-white group-hover:text-yellow-400 transition-colors uppercase tracking-tighter">{civ.name}</h2>
                <div className="p-3 bg-slate-800 rounded-xl">
                  <Sword className="text-yellow-500 w-6 h-6" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center text-slate-300">
                  <Shield className="w-5 h-5 mr-3 text-blue-400" />
                  <span className="text-sm uppercase tracking-wider font-bold">Especialidad:</span>
                  <span className="ml-2 text-white">{civ.specialty}</span>
                </div>
                <div className="flex items-center text-slate-300">
                  <Crosshair className="w-5 h-5 mr-3 text-red-400" />
                  <span className="text-sm uppercase tracking-wider font-bold">Unidad Única:</span>
                  <span className="ml-2 text-white">{civ.uniqueUnit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}