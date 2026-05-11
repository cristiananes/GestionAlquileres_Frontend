'use client';

import { useState } from 'react';
import { contactApi } from '@/lib/api';
import { Mail, Send } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await contactApi.send(form);
      setSent(true);
    } catch {
      setError('Error al enviar el mensaje. Intentalo de nuevo.');
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Mail size={48} className="text-blue-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Mensaje enviado</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Gracias por contactarnos. Te responderemos a la brevedad.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Contacto</h1>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Asunto</label>
          <input value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mensaje</label>
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm" rows={5} required />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Send size={16} /> Enviar mensaje
        </button>
      </form>
    </div>
  );
}
