/**
 * Wrapper Prisma Client qui utilise sqlite3 directement
 * Contournement pour les problèmes de téléchargement des binaires Prisma
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'dev.db');

class PrismaClient {
  constructor() {
    this.db = null;
    this._connected = false;
  }

  async $connect() {
    if (this._connected) return;

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Erreur de connexion à la base de données:', err);
          reject(err);
        } else {
          this._connected = true;
          resolve();
        }
      });
    });
  }

  async $disconnect() {
    if (!this._connected || !this.db) return;

    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err);
        else {
          this._connected = false;
          resolve();
        }
      });
    });
  }

  // Helper methods
  _run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  _get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  _all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  // Convertir les dates ISO en objets Date
  _convertDates(obj) {
    if (!obj) return obj;
    const dateFields = ['createdAt', 'updatedAt', 'date', 'dueDate'];
    const converted = { ...obj };
    dateFields.forEach(field => {
      if (converted[field]) {
        converted[field] = new Date(converted[field]);
      }
    });
    return converted;
  }

  _convertDatesArray(arr) {
    return arr.map(obj => this._convertDates(obj));
  }

  // User model
  get user() {
    return {
      findUnique: async ({ where, include }) => {
        await this.$connect();
        let sql = 'SELECT * FROM users WHERE ';
        const params = [];

        if (where.id) {
          sql += 'id = ?';
          params.push(where.id);
        } else if (where.email) {
          sql += 'email = ?';
          params.push(where.email);
        }

        const user = await this._get(sql, params);
        if (!user) return null;

        if (include?.team && user.teamId) {
          user.team = await this._get('SELECT * FROM teams WHERE id = ?', [user.teamId]);
        }

        return this._convertDates(user);
      },

      findMany: async ({ where, include } = {}) => {
        await this.$connect();
        let sql = 'SELECT * FROM users';
        const params = [];

        if (where?.teamId) {
          sql += ' WHERE teamId = ?';
          params.push(where.teamId);
        }

        const users = await this._all(sql, params);

        if (include?.team) {
          for (const user of users) {
            if (user.teamId) {
              user.team = await this._get('SELECT * FROM teams WHERE id = ?', [user.teamId]);
            }
          }
        }

        return this._convertDatesArray(users);
      },

      create: async ({ data }) => {
        await this.$connect();
        const result = await this._run(
          `INSERT INTO users (email, password, firstName, lastName, role, teamId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [data.email, data.password, data.firstName, data.lastName, data.role, data.teamId || null]
        );
        return this._get('SELECT * FROM users WHERE id = ?', [result.lastID]);
      },

      update: async ({ where, data }) => {
        await this.$connect();
        const updates = [];
        const params = [];

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'createdAt') {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        });

        if (updates.length > 0) {
          updates.push('updatedAt = datetime(\'now\')');
          params.push(where.id);
          await this._run(
            `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
        }

        return this._get('SELECT * FROM users WHERE id = ?', [where.id]);
      },

      delete: async ({ where }) => {
        await this.$connect();
        await this._run('DELETE FROM users WHERE id = ?', [where.id]);
        return { id: where.id };
      }
    };
  }

  // Team model
  get team() {
    return {
      findMany: async ({ include } = {}) => {
        await this.$connect();
        const teams = await this._all('SELECT * FROM teams ORDER BY name');

        if (include?.users) {
          for (const team of teams) {
            team.users = await this._all('SELECT * FROM users WHERE teamId = ?', [team.id]);
          }
        }

        return this._convertDatesArray(teams);
      },

      findUnique: async ({ where, include }) => {
        await this.$connect();
        const team = await this._get('SELECT * FROM teams WHERE id = ?', [where.id]);
        if (!team) return null;

        if (include?.users) {
          team.users = await this._all('SELECT * FROM users WHERE teamId = ?', [team.id]);
        }

        return this._convertDates(team);
      },

      create: async ({ data }) => {
        await this.$connect();
        const result = await this._run(
          `INSERT INTO teams (name, description, color, createdAt, updatedAt)
           VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
          [data.name, data.description || null, data.color || '#667eea']
        );
        return this._get('SELECT * FROM teams WHERE id = ?', [result.lastID]);
      },

      update: async ({ where, data }) => {
        await this.$connect();
        const updates = [];
        const params = [];

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'createdAt') {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        });

        if (updates.length > 0) {
          updates.push('updatedAt = datetime(\'now\')');
          params.push(where.id);
          await this._run(
            `UPDATE teams SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
        }

        return this._get('SELECT * FROM teams WHERE id = ?', [where.id]);
      },

      delete: async ({ where }) => {
        await this.$connect();
        await this._run('DELETE FROM teams WHERE id = ?', [where.id]);
        return { id: where.id };
      }
    };
  }

  // Meeting model
  get meeting() {
    return {
      findMany: async ({ where, include, orderBy } = {}) => {
        await this.$connect();
        let sql = 'SELECT * FROM meetings';
        const params = [];

        if (where?.teamId) {
          sql += ' WHERE teamId = ?';
          params.push(where.teamId);
        }

        if (orderBy?.date) {
          sql += ` ORDER BY date ${orderBy.date}`;
        }

        const meetings = await this._all(sql, params);

        if (include?.team) {
          for (const meeting of meetings) {
            meeting.team = await this._get('SELECT * FROM teams WHERE id = ?', [meeting.teamId]);
          }
        }

        return this._convertDatesArray(meetings);
      },

      findUnique: async ({ where, include }) => {
        await this.$connect();
        const meeting = await this._get('SELECT * FROM meetings WHERE id = ?', [where.id]);
        if (!meeting) return null;

        if (include?.team) {
          meeting.team = await this._get('SELECT * FROM teams WHERE id = ?', [meeting.teamId]);
        }

        return this._convertDates(meeting);
      },

      create: async ({ data }) => {
        await this.$connect();
        const result = await this._run(
          `INSERT INTO meetings (title, description, date, notes, teamId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [data.title, data.description || null, data.date, data.notes || null, data.teamId]
        );
        return this._get('SELECT * FROM meetings WHERE id = ?', [result.lastID]);
      },

      update: async ({ where, data }) => {
        await this.$connect();
        const updates = [];
        const params = [];

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'createdAt') {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        });

        if (updates.length > 0) {
          updates.push('updatedAt = datetime(\'now\')');
          params.push(where.id);
          await this._run(
            `UPDATE meetings SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
        }

        return this._get('SELECT * FROM meetings WHERE id = ?', [where.id]);
      },

      delete: async ({ where }) => {
        await this.$connect();
        await this._run('DELETE FROM meetings WHERE id = ?', [where.id]);
        return { id: where.id };
      }
    };
  }

  // Task model
  get task() {
    return {
      findMany: async ({ where, include, orderBy } = {}) => {
        await this.$connect();
        let sql = 'SELECT * FROM tasks';
        const params = [];
        const conditions = [];

        if (where) {
          if (where.teamId) {
            conditions.push('teamId = ?');
            params.push(where.teamId);
          }
          if (where.assignedToId) {
            conditions.push('assignedToId = ?');
            params.push(where.assignedToId);
          }
          if (where.status) {
            conditions.push('status = ?');
            params.push(where.status);
          }
        }

        if (conditions.length > 0) {
          sql += ' WHERE ' + conditions.join(' AND ');
        }

        if (orderBy?.dueDate) {
          sql += ` ORDER BY dueDate ${orderBy.dueDate}`;
        }

        const tasks = await this._all(sql, params);

        if (include) {
          for (const task of tasks) {
            if (include.team) {
              task.team = await this._get('SELECT * FROM teams WHERE id = ?', [task.teamId]);
            }
            if (include.assignedTo && task.assignedToId) {
              task.assignedTo = await this._get('SELECT * FROM users WHERE id = ?', [task.assignedToId]);
            }
          }
        }

        return this._convertDatesArray(tasks);
      },

      findUnique: async ({ where, include }) => {
        await this.$connect();
        const task = await this._get('SELECT * FROM tasks WHERE id = ?', [where.id]);
        if (!task) return null;

        if (include) {
          if (include.team) {
            task.team = await this._get('SELECT * FROM teams WHERE id = ?', [task.teamId]);
          }
          if (include.assignedTo && task.assignedToId) {
            task.assignedTo = await this._get('SELECT * FROM users WHERE id = ?', [task.assignedToId]);
          }
        }

        return this._convertDates(task);
      },

      create: async ({ data }) => {
        await this.$connect();
        const result = await this._run(
          `INSERT INTO tasks (title, description, status, priority, dueDate, teamId, assignedToId, meetingId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            data.title,
            data.description || null,
            data.status || 'TODO',
            data.priority || 'MEDIUM',
            data.dueDate || null,
            data.teamId,
            data.assignedToId || null,
            data.meetingId || null
          ]
        );
        return this._get('SELECT * FROM tasks WHERE id = ?', [result.lastID]);
      },

      update: async ({ where, data }) => {
        await this.$connect();
        const updates = [];
        const params = [];

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'createdAt') {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        });

        if (updates.length > 0) {
          updates.push('updatedAt = datetime(\'now\')');
          params.push(where.id);
          await this._run(
            `UPDATE tasks SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
        }

        return this._get('SELECT * FROM tasks WHERE id = ?', [where.id]);
      },

      delete: async ({ where }) => {
        await this.$connect();
        await this._run('DELETE FROM tasks WHERE id = ?', [where.id]);
        return { id: where.id };
      }
    };
  }

  // Decision model
  get decision() {
    return {
      findMany: async ({ where, include, orderBy } = {}) => {
        await this.$connect();
        let sql = 'SELECT * FROM decisions';
        const params = [];

        if (where?.teamId) {
          sql += ' WHERE teamId = ?';
          params.push(where.teamId);
        }

        if (orderBy?.date) {
          sql += ` ORDER BY date ${orderBy.date}`;
        }

        const decisions = await this._all(sql, params);

        if (include) {
          for (const decision of decisions) {
            if (include.team) {
              decision.team = await this._get('SELECT * FROM teams WHERE id = ?', [decision.teamId]);
            }
            if (include.meeting && decision.meetingId) {
              decision.meeting = await this._get('SELECT * FROM meetings WHERE id = ?', [decision.meetingId]);
            }
          }
        }

        return this._convertDatesArray(decisions);
      },

      findUnique: async ({ where, include }) => {
        await this.$connect();
        const decision = await this._get('SELECT * FROM decisions WHERE id = ?', [where.id]);
        if (!decision) return null;

        if (include) {
          if (include.team) {
            decision.team = await this._get('SELECT * FROM teams WHERE id = ?', [decision.teamId]);
          }
          if (include.meeting && decision.meetingId) {
            decision.meeting = await this._get('SELECT * FROM meetings WHERE id = ?', [decision.meetingId]);
          }
        }

        return this._convertDates(decision);
      },

      create: async ({ data }) => {
        await this.$connect();
        const result = await this._run(
          `INSERT INTO decisions (title, description, date, teamId, meetingId, createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
          [
            data.title,
            data.description || null,
            data.date || new Date().toISOString(),
            data.teamId,
            data.meetingId || null
          ]
        );
        return this._get('SELECT * FROM decisions WHERE id = ?', [result.lastID]);
      },

      update: async ({ where, data }) => {
        await this.$connect();
        const updates = [];
        const params = [];

        Object.entries(data).forEach(([key, value]) => {
          if (key !== 'id' && key !== 'createdAt') {
            updates.push(`${key} = ?`);
            params.push(value);
          }
        });

        if (updates.length > 0) {
          updates.push('updatedAt = datetime(\'now\')');
          params.push(where.id);
          await this._run(
            `UPDATE decisions SET ${updates.join(', ')} WHERE id = ?`,
            params
          );
        }

        return this._get('SELECT * FROM decisions WHERE id = ?', [where.id]);
      },

      delete: async ({ where }) => {
        await this.$connect();
        await this._run('DELETE FROM decisions WHERE id = ?', [where.id]);
        return { id: where.id };
      }
    };
  }
}

module.exports = { PrismaClient };
