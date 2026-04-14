import { useState, useEffect, useRef, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAPI } from '../../utils/api';
import type { StudentSummary, StudentDetail } from '../../types';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, RoundedBox, Environment } from '@react-three/drei';
import { ArrowLeft, Loader2, X, BookOpen, Clock, Award, Users, Eye } from 'lucide-react';
import * as THREE from 'three';

// ──────── 3D Student Avatar Component ────────
function StudentAvatar({ student, index, total, onClick, isSelected }: {
  student: StudentSummary; index: number; total: number; onClick: () => void; isSelected: boolean;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const isMale = student.gender !== 'female';
  
  // Grid layout: place students in rows
  const cols = Math.min(total, 5);
  const row = Math.floor(index / cols);
  const col = index % cols;
  const spacing = 2.5;
  const x = (col - (cols - 1) / 2) * spacing;
  const z = row * spacing;

  // Colors
  const bodyColor = isMale ? '#3B82F6' : '#EC4899';
  const skinColor = '#F5D0A9';

  return (
    <group
      ref={meshRef}
      position={[x, 0, z]}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={() => { if (meshRef.current) meshRef.current.scale.set(1.08, 1.08, 1.08); document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => { if (meshRef.current) meshRef.current.scale.set(1, 1, 1); document.body.style.cursor = 'default'; }}
    >
      {/* Body */}
      <RoundedBox args={[0.8, 1.2, 0.5]} radius={0.15} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial color={isSelected ? '#F59E0B' : bodyColor} roughness={0.4} metalness={0.1} />
      </RoundedBox>
      
      {/* Head */}
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.35, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.5} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.8, -0.05]}>
        <sphereGeometry args={[0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color={isMale ? '#4A3728' : '#2C1810'} roughness={0.8} />
      </mesh>

      {/* Arms */}
      <RoundedBox args={[0.2, 0.8, 0.2]} radius={0.08} position={[-0.5, 0.5, 0]}>
        <meshStandardMaterial color={isSelected ? '#F59E0B' : bodyColor} roughness={0.4} />
      </RoundedBox>
      <RoundedBox args={[0.2, 0.8, 0.2]} radius={0.08} position={[0.5, 0.5, 0]}>
        <meshStandardMaterial color={isSelected ? '#F59E0B' : bodyColor} roughness={0.4} />
      </RoundedBox>

      {/* Legs */}
      <RoundedBox args={[0.25, 0.7, 0.25]} radius={0.08} position={[-0.2, -0.35, 0]}>
        <meshStandardMaterial color="#1E293B" roughness={0.6} />
      </RoundedBox>
      <RoundedBox args={[0.25, 0.7, 0.25]} radius={0.08} position={[0.2, -0.35, 0]}>
        <meshStandardMaterial color="#1E293B" roughness={0.6} />
      </RoundedBox>

      {/* Name Tag */}
      <Text
        position={[0, 2.3, 0]}
        fontSize={0.18}
        color="#1F2937"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {student.firstName} {student.lastName[0]}.
      </Text>
      <Text
        position={[0, 2.05, 0]}
        fontSize={0.13}
        color="#6B7280"
        anchorX="center"
        anchorY="middle"
        font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        {student.rollNumber || `#${index + 1}`}
      </Text>

      {/* Entry count badge */}
      {student.entryCount > 0 && (
        <group position={[0.5, 1.9, 0.3]}>
          <mesh>
            <circleGeometry args={[0.15, 32]} />
            <meshBasicMaterial color="#10B981" />
          </mesh>
          <Text position={[0, 0, 0.01]} fontSize={0.1} color="white" anchorX="center" anchorY="middle"
            font="https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfAZ9hjQ.woff2">
            {student.entryCount}
          </Text>
        </group>
      )}

      {/* Selection indicator */}
      {isSelected && (
        <mesh position={[0, -0.72, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.5, 0.7, 32]} />
          <meshBasicMaterial color="#F59E0B" transparent opacity={0.5} />
        </mesh>
      )}
    </group>
  );
}

// ──────── Floor ────────
function Floor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.7, 2]} receiveShadow>
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#F1F5F9" roughness={0.8} />
    </mesh>
  );
}

// ──────── Student Detail Panel ────────
function StudentDetailPanel({ studentId, onClose }: { studentId: string; onClose: () => void }) {
  const [detail, setDetail] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminAPI.getStudentDetail(studentId);
        setDetail(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [studentId]);

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[440px] bg-white shadow-2xl z-50 overflow-y-auto border-l border-gray-200">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
        <h3 className="font-bold text-gray-900">Student Profile</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-amber-500 animate-spin" />
        </div>
      ) : detail ? (
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="text-center">
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
              detail.student.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
            }`}>
              {detail.student.firstName[0]}{detail.student.lastName[0]}
            </div>
            <h2 className="mt-3 text-xl font-extrabold text-gray-900">
              {detail.student.firstName} {detail.student.lastName}
            </h2>
            <p className="text-sm text-gray-500 font-medium">{detail.student.email}</p>
            <div className="flex items-center justify-center gap-4 mt-3">
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                {detail.student.rollNumber}
              </span>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {detail.student.department || detail.student.className}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <BookOpen className="h-4 w-4 text-blue-500 mx-auto mb-1" />
              <p className="text-lg font-extrabold text-gray-900">{detail.summary.totalEntries}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Entries</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Clock className="h-4 w-4 text-amber-500 mx-auto mb-1" />
              <p className="text-lg font-extrabold text-gray-900">{detail.summary.totalHours}h</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Hours</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3 text-center">
              <Award className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
              <p className="text-lg font-extrabold text-gray-900">{detail.summary.uniqueSkills}</p>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Skills</p>
            </div>
          </div>

          {/* Domains */}
          {Object.keys(detail.summary.domains).length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Focus Areas</h4>
              <div className="space-y-2">
                {Object.entries(detail.summary.domains)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([domain, count]) => {
                    const max = Math.max(...Object.values(detail.summary.domains));
                    return (
                      <div key={domain}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-gray-600">{domain}</span>
                          <span className="font-bold text-gray-900">{count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full transition-all duration-700"
                            style={{ width: `${(count / max) * 100}%` }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* Recent Entries */}
          {detail.entries.length > 0 && (
            <div>
              <h4 className="text-sm font-bold text-gray-900 mb-3">Recent Learning</h4>
              <div className="space-y-3">
                {detail.entries.slice(0, 8).map((entry) => (
                  <div key={entry.id} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-bold text-gray-900 truncate">{entry.title}</h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 font-medium">{entry.platform}</span>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-400 font-medium">{entry.domain}</span>
                        </div>
                        {entry.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.skills.slice(0, 3).map((skill, i) => (
                              <span key={i} className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {entry.hoursSpent && (
                        <span className="text-xs text-gray-400 font-bold whitespace-nowrap">{entry.hoursSpent}h</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detail.entries.length === 0 && (
            <div className="text-center py-6">
              <p className="text-sm text-gray-400 font-medium">This student hasn't logged any entries yet.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <p className="text-gray-400">Failed to load student data</p>
        </div>
      )}
    </div>
  );
}

// ──────── Main ClassroomView ────────
export default function ClassroomView() {
  const { className } = useParams<{ className: string }>();
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'3d' | 'grid'>('3d');

  useEffect(() => {
    const load = async () => {
      if (!className) return;
      try {
        const data = await adminAPI.getStudentsByClass(decodeURIComponent(className));
        setStudents(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [className]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/dashboard"
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold text-gray-900">
              Class: {decodeURIComponent(className || '')}
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-0.5">
              <Users className="inline h-4 w-4 mr-1" />
              {students.length} {students.length === 1 ? 'student' : 'students'} registered
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
          <button onClick={() => setViewMode('3d')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === '3d' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            3D View
          </button>
          <button onClick={() => setViewMode('grid')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}>
            Grid View
          </button>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl p-12 text-center border-2 border-dashed border-gray-200">
          <Users className="h-10 w-10 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">No students registered in this class yet.</p>
        </div>
      ) : viewMode === '3d' ? (
        /* 3D Canvas View */
        <div className="relative bg-gradient-to-b from-sky-50 to-slate-100 rounded-2xl overflow-hidden border border-gray-200" style={{ height: '520px' }}>
          <Canvas
            shadows
            camera={{ position: [0, 5, 10], fov: 50 }}
            onCreated={({ gl }) => { gl.shadowMap.enabled = true; gl.shadowMap.type = THREE.VSMShadowMap; }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.6} />
              <directionalLight position={[5, 10, 5]} intensity={0.8} castShadow
                shadow-mapSize-width={2048} shadow-mapSize-height={2048} />
              <pointLight position={[-5, 8, -5]} intensity={0.3} color="#F59E0B" />
              
              {students.map((student, i) => (
                <StudentAvatar
                  key={student.id}
                  student={student}
                  index={i}
                  total={students.length}
                  onClick={() => setSelectedStudentId(student.id)}
                  isSelected={selectedStudentId === student.id}
                />
              ))}
              
              <Floor />
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                maxPolarAngle={Math.PI / 2.1}
                minDistance={3}
                maxDistance={20}
                target={[0, 1, 2]}
              />
              <Environment preset="city" />
            </Suspense>
          </Canvas>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-3 border border-gray-200 shadow-sm">
            <p className="text-xs font-bold text-gray-500 mb-2">Legend</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-gray-600 font-medium">Male</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-pink-500" />
                <span className="text-xs text-gray-600 font-medium">Female</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-gray-600 font-medium">Entries</span>
              </div>
            </div>
          </div>

          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 font-medium">Click a student to view their profile</p>
          </div>
        </div>
      ) : (
        /* Grid Card View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {students.map((student) => (
            <button
              key={student.id}
              onClick={() => setSelectedStudentId(student.id)}
              className={`text-left bg-white border rounded-xl p-5 hover:shadow-lg transition-all ${
                selectedStudentId === student.id ? 'border-amber-500 ring-2 ring-amber-500/20' : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  student.gender === 'female' ? 'bg-pink-500' : 'bg-blue-500'
                }`}>
                  {student.firstName[0]}{student.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">
                    {student.firstName} {student.lastName}
                  </p>
                  <p className="text-xs text-gray-400 font-medium">
                    {student.rollNumber || 'No roll number'}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">{student.department}</span>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600">
                  <BookOpen className="h-3 w-3" />
                  {student.entryCount}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1 text-xs text-amber-600 font-semibold">
                <Eye className="h-3 w-3" /> View details
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Detail Panel Overlay */}
      {selectedStudentId && (
        <>
          <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setSelectedStudentId(null)} />
          <StudentDetailPanel studentId={selectedStudentId} onClose={() => setSelectedStudentId(null)} />
        </>
      )}
    </div>
  );
}
