const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class NotesService {
  constructor() {
    this.notes = [];
  }

  /**
     *
     * @param {title, body, tags} obj
     * @returns {string}
     */
  addNote({ title, body, tags }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const newNote = {
      title, tags, body, id, createdAt, updatedAt,
    };

    this.notes.push(newNote);

    const isSuccess = this.notes.findIndex((note) => note.id === id) >= 0;

    if (!isSuccess) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    return id;
  }

  getNotes() {
    return this.notes;
  }

  getNoteById(id) {
    const note = this.notes.find(({ id: noteId }) => id === noteId);

    if (!note) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return note;
  }

  editNoteById(id, { title, body, tags }) {
    const note = this.notes.find(({ id: noteId }) => id === noteId);

    if (!note) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const updatedAt = new Date().toISOString();

    Object.assign(note, {
      title,
      body,
      tags,
      updatedAt,
    });
  }

  deleteNoteById(id) {
    const index = this.notes.findIndex(({ id: noteId }) => id === noteId);

    if (index < 0) {
      throw new NotFoundError('Gagal menghapus catatan. Id tidak ditemukan');
    }

    this.notes.splice(index, 1);
  }
}

module.exports = NotesService;
