import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchEventById, selectSelectedEvent } from "../../../redux/slices/eventSlice";
import { 
  fetchMySubmission, 
  submitWorkThunk, 
  addSubmissionFileThunk, 
  deleteSubmissionFileThunk, 
  selectMySubmission, 
  selectSubmissionLoading, 
  selectUploadStatus 
} from "../../../redux/slices/submissionSlice";
import CircularProgress from "../../../components/common/CircularProgress";
import FormField from "../../../components/common/FormField";
import Button from "../../../components/common/Button";
import FileDropzone from "../../../components/events/Submissions/FileDropzone";
import PageHeader from "../../../components/common/PageHeader";
import PageContent from "../../../components/common/PageContent";
import ConfirmModal from "../../../components/common/ConfirmModal";

export default function SubmissionPanel() {
  const { id: eventId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const event = useSelector(selectSelectedEvent);
  const submission = useSelector(selectMySubmission);
  const loading = useSelector(selectSubmissionLoading);
  const uploadStatus = useSelector(selectUploadStatus);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    repositoryUrl: "",
    liveDemoUrl: "",
    youtubeUrl: ""
  });

  const [confirmState, setConfirmState] = useState({ isOpen: false });

  useEffect(() => {
    if (eventId) {
      dispatch(fetchMySubmission(eventId));
    }
  }, [dispatch, eventId]);

  useEffect(() => {
    if (submission) {
      setFormData({
        title: submission.title || "",
        description: submission.description || "",
        repositoryUrl: submission.links?.find(l => l.label === 'GitHub' || l.label === 'Repository')?.url || "",
        liveDemoUrl: submission.links?.find(l => l.label === 'Deployment' || l.label === 'Live Demo')?.url || "",
        youtubeUrl: submission.links?.find(l => l.label === 'YouTube Video')?.url || "",
      });
    }
  }, [submission]);

  const handleSaveDraft = async (e) => {
    if (e) e.preventDefault();
    if (!eventId) return;

    const links = [];
    if (formData.repositoryUrl) links.push({ label: 'GitHub', url: formData.repositoryUrl });
    if (formData.liveDemoUrl) links.push({ label: 'Deployment', url: formData.liveDemoUrl });
    if (formData.youtubeUrl) links.push({ label: 'YouTube Video', url: formData.youtubeUrl });

    // Send the draft payload
    await dispatch(submitWorkThunk({
      eventId,
      data: { 
        title: formData.title, 
        description: formData.description,
        links: links,
        isFinalized: false 
      }
    }));
  };

  const handleFinalSubmit = async () => {
    setConfirmState({
      isOpen: true,
      title: "Finalize Submission",
      message: "Are you sure you want to finalize your submission? You cannot alter files or project details after this step. This is an irreversible action.",
      confirmText: "Yes, Finalize",
      variant: "primary",
      onConfirm: async () => {
        const links = [];
        if (formData.repositoryUrl) links.push({ label: 'GitHub', url: formData.repositoryUrl });
        if (formData.liveDemoUrl) links.push({ label: 'Deployment', url: formData.liveDemoUrl });
        if (formData.youtubeUrl) links.push({ label: 'YouTube Video', url: formData.youtubeUrl });

        await dispatch(submitWorkThunk({
          eventId,
          data: { 
            title: formData.title, 
            description: formData.description,
            links: links,
            status: "submitted" 
          } 
        }));
        setConfirmState({ isOpen: false });
      }
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !eventId) return;

    const fileData = new FormData();
    fileData.append("file", file);
    await dispatch(addSubmissionFileThunk({ eventId, formData: fileData }));    
  };

  const handleDeleteFile = async (fileId) => {
    if (!eventId) return;
    await dispatch(deleteSubmissionFileThunk({ eventId, fileId }));
  };

  if (!event || (loading && !submission)) {
    return <div className="h-screen flex justify-center items-center bg-[#0d1117]"><CircularProgress /></div>;
  }

  const submissionsOpen = event.submissionsOpen;

  return (
    <div className="text-[#e6edf3] pb-10">
      <PageHeader
        title="Submission Panel"
        subtitle={event.title}
        icon="upload_file"
        action={
          <div className="bg-[#161b22] border border-[#30363d] px-4 py-2 rounded-lg flex gap-3 items-center">
            <span className="material-symbols-outlined text-xl text-[#1f6feb]">info</span>
            <div className="text-left">
              <p className="text-[10px] text-[#8b949e] uppercase font-bold tracking-wider leading-none">Status</p>
              <p className={`text-sm font-semibold capitalize leading-tight ${submission?.status === 'submitted' ? 'text-[#3fb950]' : 'text-[#e3b341]'}`}>
                {submission?.status || 'Draft'}
              </p>
            </div>
          </div>
        }
      />

      <PageContent>
        {(!submissionsOpen && submission?.status !== 'submitted') && (
           <div className="mb-8 bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg flex items-center gap-3">
              <span className="material-symbols-outlined">error</span>
              <p className="font-semibold">Submissions are currently closed for this event.</p>
           </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Form Area */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-xl font-bold border-b border-[#30363d] pb-4 mb-4">Project Details</h2>
            
            <form onSubmit={handleSaveDraft} className="space-y-4">
              <FormField 
                label="Project Title" 
                name="title" 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder="Name your hackathon submission"
                disabled={!submissionsOpen || submission?.status === 'submitted'}
                required 
              />
              <FormField 
                label="Description & Tech Stack" 
                name="description" 
                type="textarea"
                rows={5}
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="What did you build? How does it work?"
                disabled={!submissionsOpen || submission?.status === 'submitted'}
                required 
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField 
                  label="GitHub URL" 
                  name="repositoryUrl" 
                  value={formData.repositoryUrl} 
                  onChange={e => setFormData({...formData, repositoryUrl: e.target.value})}
                  placeholder="https://github.com/..."
                  disabled={!submissionsOpen || submission?.status === 'submitted'}
                  required
                />
                <FormField 
                  label="Deployment URL (Optional)" 
                  name="liveDemoUrl" 
                  value={formData.liveDemoUrl} 
                  onChange={e => setFormData({...formData, liveDemoUrl: e.target.value})}
                  placeholder="https://my-app.vercel.app"
                  disabled={!submissionsOpen || submission?.status === 'submitted'}
                />
                <FormField 
                  label="YouTube Video Link" 
                  name="youtubeUrl" 
                  value={formData.youtubeUrl} 
                  onChange={e => setFormData({...formData, youtubeUrl: e.target.value})}
                  placeholder="https://youtube.com/watch?v=..."
                  disabled={!submissionsOpen || submission?.status === 'submitted'}
                  required
                />
              </div>

              {submissionsOpen && submission?.status !== 'submitted' && (
                <div className="flex justify-end pt-4">
                  <Button variant="primary" type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save Draft"}
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Deliverables Upload */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h2 className="text-xl font-bold border-b border-[#30363d] pb-4 mb-4">Deliverables</h2>
            
            {/* File List */}
            {submission?.files && submission.files.length > 0 ? (
              <div className="space-y-3 mb-6">
                <h4 className="text-sm font-semibold text-[#8b949e] uppercase">Uploaded Files</h4>
                {submission.files.map(file => (
                  <div key={file._id} className="flex justify-between items-center p-3 bg-[#0d1117] border border-[#30363d] rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-[#1f6feb]">draft</span>
                      <a href={file.url} target="_blank" rel="noreferrer" className="text-white hover:underline text-sm">{file.originalName || 'Download File'}</a>
                    </div>
                    {submissionsOpen && submission?.status !== 'submitted' && (
                      <button onClick={() => handleDeleteFile(file._id)} className="text-[#8b949e] hover:text-[#f85149] transition-colors">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
               <p className="text-[#8b949e] text-sm mb-4">No files uploaded yet.</p>
            )}

            {/* Droppable / File Input */}
            {submissionsOpen && submission?.status !== 'submitted' && (
              <FileDropzone 
                disabled={!submissionsOpen || submission?.status === 'submitted'} 
                isUploading={uploadStatus === 'loading'} 
                onUpload={(file) => {
                  const fileData = new FormData();
                  fileData.append("file", file);
                  dispatch(addSubmissionFileThunk({ eventId, formData: fileData }));    
                }} 
              />
            )}
          </div>
        </div>

        {/* Right Sidebar: Rules & Finalize */}
        <div className="space-y-6">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 shadow-xl text-center">
            <span className="material-symbols-outlined text-5xl text-[#1dc964] mb-4">verified</span>
            <h3 className="text-lg font-bold text-white">Ready to Submit?</h3>
            <p className="text-sm text-[#8b949e] mt-2 mb-6">Once finalized, judges will be able to review your work. You cannot make edits after this step.</p>
            <Button 
               variant="primary" 
               className="w-full justify-center py-3 bg-[#238636] hover:bg-[#2ea043] border-none"
               disabled={!submissionsOpen || submission?.status === 'submitted' || (!submission?.title && !formData.title)}
               onClick={handleFinalSubmit}
            >
              {submission?.status === 'submitted' ? "Submitted Successfully" : "Finalize Submission"}
            </Button>
          </div>

          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <h3 className="font-bold text-white border-b border-[#30363d] pb-2 mb-4">Event Rubric</h3>
            <div className="space-y-4">
              {event.judgingConfig?.criteria && event.judgingConfig.criteria.length > 0 ? (
                 event.judgingConfig.criteria.map((c, idx) => (
                   <div key={idx}>
                     <p className="text-sm font-bold text-white flex justify-between">
                       <span>{c.name}</span>
                       <span className="text-[#1dc964]">{c.maxScore} pts</span>
                     </p>
                     {c.description && <p className="text-xs text-[#8b949e] mt-1">{c.description}</p>}
                   </div>
                 ))
              ) : (
                <p className="text-sm text-[#8b949e]">No specific grading criteria provided by organizers.</p>
              )}
            </div>
          </div>
        </div>

        </div>

      </PageContent>
      <ConfirmModal 
        {...confirmState} 
        onCancel={() => setConfirmState({ isOpen: false })} 
      />
    </div>
  );
}
