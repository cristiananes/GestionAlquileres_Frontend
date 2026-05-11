'use client';

import { useState } from 'react';
import { feedbackApi } from '@/lib/api';
import { ThumbsUp, Send } from 'lucide-react';

const categories = [
  { value: 'good', label: 'Algo positivo', emoji: '😊' },
  { value: 'bad', label: 'Algo negativo', emoji: '😞' },
  { value: 'bug', label: 'Un error/bug', emoji: '🐛' },
  { value: 'suggestion', label: 'Una sugerencia', emoji: '💡' },
];

export default function FeedbackPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [category, setCategory] = useState('good');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await feedbackApi.send({ ...form, subject: category });
      setSent(true);
    } catch {
      setError('Error al enviar el feedback. Intentalo de nuevo.');
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <ThumbsUp size={48} className="text-green-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">¡Gracias por tu opinión!</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Tu feedback nos ayuda a mejorar la aplicación.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Tu opinión nos importa</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Comparte con nosotros tus experiencias, sugerencias o reporta cualquier problema que hayas encontrado.</p>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-4 md:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">¿Qué tipo de feedback quieres compartir?</label>
          <div className="grid grid-cols-2 gap-2">
            {categories.map(cat => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`flex items-center gap-2 px-3 py-2.5 text-sm rounded-lg border transition-colors ${
                  category === cat.value
                    ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-600 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span>{cat.emoji}</span>
                <span className="text-left">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Nombre</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm" required />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Cuéntanos más</label>
          <textarea value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full border dark:border-gray-600 rounded-lg px-3 py-2 text-sm" rows={5} required placeholder="Describe tu experiencia, sugerencia o el error que encontraste..." />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
          <Send size={16} /> Enviar feedback
        </button>
      </form>
    </div>
  );
}
