const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModel } = require('../../utils');

class NotesService {
  constructor(collaborationsService, cacheService) {
    this.pool = new Pool();
    this.collaborationsService = collaborationsService;
    this.cacheService = cacheService;
  }

  /**
     *
     * @param {object} obj
     * @returns {string}
     */
  async addNote({
    title, body, tags, owner,
  }) {
    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const query = {
      text: 'INSERT INTO notes VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      values: [id, title, body, tags, createdAt, updatedAt, owner],
    };

    const result = await this.pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Catatan gagal ditambahkan');
    }

    await this.cacheService.delete(`notes:${owner}`)

    return result.rows[0].id;
  }

  async getNotes(owner) {
    try {
      // get the notes data from cache first
      const result = await this.cacheService.get(`notes:${owner}`)
      return JSON.parse(result)
    } catch (error) {
      // if failed, then get the notes data from database
      const query = {
        text: `SELECT notes.* FROM notes
        LEFT JOIN collaborations ON collaborations.note_id = notes.id
        WHERE notes.owner = $1 OR collaborations.user_id = $1
        GROUP BY notes.id`,
        values: [owner],
      };
      const result = await this.pool.query(query);
      const mappedResult = result.rows.map(mapDBToModel);

      // cache the result before returning the result
      await this.cacheService.set(`notes:${owner}`, JSON.stringify(mappedResult))

      return mappedResult;
    }
  }

  async getNoteById(id) {
    const query = {
      text: `SELECT notes.*, users.username 
      FROM notes
      LEFT JOIN users ON users.id = notes.owner
      WHERE notes.id = $1`,
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async editNoteById(id, { title, body, tags }) {
    const updatedAt = new Date().toISOString();
    const query = {
      text: 'UPDATE notes SET title = $1, body = $2, tags = $3, updated_at = $4 WHERE id = $5 RETURNING id, owner',
      values: [title, body, tags, updatedAt, id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal memperbarui catatan. Id tidak ditemukan');
    }

    const { owner } = result.rows[0]

    await this.cacheService.delete(`notes:${owner}`)
  }

  async deleteNoteById(id) {
    const query = {
      text: 'DELETE FROM notes WHERE id = $1 RETURNING id, owner',
      values: [id],
    };

    const result = await this.pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Gagal menghapus catatan. Id tidak ditemukan');
    }

    const { owner } = result.rows[0]

    await this.cacheService.delete(`notes:${owner}`)
  }

  async verifyNoteOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM notes WHERE id = $1',
      values: [id],
    };

    // Query to database
    const result = await this.pool.query(query);

    // If notes not exists then throws NotFoundError
    if (!result.rowCount) {
      throw new NotFoundError('Catatan tidak ditemukan');
    }

    const note = result.rows[0];

    // If the owner does not own this notes then throwsAuthorizationError
    if (note.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyNoteAccess(noteId, userId) {
    // first
    // check if user is the owner of the notes
    try {
      // if user is owner, verification passed
      await this.verifyNoteOwner(noteId, userId);
    } catch (error) {
      // re-throw if the error is NotFoundError
      if (error instanceof NotFoundError) {
        throw error;
      }

      // if not owner then
      // check if user has access to the notes
      // if user is collaborator, verification passed
      await this.collaborationsService.verifyCollaborator(noteId, userId);
    }
  }
}

module.exports = NotesService;
