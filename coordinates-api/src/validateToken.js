/**
 * Valida un token consultando la base de datos PostgreSQL.
 *
 * @param {object} pgClient - El cliente de PostgreSQL.
 * @param {string} token - El token a validar.
 * @returns {object} Un objeto que indica si el token es válido y el ID de la empresa asociada.
 * @property {boolean} isValid - Indica si el token es válido.
 * @property {number|null} empresaId - El ID de la empresa si el token es válido, o null si no lo es.
 */

module.exports = async function validateToken(pgClient, token) {
    try {
        const res = await pgClient.query("SELECT empresa_id FROM gestion.acceso WHERE token = $1", [
            token,
        ]);

        if (res.rowCount > 0) {
            return { isValid: true, empresaId: res.rows[0].empresa_id };
        } else {
            return { isValid: false, empresaId: null };
        }
    } catch (error) {
        console.error("Error al validar el token:", error);
        return { isValid: false, empresaId: null };
    }
};
