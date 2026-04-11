import { Note } from '../models/Note.js';

// Get notes: user's own + shared notes from others
export const getNotes = async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const notes = await Note.find({
            $or: [
                { author: userId },
                { isShared: true }
            ]
        }).populate('author', 'email profile.firstName profile.lastName profile.displayName').sort({ createdAt: -1 });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notes', error: error.message });
    }
};

// Create a new note
export const createNote = async (req, res) => {
    try {
        const { title, subject, description, tags, fileName, fileSize, fileType, fileUrl } = req.body;

        const newNote = new Note({
            title,
            subject,
            description,
            tags,
            fileName,
            fileSize,
            fileType,
            fileUrl,
            author: req.user._id || req.user.id
        });

        const savedNote = await newNote.save();
        res.status(201).json(savedNote);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create note', error: error.message });
    }
};

// Delete a note
export const deleteNote = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.author.toString() !== (req.user._id?.toString() || req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }

        await note.deleteOne();
        res.json({ message: 'Note removed', id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting note', error: error.message });
    }
};

// Toggle share status
export const toggleShare = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.author.toString() !== (req.user._id?.toString() || req.user.id) && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to edit this note' });
        }

        note.isShared = !note.isShared;
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating note', error: error.message });
    }
};

// Increment download count
export const incrementDownload = async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        note.downloadCount += 1;
        await note.save();
        res.json(note);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating note', error: error.message });
    }
};