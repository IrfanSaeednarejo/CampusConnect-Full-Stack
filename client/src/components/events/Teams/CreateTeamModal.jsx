import React, { useState } from "react";
import Button from "../../common/Button";
import FormField from "../../common/FormField";

export default function CreateTeamModal({ isOpen, onClose, onSubmit, minSize, maxSize, loading }) {
  const [formData, setFormData] = useState({
    name: "",
    password: "",
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      teamName: formData.name,
      password: formData.password || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-6 border-b border-[#30363d]">
          <h2 className="text-xl font-bold text-white">Form a Team</h2>
          <button onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <FormField
            label="Team Name"
            name="name"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="E.g., The Code Fathers"
            required
          />
          
          <FormField
            label="Join Password (Optional)"
            name="password"
            type="password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
            placeholder="Leave blank for an open team"
          />

          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded-lg flex gap-3 text-sm text-[#8b949e]">
            <span className="material-symbols-outlined text-[#1f6feb]">info</span>
            <p>Your team will have a maximum capacity of <strong className="text-white">{maxSize}</strong> members.</p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#30363d]">
            <Button variant="outline" onClick={onClose} type="button">Cancel</Button>
            <Button variant="primary" type="submit" disabled={loading || !formData.name}>
              {loading ? "Creating..." : "Create Team"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
