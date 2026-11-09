export function createAuthRepository(pool) {
  return {
    async findUserForLogin(email) {
      const [rows] = await pool.execute(
        `SELECT id, password_hash AS passwordHash, is_active AS isActive
         FROM users WHERE email = ? LIMIT 1`,
        [email],
      )
      return rows[0] ?? null
    },

    async getSafeUser(userId) {
      const [rows] = await pool.execute(
        `SELECT
           u.id,
           u.full_name AS fullName,
           u.email,
           u.phone,
           u.role,
           u.is_active AS isActive,
           u.department_id AS departmentId,
           d.name AS departmentName,
           d.municipality_id AS departmentMunicipalityId,
           u.home_district_id AS homeDistrictId,
           hd.name AS homeDistrictName,
           u.home_municipality_id AS homeMunicipalityId,
           hm.name AS homeMunicipalityName
         FROM users u
         LEFT JOIN departments d ON d.id = u.department_id
         LEFT JOIN districts hd ON hd.id = u.home_district_id
         LEFT JOIN municipalities hm ON hm.id = u.home_municipality_id
         WHERE u.id = ? LIMIT 1`,
        [userId],
      )
      const row = rows[0]
      if (!row || Number(row.isActive) !== 1) {
        return null
      }

      const [memberships] = await pool.execute(
        `SELECT m.id, m.name, m.code, m.district_id AS districtId
         FROM user_municipalities um
         JOIN municipalities m ON m.id = um.municipality_id
         WHERE um.user_id = ?
         ORDER BY m.name`,
        [userId],
      )

      return {
        id: String(row.id),
        fullName: row.fullName,
        email: row.email,
        phone: row.phone,
        role: row.role,
        department: row.departmentId === null
          ? null
          : {
              id: String(row.departmentId),
              name: row.departmentName,
              municipalityId: String(row.departmentMunicipalityId),
            },
        homeDistrict: row.homeDistrictId === null
          ? null
          : {
              id: String(row.homeDistrictId),
              name: row.homeDistrictName,
            },
        homeMunicipality: row.homeMunicipalityId === null
          ? null
          : {
              id: String(row.homeMunicipalityId),
              name: row.homeMunicipalityName,
            },
        municipalities: memberships.map((municipality) => ({
          id: String(municipality.id),
          name: municipality.name,
          code: municipality.code,
          districtId: String(municipality.districtId),
        })),
      }
    },

    async listMunicipalities() {
      const [rows] = await pool.execute(
        `SELECT m.id, m.name, m.code, d.id AS districtId, d.name AS districtName
         FROM municipalities m
         JOIN districts d ON d.id = m.district_id
         ORDER BY d.name, m.name`,
      )
      return rows.map((row) => ({
        id: String(row.id),
        name: row.name,
        code: row.code,
        district: { id: String(row.districtId), name: row.districtName },
      }))
    },

    async createCitizen({
      fullName,
      email,
      phone,
      passwordHash,
      districtId,
      municipalityId,
      refreshTokenHash,
    }) {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        const [municipalities] = await connection.execute(
          `SELECT id, district_id AS districtId
           FROM municipalities
           WHERE id = ? AND district_id = ?
           FOR SHARE`,
          [municipalityId, districtId],
        )
        if (municipalities.length !== 1) {
          await connection.rollback()
          return null
        }

        const [result] = await connection.execute(
          `INSERT INTO users (
             full_name, email, phone, password_hash, role,
             home_district_id, home_municipality_id
           ) VALUES (?, ?, ?, ?, 'citizen', ?, ?)`,
          [fullName, email, phone, passwordHash, districtId, municipalityId],
        )
        await connection.execute(
          `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
           VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY))`,
          [result.insertId, refreshTokenHash],
        )
        await connection.commit()
        return String(result.insertId)
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    },

    async storeRefreshToken(userId, tokenHash) {
      await pool.execute(
        `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
         VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY))`,
        [userId, tokenHash],
      )
    },

    async rotateRefreshToken(oldHash, newHash) {
      const connection = await pool.getConnection()
      try {
        await connection.beginTransaction()
        const [rows] = await connection.execute(
          `SELECT
             rt.id, rt.user_id AS userId, rt.expires_at AS expiresAt,
             rt.revoked_at AS revokedAt, rt.replaced_by_id AS replacedById,
             u.is_active AS isActive,
             (rt.expires_at <= CURRENT_TIMESTAMP(3)) AS isExpired
           FROM refresh_tokens rt
           JOIN users u ON u.id = rt.user_id
           WHERE rt.token_hash = ?
           FOR UPDATE`,
          [oldHash],
        )
        const token = rows[0]
        if (!token) {
          await connection.rollback()
          return { kind: 'invalid' }
        }

        if (token.revokedAt !== null) {
          if (token.replacedById !== null) {
            await connection.execute(
              `UPDATE refresh_tokens
               SET revoked_at = COALESCE(revoked_at, CURRENT_TIMESTAMP(3))
               WHERE user_id = ? AND revoked_at IS NULL`,
              [token.userId],
            )
            await connection.commit()
            return { kind: 'reused' }
          }
          await connection.rollback()
          return { kind: 'invalid' }
        }

        if (Number(token.isExpired) === 1 || Number(token.isActive) !== 1) {
          await connection.rollback()
          return { kind: 'invalid' }
        }

        const [insertResult] = await connection.execute(
          `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
           VALUES (?, ?, DATE_ADD(CURRENT_TIMESTAMP(3), INTERVAL 7 DAY))`,
          [token.userId, newHash],
        )
        const [updateResult] = await connection.execute(
          `UPDATE refresh_tokens
           SET revoked_at = CURRENT_TIMESTAMP(3), replaced_by_id = ?
           WHERE id = ? AND revoked_at IS NULL`,
          [insertResult.insertId, token.id],
        )
        if (updateResult.affectedRows !== 1) {
          throw new Error('Refresh token rotation lost its row lock.')
        }

        await connection.commit()
        return { kind: 'rotated', userId: String(token.userId) }
      } catch (error) {
        await connection.rollback()
        throw error
      } finally {
        connection.release()
      }
    },

    async revokeRefreshToken(tokenHash) {
      const [result] = await pool.execute(
        `UPDATE refresh_tokens
         SET revoked_at = CURRENT_TIMESTAMP(3)
         WHERE token_hash = ? AND revoked_at IS NULL`,
        [tokenHash],
      )
      return result.affectedRows > 0
    },
  }
}
