/**
 * Check whether a user has access permissions for a database object.
 * @param   {String} user The email address of the user to check.
 * @param   {Object} item The item to check against. Must have a `permissions` object.
 * @returns {Boolean}
 */
export function hasAccess(user, item) {

  const { permissions } = item

  if (!user) return permissions.public

  return permissions.public
    || permissions.owners.includes(user)
    || permissions.editors.includes(user)
    || permissions.viewers.includes(user)

}

/**
 * Check whether a user is an owner of a database object.
 * @param   {String} user The email address of the user to check.
 * @param   {Object} item The item to check against. Must have a `permissions` object.
 * @returns {Boolean}
 */
export function isOwner(user, item) {

  if (!user) return false

  return item.permissions.owners.includes(user)

}

/**
 * Check whether a user is an editor of a database object.
 * @param   {String} user The email address of the user to check.
 * @param   {Object} item The item to check against. Must have a `permissions` object.
 * @returns {Boolean}
 */
export function isEditor(user, item) {

  if (!user) return false

  return item.permissions.editors.includes(user)

}

/**
 * Check whether the user is a viewer of a database object (not just able to view it publicly).
 * @param   {String} user The email address of the user to check.
 * @param   {Object} item The item to check against. Must have a `permissions` object.
 * @returns {Boolean}
 */
export function isViewer(user, item) {

  if (!user) return false

  return item.permissions.viewers.includes(user)

}
