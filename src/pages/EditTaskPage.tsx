import { useState, FormEvent, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTasks } from '../hooks/useTasks';
import { StudentSelector } from '../components/StudentSelector';
import { SUBJECT_LIST } from '../constants/subjects';

export const EditTaskPage = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const [subject, setSubject] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const { updateTask, fetchTaskById, fetchTaskAssignments } = useTasks();
  const navigate = useNavigate();

  // Load task data on mount
  useEffect(() => {
    const loadTask = async () => {
      if (!taskId) {
        navigate('/dashboard/teacher');
        return;
      }

      setInitialLoading(true);
      try {
        const [taskData, assignments] = await Promise.all([
          fetchTaskById(taskId),
          fetchTaskAssignments(taskId),
        ]);

        if (taskData) {
          setSubject(taskData.subject);
          setTitle(taskData.title);
          setDescription(taskData.description || '');
          // Convert ISO date to YYYY-MM-DD format for input
          setDueDate(taskData.due_date.split('T')[0]);
        }
        setSelectedStudents(assignments);
      } catch (err) {
        console.error('Error loading task:', err);
        setError('Gagal memuat data tugas');
      } finally {
        setInitialLoading(false);
      }
    };

    loadTask();
  }, [taskId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!subject) {
      setError('Mata pelajaran wajib dipilih');
      return;
    }

    if (!title.trim()) {
      setError('Judul tugas wajib diisi');
      return;
    }

    if (title.length > 200) {
      setError('Judul tugas maksimal 200 karakter');
      return;
    }

    if (!dueDate) {
      setError('Tanggal jatuh tempo wajib diisi');
      return;
    }

    if (selectedStudents.length === 0) {
      setError('Pilih minimal satu siswa');
      return;
    }

    if (description && description.length > 1000) {
      setError('Deskripsi maksimal 1000 karakter');
      return;
    }

    if (!taskId) return;

    setLoading(true);

    try {
      await updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || undefined,
        due_date: new Date(dueDate).toISOString(),
        subject: subject,
        student_ids: selectedStudents,
      });

      // Success - redirect to dashboard
      navigate('/dashboard/teacher', {
        state: { message: 'Tugas berhasil diperbarui!' },
      });
    } catch (err: any) {
      setError(err.message || 'Gagal memperbarui tugas');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat data tugas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/dashboard/teacher')}
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Edit Tugas</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}

            {/* Subject Field */}
            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                Mata Pelajaran <span className="text-red-500">*</span>
              </label>
              <select
                id="subject"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Pilih Mata Pelajaran --</option>
                {SUBJECT_LIST.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>

            {/* Title Field */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Judul Tugas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                required
                maxLength={200}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Contoh: Mengerjakan soal matematika halaman 45"
              />
              <p className="mt-1 text-xs text-gray-500">{title.length}/200 karakter</p>
            </div>

            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Deskripsi (Opsional)
              </label>
              <textarea
                id="description"
                rows={4}
                maxLength={1000}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Berikan instruksi detail tentang tugas ini..."
              />
              <p className="mt-1 text-xs text-gray-500">{description.length}/1000 karakter</p>
            </div>

            {/* Due Date Field */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
                Tanggal Jatuh Tempo <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tugaskan ke Siswa <span className="text-red-500">*</span>
              </label>
              <StudentSelector
                selectedStudentIds={selectedStudents}
                onChange={setSelectedStudents}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Menyimpan...' : '✓ Simpan Perubahan'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/dashboard/teacher')}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};
