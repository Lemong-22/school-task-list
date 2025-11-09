import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { UserProfile } from '../types/auth';

interface StudentSelectorProps {
  selectedStudentIds: string[];
  onChange: (studentIds: string[]) => void;
}

export const StudentSelector = ({ selectedStudentIds, onChange }: StudentSelectorProps) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all students
  useEffect(() => {
    const fetchStudents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('role', 'student')
          .order('full_name', { ascending: true });

        if (error) throw error;
        setStudents(data || []);
      } catch (err) {
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Filter students based on search query
  const filteredStudents = students.filter((student) =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle student selection
  const toggleStudent = (studentId: string) => {
    if (selectedStudentIds.includes(studentId)) {
      onChange(selectedStudentIds.filter((id) => id !== studentId));
    } else {
      onChange([...selectedStudentIds, studentId]);
    }
  };

  // Select all students
  const selectAll = () => {
    onChange(filteredStudents.map((s) => s.id));
  };

  // Deselect all students
  const deselectAll = () => {
    onChange([]);
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-none h-8 w-8 border-b-2 border-codedex-cyan mx-auto"></div>
        <p className="mt-2 text-gray-300">Memuat daftar siswa...</p>
      </div>
    );
  }

  return (
    <div className="bg-codedex-navy border-2 border-gray-600 rounded-none p-4">
      {/* Header with selection count */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-gray-100">
          Pilih Siswa ({selectedStudentIds.length} dipilih)
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-codedex-cyan hover:text-codedex-yellow font-bold transition-colors"
          >
            Pilih Semua
          </button>
          <span className="text-gray-600">|</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-codedex-cyan hover:text-codedex-yellow font-bold transition-colors"
          >
            Hapus Semua
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="mb-3">
        <input
          type="text"
          placeholder="Cari siswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-2 bg-codedex-slate border-2 border-gray-600 text-gray-100 rounded-none focus:outline-none focus:ring-2 focus:ring-codedex-cyan focus:border-codedex-cyan text-sm placeholder-gray-500"
        />
      </div>

      {/* Student list */}
      <div className="max-h-64 overflow-y-auto border-2 border-gray-600 rounded-none bg-codedex-slate">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            {searchQuery ? 'Tidak ada siswa yang cocok dengan pencarian' : 'Tidak ada siswa terdaftar'}
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudentIds.includes(student.id);
              return (
                <label
                  key={student.id}
                  className={`flex items-center px-3 py-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-codedex-cyan text-black font-bold'
                      : 'hover:bg-codedex-navy text-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 text-codedex-cyan focus:ring-codedex-cyan border-gray-600 rounded-none"
                  />
                  <span className="ml-3 text-sm">{student.full_name}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="mt-2 text-xs text-gray-400">
        {selectedStudentIds.length === 0
          ? 'Pilih minimal satu siswa untuk ditugaskan'
          : `${selectedStudentIds.length} siswa akan menerima tugas ini`}
      </p>
    </div>
  );
};
