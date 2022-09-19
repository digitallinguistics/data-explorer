const errorData = {
  ItemNotFound: {
    message: `This item does not exist.`,
    status:  404,
    title:   `Item Not Found`,
  },
  PageNotFound: {
    message: `This page does not exist.`,
    status:  404,
    title:   `Page Not Found`,
  },
  ServerError: {
    message: `Please consider <a class=link href='https://github.com/digitallinguistics/data-explorer/issues/new?{{ bugReportQuery }}'>opening an issue on GitHub</a> to report this error.`,
    status:  500,
    title:   `Server Error`,
  },
  Unauthenticated: {
    message: `You must be logged in to view this item.`,
    status:  401,
    title:   `Unauthenticated`,
  },
  Unauthorized: {
    message: `You do not have permission to view this item.`,
    status:  403,
    title:   `Unauthorized`,
  },
}

export default function errors(req, res, next) {

  res.error = function error(errorType = `ServerError`) {

    const { message, status, title } = errorData[errorType]

    res.status(status)

    res.render(`Error/Error`, {
      Error:   true,
      heading: `${ status }: ${ title }`,
      message,
      title,
    })
  }

  next()

}
