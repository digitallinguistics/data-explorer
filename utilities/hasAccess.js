/**
 * Check whether a user has access permissions for a database object.
 * @param   {String} user The email address of the user to check.
 * @param   {Object} item The item to check against. Must have a `permissions` object.
 * @returns {Boolean}
 */
export default function hasAccess(user, item) {

  const { permissions } = item

  if (!user) return permissions.public

  return permissions.public
    || permissions.owners.includes(user)
    || permissions.editors.includes(user)
    || permissions.viewers.includes(user)

}
