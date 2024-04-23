class ResourceNotFound extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, ResourceNotFound);
  }
}

export default ResourceNotFound;
