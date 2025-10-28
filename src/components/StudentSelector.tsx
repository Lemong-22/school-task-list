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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Memuat daftar siswa...</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-300 rounded-md p-4">
      {/* Header with selection count */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-700">
          Pilih Siswa ({selectedStudentIds.length} dipilih)
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
          >
            Pilih Semua
          </button>
          <span className="text-gray-400">|</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
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
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>

      {/* Student list */}
      <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {searchQuery ? 'Tidak ada siswa yang cocok dengan pencarian' : 'Tidak ada siswa terdaftar'}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredStudents.map((student) => (
              <label
                key={student.id}
                className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedStudentIds.includes(student.id)}
                  onChange={() => toggleStudent(student.id)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-900">{student.full_name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="mt-2 text-xs text-gray-500">
        {selectedStudentIds.length === 0
          ? 'Pilih minimal satu siswa untuk ditugaskan'
          : `${selectedStudentIds.length} siswa akan menerima tugas ini`}
      </p>
    </div>
  );
};
