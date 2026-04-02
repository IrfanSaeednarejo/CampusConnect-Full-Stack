import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotes,
  uploadNote,
  deleteNote,
  toggleNoteShare,
  setNoteFilter,
  incrementDownloadCount,
  selectFilteredNotes,
  selectNotesFilters,
  selectUploadStatus
} from '../../redux/slices/notesSlice';
import { selectUnreadCount } from '../../redux/slices/notificationsSlice';
import { formatFileSize, timeAgo } from '../../utils/helpers';


export default function NotesList() {
  const dispatch = useDispatch();
  const notes = useSelector(selectFilteredNotes);
  const filters = useSelector(selectNotesFilters);
  const status = useSelector(state => state.notes.status);
  const uploadStatus = useSelector(selectUploadStatus);
  const unreadCount = useSelector(selectUnreadCount);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadData, setUploadData] = useState({ title: '', subject: 'Computer Science', tags: '' });
  const [selectedFile, setSelectedFile] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFilterChange = (field, value) => {
    dispatch(setNoteFilter({ field, value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      if (!uploadData.title) {
        setUploadData({ ...uploadData, title: e.target.files[0].name.split('.')[0] });
      }
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !uploadData.title || uploadStatus === 'uploading') return;

    const payload = {
      title: uploadData.title,
      subject: uploadData.subject,
      tags: uploadData.tags.split(',').map(t => t.trim()).filter(Boolean),
      fileName: selectedFile.name,
      size: selectedFile.size
    };

    try {
      await dispatch(uploadNote(payload)).unwrap();
      setIsUploadModalOpen(false);
      setUploadData({ title: '', subject: 'Computer Science', tags: '' });
      setSelectedFile(null);
      showToast('File uploaded successfully!');
    } catch (err) {
      alert("Failed to upload: " + err);
    }
  };

  // FIX [Bug 7]: Actual download with Blob + download count increment
  const handleDownload = (note) => {
    const content = `CampusConnect Mock File\n\n` +
      `Title: ${note.title}\n` +
      `Subject: ${note.subject}\n` +
      `Description: ${note.description || 'N/A'}\n` +
      `Tags: ${(note.tags || []).join(', ')}\n\n` +
      `This is a simulated download. Real file content\n` +
      `will be available after backend integration.`;

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = note.fileName || `${note.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    dispatch(incrementDownloadCount(note.id));
    showToast(`Downloading ${note.fileName}...`);
  };

  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return { icon: 'picture_as_pdf', color: 'text-red-400', bg: 'bg-red-500/10' };
      case 'doc': return { icon: 'description', color: 'text-blue-400', bg: 'bg-blue-500/10' };
      case 'ppt': return { icon: 'co_present', color: 'text-orange-400', bg: 'bg-orange-500/10' };
      case 'img': return { icon: 'image', color: 'text-purple-400', bg: 'bg-purple-500/10' };
      default: return { icon: 'folder', color: 'text-gray-400', bg: 'bg-gray-500/10' };
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">


      <main className="flex-1 overflow-y-auto w-full custom-scrollbar relative">
        {toastMessage && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2ea043] text-white px-6 py-3 rounded-lg shadow-xl font-medium flex items-center gap-2 animate-bounce">
            <span className="material-symbols-outlined text-[20px]">check_circle</span>
            {toastMessage}
          </div>
        )}

        <div className="p-4 sm:p-8 lg:p-12 max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-border">
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">Notes & Documents</h1>
              <p className="text-text-secondary mt-1">Organize and share your academic resources securely.</p>
            </div>
            
            <button 
              onClick={() => setIsUploadModalOpen(true)}
              className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-[20px]">upload_file</span>
              Upload Document
            </button>
          </header>

          {/* Filters & Search */}
          <div className="bg-surface border border-border rounded-xl p-6 shadow-sm mb-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              <div className="md:col-span-5 relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">search</span>
                <input
                  type="text"
                  placeholder="Search notes, documents, or tags..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="w-full bg-background border border-border text-white pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div className="md:col-span-3">
                <select 
                  value={filters.subject}
                  onChange={(e) => handleFilterChange('subject', e.target.value)}
                  className="w-full bg-background border border-border text-white py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {['All', 'Computer Science', 'Mathematics', 'Physics', 'Design', 'Business'].map(opt => (
                    <option key={opt} value={opt}>{opt === 'All' ? 'All Subjects' : opt}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <select 
                  value={filters.fileType}
                  onChange={(e) => handleFilterChange('fileType', e.target.value)}
                  className="w-full bg-background border border-border text-white py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {['All', 'PDF', 'Document', 'Presentation', 'Image'].map(opt => (
                    <option key={opt} value={opt}>{opt === 'All' ? 'All Types' : opt}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full bg-background border border-border text-white py-2 px-3 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="most-downloaded">Downloads</option>
                </select>
              </div>
            </div>
          </div>

          {/* Grid */}
          {status === 'loading' ? (
            <div className="flex justify-center py-20">
              <span className="material-symbols-outlined animate-spin text-4xl text-text-secondary">refresh</span>
            </div>
          ) : notes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {notes.map(note => {
                const { icon, color, bg } = getFileIcon(note.fileType);
                return (
                  <div key={note.id} className="bg-surface border border-border rounded-xl overflow-hidden hover:border-[#8b949e]/50 transition-colors flex flex-col group">
                    <div className="p-5 flex-1 relative">
                       {/* Dropdown Menu Toggle (Simulated with hover for simplicity) */}
                       <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                         <button 
                           onClick={() => dispatch(toggleNoteShare(note.id))}
                           className="w-8 h-8 rounded bg-background border border-border text-text-secondary hover:text-white flex items-center justify-center transition-colors"
                           title={note.isShared ? 'Make Private' : 'Share'}
                         >
                           <span className="material-symbols-outlined text-[16px]">{note.isShared ? 'public_off' : 'share'}</span>
                         </button>
                         <button 
                           onClick={() => dispatch(deleteNote(note.id))}
                           className="w-8 h-8 rounded bg-background border border-border text-text-secondary hover:text-[#f85149] hover:border-[#f85149]/50 flex items-center justify-center transition-colors"
                           title="Delete"
                         >
                           <span className="material-symbols-outlined text-[16px]">delete</span>
                         </button>
                       </div>

                       <div className={`w-12 h-12 rounded-lg ${bg} ${color} flex items-center justify-center mb-4`}>
                          <span className="material-symbols-outlined text-[28px]">{icon}</span>
                       </div>
                       <h3 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-2" title={note.title}>
                         {note.title}
                       </h3>
                       <p className="text-xs text-text-secondary mb-4 truncate">{note.fileName}</p>
                       
                       <div className="flex flex-wrap gap-1.5 mb-4">
                         {note.tags?.slice(0, 3).map((tag, idx) => (
                           <span key={idx} className="bg-surface-hover border border-border px-2 py-0.5 rounded text-[10px] text-text-primary uppercase font-bold tracking-wider">
                             {tag}
                           </span>
                         ))}
                       </div>

                       <div className="mt-auto space-y-1">
                         <div className="flex justify-between text-xs text-text-secondary">
                           <span>Subject:</span>
                           <span className="text-text-primary font-medium">{note.subject}</span>
                         </div>
                         <div className="flex justify-between text-xs text-text-secondary">
                           <span>Size:</span>
                           {/* FIX [Bug 2]: Display fileSize string directly for seed data, format size bytes for new uploads */}
                           <span className="text-text-primary font-medium">{note.fileSize || formatFileSize(note.size)}</span>
                         </div>
                         <div className="flex justify-between text-xs text-text-secondary">
                           <span>Uploaded:</span>
                           <span className="text-text-primary font-medium">{timeAgo(note.uploadedAt)}</span>
                         </div>
                       </div>
                    </div>
                    
                    <div className="p-3 border-t border-border bg-surface-hover/50 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-text-secondary font-medium">
                        <span className="material-symbols-outlined text-[14px]">download</span>
                        {note.downloadCount || 0}
                      </div>
                      
                      <button 
                        onClick={() => handleDownload(note)}
                        className="text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                      >
                        Download
                        <span className="material-symbols-outlined text-[16px]">file_download</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col gap-4 py-16 px-4 rounded-xl border border-border bg-surface items-center justify-center text-center">
              <div className="w-20 h-20 bg-surface-hover rounded-full flex items-center justify-center border border-border mb-2 shadow-sm">
                <span className="material-symbols-outlined text-4xl text-text-secondary">draft</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">No notes found</h3>
              <p className="text-text-secondary max-w-sm mb-6">
                {filters.search || filters.subject !== 'All' 
                  ? "Try adjusting your filters or search terms."
                  : "Start by uploading your first study material or document."}
              </p>
              <button 
                onClick={() => setIsUploadModalOpen(true)}
                className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white font-bold rounded-lg transition-colors shadow-sm"
              >
                Upload Document
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-surface border border-border w-full max-w-lg rounded-xl shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <h3 className="text-xl font-bold text-white">Upload Document</h3>
              <button 
                onClick={() => setIsUploadModalOpen(false)}
                className="text-text-secondary hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <form onSubmit={handleUploadSubmit} className="p-6 space-y-5">
              
              {/* File Drop Area */}
              <div className="relative border-2 border-dashed border-border hover:border-blue-500 bg-background rounded-xl p-8 text-center transition-colors cursor-pointer" onClick={() => document.getElementById('file-upload').click()}>
                <input 
                  type="file" 
                  id="file-upload"
                  className="hidden" 
                  onChange={handleFileChange}
                />
                <span className="material-symbols-outlined text-4xl text-text-secondary mb-2">cloud_upload</span>
                {selectedFile ? (
                   <p className="text-white font-medium text-sm">
                     {selectedFile.name} <br/>
                     <span className="text-text-secondary text-xs font-normal">({formatFileSize(selectedFile.size)})</span>
                   </p>
                ) : (
                   <p className="text-text-secondary text-sm font-medium">Click to browse or drag and drop<br/>PDF, DOCX, PPTX or Images (max 50MB)</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Document Title *</label>
                <input
                  type="text"
                  required
                  value={uploadData.title}
                  onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                  className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. Chapter 4 Summary Notes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Subject Category</label>
                <select 
                  value={uploadData.subject}
                  onChange={(e) => setUploadData({...uploadData, subject: e.target.value})}
                  className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 appearance-none"
                >
                  {['Computer Science', 'Mathematics', 'Physics', 'Design', 'Business', 'Other'].map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Tags (comma separated)</label>
                <input
                  type="text"
                  value={uploadData.tags}
                  onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                  className="w-full bg-background border border-border text-white px-4 py-2 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="e.g. midterms, revision, diagrams"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-border">
                <button 
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-5 py-2 text-sm font-semibold text-text-primary hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedFile || !uploadData.title || uploadStatus === 'uploading'}
                  className="px-5 py-2 text-sm bg-primary hover:bg-primary-hover text-white font-bold rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {uploadStatus === 'uploading' ? (
                    <><span className="material-symbols-outlined text-[16px] animate-spin">sync</span> Uploading...</>
                  ) : 'Upload Note'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
