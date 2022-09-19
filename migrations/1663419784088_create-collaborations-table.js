/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createTable('collaborations', {
        id: {
            type: 'VARCHAR(50)',
            primaryKey: true,
        },
        note_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
        user_id: {
            type: 'VARCHAR(50)',
            notNull: true,
        },
    })

    // menambahkan constraint unique pada kolom note_id dan user_id agar tidak terjadi duplikasi data pada nilai keduanya

    pgm.addConstraint('collaborations', 'unique_note_id_and_user_id', 'UNIQUE(note_id, user_id)')

    // Memberikan constraint foreign key pada kolom note_id dan user id terhadap users.id dan notes.id

    pgm.addConstraint('collaborations', 'fk_collaborations.note_id_notes.id', 'FOREIGN KEY(note_id) REFERENCES notes(id) ON DELETE CASCADE');
    pgm.addConstraint('collaborations', 'fk_collaborations.user_id_users.id', 'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE');
};

exports.down = pgm => { 
    pgm.dropTable('collaborations')
};
