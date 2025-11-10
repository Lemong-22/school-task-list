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
        <svg className="animate-spin h-8 w-8 text-primary mx-auto" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <p className="mt-2 text-text-secondary-dark">Loading students...</p>
      </div>
    );
  }

  return (
    <div className="bg-background-dark border border-border-dark rounded-lg p-4">
      {/* Header with selection count */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-bold text-text-primary-dark">
          Select Students <span className="text-primary">({selectedStudentIds.length} selected)</span>
        </h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Select All
          </button>
          <span className="text-border-dark">|</span>
          <button
            type="button"
            onClick={deselectAll}
            className="text-xs text-text-secondary-dark hover:text-text-primary-dark font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
      </div>

      {/* Search box */}
      <div className="mb-3">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-4 w-4 text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search students..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-3 py-2 bg-component-dark border border-border-dark text-text-primary-dark rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-sm placeholder-text-secondary-dark transition-all"
          />
        </div>
      </div>

      {/* Student list */}
      <div className="max-h-64 overflow-y-auto border border-border-dark rounded-lg bg-component-dark">
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-text-secondary-dark">
            {searchQuery ? 'No students match your search' : 'No students registered'}
          </div>
        ) : (
          <div className="divide-y divide-border-dark">
            {filteredStudents.map((student) => {
              const isSelected = selectedStudentIds.includes(student.id);
              return (
                <label
                  key={student.id}
                  className={`flex items-center px-4 py-3 cursor-pointer transition-all duration-200 transform ${
                    isSelected
                      ? 'bg-primary text-white font-semibold scale-[1.02] shadow-md'
                      : 'hover:bg-background-dark text-text-primary-dark hover:scale-[1.01]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStudent(student.id)}
                    className="h-4 w-4 text-primary focus:ring-primary focus:ring-offset-0 border-border-dark rounded transition-all"
                  />
                  <span className="ml-3 text-sm flex-1">{student.full_name}</span>
                  {isSelected && (
                    <svg className="h-5 w-5 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
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
