/**
 * Error handler for uncaught exceptions
 */
export default function handleUncaughtException(err) {
  console.error(err)
  process.exit(1)
}
